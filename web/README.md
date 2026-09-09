# Web

Minimal web UIs for TRANSEVIL (finale / witness interfaces).

## Overview

A minimal Next.js application providing:

### Routes
- **`/`** - Landing page with project context
- **`/finale`** - Artist-only finale proof submission
- **`/witness`** - Token-gated witness proof submission

## Design Philosophy

**Minimal and utilitarian**. No:
- Gamification
- Leaderboards
- Progress bars
- Flashy animations

The interface should be:
- Clear and functional
- Respectful of the work's gravity
- Monospace typography
- Black and white aesthetic
- Emphasizing constraint and opacity

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-finale-contract>
NEXT_PUBLIC_NETWORK=sepolia
```

## Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

```bash
npm run build
npm run start
```

Or deploy to Vercel:
```bash
vercel
```

## Web3 Integration

Uses:
- `wagmi` for Ethereum interactions
- `viem` for contract ABI encoding
- `@rainbow-me/rainbowkit` for wallet connection (optional)

## vercel

npm i -g vercel
vercel login
cd ./web
vercel --prod