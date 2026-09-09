import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate and pin metadata to IPFS
 *
 * For each token:
 * 1. Generate metadata JSON
 * 2. Pin image to IPFS (if provided)
 * 3. Generate and pin HTML viewer
 * 4. Pin metadata JSON
 *
 * Usage:
 *   node generate-metadata.js
 */

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const USE_IPFS = PINATA_API_KEY && PINATA_SECRET_KEY;

/**
 * Pin data to IPFS via Pinata
 */
async function pinToPinata(content, name) {
  if (!USE_IPFS) {
    console.log(`  [LOCAL] Would pin: ${name}`);
    return `LOCAL_${name}`;
  }

  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const data = JSON.stringify({
    pinataContent: content,
    pinataMetadata: {
      name
    }
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY
    },
    body: data
  });

  if (!response.ok) {
    throw new Error(`Pinata error: ${await response.text()}`);
  }

  const result = await response.json();
  return result.IpfsHash;
}

/**
 * Pin file to IPFS via Pinata
 */
async function pinFileToPinata(filePath, name) {
  if (!USE_IPFS) {
    console.log(`  [LOCAL] Would pin file: ${name}`);
    return `LOCAL_${name}`;
  }

  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const formData = new FormData();

  formData.append('file', fs.createReadStream(filePath));
  formData.append('pinataMetadata', JSON.stringify({ name }));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
      ...formData.getHeaders()
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Pinata error: ${await response.text()}`);
  }

  const result = await response.json();
  return result.IpfsHash;
}

/**
 * Generate HTML viewer for a token
 */
function generateViewer(tokenId, params) {
  const viewerTemplate = fs.readFileSync(
    path.join(__dirname, '../viewers/token-viewer-template.html'),
    'utf8'
  );

  // Embed params. replaceAll: the placeholders appear multiple times in the
  // template; .replace() would leave `const TOKEN_ID = {{TOKEN_ID}};` behind,
  // a syntax error in the embedded viewer script.
  const viewer = viewerTemplate
    .replaceAll('{{TOKEN_ID}}', String(tokenId))
    .replaceAll('{{PARAMS}}', JSON.stringify(params));

  return viewer;
}

/**
 * Generate metadata for a token
 */
async function generateTokenMetadata(tokenId, options = {}) {
  console.log(`Generating metadata for token ${tokenId}...`);

  const {
    imagePath,
    params = {},
    witnessed = false,
    resolved = false,
    witnessCount = 0
  } = options;

  // Pin image if provided
  let imageCID = null;
  if (imagePath && fs.existsSync(imagePath)) {
    console.log('  Pinning image...');
    imageCID = await pinFileToPinata(imagePath, `transevil-${tokenId}.png`);
    console.log(`  ✓ Image CID: ${imageCID}`);
  }

  // Generate and pin HTML viewer. It must be pinned as a file: pinning the
  // HTML string through pinJSONToIPFS would serve a JSON-quoted string, and
  // animation_url would not render.
  console.log('  Generating viewer...');
  const viewer = generateViewer(tokenId, params);
  const outputDir = path.join(__dirname, 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  const viewerPath = path.join(outputDir, `viewer-${tokenId}.html`);
  fs.writeFileSync(viewerPath, viewer);
  const viewerCID = await pinFileToPinata(viewerPath, `transevil-viewer-${tokenId}.html`);
  console.log(`  ✓ Viewer CID: ${viewerCID}`);

  // Generate metadata
  const metadata = {
    name: `TRANSEVIL #${tokenId}`,
    description: tokenId === 1000001
      ? 'RELIC — A work that evolves with each witness, held in perpetuity, never sold. Intended for institutional loan and exhibition only.'
      : 'A constrained crypto-art work using zero-knowledge proofs poetically — to enforce opacity without surveillance. Trust formalised, not eliminated.',
    image: imageCID ? `ipfs://${imageCID}` : null,
    animation_url: `ipfs://${viewerCID}`,
    attributes: [
      {
        trait_type: 'Token ID',
        value: tokenId
      },
      {
        trait_type: 'Witnessed',
        value: witnessed ? 'Yes' : 'No'
      },
      {
        trait_type: 'Resolved',
        value: resolved ? 'Yes' : 'No'
      },
      {
        trait_type: 'Witness Count',
        value: witnessCount
      }
    ],
    params
  };

  if (tokenId === 1000001) {
    metadata.attributes.push({
      trait_type: 'Type',
      value: 'RELIC'
    });
  }

  // Pin metadata
  console.log('  Pinning metadata...');
  const metadataCID = await pinToPinata(metadata, `transevil-metadata-${tokenId}.json`);
  console.log(`  ✓ Metadata CID: ${metadataCID}\n`);

  return {
    tokenId,
    metadata,
    cids: {
      image: imageCID,
      viewer: viewerCID,
      metadata: metadataCID
    }
  };
}

/**
 * Generate metadata for all tokens
 */
async function generateAllMetadata() {
  console.log('TRANSEVIL Metadata Generator\n');

  if (!USE_IPFS) {
    console.log('⚠️  No Pinata credentials found. Running in LOCAL mode.');
    console.log('   Add PINATA_API_KEY and PINATA_SECRET_KEY to .env to enable IPFS pinning.\n');
  }

  const outputDir = path.join(__dirname, '../metadata/output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  // Example: Generate for tokens 1-3 and RELIC
  // In production, loop through all minted tokens

  const tokens = [1, 2, 3, 1000001];

  for (const tokenId of tokens) {
    const result = await generateTokenMetadata(tokenId, {
      params: {
        seed: `seed-${tokenId}`,
        timestamp: Date.now()
      },
      witnessed: false,
      resolved: false,
      witnessCount: 0
    });

    results.push(result);

    // Save locally
    const localPath = path.join(outputDir, `${tokenId}.json`);
    fs.writeFileSync(localPath, JSON.stringify(result.metadata, null, 2));
  }

  // Save summary
  const summaryPath = path.join(outputDir, 'metadata-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log('✅ Metadata generation complete!');
  console.log(`   Summary saved to: ${summaryPath}\n`);

  if (USE_IPFS) {
    // Each metadata JSON is pinned as its own CID, so there is no folder
    // base URI. Set token URIs individually, or pin the output directory
    // as one IPFS folder if a single baseURI is needed.
    console.log('Metadata CIDs (set per-token URIs on the contract):');
    for (const r of results) {
      console.log(`  #${r.tokenId}: ipfs://${r.cids.metadata}`);
    }
    console.log();
  }
}

generateAllMetadata().catch(console.error);
