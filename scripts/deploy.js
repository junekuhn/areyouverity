import hre from "hardhat";
import fs from "fs";
import { ethers } from "ethers";

async function main() {
  console.log("Deploying HydraNFT contract...");

  const HydraNFT = await hre.ethers.getContractFactory("HydraNFT");
  const hydraNFT = await HydraNFT.deploy();

  await hydraNFT.waitForDeployment();

  const address = await hydraNFT.getAddress();
  console.log(`HydraNFT deployed to: ${address}`);

  // Save the contract address to a file for the frontend
  const contractInfo = {
    address: address,
    network: "sepolia",
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "./hydra-visualiser/src/contract-address.json",
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract address saved to hydra-visualiser/src/contract-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
