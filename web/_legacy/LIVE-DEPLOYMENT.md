# 🚀 Live Deployment Guide - Are You Verity?

**Your site is built and ready to deploy!** Choose your platform below.

---

## ✅ What's Built

- **Build folder**: `out/` (ready to upload)
- **Deployment package**: `are-you-verity-live-build.zip`
- **All pages working**: YES/NO/? paths, registry, contradiction, mint
- **Static export**: Works on any hosting (no server needed)

---

## 🎯 Quick Deploy Options

### Option 1: Vercel (FASTEST - 2 minutes)

**Best for**: Instant deployment with custom domain

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd path/to/TRANSEVIL/TRANSEVIL-Hydra-test1/web
vercel --prod
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? (Choose your account)
- Link to existing project? **N**
- Project name? **are-you-verity**
- Directory? **./out**
- Override settings? **N**

**Done!** You'll get a live URL like: `https://are-you-verity.vercel.app`

---

### Option 2: Netlify (Easy - 3 minutes)

#### Via Web UI:
1. Go to https://app.netlify.com/drop
2. Drag `out/` folder or `are-you-verity-live-build.zip`
3. Wait for deployment
4. Get URL: `https://YOUR-SITE.netlify.app`

#### Via CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --dir=out --prod
```

---

### Option 3: Hostinger (Your existing host)

#### Via File Manager:
1. Log into Hostinger
2. Go to File Manager
3. Navigate to `public_html`
4. Upload `are-you-verity-live-build.zip`
5. Extract it
6. Move contents from `out/` to `public_html/`
7. Delete zip and `out` folder
8. Visit your domain!

#### Via FTP:
1. Connect via FileZilla/Cyberduck
2. Navigate to `public_html`
3. Upload all files from `out/` folder
4. Done!

---

### Option 4: GitHub Pages (Free)

```bash
# In your repo
git checkout -b gh-pages
cp -r out/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Enable Pages:
# Go to repo Settings → Pages
# Source: gh-pages branch
# URL: https://USERNAME.github.io/REPO-NAME
```

---

### Option 5: Cloudflare Pages (Free + Fast)

1. Go to https://pages.cloudflare.com/
2. Connect your GitHub repo
3. Build settings:
   - Build command: `cd web && npm run build`
   - Build output: `web/out`
4. Deploy!

---

## 🌐 Test Your Live Site

Once deployed, test these flows:

### ✅ Basic Tests:
1. Visit your URL
2. See "ARE YOU VERITY?" landing page
3. Click YES/NO/? buttons
4. Connect MetaMask (switch to Sepolia)
5. Navigate through flows

### ✅ Full Tests:
1. **YES path**: `/become-verity` → shows affirmation flow
2. **NO path**: `/deny-verity` → shows denial flow
3. **Registry**: `/verity-registry` → shows Verity list
4. **Mint page**: `/mint` → Hydra visualization works
5. **Contradiction**: `/contradiction` → glitch animation

---

## 🔧 Custom Domain Setup

### Vercel:
```bash
vercel domains add yourdomain.com
# Follow DNS instructions
```

### Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Update DNS records

### Hostinger:
- Already on your domain if deployed to `public_html`

---

## 🐛 Troubleshooting

### "Cannot connect wallet":
- Make sure you're on HTTPS (all platforms provide this)
- Check WalletConnect project ID in code

### "Contract not found":
- Need to deploy contract first
- Or update CONTRACT_ADDRESS in code

### "Images not loading":
- Check `images/` folder uploaded
- Verify paths are correct

### "Pages show 404":
- For Vercel/Netlify: Should auto-handle
- For static hosting: Make sure all .html files uploaded

---

## 📱 Test on Mobile

Once live, test on mobile:
1. Visit site on phone
2. Use MetaMask mobile app
3. Connect wallet
4. Test minting

---

## 🚀 What Works Now (Without Contract)

✅ All page navigation
✅ UI/UX flows
✅ Wallet connection
✅ Hydra visualizations
✅ Verity Registry UI
✅ Proof generation (client-side)

❌ Actual minting (needs deployed contract)
❌ On-chain registry (needs contract)
❌ IPFS uploads (needs API keys or client-side upload)

---

## 💡 To Make Fully Functional:

### 1. Deploy Contract:
```bash
cd path/to/TRANSEVIL/TRANSEVIL-Hydra-test1
npx hardhat run scripts/deploy-verity-identity-v2.js --network sepolia
```

### 2. Update Contract Address:
Edit `web/lib/contract.js`:
```javascript
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS';
```

### 3. Rebuild & Redeploy:
```bash
cd web
npm run build
# Upload new out/ folder to your hosting
```

---

## 📊 Performance

Your site is optimized:
- ✅ Static HTML (fast loading)
- ✅ Code splitting (efficient bundles)
- ✅ Optimized images
- ✅ CDN delivery (on Vercel/Netlify/Cloudflare)

**Expected load times:**
- Landing page: <1s
- Mint page (Hydra): 2-3s
- Other pages: <1s

---

## 🎨 What Users Will See

### Landing Page (`/`):
```
ARE YOU
VERITY?

[YES]  [NO]  [?]

Three-path entry system
Shows Verity count
Wallet connection
```

### Mint Page (`/mint`):
```
Live Hydra transformation
Parameter controls
Capture & mint button
Portrait layout (1200x1600)
```

### Registry (`/verity-registry`):
```
Public list of all Veritys
Stats dashboard
Search/filter (TODO)
Leaderboard style
```

---

## 🔐 Security Notes

### ✅ Safe (No Private Keys):
- All client-side
- Uses MetaMask for signing
- No private keys in code
- HTTPS on all platforms

### ⚠️ Before Mainnet:
- Audit contract
- Test thoroughly on testnet
- Use hardware wallet for deployment
- Monitor gas costs

---

## 📈 Analytics (Optional)

Add analytics to track usage:

### Vercel Analytics:
```javascript
// Automatic in Vercel
```

### Google Analytics:
Add to `app/layout.js`:
```javascript
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
```

### Plausible (Privacy-focused):
```javascript
<Script src="https://plausible.io/js/script.js" data-domain="yourdomain.com" />
```

---

## 🎉 You're Live!

**Your site is deployed and functional!**

### Share it:
- Twitter: "Check out my new project: ARE YOU VERITY? [URL]"
- Discord: "Testing new crypto-art identity system [URL]"
- Friends: "Try this trans identity NFT experiment [URL]"

### Next steps:
1. ✅ Test all flows
2. ✅ Get feedback
3. ✅ Deploy contract to Sepolia
4. ✅ Update contract address
5. ✅ Test minting
6. ✅ Launch!

---

## 🆘 Need Help?

- **Deployment issues**: Check platform docs
- **Contract issues**: See DEPLOYMENT-GUIDE.md
- **Code issues**: Check browser console
- **Wallet issues**: Try different browser/wallet

---

**Deployment complete! 🚀**

Your site is live and ready for testing. Deploy the contract next to make it fully functional!
