# ARE YOU VERITY? - Deployment Instructions

## Build Complete! ✅

The production build is ready in the `/out` folder.

## What Was Built

The build contains the complete "Are You Verity?" system:
- Landing page: "Are You Verity?" (`index.html`)
- Verify page: Check ownership (`verify.html`)
- Identity Formation: Hydra transformation mint page (`mint.html`)
- Honest Citizen: For those who deny (`honest-citizen.html`)
- Deny page: Identity invalidation (`deny.html`)
- Identity Created: Success page (`identity-created.html`)
- All static assets (JS, CSS, images)

## Files

- **areyouverity-build.zip** - Ready to upload zip file
- **out/** - Static build folder (can upload directly)

## Deployment to Hostinger

### Option 1: Upload ZIP file
1. Log into Hostinger
2. Go to File Manager
3. Navigate to `public_html` directory
4. Upload `areyouverity-build.zip`
5. Extract the zip
6. Move all contents from `out/` folder to `public_html/`
7. Delete the `out` folder and zip file
8. Your site is live!

### Option 2: Upload via FTP
1. Use an FTP client (FileZilla, Cyberduck, etc.)
2. Connect to your Hostinger FTP
3. Navigate to `public_html` directory
4. Upload all contents from the `out/` folder
5. Your site is live!

### Option 3: Direct folder upload
1. Log into Hostinger File Manager
2. Navigate to `public_html`
3. Upload all files from `out/` folder directly
4. Your site is live!

## What Works in Static Build

✅ Landing page with "Are You Verity?" question
✅ All routing between pages
✅ Hydra visualizations (loads from CDN)
✅ Web3 wallet connections
✅ All interactive controls and parameters
✅ Images and assets

## What Requires Backend

The following features need a backend/blockchain connection when deployed:
- Smart contract interactions (minting)
- IPFS uploads (need API routes)
- ZK proof verification

## API Routes (Not Included in Static Build)

The following API routes are server-side only and won't work in static export:
- `/api/ipfs/upload-image`
- `/api/ipfs/upload-metadata`

For full functionality, you'll need to:
1. Deploy these API routes separately (Vercel, Netlify Functions, etc.)
2. Update the contract address in the environment variables
3. Set up IPFS upload credentials

## Environment Variables

Before deploying to production, update:
- Contract address in `.env.local`
- IPFS credentials (Pinata API key)
- WalletConnect project ID

## Testing Locally

To test the static build locally:
```bash
cd out
python3 -m http.server 8000
```

Visit http://localhost:8000

## File Structure

```
out/
├── index.html              # "Are You Verity?" landing
├── verify.html             # Identity verification
├── mint.html              # Identity formation (Hydra)
├── honest-citizen.html    # Non-owner denial
├── deny.html              # Owner denial
├── identity-created.html  # Success
├── _next/                 # Next.js assets
│   ├── static/           # JS/CSS bundles
│   └── ...
└── images/               # Portrait images
    ├── base_2.png
    ├── forechin.png
    ├── eyes.png
    └── ears.png
```

## Important Notes

- The build is **fully static** - no server required
- Hydra loads from CDN: https://cdn.jsdelivr.net/npm/hydra-synth
- Images are bundled in the build
- Wallet connection works client-side
- Smart contract interactions require MetaMask or compatible wallet

## Troubleshooting

### Images not loading
- Check that `images/` folder uploaded correctly
- Verify file permissions (644 for files, 755 for folders)

### Wallet not connecting
- Make sure you're on HTTPS (Hostinger provides this)
- Check browser console for errors
- Verify WalletConnect project ID is set

### Hydra not loading
- Check internet connection (Hydra loads from CDN)
- Check browser console for CORS errors
- Try different browser

## Next Steps

1. Upload to Hostinger
2. Test all pages
3. Connect wallet and test interactions
4. Deploy smart contracts if needed
5. Set up IPFS for production minting

---

Built on: April 5, 2026
Version: Are You Verity? v1.0
Branch: secondversion-areyouverity-version1
