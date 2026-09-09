/**
 * State Machine for "Are You Verity?" identity flow
 *
 * States:
 *   NONE           - No tokens
 *   VALID          - Owns 1 Valid (Verity) token
 *   INVALID        - Owns 1 Invalid (Not-Verity) token
 *   VALID_INVALID  - Owns both Valid and Invalid tokens (paradox / VIV)
 *   VALID_PLUS     - Owns multiple Valid tokens
 *   INVALID_PLUS   - Owns multiple Invalid tokens
 *   VIV_PLUS       - Owns multiple of both types
 */

export const IDState = {
  NONE: 'NONE',
  VALID: 'VALID',
  INVALID: 'INVALID',
  VALID_INVALID: 'VALID_INVALID',
  VALID_PLUS: 'VALID_PLUS',
  INVALID_PLUS: 'INVALID_PLUS',
  VIV_PLUS: 'VIV_PLUS',
};

/**
 * Determine wallet's identity state from token ownership
 * @param {number} validCount - Number of valid (Verity) tokens
 * @param {number} invalidCount - Number of invalid (Not-Verity) tokens
 * @returns {string} IDState value
 */
export function getIdentityState(validCount, invalidCount) {
  const hasValid = validCount > 0;
  const hasInvalid = invalidCount > 0;
  const multiValid = validCount > 1;
  const multiInvalid = invalidCount > 1;

  if (!hasValid && !hasInvalid) return IDState.NONE;
  if (hasValid && hasInvalid && (multiValid || multiInvalid)) return IDState.VIV_PLUS;
  if (hasValid && hasInvalid) return IDState.VALID_INVALID;
  if (multiValid) return IDState.VALID_PLUS;
  if (multiInvalid) return IDState.INVALID_PLUS;
  if (hasValid) return IDState.VALID;
  if (hasInvalid) return IDState.INVALID;

  return IDState.NONE;
}

/**
 * Determine route based on identity state + user claim
 * @param {string} state - IDState value
 * @param {boolean} claimsVerity - true if user clicked "I AM VERITY", false for "I AM NOT VERITY"
 * @returns {{ route: string, message: string, actions: Array<{label: string, href: string}> }}
 */
export function resolveRoute(state, claimsVerity) {
  // NONE + YES → identity creation (become Verity)
  if (state === IDState.NONE && claimsVerity) {
    return {
      route: '/identity-creation/stage-1',
      message: 'You claim to be Verity, but you do not yet own a valid Verity identity token. To verify that you are Verity, you must commit to creating a token.',
      actions: [
        { label: 'CREATE IDENTITY', href: '/identity-creation/stage-1' },
      ],
    };
  }

  // NONE + NO → witness page (ZK explainer), then option to validate as Not Verity
  if (state === IDState.NONE && !claimsVerity) {
    return {
      route: '/witness',
      message: 'Would you like to learn about how this identity system works through zero-knowledge proofs?',
      actions: [
        { label: 'LEARN ABOUT ZK-PROOFS', href: '/witness' },
        { label: 'VALIDATE AS NOT VERITY', href: '/identity-creation/stage-1?type=invalid' },
      ],
    };
  }

  // VALID + YES → view collection / duplicate
  if (state === IDState.VALID && claimsVerity) {
    return {
      route: '/collection',
      message: 'Welcome back, Verity. Your identity is valid.',
      actions: [
        { label: 'VIEW COLLECTION', href: '/collection' },
        { label: 'DUPLICATE ID', href: '/identity-creation/stage-1?type=duplicate' },
      ],
    };
  }

  // VALID + NO → STRIKE! contradiction - valid becomes invalid
  if (state === IDState.VALID && !claimsVerity) {
    return {
      route: '/error-states/mistake',
      message: 'There\'s been a mistake. You have a valid ID and you claim you\'re not Verity. The ID you used to reach this page has become INVALID. Collection is not currently available.',
      actions: [
        { label: 'LEARN ABOUT ZK-PROOFS', href: '/witness' },
        { label: 'BACK TO MAIN', href: '/' },
        { label: 'BURN INVALID ID', href: '/burn' },
      ],
    };
  }

  // INVALID + YES → "your ID is invalid/expired" - can get new valid
  if (state === IDState.INVALID && claimsVerity) {
    return {
      route: '/error-states/invalid-id',
      message: 'Verity, I\'m sorry but your ID is invalid. You currently own an invalid ID, and you should consider carrying one that is valid.',
      actions: [
        { label: 'CREATE NEW VALID ID', href: '/identity-creation/stage-1' },
        { label: 'VIEW COLLECTION', href: '/collection' },
        { label: 'BURN INVALID ID', href: '/burn' },
      ],
    };
  }

  // INVALID + NO → "Ok, you're not Verity. Sign for it?" (create new valid-invalid)
  if (state === IDState.INVALID && !claimsVerity) {
    return {
      route: '/error-states/not-verity',
      message: 'Hi, not Verity. You already own an invalid ID. Would you like a duplicate, or view the collection?',
      actions: [
        { label: 'VIEW COLLECTION', href: '/collection' },
        { label: 'DUPLICATE ID', href: '/identity-creation/stage-1?type=invalid-duplicate' },
      ],
    };
  }

  // VALID_INVALID + YES → "Invalid hack" - invalid stays, new valid opportunity
  if (state === IDState.VALID_INVALID && claimsVerity) {
    return {
      route: '/error-states/invalid-id',
      message: 'Your ID is invalid/expired. You hold both valid and invalid identities - a paradox state. Ready for a new ID?',
      actions: [
        { label: 'VIEW COLLECTION', href: '/collection' },
        { label: 'CREATE NEW ID', href: '/identity-creation/stage-1' },
      ],
    };
  }

  // VALID_INVALID + NO → VIV strike
  if (state === IDState.VALID_INVALID && !claimsVerity) {
    return {
      route: '/error-states/mistake',
      message: 'There\'s been a mistake. You hold both valid and invalid identities and now deny being Verity. Your valid ID has received a strike. Collection is not currently available.',
      actions: [
        { label: 'LEARN ABOUT ZK-PROOFS', href: '/witness' },
        { label: 'BACK TO MAIN', href: '/' },
        { label: 'BURN INVALID ID', href: '/burn' },
      ],
    };
  }

  // VIV / VIV_PLUS → strike, collection unavailable
  if (state === IDState.VIV_PLUS) {
    return {
      route: '/error-states/mistake',
      message: 'Your identity state is deeply contradictory. You hold multiple valid and invalid IDs. Collection is not currently available.',
      actions: [
        { label: 'LEARN ABOUT ZK-PROOFS', href: '/witness' },
        { label: 'BACK TO MAIN', href: '/' },
      ],
    };
  }

  // VALID_PLUS + YES → view collection / more duplicates
  if (state === IDState.VALID_PLUS && claimsVerity) {
    return {
      route: '/collection',
      message: 'Welcome back, Verity. You hold multiple valid identities.',
      actions: [
        { label: 'VIEW COLLECTION', href: '/collection' },
      ],
    };
  }

  // VALID_PLUS + NO → strike on all
  if (state === IDState.VALID_PLUS && !claimsVerity) {
    return {
      route: '/error-states/mistake',
      message: 'There\'s been a mistake. You hold multiple valid IDs and now deny being Verity. All IDs have received a strike. Collection is not currently available.',
      actions: [
        { label: 'BACK TO MAIN', href: '/' },
      ],
    };
  }

  // INVALID_PLUS + YES → view collection
  if (state === IDState.INVALID_PLUS && claimsVerity) {
    return {
      route: '/error-states/invalid-id',
      message: 'You hold multiple invalid IDs. Consider creating a valid one.',
      actions: [
        { label: 'CREATE VALID ID', href: '/identity-creation/stage-1' },
        { label: 'VIEW COLLECTION', href: '/collection' },
      ],
    };
  }

  // INVALID_PLUS + NO → view collection / duplicate
  if (state === IDState.INVALID_PLUS && !claimsVerity) {
    return {
      route: '/error-states/not-verity',
      message: 'Hi, not Verity. You already hold multiple invalid IDs.',
      actions: [
        { label: 'VIEW COLLECTION', href: '/collection' },
        { label: 'DUPLICATE ID', href: '/identity-creation/stage-1?type=invalid-duplicate' },
      ],
    };
  }

  // Fallback
  return {
    route: '/',
    message: 'Something unexpected happened.',
    actions: [
      { label: 'BACK TO MAIN', href: '/' },
    ],
  };
}
