# TRANSEVIL Web Interface — Setup Guide

Complete, functional collector experience for testing TRANSEVIL.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Edit .env.local
# - Add WalletConnect Project ID (get free at https://cloud.walletconnect.com)
# - Add contract address (after deployment)

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

## Features Implemented

### Navigation
- **/** — Landing page with conceptual framework
- **/collection** — View your owned tokens
- **/token/[id]** — Individual token detail page
- **/witness** — Step-by-step witness ritual flow
- **/relic** — RELIC viewer with evolution display
- **/finale** — Artist-only finale proof submission

### Wallet Integration
- ConnectKit for seamless wallet connection
- Supports MetaMask, WalletConnect, Coinbase Wallet, etc.
- Wagmi hooks for contract interactions
- Read contract state (balance, metadata, witness status)
- Write transactions (submit witness proofs)

### Collector Experience

**Collection View**:
- Grid of owned tokens
- Witness status for each token
- Quick access to witness flow
- Token count and finale status

**Token Detail Page**:
- Full token visualization placeholder
- Owner, witness status, resolved flag
- Metadata URI
- Direct link to witness if not witnessed
- Conceptual context about the work

**Witness Flow** (Multi-step ritual):
1. **Select** — Choose token to witness
2. **Ritual** — Read about the act, prepare mentally
3. **Generate** — Create witness credential (secret)
4. **Submit** — Generate ZK proof and submit (demo mode)
5. **Success** — Confirmation, link to token and RELIC

**RELIC Viewer**:
- Live witness count display
- Visual evolution (6 stages based on witness count)
- Evolution level indicator
- Non-transferrable status
- Institutional exhibition context

### Design Philosophy

**Minimal & Restrained**:
- Monospace typography (Courier New)
- Black & white aesthetic
- Border-based UI (no shadows/gradients)
- Slow, meaningful transitions
- No gamification or progress bars

**Tone**:
- Serious and contemplative
- Emphasizes constraint over revelation
- Respects privacy and opacity
- Clear about what ZK proves (and doesn't)

## Environment Variables

```bash
# .env.local

# Contract address (deployed TransevilFinale)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# WalletConnect Project ID
# Get free at: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...
```

## Testing Without Contract Deployment

The app works in "demo mode" even without a deployed contract:

- Mock token ownership (tokens 1, 42, 137)
- Simulated witness flow
- Visual RELIC evolution
- All UI interactions work

To test with real contract:
1. Deploy contracts (see main README)
2. Update `NEXT_PUBLIC_CONTRACT_ADDRESS`
3. Restart dev server

## Contract Integration

The app reads from:
- `balanceOf(address)` — User's token count
- `totalMinted()` — Total tokens minted
- `resolved()` — Has finale been resolved?
- `witnessCount()` — Global witness count
- `witnessed(tokenId)` — Is token witnessed?
- `getTokenMetadata(tokenId)` — Full token state
- `tokenURI(tokenId)` — Metadata URI

The app writes to:
- `submitWitness(tokenId, proof)` — Submit witness proof

## Current Limitations

**For Testing/Demo**:
- Token ownership is mocked (shows tokens 1, 42, 137)
- ZK proof generation is simulated (shows structure)
- Transactions are logged, not submitted
- Visual placeholders for actual Hydra visualizations

**To Make Production-Ready**:
1. Integrate actual token ownership queries (multicall or indexer)
2. Add client-side ZK proof generation (snarkjs)
3. Connect to real contract write functions
4. Embed actual Hydra visualizer in token/RELIC views
5. Add error handling and loading states
6. Implement proper credential issuance (server-signed)

## File Structure

```
web/
├── app/
│   ├── page.js              # Landing page
│   ├── layout.js            # Root layout with providers
│   ├── providers.js         # Wagmi + ConnectKit config
│   ├── globals.css          # Global styles
│   ├── components/
│   │   └── Navigation.js    # Top nav with wallet connect
│   ├── collection/
│   │   └── page.js          # Collection gallery
│   ├── token/[id]/
│   │   └── page.js          # Individual token view
│   ├── witness/
│   │   └── page.js          # Witness ritual flow
│   ├── relic/
│   │   └── page.js          # RELIC viewer
│   └── finale/
│       └── page.js          # Artist finale submission
├── lib/
│   └── contract.js          # Contract ABI and config
├── package.json
├── next.config.js
├── tailwind.config.js
└── .env.example
```

## Development Tips

**Hot Reload**:
Changes to files auto-reload. If wallet connection breaks, refresh page.

**Debugging**:
- Check browser console for logs
- Use React DevTools for component state
- wagmi has built-in dev tools

**Styling**:
- Uses Tailwind CSS utility classes
- Custom values: `text-white/60` = 60% opacity
- Borders: `border-white/20` = 20% opacity white

**Testing Witness Flow**:
1. Connect wallet
2. Click "Collection" → select token → "Witness This Token"
3. OR go directly to "/witness"
4. Follow multi-step flow
5. Check RELIC after "witnessing"

## Collector Experience Flow

```
1. Land on homepage
   ↓
2. Connect wallet (top right)
   ↓
3. Click "Collection" in nav
   ↓
4. See owned tokens with witness status
   ↓
5. Click token card → token detail page
   ↓
6. If not witnessed: "Witness This Token" button
   ↓
7. Witness flow (select → ritual → generate → submit)
   ↓
8. Success! Token marked as witnessed
   ↓
9. Visit RELIC to see evolution
```

## Notes on Tone

The interface treats witnessing as a serious, consensual act:
- No casual language ("Mint!", "Collect!")
- Explicit about what ZK proves
- Pauses for reflection (ritual step)
- No extraction or gamification
- Respectful of opacity and privacy

This is intentional. The work is about constraint, not revelation.

## Support

For issues:
- Check contract is deployed and address is correct
- Verify WalletConnect Project ID is valid
- Try different wallet (MetaMask, Coinbase, etc.)
- Clear browser cache if styles look broken

---

**Remember: Trust is formalised, not eliminated.**
