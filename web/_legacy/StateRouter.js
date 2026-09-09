'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTokenState } from '@/hooks/useTokenState';
import { resolveRoute } from '@/lib/stateLogic';

/**
 * Handles routing based on wallet token state + user claim.
 * Called when user clicks "I AM VERITY" or "I AM NOT VERITY".
 */
export function useStateRouter() {
  const router = useRouter();
  const tokenState = useTokenState();

  const handleClaim = useCallback((claimsVerity) => {
    const { route } = resolveRoute(tokenState.state, claimsVerity);
    // Store the claim in sessionStorage so downstream pages can access it
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('areyouverity_claim', claimsVerity ? 'verity' : 'not-verity');
      sessionStorage.setItem('areyouverity_state', tokenState.state);
    }
    router.push(route);
  }, [tokenState.state, router]);

  return {
    handleClaim,
    ...tokenState,
  };
}
