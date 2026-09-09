const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

/**
 * Deploys VerityIdentityNFT v4 (the QUESTIONING model, with REAFFIRM).
 *
 * Records the deployment under deployments/verity-identity-v4-<network>.json
 * with the network name resolved BEFORE writing, so no more
 * "-undefined.json" files with unprovenanced addresses.
 *
 * Optional env: FUNDRAISER_ADDRESS — FFS fund destination (defaults to
 * the deployer).
 */
async function main() {
  const network = hre.network.name;
  if (!network) {
    throw new Error("Refusing to deploy: network name is unresolved.");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying VerityIdentityNFT v4 to '${network}' as ${deployer.address}`);

  const fundraiser = process.env.FUNDRAISER_ADDRESS || deployer.address;
  const factory = await hre.ethers.getContractFactory(
    "contracts/VerityIdentityNFT_v4.sol:VerityIdentityNFT"
  );
  const contract = await factory.deploy(fundraiser);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const tx = contract.deploymentTransaction();

  const record = {
    version: "v4",
    network,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    address,
    deployer: deployer.address,
    fundraiser,
    mintPrice: hre.ethers.formatEther(await contract.mintPrice()),
    verifier: "unset — declarations trust ownership until setVerifier + lockVerifier",
    txHash: tx?.hash ?? null,
    timestamp: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `verity-identity-v4-${network}.json`);
  fs.writeFileSync(outFile, JSON.stringify(record, null, 2));

  console.log(`Deployed: ${address}`);
  console.log(`Recorded: ${outFile}`);
  console.log(
    "Next: set NEXT_PUBLIC_VERITY_CONTRACT in web/, swap the storage layer in web/hooks/useIdentity.js + web/lib/identity.js."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
