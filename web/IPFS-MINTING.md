# IPFS Minting Workflow

## Overview

The minting process now automatically captures the current Hydra sketch and stores it permanently on IPFS before minting the NFT.

## How It Works

### 1. **Adjust Your Sketch**
- Select one of the 6 Hydra sketches
- Adjust parameters using the sliders (noise, threshold, luma, etc.)
- Move your mouse over the canvas for interactive effects
- Or click "Randomize" for random parameters

### 2. **Mint NFT**
When you click "Mint NFT with Current Sketch", the following happens automatically:

#### Step 1: Canvas Snapshot
- Captures the current state of the Hydra canvas as a PNG image

#### Step 2: Upload Image to IPFS
- Uploads the PNG to IPFS via Pinata
- Returns permanent IPFS hash and URL
- Image is stored as: `ipfs://{hash}`

#### Step 3: Generate Metadata
Creates ERC721-compliant metadata including:
- Token name: `TRANSEVIL #{tokenId}`
- Description of the artwork
- IPFS image URI
- All Hydra parameters as attributes:
  - Sketch name
  - Noise amount, noise speed
  - Threshold, luma threshold, luma smooth
  - Modulate amount, feedback amount
  - Generation timestamp

#### Step 4: Upload Metadata to IPFS
- Uploads the metadata JSON to IPFS via Pinata
- Returns permanent IPFS hash
- Metadata is stored as: `ipfs://{hash}`

#### Step 5: Blockchain Transaction
- Calls `mintNFT()` contract function with:
  - Recipient address
  - Metadata IPFS URI
  - Image IPFS URI
- Pays mint price (default: 0.001 ETH)
- NFT is minted on-chain with permanent IPFS references

## What's Stored On-Chain

Each minted NFT includes:
- **Token URI**: `ipfs://{metadataHash}` (points to metadata JSON)
- **Image URI**: `ipfs://{imageHash}` (points to PNG image)
- Both are permanently stored in the contract

## Retrieving NFT Data

### View Token Metadata
```javascript
const metadata = await contract.tokenURI(tokenId);
// Returns: ipfs://{hash}
```

### View Token Image
```javascript
const image = await contract.getTokenImage(tokenId);
// Returns: ipfs://{hash}
```

### Access via Gateway
- Image: `https://gateway.pinata.cloud/ipfs/{hash}`
- Metadata: `https://gateway.pinata.cloud/ipfs/{hash}`

## NFT Metadata Structure

```json
{
  "name": "TRANSEVIL #1",
  "description": "TRANSEVIL: Zero-knowledge constrained crypto-art...",
  "image": "ipfs://{imageHash}",
  "external_url": "https://transevil.art",
  "attributes": [
    {
      "trait_type": "Sketch",
      "value": "Noise Ghost"
    },
    {
      "trait_type": "Noise Amount",
      "value": 2.5
    },
    // ... all other Hydra parameters
    {
      "trait_type": "Generation Timestamp",
      "value": "2026-01-18T19:00:00.000Z"
    }
  ],
  "properties": {
    "artist": "Verity Bascaran",
    "technology": "Hydra Synth",
    "category": "Generative Art"
  }
}
```

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_secret_key
```

Get your keys from: https://pinata.cloud

## Technical Details

### Files Modified
- `web/lib/ipfs.js` - New IPFS utility functions
- `web/app/mint/page.js` - Updated to use IPFS workflow
- `contracts/TransevilFinale.sol` - Contract has `mintNFT()` function

### Key Functions
- `uploadNFTToIPFS()` - Complete workflow orchestrator
- `canvasToBlob()` - Captures canvas as image
- `uploadImageToIPFS()` - Uploads image to Pinata
- `createNFTMetadata()` - Generates metadata JSON
- `uploadMetadataToIPFS()` - Uploads metadata to Pinata

### Contract Function
```solidity
function mintNFT(
    address to,
    string memory metadataURI,
    string memory imageData
) public payable returns (uint256)
```

## Benefits

1. **Permanent Storage**: Images and metadata stored on IPFS forever
2. **Decentralized**: No single point of failure
3. **Verifiable**: All parameters preserved as NFT attributes
4. **Unique**: Each mint captures exact state at that moment
5. **Standard Compliant**: Full ERC721 metadata support

## Testing

1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3004/mint
3. Connect wallet
4. Adjust Hydra parameters
5. Click "Mint NFT"
6. Watch the progress messages
7. Approve transaction in wallet
8. View your NFT on Etherscan or OpenSea

## Troubleshooting

### "Pinata API keys not configured"
- Check `.env.local` has the correct keys
- Restart the dev server after adding keys

### "Canvas not ready"
- Wait for Hydra to fully load (~2 seconds)
- Ensure the canvas shows the visualization

### Transaction fails
- Check you have enough ETH (mint price + gas)
- Verify contract address is correct
- Ensure you're on the right network (Sepolia testnet)
