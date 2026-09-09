const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying VerityIdentityNFT v3 (Social Mechanics Edition)...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  const VerityIdentityNFT = await hre.ethers.getContractFactory("VerityIdentityNFT");
  const contract = await VerityIdentityNFT.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ VerityIdentityNFT v3 deployed to:", contractAddress);

  // Get initial state
  const affirmPrice = await contract.affirmationPrice();
  const denialPrice = await contract.denialPrice();
  const minChallengeStake = await contract.minimumChallengeStake();
  const challengeDuration = await contract.challengeDuration();

  console.log("\n📊 Contract Configuration:");
  console.log("- Affirmation Price:", hre.ethers.formatEther(affirmPrice), "ETH");
  console.log("- Denial Price:", hre.ethers.formatEther(denialPrice), "ETH");
  console.log("- Min Challenge Stake:", hre.ethers.formatEther(minChallengeStake), "ETH");
  console.log("- Challenge Duration:", Number(challengeDuration) / 86400, "days");

  console.log("\n🎮 New Features:");
  console.log("✓ Witness Protocol (3 witnesses per identity)");
  console.log("✓ Challenge System (stake to challenge contradictions)");
  console.log("✓ Reputation System (earn/lose based on actions)");
  console.log("✓ Public Events Feed (social activity stream)");
  console.log("✓ Verity Census (live statistics)");

  console.log("\n🔗 Contract deployed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update web/.env.local with contract address:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Update web/lib/contract.js with new ABI");
  console.log("3. Test features on frontend");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    version: "v3",
    features: [
      "Witness Protocol",
      "Challenge System",
      "Reputation System",
      "Social Feed",
      "Verity Census"
    ],
    config: {
      affirmationPrice: hre.ethers.formatEther(affirmPrice),
      denialPrice: hre.ethers.formatEther(denialPrice),
      minChallengeStake: hre.ethers.formatEther(minChallengeStake),
      challengeDurationDays: Number(challengeDuration) / 86400
    }
  };

  fs.writeFileSync(
    'deployments/verity-identity-v3-' + hre.network.name + '.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to deployments/verity-identity-v3-" + hre.network.name + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
