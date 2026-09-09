import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("\n=== Deploying VerityIdentityNFT v2 ===\n");

  // Hardhat 3: network access goes through an explicit connection
  const connection = await hre.network.connect();
  const { ethers, networkName } = connection;

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Fully qualified name: three .sol files declare "VerityIdentityNFT",
  // so the bare name is ambiguous (HH701)
  const VerityIdentityNFT = await ethers.getContractFactory(
    "contracts/VerityIdentityNFT_v2.sol:VerityIdentityNFT"
  );

  console.log("Deploying contract...");

  // Deploy the contract
  const verityIdentity = await VerityIdentityNFT.deploy();

  await verityIdentity.waitForDeployment();

  const address = await verityIdentity.getAddress();

  console.log("\n✅ VerityIdentityNFT v2 deployed successfully!\n");
  console.log("=== Deployment Summary ===");
  console.log("Contract: VerityIdentityNFT v2");
  console.log("Address:", address);
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log("Tx Hash:", verityIdentity.deploymentTransaction().hash);

  // Get initial state
  const affirmationPrice = await verityIdentity.affirmationPrice();
  const denialPrice = await verityIdentity.denialPrice();
  const verityCount = await verityIdentity.getVerityCount();

  console.log("\n=== Initial Configuration ===");
  console.log("Affirmation Price (YES):", ethers.formatEther(affirmationPrice), "ETH");
  console.log("Denial Price (NO):", ethers.formatEther(denialPrice), "ETH");
  console.log("Verity Registry Count:", verityCount.toString());

  console.log("\n=== Are You Verity? ===");
  console.log("The contract is ready to receive identity commitments.");
  console.log("Multiple people can be Verity.");
  console.log("Identity is commitment, not biology.");
  console.log("Denial has value.");

  // Save deployment info
  const deploymentInfo = {
    version: "2.0",
    network: networkName,
    contract: "VerityIdentityNFT",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    affirmationPrice: ethers.formatEther(affirmationPrice),
    denialPrice: ethers.formatEther(denialPrice),
    transactionHash: verityIdentity.deploymentTransaction().hash,
    blockNumber: verityIdentity.deploymentTransaction().blockNumber
  };

  const outputPath = `./deployments/verity-identity-v2-${networkName}.json`;
  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:", outputPath);

  // Save contract address for web app
  const contractConfigPath = './web/lib/contract-address.json';
  const contractConfig = {
    address: address,
    network: networkName,
    deployedAt: new Date().toISOString()
  };
  fs.writeFileSync(contractConfigPath, JSON.stringify(contractConfig, null, 2));
  console.log("📝 Contract address saved for web app:", contractConfigPath);

  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\n🔍 To verify on the block explorer, run:");
    console.log(`npx hardhat verify --network ${networkName} ${address}`);
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Update web/lib/contract.js with new CONTRACT_ADDRESS");
  console.log("2. Update web/lib/contract.js with v2 ABI");
  console.log("3. Test minting with affirmation (YES path)");
  console.log("4. Test minting with denial (NO path)");
  console.log("5. Test contradiction transformation");
  console.log("6. Verify Verity Registry updates correctly");
  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:\n", error);
    process.exit(1);
  });
