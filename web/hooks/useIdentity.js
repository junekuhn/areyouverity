'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadTokens, summarize } from '@/lib/identity';

/**
 * Live view of the identity registry. Re-renders on registry changes
 * (same-tab via the ayj:change event, cross-tab via storage events).
 *
 * When the smart contract is deployed this hook becomes the single
 * place that swaps localStorage reads for contract reads.
 */
export function useIdentity(address) {
  const [tokens, setTokens] = useState([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setTokens(loadTokens());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('ayj:change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('ayj:change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return {
    tokens,
    ready,
    summary: summarize(tokens, address),
    refresh,
  };
}
