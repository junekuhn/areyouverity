import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploy TRANSEVIL contracts
 *
 * Deploys:
 * 1. MerkleProofVerifier
 * 2. WitnessProofVerifier
 * 3. TransevilFinale (main NFT contract)
 *
 * Usage:
 *   node deploy-transevil.js
 */

async function main() {
  console.log('Deploying TRANSEVIL contracts...\n');

  // Load Merkle root
  const merkleTreePath = path.join(__dirname, '../zk/outputs/merkle-tree.json');
  if (!fs.existsSync(merkleTreePath)) {
    console.error('Error: Merkle tree not found. Run: cd zk/scripts && node build-merkle-tree.js');
    process.exit(1);
  }

  const { root: endStateRoot } = JSON.parse(fs.readFileSync(merkleTreePath, 'utf8'));
  console.log('Merkle root:', endStateRoot, '\n');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  let privateKey = process.env.PRIVATE_KEY;

  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Deploying from:', wallet.address, '\n');

  // Load compiled contracts
  const merkleVerifierArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../contracts/MerkleProofVerifier.sol'),
      'utf8'
    )
  );

  const witnessVerifierArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../contracts/WitnessProofVerifier.sol'),
      'utf8'
    )
  );

  const finaleArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../hydra-visualiser/artifacts/contracts/TransevilFinale.sol/TransevilFinale.json'),
      'utf8'
    )
  );

  // Deploy MerkleProofVerifier
  console.log('Deploying MerkleProofVerifier...');
  const MerkleVerifier = new ethers.ContractFactory(
    merkleVerifierArtifact.abi,
    merkleVerifierArtifact.bytecode,
    wallet
  );
  const merkleVerifier = await MerkleVerifier.deploy();
  await merkleVerifier.waitForDeployment();
  const merkleVerifierAddress = await merkleVerifier.getAddress();
  console.log('✓ MerkleProofVerifier deployed:', merkleVerifierAddress, '\n');

  // Deploy WitnessProofVerifier
  console.log('Deploying WitnessProofVerifier...');
  const WitnessVerifier = new ethers.ContractFactory(
    witnessVerifierArtifact.abi,
    witnessVerifierArtifact.bytecode,
    wallet
  );
  const witnessVerifier = await WitnessVerifier.deploy();
  await witnessVerifier.waitForDeployment();
  const witnessVerifierAddress = await witnessVerifier.getAddress();
  console.log('✓ WitnessProofVerifier deployed:', witnessVerifierAddress, '\n');

  // Deploy TransevilFinale
  console.log('Deploying TransevilFinale...');

  const name = process.env.NFT_NAME || 'TRANSEVIL';
  const symbol = process.env.NFT_SYMBOL || 'TRNSEVL';
  const baseURI = process.env.BASE_URI || 'ipfs://REPLACE_WITH_IPFS_CID/';

  const Finale = new ethers.ContractFactory(
    finaleArtifact.abi,
    finaleArtifact.bytecode,
    wallet
  );

  const finale = await Finale.deploy(
    name,
    symbol,
    baseURI,
    endStateRoot,
    merkleVerifierAddress,
    witnessVerifierAddress
  );

  await finale.waitForDeployment();
  const finaleAddress = await finale.getAddress();
  console.log('✓ TransevilFinale deployed:', finaleAddress, '\n');

  // Save deployment info
  const deployment = {
    network: 'sepolia',
    timestamp: new Date().toISOString(),
    contracts: {
      merkleVerifier: merkleVerifierAddress,
      witnessVerifier: witnessVerifierAddress,
      finale: finaleAddress
    },
    config: {
      name,
      symbol,
      baseURI,
      endStateRoot
    }
  };

  const outputPath = path.join(__dirname, '../contracts/deployment.json');
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));

  console.log('✅ Deployment complete!');
  console.log('Deployment info saved to:', outputPath);
  console.log('\nContract addresses:');
  console.log('  MerkleProofVerifier:', merkleVerifierAddress);
  console.log('  WitnessProofVerifier:', witnessVerifierAddress);
  console.log('  TransevilFinale:', finaleAddress);
  console.log('\nView on Etherscan:');
  console.log(`  https://sepolia.etherscan.io/address/${finaleAddress}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
