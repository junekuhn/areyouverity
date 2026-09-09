// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockWitnessProofVerifier
 * @notice Mock verifier for testing - ALWAYS RETURNS TRUE
 * @dev Replace with actual Groth16 verifier in production
 */
contract MockWitnessProofVerifier {
    function verifyProof(
        uint[2] calldata, // _pA
        uint[2][2] calldata, // _pB
        uint[2] calldata, // _pC
        uint[3] calldata  // _pubSignals [nullifier, commitment, tokenId]
    ) external pure returns (bool) {
        // Mock implementation - always returns true
        // Replace with actual ZK verification in production
        return true;
    }
}
