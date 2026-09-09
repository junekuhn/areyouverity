import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('Deploying HydraVerseNFT contract...');

  // Read the compiled contract
  const artifactPath = path.join(__dirname, '../hydra-visualiser/artifacts/contracts/HydraVerseNFT.sol/HydraVerseNFT.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  let privateKey = process.env.PRIVATE_KEY;

  // Ensure private key has 0x prefix
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('Deploying from:', wallet.address);

  // Create contract factory and deploy
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('HydraVerseNFT deployed to:', address);

  // Save contract info
  const contractInfo = {
    address: address,
    abi: artifact.abi
  };

  const outputPath = path.join(__dirname, '../hydra-visualiser/src/contract-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));

  console.log('Contract info saved to:', outputPath);
  console.log('\n✅ Deployment complete!');
  console.log('Contract address:', address);
  console.log('View on Etherscan:', `https://sepolia.etherscan.io/address/${address}`);
  console.log('\nNOTE: This contract is Verse-compatible!');
  console.log('- Includes mint() and mintBatch() functions');
  console.log('- Has minting manager functionality');
  console.log('- Set minting manager with: setMintingManager(address)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
