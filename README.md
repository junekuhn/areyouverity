# ARE YOU VERITY
A crypto-art project using zero-knowledge proofs poetically — to enforce
constraint without surveillance.

**Live site: https://areyouverity.vercel.app** (demonstration mode: browser-local
registry, declared in-page).
Start here: **`docs/AUDIT-2026-07-19.md`** — full audit (logic, collector
psyche, protocol-art, ZK honesty) and the changelog of the two rehauls built
from it. Then `web/HANDOFF.md` for the app internals. The five diagrams in
`../areyouverity_export/` are canon for flow and copy.

## The work, in one paragraph

A fundraiser for June Kuhn's facial feminisation surgery and a speculative
identity system (artist June Kuhn; lead dev/curator Atay Ilgun; Softworld).
Visitors answer *Are you Verity?*, sign a fictional Agreement as VERITY or
NOTVERITY, compose a generative face whose slider values become a private
witness, and mint an identity document carrying a Poseidon commitment.
Contradicting a valid document marks it QUESTIONING — *valid + questioning is
still valid*; contradicting again voids it; reaffirming lifts it. Voidness is
"a legitimate and meaningful state of being." Nothing is confiscated, no one
is blocklisted, and proof is offered as a capability, never extracted as a
toll. Holding a valid Verity and a valid Nonverity at once is the named PARADOX
state, left with the holder.

## State model (canon, 10 Verity 2026 — the QUESTIONING model)

```
kinds:    VERITY | NOTVERITY          statuses: VALID | QUESTIONING | VOID

match    + VALID       → welcome home
match    + QUESTIONING → VALID        (reaffirm)
mismatch + VALID       → QUESTIONING  (not punishment)
mismatch + QUESTIONING → VOID         (revoke; burnable, or kept)
no proof               → NONE         (the system knows nothing about you)
verified proof, unknown commitment → VOID (a memory without a body)
```

Implemented in `web/lib/identity.js` (`decide()`), mirrored on-chain by
`contracts/VerityIdentityNFT_v4.sol` (the first contract version with
REAFFIRM — v1–v3 are superseded and their states were one-way).

The earlier punitive model (permanent invalidation, blocklists) and the v2/v3
economies (denial premiums, rarity tiers, staked challenges, reputation) are
**renounced**, not just parked — see `docs/archive/README.md` for why. Do not
revive the v3 "Contradiction Marketplace": a bounty market for forcing
identity reveals contradicts the work's ethics.

## Honest status of the cryptography

- The live site is a **declared demonstration**: real Poseidon commitments
  (circomlibjs), proof files that are Groth16-*shaped* (`groth16-demo`) with
  points derived from the commitment — not zk-SNARKs — and a browser-local
  registry. The About page ("Protocol status"), the Agreement's exhibition
  notice, and the site footer all say so in-page.
- No proving/verification keys have ever been built (`zk/outputs/`,
  `zk/zkeys/` do not exist). The deployed Sepolia TransevilFinale wires
  **mock verifiers that accept any proof** and a placeholder Merkle root.
- Before any "real ZK" claim, the circuits need *redesign*, not just
  compilation: the finale circuit cannot seal a selection (the end-state tree
  is public), the witness circuit checks credentials nothing issues, and
  `circuits/verity_identity.circom` leaves ownership unconstrained. Details in
  the audit, §4.
- `VerityIdentityNFT_v4.sol` is verifier-ready: `setVerifier()` then
  `lockVerifier()` (one-way) when a real Groth16 verifier exists; until then
  declarations trust token ownership and the `Declared` event records
  `proofChecked = false`.

## Pricing and proceeds

**Open decision.** Historical docs quoted 0.001 ETH (v1) and 0.05/0.08 ETH
with a denial premium (v2); the current model prices both kinds equally
(`mintPrice`, default 0.001 ETH, settable) and the live demo is free. The
denial premium is gone on purpose — denial is an identity, not a product
tier. Proceeds fund facial feminisation surgery; define the
secondary-royalty and reissue-fee story before mainnet.

## Project structure

```
TRANSEVIL-Hydra-test1/
├── web/                   # ARE YOU VERITY Next.js app (LIVE) — see web/HANDOFF.md
│   └── _legacy/           # dead code + retired web docs (kept for reference)
├── contracts/
│   ├── VerityIdentityNFT_v4.sol   # ACTIVE model (QUESTIONING + REAFFIRM + PARADOX)
│   ├── VerityIdentityNFT*.sol     # v1–v3, superseded
│   ├── TransevilFinale.sol      # separate work (Sepolia, mock verifiers)
│   └── Mock*Verifier.sol        # test stubs — always return true
├── circuits/ zk/          # circom material — needs redesign before use (audit §4)
├── scripts/               # deploy-verity-identity-v4.js is the Verity deployer
├── docs/
│   ├── AUDIT-2026-07-19.md      # START HERE
│   └── archive/                 # retired docs, with retirement rationale
└── hydra-visualiser/      # archived Hydra layer (separate work, unnamed)
```

## Quick start

Contracts: `npm install && npx hardhat compile`. Deploy v4 with
`npx hardhat run scripts/deploy-verity-identity-v4.js --network sepolia`
(records `deployments/verity-identity-v4-sepolia.json`; set
`FUNDRAISER_ADDRESS` env to direct proceeds).

Web app: `cd web && npm install && npm run dev` (port 3000 is usually taken
by another project; this lands on 3001). Deployed to Vercel project
`areyouverity`.

### Integration status

The site runs on the localStorage registry by design. The single swap point
for chain integration is `web/hooks/useIdentity.js` + the storage functions
in `web/lib/identity.js`; the decision tree (`decide()`) must not be
re-derived elsewhere. v4's `declare()` mirrors it one-to-one.
