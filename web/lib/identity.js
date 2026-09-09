/**
 * ARE YOU VERITY? — identity state machine
 *
 * Implements the NEW logic from the flow diagrams (10 Verity 2026):
 *   1. answer yes/no
 *   2. submit a proof OR generate one from private parameters
 *   3. the app verifies the proof
 *   4. proceed with the decision tree given (validity, answer)
 *   5. NOTE: Valid + Questioning is still Valid
 *
 * Instead of punitive strikes, contradiction marks an identity as
 * QUESTIONING. Contradicting a QUESTIONING identity again voids it.
 *
 * Validity table (from the dev diagram):
 *   NFT + proof              = VALID
 *   questioning NFT + proof  = QUESTIONING
 *   void NFT + proof         = VOID
 *   no NFT + proof           = VOID
 *   NFT + no proof           = NONE
 *   no NFT + no proof        = NONE
 *
 * Tokens are persisted in localStorage until the smart contract is wired
 * in — every read/write below is isolated so the on-chain implementation
 * can replace the storage layer without touching the decision tree.
 */

const STORE_KEY = 'areyouverity.registry.v1';
const SESSION_ANSWER = 'ayj.answer';
const SESSION_VERIFIED = 'ayj.verifiedToken';

export const TokenKind = {
  VERITY: 'VERITY',
  NOTVERITY: 'NOTVERITY',
};

export const TokenStatus = {
  VALID: 'VALID',
  QUESTIONING: 'QUESTIONING',
  VOID: 'VOID',
};

/* ------------------------------------------------------------------ */
/* storage                                                             */
/* ------------------------------------------------------------------ */

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ayj:change'));
  }
}

export function loadTokens() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveTokens(tokens) {
  localStorage.setItem(STORE_KEY, JSON.stringify(tokens));
  emitChange();
}

export function getToken(id) {
  return loadTokens().find((t) => t.id === id) || null;
}

export function findByCommitment(commitment) {
  if (!commitment) return null;
  const c = String(commitment).toLowerCase();
  return loadTokens().find((t) => t.commitment.toLowerCase() === c) || null;
}

export function mintToken({ kind, image, commitment, address, replaces }) {
  let tokens = loadTokens();
  // Renewing replaces the identity it renews rather than accumulating a new
  // one beside it. (When on-chain, the token id is the contract's; here the
  // commitment is the document's only key — no human-readable serial.)
  if (replaces) {
    tokens = tokens.filter((t) => t.id !== replaces);
  }
  const token = {
    id: commitment,
    kind,
    status: TokenStatus.VALID,
    image: image || null,
    commitment,
    address: address || 'UNCONNECTED',
    inception: new Date().toISOString(),
  };
  saveTokens([...tokens, token]);
  return token;
}

export function setTokenStatus(id, status) {
  const tokens = loadTokens().map((t) =>
    t.id === id ? { ...t, status } : t
  );
  saveTokens(tokens);
}

export function burnToken(id) {
  saveTokens(loadTokens().filter((t) => t.id !== id));
}

/**
 * Summary for the header chip. When an address is given, only documents
 * bound to that address (or issued unconnected) speak for the holder.
 *
 * Holding a valid Verity AND a valid Nonverity at once is not an error —
 * it is the paradox state, and the registry names it rather than
 * pretending it cannot happen.
 * A questioning identity otherwise takes visual precedence; then the
 * most recently minted valid identity speaks.
 */
export function summarize(tokens, address) {
  let scope = tokens;
  if (address) {
    const a = String(address).toLowerCase();
    scope = tokens.filter(
      (t) => t.address === 'UNCONNECTED' || String(t.address).toLowerCase() === a
    );
  }
  if (!scope.length) return 'NONE';
  const validKinds = new Set(
    scope.filter((t) => t.status === TokenStatus.VALID).map((t) => t.kind)
  );
  if (validKinds.has(TokenKind.VERITY) && validKinds.has(TokenKind.NOTVERITY)) {
    return 'PARADOX';
  }
  if (scope.some((t) => t.status === TokenStatus.QUESTIONING)) {
    return 'QUESTIONING';
  }
  const valid = [...scope]
    .reverse()
    .find((t) => t.status === TokenStatus.VALID);
  if (valid) {
    return valid.kind === TokenKind.VERITY ? 'VALID_VERITY' : 'VALID_NOTVERITY';
  }
  return 'VOID';
}

/** True when the registry holds both a valid Verity and a valid Nonverity. */
export function isParadox(tokens) {
  const kinds = new Set(
    tokens.filter((t) => t.status === TokenStatus.VALID).map((t) => t.kind)
  );
  return kinds.has(TokenKind.VERITY) && kinds.has(TokenKind.NOTVERITY);
}

/* ------------------------------------------------------------------ */
/* session claim                                                       */
/* ------------------------------------------------------------------ */

export function rememberAnswer(claimsVerity) {
  sessionStorage.setItem(SESSION_ANSWER, claimsVerity ? 'verity' : 'nonverity');
}

export function recallAnswer() {
  if (typeof window === 'undefined') return null;
  const v = sessionStorage.getItem(SESSION_ANSWER);
  return v === null ? null : v === 'verity';
}

export function rememberVerifiedToken(id) {
  sessionStorage.setItem(SESSION_VERIFIED, id);
}

export function clearVerifiedToken() {
  sessionStorage.removeItem(SESSION_VERIFIED);
}

export function recallVerifiedToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_VERIFIED);
}

/* ------------------------------------------------------------------ */
/* the decision tree                                                   */
/* ------------------------------------------------------------------ */

/**
 * The complete decision tree. Callers verify the proof file first; a file
 * that fails verification never reaches this function.
 *
 * @param {boolean} answerVerity   — the answer to "Are you Verity?"
 * @param {object|null} token    — the registry token matching the proof's
 *                                 commitment, or null if none matched
 * @param {boolean} proofVerified — true when a proof verified but may not
 *                                 match any document
 * @returns {{ route: string, effect: null | {type: string, tokenId: string} }}
 */
export function decide(answerVerity, token, proofVerified = false) {
  if (!token) {
    // Verified proof, unknown commitment: no NFT + proof = VOID.
    if (proofVerified) {
      return {
        route: `/status/void?claim=${answerVerity ? 'verity' : 'nonverity'}&unknown=1`,
        effect: null,
      };
    }
    // No proof → the system knows nothing about you (state NONE).
    return {
      route: answerVerity ? '/inception?as=verity' : '/inception?as=nonverity',
      effect: null,
    };
  }

  const matchesKind =
    (token.kind === TokenKind.VERITY) === Boolean(answerVerity);

  if (token.status === TokenStatus.VALID) {
    if (matchesKind) {
      // Consistent declaration → welcome home.
      return {
        route: `/collection?hi=${token.kind.toLowerCase()}`,
        effect: null,
      };
    }
    // Contradiction → the identity enters QUESTIONING (not punishment).
    return {
      route: '/status/questioning',
      effect: { type: 'QUESTION', tokenId: token.id },
    };
  }

  if (token.status === TokenStatus.QUESTIONING) {
    if (matchesKind) {
      // Answering consistently does not lift the questioning — a questioned
      // document stays questioned. It is still valid to hold; it simply
      // carries the mark. (Reaffirm-to-valid is intentionally not in the logic.)
      return {
        route: `/collection?hi=${token.kind.toLowerCase()}`,
        effect: null,
      };
    }
    // Contradicted again → the identity is revoked.
    return {
      route: '/status/invalid',
      effect: { type: 'REVOKE', tokenId: token.id },
    };
  }

  // VOID token
  return {
    route: `/status/void?claim=${answerVerity ? 'verity' : 'nonverity'}`,
    effect: null,
  };
}

/** Apply a decision's side-effect to the registry. */
export function applyEffect(effect) {
  if (!effect) return;
  if (effect.type === 'QUESTION') {
    setTokenStatus(effect.tokenId, TokenStatus.QUESTIONING);
  } else if (effect.type === 'REVOKE') {
    setTokenStatus(effect.tokenId, TokenStatus.VOID);
  }
}
