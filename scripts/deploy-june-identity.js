const hre = require("hardhat");

async function main() {
  console.log("Deploying VerityIdentityNFT contract...");

  // Get the contract factory
  const VerityIdentityNFT = await hre.ethers.getContractFactory("VerityIdentityNFT");

  // Deploy the contract
  const verityIdentity = await VerityIdentityNFT.deploy();

  await verityIdentity.waitForDeployment();

  const address = await verityIdentity.getAddress();

  console.log("VerityIdentityNFT deployed to:", address);
  console.log("\n=== Deployment Summary ===");
  console.log("Contract: VerityIdentityNFT");
  console.log("Address:", address);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);

  // Get initial state
  const mintPrice = await verityIdentity.mintPrice();
  console.log("\n=== Initial Configuration ===");
  console.log("Mint Price:", hre.ethers.formatEther(mintPrice), "ETH");

  console.log("\n=== Are You Verity? ===");
  console.log("The contract is ready to receive identity commitments.");
  console.log("Multiple people can be Verity.");
  console.log("Identity is commitment, not biology.");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contract: "VerityIdentityNFT",
    address: address,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    mintPrice: hre.ethers.formatEther(mintPrice),
    transactionHash: verityIdentity.deploymentTransaction().hash
  };

  const outputPath = `./deployments/verity-identity-${hre.network.name}.json`;
  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\nDeployment info saved to:", outputPath);

  // If on a testnet, verify contract
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await verityIdentity.deploymentTransaction().wait(5);

    console.log("\nVerifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
