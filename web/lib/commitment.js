/**
 * Commitment + proof helpers.
 *
 * The private witness is the set of generative parameters chosen during
 * identity creation plus a random salt. The website never stores them —
 * they exist only in the file the signer downloads at mint time.
 *
 * commitment = Poseidon(param_0 … param_n, salt)
 *
 * The proof is Groth16-shaped (three points on a curve, per the dev
 * notes). Until the circom circuit + snarkjs pipeline is wired in, the
 * points are derived deterministically from the commitment with
 * Poseidon, so verification is: recompute the chain, match the
 * commitment against the registry. The file formats will not change
 * when the real prover lands.
 */

import { buildPoseidon } from 'circomlibjs';

let poseidonPromise = null;

async function getPoseidon() {
  if (!poseidonPromise) poseidonPromise = buildPoseidon();
  return poseidonPromise;
}

/**
 * Order matters: this is the canonical witness layout — the eleven
 * parameters of the generative sketch (see artwork). Their conceptual
 * names live in PARAM_LABELS.
 */
export const PARAM_KEYS = [
  'feedback',
  'boneExtraction',
  'warping',
  'hue',
  'lavender',
  'rhinoplasty',
  'transparency',
  'blending',
  'hardLighting',
  'squishiness',
  'idealProportions',
];

export const PARAM_LABELS = {
  feedback: 'Feedback',
  boneExtraction: 'Bone Extraction',
  warping: 'Warping',
  hue: 'Hue',
  lavender: 'Lavender',
  rhinoplasty: 'Rhinoplasty',
  transparency: 'Transparency',
  blending: 'Blending',
  hardLighting: 'Hard Lighting',
  squishiness: 'Squishiness',
  idealProportions: 'Ideal Proportions',
};

const SCALE = 1000; // fixed-point: floats → field elements

/** A short, filename-safe reference derived from a commitment. */
export function shortRef(commitment) {
  return 'verity-' + String(commitment || '').replace(/^0x/, '').slice(0, 8);
}

export function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return (
    '0x' +
    Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  );
}

function paramsToFieldElements(params) {
  return PARAM_KEYS.map((k) =>
    BigInt(Math.round(Number(params[k] ?? 0) * SCALE))
  );
}

function toHex(poseidon, hash) {
  return '0x' + poseidon.F.toString(hash, 16).padStart(64, '0');
}

/** Poseidon commitment over the private parameters + salt. */
export async function computeCommitment(params, salt) {
  const poseidon = await getPoseidon();
  const inputs = [...paramsToFieldElements(params), BigInt(salt)];
  return toHex(poseidon, poseidon(inputs));
}

/* ------------------------------------------------------------------ */
/* file formats                                                        */
/* ------------------------------------------------------------------ */

export function buildParametersFile({ token, params, salt }) {
  return {
    type: 'areyouverity-private-parameters',
    version: 1,
    warning:
      'PRIVATE. This file is your identity. The website does not keep a copy. Store it like a wallet recovery phrase.',
    tokenId: token.id,
    kind: token.kind,
    inception: token.inception,
    commitment: token.commitment,
    parameters: Object.fromEntries(
      PARAM_KEYS.map((k) => [k, Number(params[k] ?? 0)])
    ),
    salt,
  };
}

/** Derive the three demo curve points from a commitment. */
async function derivePoints(commitment) {
  const poseidon = await getPoseidon();
  const c = BigInt(commitment);
  const point = async (i) => [
    toHex(poseidon, poseidon([c, BigInt(i), 1n])),
    toHex(poseidon, poseidon([c, BigInt(i), 2n])),
  ];
  return {
    pi_a: await point(1),
    pi_b: await point(2),
    pi_c: await point(3),
  };
}

export async function buildProofFile({ commitment, tokenId, kind }) {
  const points = await derivePoints(commitment);
  return {
    type: 'areyouverity-proof',
    version: 1,
    protocol: 'groth16-demo',
    curve: 'bn128',
    note: 'Demonstration proof: Groth16-shaped, points derived from the commitment with Poseidon. Not a zk-SNARK until the circuit is live.',
    ...points,
    publicSignals: {
      commitment,
      domain: kind, // VERITY | NOTVERITY — the only public claim
    },
    tokenId,
  };
}

/**
 * Verify an uploaded file — accepts either a proof file or a raw
 * private-parameters file (from which the proof is recomputed).
 *
 * @returns {{ ok: boolean, commitment: string|null, reason: string|null }}
 */
export async function verifyUploadedFile(json) {
  try {
    if (json?.type === 'areyouverity-proof') {
      const commitment = json.publicSignals?.commitment;
      if (!commitment) return { ok: false, commitment: null, reason: 'MALFORMED_PROOF' };
      const expected = await derivePoints(commitment);
      const same =
        JSON.stringify(expected.pi_a) === JSON.stringify(json.pi_a) &&
        JSON.stringify(expected.pi_b) === JSON.stringify(json.pi_b) &&
        JSON.stringify(expected.pi_c) === JSON.stringify(json.pi_c);
      return same
        ? { ok: true, commitment, reason: null }
        : { ok: false, commitment: null, reason: 'INVALID_PROOF' };
    }

    if (json?.type === 'areyouverity-private-parameters') {
      const commitment = await computeCommitment(json.parameters, json.salt);
      return commitment.toLowerCase() === String(json.commitment).toLowerCase()
        ? { ok: true, commitment, reason: null }
        : { ok: false, commitment: null, reason: 'PARAMETER_MISMATCH' };
    }

    return { ok: false, commitment: null, reason: 'UNRECOGNISED_FILE' };
  } catch {
    return { ok: false, commitment: null, reason: 'VERIFICATION_ERROR' };
  }
}

/* ------------------------------------------------------------------ */
/* download helper                                                     */
/* ------------------------------------------------------------------ */

export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
