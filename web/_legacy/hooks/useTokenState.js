'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { getIdentityState, IDState } from '@/lib/stateLogic';

/**
 * Hook to determine wallet's token ownership state.
 * Queries the contract for valid and invalid token counts,
 * then derives the IDState.
 *
 * For now, uses mock data until contract is deployed.
 */
export function useTokenState() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [state, setState] = useState(IDState.NONE);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isConnected || !address) {
      setState(IDState.NONE);
      setValidCount(0);
      setInvalidCount(0);
      setTokens([]);
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual contract calls when deployed
      // For now, default to NONE state (no tokens)
      //
      // In production this would be:
      //   const tokenIds = await contract.getTokensByAddress(address);
      //   for each tokenId: check if invalidated
      //   count valid vs invalid
      //
      const vc = 0;
      const ic = 0;

      setValidCount(vc);
      setInvalidCount(ic);
      setState(getIdentityState(vc, ic));
      setTokens([]);
    } catch (err) {
      console.error('Failed to fetch token state:', err);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    state,
    validCount,
    invalidCount,
    tokens,
    loading,
    refresh,
    isConnected,
    address,
  };
}
