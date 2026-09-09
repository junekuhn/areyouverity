/**
 * Verity Identity Contract Interaction Library
 *
 * Provides functions for interacting with the VerityIdentityNFT smart contract
 */

import { ethers } from 'ethers';

// Contract ABI (simplified - update with full ABI after deployment)
const VERITY_IDENTITY_ABI = [
  "function createVerityIdentity(string metadataURI, string imageData, bytes32 identityCommitment) payable returns (uint256)",
  "function verifyVerityIdentity(uint256 tokenId, bytes32 proof) view returns (bool)",
  "function denyBeingVerity(uint256 tokenId)",
  "function permanentlyBlockSelf()",
  "function isVerity(address account) view returns (bool)",
  "function getTokensByAddress(address account) view returns (uint256[])",
  "function getIdentityCommitment(uint256 tokenId) view returns (bytes32)",
  "function getTokenImage(uint256 tokenId) view returns (string)",
  "function tokenInvalidated(uint256) view returns (bool)",
  "function permanentlyBlocked(address) view returns (bool)",
  "function hasVerityIdentity(address) view returns (bool)",
  "function mintPrice() view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
];

// Contract address (update after deployment)
const VERITY_IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_VERITY_IDENTITY_CONTRACT || "";

/**
 * Get contract instance
 */
export function getVerityIdentityContract(signerOrProvider) {
  return new ethers.Contract(
    VERITY_IDENTITY_ADDRESS,
    VERITY_IDENTITY_ABI,
    signerOrProvider
  );
}

/**
 * Check if an address is Verity (owns valid tokens)
 */
export async function checkIsVerity(provider, address) {
  try {
    const contract = getVerityIdentityContract(provider);
    const isVerity = await contract.isVerity(address);
    return isVerity;
  } catch (error) {
    console.error('Error checking if Verity:', error);
    throw error;
  }
}

/**
 * Get all tokens owned by an address
 */
export async function getAddressTokens(provider, address) {
  try {
    const contract = getVerityIdentityContract(provider);
    const tokens = await contract.getTokensByAddress(address);
    return tokens.map(t => Number(t));
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
}

/**
 * Check if address is permanently blocked
 */
export async function checkPermanentlyBlocked(provider, address) {
  try {
    const contract = getVerityIdentityContract(provider);
    const blocked = await contract.permanentlyBlocked(address);
    return blocked;
  } catch (error) {
    console.error('Error checking if blocked:', error);
    throw error;
  }
}

/**
 * Check if address has Verity identity
 */
export async function checkHasVerityIdentity(provider, address) {
  try {
    const contract = getVerityIdentityContract(provider);
    const hasIdentity = await contract.hasVerityIdentity(address);
    return hasIdentity;
  } catch (error) {
    console.error('Error checking identity:', error);
    throw error;
  }
}

/**
 * Generate identity commitment hash
 */
export function generateIdentityCommitment(imageData, distortionLevel, address) {
  // Create a hash from the identity data
  // In production, this would be part of a proper ZK proof system
  const data = ethers.solidityPackedKeccak256(
    ['string', 'uint256', 'address', 'uint256'],
    [imageData, distortionLevel, address, Date.now()]
  );
  return data;
}

/**
 * Create Verity identity (mint NFT)
 */
export async function createVerityIdentity(
  signer,
  metadataURI,
  imageData,
  identityCommitment
) {
  try {
    const contract = getVerityIdentityContract(signer);
    const mintPrice = await contract.mintPrice();

    const tx = await contract.createVerityIdentity(
      metadataURI,
      imageData,
      identityCommitment,
      { value: mintPrice }
    );

    const receipt = await tx.wait();

    // Extract token ID from event
    const event = receipt.logs.find(
      log => log.fragment && log.fragment.name === 'NFTMinted'
    );
    const tokenId = event ? Number(event.args[1]) : null;

    return { tokenId, receipt };
  } catch (error) {
    console.error('Error creating identity:', error);
    throw error;
  }
}

/**
 * Verify Verity identity with ZK proof
 */
export async function verifyVerityIdentity(provider, tokenId, proof) {
  try {
    const contract = getVerityIdentityContract(provider);
    const isValid = await contract.verifyVerityIdentity(tokenId, proof);
    return isValid;
  } catch (error) {
    console.error('Error verifying identity:', error);
    throw error;
  }
}

/**
 * Deny being Verity (invalidate token)
 */
export async function denyBeingVerity(signer, tokenId) {
  try {
    const contract = getVerityIdentityContract(signer);
    const tx = await contract.denyBeingVerity(tokenId);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Error denying identity:', error);
    throw error;
  }
}

/**
 * Permanently block self from becoming Verity
 */
export async function permanentlyBlockSelf(signer) {
  try {
    const contract = getVerityIdentityContract(signer);
    const tx = await contract.permanentlyBlockSelf();
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Error blocking self:', error);
    throw error;
  }
}

/**
 * Get token metadata
 */
export async function getTokenMetadata(provider, tokenId) {
  try {
    const contract = getVerityIdentityContract(provider);

    const [owner, imageData, commitment, invalidated] = await Promise.all([
      contract.ownerOf(tokenId),
      contract.getTokenImage(tokenId),
      contract.getIdentityCommitment(tokenId),
      contract.tokenInvalidated(tokenId),
    ]);

    return {
      tokenId,
      owner,
      imageData,
      commitment,
      invalidated,
    };
  } catch (error) {
    console.error('Error getting token metadata:', error);
    throw error;
  }
}

/**
 * Get mint price in ETH
 */
export async function getMintPrice(provider) {
  try {
    const contract = getVerityIdentityContract(provider);
    const price = await contract.mintPrice();
    return ethers.formatEther(price);
  } catch (error) {
    console.error('Error getting mint price:', error);
    throw error;
  }
}

/**
 * Upload metadata to IPFS (placeholder)
 */
export async function uploadToIPFS(metadata, imageData) {
  // TODO: Implement actual IPFS upload
  // For now, return a placeholder URI

  const metadataJSON = {
    name: "Verity Identity",
    description: "An identity commitment in the Are You Verity? system",
    image: imageData,
    attributes: [
      {
        trait_type: "Identity Type",
        value: "Verity"
      },
      {
        trait_type: "Creation Date",
        value: new Date().toISOString()
      }
    ],
    ...metadata
  };

  // Placeholder - in production, upload to IPFS via Pinata, NFT.storage, etc.
  const mockIPFSHash = 'Qm' + Math.random().toString(36).substring(2, 15);
  return `ipfs://${mockIPFSHash}`;
}

/**
 * Generate ZK proof (simplified)
 */
export function generateProof(commitment) {
  // In production, this would generate a proper ZK-SNARK proof
  // For now, return a simplified proof
  return ethers.keccak256(commitment);
}
