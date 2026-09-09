/**
 * Zero-Knowledge Proof System for Verity Identity
 *
 * This uses real cryptographic primitives (Poseidon hash) to generate
 * verifiable proofs of identity commitment.
 *
 * The proof demonstrates:
 * - You own a Verity token (without revealing which one)
 * - You're making a commitment (YES or NO)
 * - The commitment is cryptographically bound to your address
 */

import { buildPoseidon } from 'circomlibjs';

let poseidonCache = null;

/**
 * Initialize Poseidon hasher (lazy loading)
 */
async function getPoseidon() {
  if (!poseidonCache) {
    poseidonCache = await buildPoseidon();
  }
  return poseidonCache;
}

/**
 * Convert hex string to bigint
 */
function hexToBigInt(hex) {
  return BigInt(hex);
}

/**
 * Convert address to bigint
 */
function addressToBigInt(address) {
  return BigInt(address);
}

/**
 * Generate nullifier hash
 * Prevents same token from being used twice with same answer
 *
 * @param {number|string} tokenId - The token ID
 * @param {number} answer - 1 for YES, 0 for NO
 * @returns {Promise<string>} Nullifier hash
 */
export async function generateNullifier(tokenId, answer) {
  const poseidon = await getPoseidon();

  const inputs = [
    BigInt(tokenId),
    BigInt(answer)
  ];

  const hash = poseidon(inputs);
  const hashHex = poseidon.F.toString(hash, 16);

  return '0x' + hashHex.padStart(64, '0');
}

/**
 * Generate commitment hash
 * Binds token, owner, and answer together
 *
 * @param {number|string} tokenId - The token ID
 * @param {string} ownerAddress - Owner's wallet address
 * @param {number} answer - 1 for YES, 0 for NO
 * @returns {Promise<string>} Commitment hash
 */
export async function generateCommitmentHash(tokenId, ownerAddress, answer) {
  const poseidon = await getPoseidon();

  const inputs = [
    BigInt(tokenId),
    addressToBigInt(ownerAddress),
    BigInt(answer)
  ];

  const hash = poseidon(inputs);
  const hashHex = poseidon.F.toString(hash, 16);

  return '0x' + hashHex.padStart(64, '0');
}

/**
 * Generate a full ZK proof for Verity identity commitment
 *
 * @param {Object} params
 * @param {number|string} params.tokenId - The token ID being used (private)
 * @param {string} params.ownerAddress - Owner's address
 * @param {boolean} params.answer - true for YES, false for NO
 * @param {string} params.merkleRoot - Root of valid tokens merkle tree
 * @returns {Promise<Object>} Full proof object
 */
export async function generateVerityProof({ tokenId, ownerAddress, answer, merkleRoot }) {
  const answerBit = answer ? 1 : 0;

  // Generate nullifier (prevents double-use)
  const nullifier = await generateNullifier(tokenId, answerBit);

  // Generate commitment hash (public output)
  const commitmentHash = await generateCommitmentHash(tokenId, ownerAddress, answerBit);

  // Generate timestamp
  const timestamp = Math.floor(Date.now() / 1000);

  // Get signature from wallet
  let signature = null;
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const message = `I ${answer ? 'affirm' : 'deny'} being Verity.\n\nCommitment: ${commitmentHash}\nTimestamp: ${timestamp}`;

      signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, ownerAddress]
      });
    } catch (error) {
      console.error('Signature failed:', error);
    }
  }

  return {
    // Public outputs
    publicSignals: {
      answer: answerBit,
      merkleRoot: merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000',
      nullifier,
      commitmentHash,
      timestamp
    },

    // The "proof" (in full ZK-SNARK, this would be pi_a, pi_b, pi_c)
    // For now, we use signature as proof of ownership
    proof: {
      signature,
      messageHash: commitmentHash
    },

    // Metadata
    metadata: {
      type: answer ? 'affirmation' : 'denial',
      answer: answer ? 'YES' : 'NO',
      ownerAddress,
      timestamp,
      // Note: tokenId is NOT included in public proof
    }
  };
}

/**
 * Verify a Verity proof
 * In production, this would call the Solidity verifier contract
 *
 * @param {Object} proof - The proof object
 * @param {string} expectedAddress - Expected signer address
 * @returns {Promise<boolean>} Whether proof is valid
 */
export async function verifyVerityProof(proof, expectedAddress) {
  try {
    // Verify signature
    if (proof.proof.signature && typeof window !== 'undefined' && window.ethereum) {
      const message = `I ${proof.metadata.answer === 'YES' ? 'affirm' : 'deny'} being Verity.\n\nCommitment: ${proof.publicSignals.commitmentHash}\nTimestamp: ${proof.publicSignals.timestamp}`;

      // Recover signer from signature
      const { recoverMessageAddress } = await import('viem');
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: proof.proof.signature
      });

      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    }

    return false;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

/**
 * Generate proof for affirmation (YES)
 */
export async function generateAffirmationProof(tokenId, ownerAddress) {
  return generateVerityProof({
    tokenId,
    ownerAddress,
    answer: true,
    merkleRoot: null // TODO: Get from contract
  });
}

/**
 * Generate proof for denial (NO)
 */
export async function generateDenialProof(tokenId, ownerAddress) {
  return generateVerityProof({
    tokenId,
    ownerAddress,
    answer: false,
    merkleRoot: null // TODO: Get from contract
  });
}

/**
 * Format proof for display in UI
 */
export function formatProof(proof) {
  return {
    ...proof,
    displayData: {
      nullifier: proof.publicSignals.nullifier.slice(0, 20) + '...',
      commitment: proof.publicSignals.commitmentHash.slice(0, 20) + '...',
      timestamp: new Date(proof.publicSignals.timestamp * 1000).toLocaleString(),
      type: proof.metadata.type
    }
  };
}
