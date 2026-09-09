import { ethers as ethersModule } from "ethers";
import fs from 'fs';

// This script connects straight to SEPOLIA_RPC_URL, so the network label is
// fixed here rather than read from Hardhat (hre.network.name no longer exists
// in Hardhat 3 and previously produced "verity-identity-v2-undefined.json").
const networkName = "sepolia";

async function main() {
  console.log("\n=== Deploying VerityIdentityNFT v2 ===\n");

  // Try to get provider and wallet
  const provider = new ethersModule.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const deployer = new ethersModule.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Deploying with:", deployer.address);

  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethersModule.formatEther(balance), "ETH\n");

  // Read contract artifacts
  const artifactPath = './artifacts/contracts/VerityIdentityNFT_v2.sol/VerityIdentityNFT.json';
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  console.log("Deploying contract...");
  const factory = new ethersModule.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ Deployed to:", address);
  console.log("Network:", networkName);

  // Save info
  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync(
    `./deployments/verity-identity-v2-${networkName}.json`,
    JSON.stringify({ address, network: networkName, deployer: deployer.address, timestamp: new Date().toISOString() }, null, 2)
  );

  fs.writeFileSync(
    './web/lib/contract-address.json',
    JSON.stringify({ address, network: networkName }, null, 2)
  );

  console.log("\n✨ Done!\n");
  console.log("Contract address:", address);
  console.log("\nNext: Update web app and redeploy");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
