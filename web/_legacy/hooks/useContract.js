'use client';

import { useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x8c93Bc2cDa13C7998093f1Ee7D139663FB454E69';

/**
 * Hook for contract interactions.
 * Wraps mint, burn, and query functions.
 */
export function useContract() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const mint = useCallback(async (metadataURI, isValid = true) => {
    if (!walletClient) throw new Error('Wallet not connected');

    // TODO: Call actual contract mint function
    // const hash = await walletClient.writeContract({
    //   address: CONTRACT_ADDRESS,
    //   abi: CONTRACT_ABI,
    //   functionName: 'mint',
    //   args: [metadataURI],
    //   value: parseEther('0.05'),
    // });
    // return hash;

    console.log('Mock mint:', { metadataURI, isValid, from: address });
    // Simulate network latency so pending states render like the real flow
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return '0x' + 'mock_tx_hash';
  }, [walletClient, address]);

  const burn = useCallback(async (tokenId) => {
    if (!walletClient) throw new Error('Wallet not connected');

    // TODO: Call actual contract burn function
    console.log('Mock burn:', { tokenId, from: address });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return '0x' + 'mock_burn_hash';
  }, [walletClient, address]);

  const getTokens = useCallback(async (ownerAddress) => {
    if (!publicClient) return [];

    // TODO: Query contract for tokens
    console.log('Mock getTokens for:', ownerAddress);
    return [];
  }, [publicClient]);

  return {
    mint,
    burn,
    getTokens,
    contractAddress: CONTRACT_ADDRESS,
  };
}
