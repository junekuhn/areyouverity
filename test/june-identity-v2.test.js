import { test } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

// Regression tests for the Verity Registry bookkeeping in VerityIdentityNFT_v2.
// The original _createToken minted before writing tokenMetadata, so _update()
// saw the zero-default state (Affirmed) and registered every minter as Verity —
// including explicit deniers.

async function deploy() {
  const connection = await hre.network.connect();
  const { ethers } = connection;
  const factory = await ethers.getContractFactory(
    "contracts/VerityIdentityNFT_v2.sol:VerityIdentityNFT"
  );
  const verity = await factory.deploy();
  await verity.waitForDeployment();
  return { ethers, verity };
}

test("denial minters are NOT added to the Verity registry", async () => {
  const { ethers, verity } = await deploy();
  const [, bob] = await ethers.getSigners();

  const commitment = ethers.keccak256(ethers.toUtf8Bytes("bob-denies"));
  await verity
    .connect(bob)
    .mintWithDenial("ipfs://meta", "ipfs://img", commitment, {
      value: ethers.parseEther("0.08"),
    });

  assert.equal(await verity.isVerity(bob.address), false);
  assert.equal(await verity.getVerityCount(), 0n);
});

test("affirmation minters ARE added to the Verity registry", async () => {
  const { ethers, verity } = await deploy();
  const [alice] = await ethers.getSigners();

  const commitment = ethers.keccak256(ethers.toUtf8Bytes("alice-affirms"));
  await verity.mintWithAffirmation("ipfs://meta", "ipfs://img", commitment, {
    value: ethers.parseEther("0.05"),
  });

  assert.equal(await verity.isVerity(alice.address), true);
  assert.equal(await verity.getVerityCount(), 1n);
});

test("minting records the token exactly once per address", async () => {
  const { ethers, verity } = await deploy();
  const [alice] = await ethers.getSigners();

  const commitment = ethers.keccak256(ethers.toUtf8Bytes("one-token"));
  await verity.mintWithAffirmation("ipfs://meta", "ipfs://img", commitment, {
    value: ethers.parseEther("0.05"),
  });

  const tokens = await verity.getTokensByAddress(alice.address);
  assert.equal(tokens.length, 1);
});

test("transferring an affirmed token moves registry membership", async () => {
  const { ethers, verity } = await deploy();
  const [alice, bob] = await ethers.getSigners();

  const commitment = ethers.keccak256(ethers.toUtf8Bytes("transfer-me"));
  await verity.mintWithAffirmation("ipfs://meta", "ipfs://img", commitment, {
    value: ethers.parseEther("0.05"),
  });

  const [tokenId] = await verity.getTokensByAddress(alice.address);
  await verity.transferFrom(alice.address, bob.address, tokenId);

  assert.equal(await verity.isVerity(alice.address), false);
  assert.equal(await verity.isVerity(bob.address), true);
  assert.equal((await verity.getTokensByAddress(alice.address)).length, 0);
  assert.equal((await verity.getTokensByAddress(bob.address)).length, 1);
});

test("registry membership survives while another affirmed token remains", async () => {
  const { ethers, verity } = await deploy();
  const [alice, bob] = await ethers.getSigners();

  const c1 = ethers.keccak256(ethers.toUtf8Bytes("first"));
  const c2 = ethers.keccak256(ethers.toUtf8Bytes("second"));
  await verity.mintWithAffirmation("ipfs://m1", "ipfs://i1", c1, {
    value: ethers.parseEther("0.05"),
  });
  await verity.mintWithAffirmation("ipfs://m2", "ipfs://i2", c2, {
    value: ethers.parseEther("0.05"),
  });

  const [firstToken] = await verity.getTokensByAddress(alice.address);
  await verity.transferFrom(alice.address, bob.address, firstToken);

  // Alice still holds one affirmed token, so she stays in the registry
  assert.equal(await verity.isVerity(alice.address), true);
  assert.equal(await verity.isVerity(bob.address), true);
});
