# ARE YOU VERITY — session handoff

_Last updated: 2026-07-12. Hand this file back to Claude Code and say "continue from HANDOFF.md"._

## What this is

`ARE YOU VERITY?` — a Next.js 14 (app router) art site living in
`TRANSEVIL-Hydra-test1/web`. It's a fundraiser for June Kuhn's facial
feminisation surgery and a speculative ZK-proof identity system.
Credits: Artist **June Kuhn**, Lead Dev/Curator **Atay Ilgun**, Studio **Softworld**.

## Current status: **the rebuild is DONE and healthy**

- Production build is clean — all 13 routes compile, no type/lint errors.
- All pages serve 200, zero runtime page errors.
- A full visual-QA pass was completed this session (see below). No open defects.

## State model (how the app thinks)

- Tokens are **VERITY** or **NOTVERITY**, each with status **VALID / QUESTIONING / VOID**.
- Decision tree lives in `lib/identity.js` → `decide(answerVerity, token)`.
  Contradicting a VALID id → QUESTIONING; reaffirming → VALID; contradicting a
  QUESTIONING id → VOID. No proof submitted = state NONE.
- **Demo mode**: the contract is NOT deployed. The registry is persisted in
  `localStorage` under key `areyouverity.registry.v1`. Poseidon commitments +
  Groth16-shaped demo proofs in `lib/commitment.js`.
- **Live files** (the only ones the app imports): `lib/identity.js`,
  `lib/commitment.js`, `hooks/useIdentity.js`.
- **Dead/legacy files** (present but NOT imported anywhere — their TODOs are
  irrelevant): `lib/zkProof.js`, `lib/verity-identity.js`, `lib/contract.js`,
  `lib/ipfs.js`, `lib/stateLogic.js`, `hooks/useContract.js`, `hooks/useTokenState.js`.
  Old pages are parked in `web/_legacy/` (out of the router).

## Flow / routes

`/` (Are you Verity? → Do you have proof?) → `/agreement` (sign as VERITY/NOTVERITY) →
`/create` (p5 FaceCanvas) → `/mint` (downloads private-parameters JSON) →
`/proof` (generate/regenerate proof) → `/collection`.
Status pages: `/status/questioning | invalid | void`. Also `/about`, `/credits`.

## What was done THIS session (2026-07-12)

1. **Verified healthy state**: clean `npm run build`, all routes 200, no page errors.
2. **Visual QA pass**: 25 screenshots (20 desktop @1440, 5 mobile @402) driving the
   entire decision tree — every page in every token state, reached by seeding
   `localStorage`/`sessionStorage` directly, plus empty/unknown edge cases.
   The screenshot harness (`shoot.js`, `measure.js`, `measure2.js`) was written in
   the session scratchpad and is GONE next session — rebuild if needed. Approach:
   playwright (module at `~/.npm/_npx/e41f203b7505f1fb/node_modules/playwright`,
   chromium already cached); `goto('/')`, `page.evaluate(seed)`, `goto(target)`,
   `fullPage` screenshot. IMPORTANT harness gotcha: reset storage on EVERY scenario
   (even seedless ones) or state bleeds between pages.
3. **Fixed 1 real bug** — mobile header clipped the `CONNECT WALLET` button whenever
   the status chip was showing (collection + status pages). `body/html` have
   `overflow-x:hidden`, so the button ran 69px off-screen at 360px and was
   unreachable. Fix: a `@media (max-width:480px)` block in `app/globals.css` that
   lets `.site-header` wrap (wordmark on line 1, chip+wallet on line 2). Verified.

**Only code change this session: the header media query in `app/globals.css`.**

## Known non-issues (left as-is on purpose — confirm before "fixing")

- Landing hero "Are You Verity?" uses a bold **sans** face while other H1s are
  **monospace**. Looks intentional; flag if not.
- QUESTIONING/VOID stamps overlap ID-card field labels — intentional
  "defaced document" aesthetic.
- Build/console prints `Project ID Not Configured … cloud.reown.com` — that's the
  demo-mode WalletConnect/Reown placeholder (see "Wallet + config" next step).

## How to run

```
cd TRANSEVIL-Hydra-test1/web
npm run dev      # hot reload; prefers :3000
npm run build    # production build / sanity check
```
Note: **port 3000 is often occupied by a different project** ("Spiral — Exhibition
Studies") — Next auto-bumps this app to **:3001**. Don't touch the 3000 server; it
isn't this project.

## Next-step options (QA is done — pick a direction)

1. **Contract integration** (biggest) — replace the localStorage demo registry with
   real on-chain mint/burn/query. Single swap point by design:
   `hooks/useIdentity.js` + the storage functions in `lib/identity.js`. Needs a
   deploy target.
2. **Wallet + config** — add a real WalletConnect/Reown project ID (kills the
   "Project ID Not Configured" warning and makes Connect Wallet actually work).
   `.env.example` exists as a starting point.
3. **Legacy cleanup** — move the unused `lib/`/`hooks/` files listed above into
   `_legacy/` so the tree reflects only what's live.
4. **More visual polish** — optional; nothing outstanding.

---

## Addendum — 2026-07-19 (audit, rehaul, v2, LIVE)

The site is **live at https://areyouverity.vercel.app** (Vercel project
`areyouverity`, deployed from this directory). Read
`../docs/AUDIT-2026-07-19.md` first — full audit + both changelogs.

What changed since the body of this handoff was written:

- **Bug rehaul**: monotonic serials (burn no longer causes ID reuse);
  params re-download + visible mint errors; status pages verify actual token
  state (unknown segments get a proper page); decision tree consolidated as
  `decide(answer, token, proofVerified)` — do NOT re-derive it elsewhere;
  verification locks navigation; re-signing a different kind voids the
  pending lock-in; greeting gated on registry contents.
- **Honesty layer**: proof files are `protocol: 'groth16-demo'` with an
  in-file note; About has a "Protocol status" section; the Agreement carries
  an exhibition notice; the footer declares demonstration mode.
- **v2 additions**: PARADOX state (valid VERITY + valid NOTVERITY) is named —
  `summarize()` returns `'PARADOX'`, header chip shows it, collection page
  acknowledges it in-voice, `isParadox()` exported; `summarize(tokens,
  address)` is wallet-aware when a wallet is connected; the missing
  `blendMode` param got a real Inversion effect + slider in FaceCanvas (all
  7 committed params are now user choices); About answers the
  "prove-you're-Verity" critique (proof as capability, never a toll); create
  page states the portrait becomes the document's public face.
- **Legacy cleanup done** (option 3 above): dead libs/hooks/components and
  the unauthenticated `/api/ipfs/*` Pinata proxies now live in `_legacy/`;
  `nft.storage` + `date-fns` dropped; `base_2.png` 11.3MB → 0.8MB.
- **Contract ready** (option 1): `../contracts/VerityIdentityNFT_v4.sol`
  mirrors `decide()` one-to-one including REAFFIRM + PARADOX, is
  verifier-ready (`setVerifier`/`lockVerifier`), compiles clean. Deploy via
  `scripts/deploy-verity-identity-v4.js` (records network correctly). Not yet
  deployed — needs a funded key and a pricing decision.
- Still open: WalletConnect project ID (option 2), and the roadmap in the
  audit §10.
