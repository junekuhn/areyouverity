import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env from hydra-visualiser directory
dotenv.config({ path: path.join(process.cwd(), 'hydra-visualiser/.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploy TRANSEVIL contracts with MOCK verifiers
 *
 * This deploys:
 * 1. MockMerkleProofVerifier (for testing)
 * 2. MockWitnessProofVerifier (for testing)
 * 3. TransevilFinale (main NFT contract)
 *
 * NOTE: Mock verifiers always return true. Replace with real ZK verifiers in production.
 */

async function main() {
  console.log('Deploying TRANSEVIL contracts with MOCK verifiers...\n');
  console.log('⚠️  WARNING: Using mock verifiers that always return true');
  console.log('    Replace with real ZK verifiers before production use\n');

  // Mock Merkle root (placeholder for testing)
  const endStateRoot = '12345678901234567890123456789012345678901234567890123456789012345';
  console.log('Mock Merkle root:', endStateRoot, '\n');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  let privateKey = process.env.PRIVATE_KEY;

  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Deploying from:', wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH\n');

  // Load compiled contracts
  const merkleVerifierArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../hydra-visualiser/artifacts/contracts/MockMerkleProofVerifier.sol/MockMerkleProofVerifier.json'),
      'utf8'
    )
  );

  const witnessVerifierArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../hydra-visualiser/artifacts/contracts/MockWitnessProofVerifier.sol/MockWitnessProofVerifier.json'),
      'utf8'
    )
  );

  const finaleArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../hydra-visualiser/artifacts/contracts/TransevilFinale.sol/TransevilFinale.json'),
      'utf8'
    )
  );

  // Deploy MockMerkleProofVerifier
  console.log('Deploying MockMerkleProofVerifier...');
  const MerkleVerifier = new ethers.ContractFactory(
    merkleVerifierArtifact.abi,
    merkleVerifierArtifact.bytecode,
    wallet
  );
  const merkleVerifier = await MerkleVerifier.deploy();
  await merkleVerifier.waitForDeployment();
  const merkleVerifierAddress = await merkleVerifier.getAddress();
  console.log('✓ MockMerkleProofVerifier deployed:', merkleVerifierAddress, '\n');

  // Deploy MockWitnessProofVerifier
  console.log('Deploying MockWitnessProofVerifier...');
  const WitnessVerifier = new ethers.ContractFactory(
    witnessVerifierArtifact.abi,
    witnessVerifierArtifact.bytecode,
    wallet
  );
  const witnessVerifier = await WitnessVerifier.deploy();
  await witnessVerifier.waitForDeployment();
  const witnessVerifierAddress = await witnessVerifier.getAddress();
  console.log('✓ MockWitnessProofVerifier deployed:', witnessVerifierAddress, '\n');

  // Deploy TransevilFinale
  console.log('Deploying TransevilFinale...');

  const name = 'TRANSEVIL';
  const symbol = 'TRNSEVL';
  const baseURI = 'ipfs://REPLACE_WITH_IPFS_CID/';

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
    note: 'MOCK VERIFIERS - Replace with real ZK verifiers before production',
    contracts: {
      mockMerkleVerifier: merkleVerifierAddress,
      mockWitnessVerifier: witnessVerifierAddress,
      finale: finaleAddress
    },
    config: {
      name,
      symbol,
      baseURI,
      endStateRoot
    },
    abi: finaleArtifact.abi
  };

  const outputPath = path.join(__dirname, '../contracts/deployment.json');
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));

  console.log('✅ Deployment complete!');
  console.log('Deployment info saved to:', outputPath);
  console.log('\nContract addresses:');
  console.log('  MockMerkleProofVerifier:', merkleVerifierAddress);
  console.log('  MockWitnessProofVerifier:', witnessVerifierAddress);
  console.log('  TransevilFinale:', finaleAddress);
  console.log('\nView on Etherscan:');
  console.log(`  https://sepolia.etherscan.io/address/${finaleAddress}`);
  console.log('\n⚠️  IMPORTANT: This deployment uses mock verifiers for testing.');
  console.log('    Generate real ZK verifiers with circom before production use.\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
