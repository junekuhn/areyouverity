# Metadata

Metadata templates and generators for TRANSEVIL NFT collections.

## Overview

Generates ERC-721 compliant metadata with:
- Token name, description, image
- Animation URL (HTML viewer)
- Attributes (witnessed, resolved, witness count)
- Embedded params for deterministic replay
- IPFS pinning via Pinata

## Generation

```bash
npm install
node generate-metadata.js
```

## IPFS Pinning

If Pinata credentials are configured in `.env`:
- Images, viewers, and metadata are pinned to IPFS
- CIDs are saved in `output/metadata-summary.json`

If credentials are missing:
- Runs in LOCAL mode
- Saves files to `output/` directory
- No pinning occurs

## Metadata Structure

```json
{
  "name": "TRANSEVIL #1",
  "description": "A constrained crypto-art work...",
  "image": "ipfs://QmXXX...",
  "animation_url": "ipfs://QmYYY...",
  "attributes": [
    { "trait_type": "Witnessed", "value": "No" },
    { "trait_type": "Resolved", "value": "No" },
    { "trait_type": "Witness Count", "value": 0 }
  ],
  "params": { ... }
}
```

## Dynamic Metadata

Metadata should be generated dynamically based on contract state:
- `witnessed[tokenId]` - Has this token been witnessed?
- `resolved` - Has the artist finalized?
- `witnessCount` - Global witness count

Marketplaces supporting EIP-4906 will automatically refresh metadata when events are emitted.
