'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useEstimateGas, useGasPrice } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useState, useEffect, useRef } from 'react';
import { uploadNFTToIPFS } from '@/lib/ipfs';
import { parseEther, keccak256, toBytes, formatEther } from 'viem';
import { generateAffirmationProof } from '@/lib/zkProof';

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState(1);
  const [selectedSketch, setSelectedSketch] = useState(0);
  const canvasRef = useRef(null);
  const hydraRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const mouseRef = useRef({ x: 500, y: 500 });

  // Witness Protocol - NEW
  const [witnesses, setWitnesses] = useState(['', '', '']);
  const [showWitnessHelp, setShowWitnessHelp] = useState(false);

  // Check if wallet is actually connected (wagmi sometimes reports false for isConnected)
  const isWalletConnected = isConnected || !!address;

  // Hydra parameter controls - updated for TRANSEVIL draft2
  const [params, setParams] = useState({
    pFeedback: 1,
    pExplode: 0,
    pWarp: 1,
    pColor: 1,
    pEyes: 1,
    pLuma: 1,
    pBlending: 0,
    pHardmix: 1,
    pScroll: 1
  });

  // TRANSEVIL Draft2 Final Sketch - Multi-layered face transformation
  const sketches = [
    {
      name: 'Final Transform',
      code: () => {
        // Main composite output (o0)
        const getMouse = () => window.getMousePosition ? window.getMousePosition() : (window.mouse || { x: 500, y: 500 });
        const pFeedback = window.pFeedback !== undefined ? window.pFeedback : 1;
        const pColor = window.pColor !== undefined ? window.pColor : 1;
        const pLuma = window.pLuma !== undefined ? window.pLuma : 1;
        const pHardmix = window.pHardmix !== undefined ? window.pHardmix : 1;
        const pBlending = window.pBlending !== undefined ? window.pBlending : 0;
        const pScroll = window.pScroll !== undefined ? window.pScroll : 1;

        src(o0)
        .layer(src(o2))
        .layer(src(o1))
        .layer(src(o3))
        .modulateScale(noise(5, 0.01), pFeedback*0.15, ()=>(pFeedback + 0.5)*0.1 + 0.9)
        .excl(src(s1)
          .excl(osc(pColor*10+1, 0.1, pColor*2.).kaleid(40)
          .add(osc(1, 0, pColor*2.).posterize(5)), pColor), pColor*0.8)
        .luma(0.1+pLuma*0.6, 0.6-pLuma*0.3)
        .hardmix(src(s0).posterize(5).hue(pHardmix), pHardmix)
        .mult(s0, pBlending*0.7)
        .blend(o0, pBlending*0.7)
        .contrast(1.1 - pBlending*0.2)
        .modulateScrollX(osc(()=>15*pScroll+5, 0).modulateRotate(
          shape(4, 0.3, 0.5), ()=>0.3*pScroll),() => 0.04*pScroll)
        .out(o0);
      }
    },
    {
      name: 'Eyes Layer',
      code: () => {
        const pEyes = window.pEyes !== undefined ? window.pEyes : 1;

        // Eyes composite (o1)
        src(s2)
        .pheonix(src(s2).scale(pEyes*0.2+1).colorama(3*pEyes), pEyes+0.3)
        .layer(src(s3).scale(pEyes*0.5+1))
        .out(o1);

        // Trigger main composition
        sketches[0].code();
      }
    },
    {
      name: 'Warp Layer',
      code: () => {
        const pWarp = window.pWarp !== undefined ? window.pWarp : 1;

        // Warped base (o2)
        src(s0)
        .modulateRotate(voronoi(1+pWarp, .1, 5), pWarp*0.2, 0)
        .out(o2);

        // Trigger main composition
        sketches[0].code();
      }
    },
    {
      name: 'Explode Layer',
      code: () => {
        const getMouse = () => window.getMousePosition ? window.getMousePosition() : (window.mouse || { x: 500, y: 500 });
        const pExplode = window.pExplode !== undefined ? window.pExplode : 0;

        // Exploded chin (o3)
        src(s1)
        .modulateScale(voronoi(9*pExplode ,0.2, 0).mult(shape2(()=>-getMouse().x/1000+.5, ()=>-getMouse().y/1000+.5))
        .thresh(0.5, 0.9), pExplode*1.5)
        .out(o3);

        // Trigger main composition
        sketches[0].code();
      }
    }
  ];

  // Read contract data
  const { data: totalMinted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalMinted',
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: mintPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mintPrice',
  });

  // Get current gas price
  const { data: gasPrice } = useGasPrice();

  // Mint function
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  // Log when connection status changes
  useEffect(() => {
    console.log('Wallet status updated:', { address, isConnected, isWalletConnected });
  }, [address, isConnected, isWalletConnected]);

  // Sync params to window globals for Hydra
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Object.entries(params).forEach(([key, value]) => {
        window[key] = value;
      });
    }
  }, [params]);

  // Set up mouse tracking - use React ref to avoid SES lockdown issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Store mouse in our ref
      const mouse = mouseRef.current;

      // Expose via a function getter to avoid SES lockdown
      window.getMousePosition = () => mouse;

      // Also try to set window.mouse if possible (may fail in SES)
      try {
        if (!window.mouse || typeof window.mouse !== 'object') {
          window.mouse = mouse;
        }
      } catch (e) {
        console.log('Using getMousePosition() fallback due to SES lockdown');
      }

      const handleMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };

      const handleTouchMove = (e) => {
        if (e.touches.length > 0) {
          mouse.x = e.touches[0].clientX;
          mouse.y = e.touches[0].clientY;
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, []);

  // Initialize Hydra visualization
  useEffect(() => {
    if (typeof window !== 'undefined' && canvasRef.current && !hydraRef.current) {
      // Load Hydra Synth
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hydra-synth/dist/hydra-synth.js';
      script.async = true;

      script.onload = () => {
        try {
          // Set canvas to high resolution PORTRAIT for minting (1200x1600)
          if (canvasRef.current) {
            canvasRef.current.width = 1200;
            canvasRef.current.height = 1600;
            console.log('Canvas resolution set to:', canvasRef.current.width, 'x', canvasRef.current.height);
          }

          // Initialize Hydra with preserveDrawingBuffer for canvas capture
          const hydra = new window.Hydra({
            canvas: canvasRef.current,
            detectAudio: false,
            makeGlobal: true,
            numSources: 4,
            numOutputs: 4,
            extendTransforms: [],
            precision: null,
            // High resolution output - PORTRAIT
            width: 1200,
            height: 1600,
            // Pass WebGL context attributes
            pb: {
              antialias: true,
              preserveDrawingBuffer: true,
              premultipliedAlpha: false
            }
          });

          hydraRef.current = hydra;

          // Check if preserveDrawingBuffer is actually set
          const gl = canvasRef.current?.getContext('webgl') || canvasRef.current?.getContext('webgl2');
          if (gl) {
            const contextAttributes = gl.getContextAttributes();
            console.log('WebGL context attributes:', contextAttributes);
            console.log('preserveDrawingBuffer:', contextAttributes?.preserveDrawingBuffer);
          }

          console.log('Hydra initialized');
          console.log('Canvas reference:', canvasRef.current);
          console.log('Hydra canvas:', hydra.canvas);
          console.log('Canvas dimensions:', canvasRef.current?.width, 'x', canvasRef.current?.height);

          // Load TRANSEVIL draft2 images
          s0.initImage('/images/base_2.png');
          s1.initImage('/images/forechin.png');
          s2.initImage('/images/eyes.png');
          s3.initImage('/images/ears.png');  // Using ears as substitute for nose

          // Define custom blend modes from TRANSEVIL draft2

          // Phoenix blend mode
          setFunction({
            name: "pheonix",
            type: "combine",
            inputs: [{ name: "amount", type: "float", default: 1 }],
            glsl: `
              vec3 rgb;
              rgb.r = min(_c0.r,_c1.r)-max(_c0.r,_c1.r)+1.0;
              rgb.g = min(_c0.g,_c1.g)-max(_c0.g,_c1.g)+1.0;
              rgb.b = min(_c0.b,_c1.b)-max(_c0.b,_c1.b)+1.0;
              _c1.a *= amount;
              vec4 blended = vec4(mix(_c0.rgb, rgb, _c1.a), 1.0);
              vec4 over = _c1 + (_c0 * (1.0 - _c1.a));
              return mix(blended, over, 1.0 - _c0.a);
            `
          });

          // Exclusion blend mode
          setFunction({
            name: "excl",
            type: "combine",
            inputs: [{ name: "amount", type: "float", default: 1 }],
            glsl: `
              vec3 rgb;
              rgb.r = _c0.r+_c1.r-2.0*_c0.r*_c1.r;
              rgb.g = _c0.g+_c1.g-2.0*_c0.g*_c1.g;
              rgb.b = _c0.b+_c1.b-2.0*_c0.b*_c1.b;
              _c1.a *= amount;
              vec4 blended = vec4(mix(_c0.rgb, rgb, _c1.a), 1.0);
              vec4 over = _c1 + (_c0 * (1.0 - _c1.a));
              return mix(blended, over, 1.0 - _c0.a);
            `
          });

          // Hardmix blend mode
          setFunction({
            name: "hardmix",
            type: "combine",
            inputs: [{ name: "amount", type: "float", default: 1 }],
            glsl: `
              vec3 rgb;
              rgb.r = (((_c1.r<0.5)?((_c1.r==0.0)?(_c1.r):max((1.0-((1.0-_c0.r)/(2.0*_c1.r))),0.0)):(((2.0*(_c1.r-0.5))==1.0)?(2.0*(_c1.r-0.5)):min(_c0.r/(1.0-(2.0*(_c1.r-0.5))),1.0)))<0.5)?0.0:1.0;
              rgb.g = (((_c1.g<0.5)?((_c1.g==0.0)?(_c1.g):max((1.0-((1.0-_c0.g)/(2.0*_c1.g))),0.0)):(((2.0*(_c1.g-0.5))==1.0)?(2.0*(_c1.g-0.5)):min(_c0.g/(1.0-(2.0*(_c1.g-0.5))),1.0)))<0.5)?0.0:1.0;
              rgb.b = (((_c1.b<0.5)?((_c1.b==0.0)?(_c1.b):max((1.0-((1.0-_c0.b)/(2.0*_c1.b))),0.0)):(((2.0*(_c1.b-0.5))==1.0)?(2.0*(_c1.b-0.5)):min(_c0.b/(1.0-(2.0*(_c1.b-0.5))),1.0)))<0.5)?0.0:1.0;
              _c1.a *= amount;
              vec4 blended = vec4(mix(_c0.rgb, rgb, _c1.a), 1.0);
              vec4 over = _c1 + (_c0 * (1.0 - _c1.a));
              return mix(blended, over, 1.0 - _c0.a);
            `
          });

          // Shape2 function for masking
          setFunction({
            name: 'shape2',
            type: 'src',
            inputs: [
              { type: 'float', name: 'width', default: 0.2 },
              { type: 'float', name: 'height', default: 0.3 },
              { type: 'float', name: 'radius', default: 0.01 }
            ],
            glsl: `
              vec2 st = _st * 2. - 1.;
              st = vec2(st.x + width, st.y + height);
              float x = length(st) - radius;
              vec3 col = vec3(1. - x);
              return vec4(col, 1.0);
            `
          });

          // Wait for images to load, then run initial sketch
          setTimeout(() => {
            sketches[0].code();
          }, 1000);

        } catch (err) {
          console.error('Hydra initialization error:', err);
        }
      };

      document.head.appendChild(script);
    }
  }, []);

  // Randomize all parameters
  const randomizeParams = () => {
    setParams({
      pFeedback: Math.random() * 2,
      pExplode: Math.random() * 2,
      pWarp: Math.random() * 2,
      pColor: Math.random() * 2,
      pEyes: Math.random() * 2,
      pLuma: Math.random() * 2,
      pBlending: Math.random() * 2,
      pHardmix: Math.random() * 2,
      pScroll: Math.random() * 2
    });
  };

  // Test canvas capture (for debugging)
  const testCapture = async () => {
    try {
      console.log('=== TESTING CANVAS CAPTURE ===');

      // Try using Hydra's built-in screencap if available
      if (typeof screencap === 'function') {
        console.log('Using Hydra screencap()');
        screencap();
        alert('Screenshot triggered! Check your downloads folder.');
        return;
      }

      // Alternative: Use Hydra's render function
      if (hydraRef.current) {
        console.log('Using Hydra render');

        // Force a render
        if (typeof render === 'function') {
          render();
        }

        // Wait a frame for render to complete
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      // Get the canvas
      let hydraCanvas = canvasRef.current;
      if (hydraRef.current && hydraRef.current.canvas) {
        hydraCanvas = hydraRef.current.canvas;
      }

      if (!hydraCanvas) {
        alert('No canvas found!');
        return;
      }

      console.log('Capturing from canvas:', {
        width: hydraCanvas.width,
        height: hydraCanvas.height
      });

      // Wait for next animation frame to ensure render is complete
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const dataUrl = hydraCanvas.toDataURL('image/png', 1.0);
      console.log('DataURL length:', dataUrl.length);
      console.log('DataURL preview:', dataUrl.substring(0, 100));

      // Open in new tab to verify
      const win = window.open();
      win.document.write(`<!DOCTYPE html><html><body style="margin:0;background:#000;"><img src="${dataUrl}" style="max-width: 100%; display: block;" /></body></html>`);

      alert(`Canvas captured! Check the new tab. DataURL length: ${dataUrl.length} characters`);
    } catch (err) {
      console.error('Capture test failed:', err);
      alert(`Capture failed: ${err.message}`);
    }
  };

  // Random mint: randomize parameters, wait for visual update, then mint
  const handleRandomMint = async () => {
    randomizeParams();
    // Wait for visual to update
    setTimeout(() => {
      handleMint();
    }, 1000);
  };

  const handleMint = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const targetAddress = mintAddress || address;

    if (!targetAddress) {
      alert('Please enter a recipient address');
      return;
    }

    // Get the actual Hydra canvas
    let hydraCanvas = canvasRef.current;
    if (hydraRef.current && hydraRef.current.canvas) {
      hydraCanvas = hydraRef.current.canvas;
    }

    if (!hydraCanvas) {
      alert('Canvas not ready. Please wait for Hydra to load.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('Preparing to capture...');

      // Ensure canvas maintains its size
      if (hydraCanvas) {
        hydraCanvas.width = 1200;
        hydraCanvas.height = 1600;
      }

      // Wait for current frame to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      setUploadStatus('Capturing canvas snapshot...');
      console.log('Capturing canvas with dimensions:', hydraCanvas.width, 'x', hydraCanvas.height);

      // Get the next token ID
      const nextTokenId = (Number(totalMinted || 0) + 1);

      // Capture and upload to IPFS
      setUploadStatus('Uploading image to IPFS...');
      const ipfsResult = await uploadNFTToIPFS(
        hydraCanvas,
        nextTokenId,
        sketches[selectedSketch].name,
        params
      );

      setUploadStatus('Image uploaded! Uploading metadata...');
      console.log('IPFS Upload Complete:', ipfsResult);

      setUploadStatus('Generating cryptographic proof...');

      // Generate commitment hash for affirmation
      const proofData = await generateAffirmationProof(nextTokenId, address);
      const commitmentHash = proofData.publicSignals.commitmentHash;

      setUploadStatus('Initiating blockchain transaction...');

      console.log('⛓️  ========================================');
      console.log('⛓️  CALLING SMART CONTRACT');
      console.log('⛓️  ========================================');
      console.log('Contract:', CONTRACT_ADDRESS);
      console.log('Function: mintWithAffirmation');
      console.log('Args:');
      console.log('  metadataURI:', ipfsResult.metadataIpfsUri);
      console.log('  imageURI:', ipfsResult.imageIpfsUri);
      console.log('  commitmentHash:', commitmentHash);
      console.log('  value:', parseEther('0.05').toString(), '(0.05 ETH)');
      console.log('⛓️  ========================================');

      // Prepare witnesses array (convert empty strings to zero address)
      const witnessAddresses = witnesses.map(w =>
        w.trim() === '' ? '0x0000000000000000000000000000000000000000' : w
      );

      console.log('Witnesses:', witnessAddresses);

      // Call mintWithAffirmation with IPFS URIs, commitment, and witnesses
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintWithAffirmation',
        args: [
          ipfsResult.metadataIpfsUri,
          ipfsResult.imageIpfsUri,
          commitmentHash,
          witnessAddresses  // NEW: Add witnesses
        ],
        value: parseEther('0.05'), // 0.05 ETH for affirmation
        gas: 1000000n, // Set reasonable gas limit (1M gas)
      });

      setUploadStatus('Transaction sent! Waiting for confirmation...');
      console.log('✅ Transaction sent to wallet for approval');
    } catch (err) {
      console.error('Mint error:', err);
      alert(`Minting failed: ${err.message}`);
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setMintAddress('');
      setMintAmount(1);
      setIsUploading(false);
      setUploadStatus('');
    }
  }, [isSuccess]);

  // Change sketch when selected
  const handleSketchChange = (index) => {
    setSelectedSketch(index);
    if (hydraRef.current && typeof window !== 'undefined' && window.Hydra) {
      try {
        sketches[index].code();
      } catch (err) {
        console.error('Sketch change error:', err);
      }
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hydra Visualization */}
          <div>
            <h2 className="text-xl font-mono mb-4">IDENTITY FORMATION</h2>
            <p className="text-xs font-mono opacity-50 mb-4 leading-relaxed">
              Transform facial imagery to create your Verity identity. No biometric data.
              Only algorithmic commitment.
            </p>
            <div className="border border-white/20 relative overflow-hidden bg-black" style={{ aspectRatio: '1200/1600' }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full"
              />
            </div>
            <div className="mt-4 space-y-4">
              {/* Sketch Selector */}
              <div>
                <label className="block text-xs text-white/60 font-mono mb-2">
                  Layer Compositions:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sketches.map((sketch, index) => (
                    <button
                      key={index}
                      onClick={() => handleSketchChange(index)}
                      className={`px-3 py-2 text-xs font-mono border transition ${
                        selectedSketch === index
                          ? 'border-white bg-white text-black'
                          : 'border-white/20 hover:border-white/60'
                      }`}
                    >
                      {sketch.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Controls - TRANSEVIL Draft2 */}
              <div className="border-t border-white/10 pt-4">
                <label className="block text-xs text-white/60 font-mono mb-3">
                  Face Transformation Controls:
                </label>
                <div className="space-y-3">
                  {/* Feedback */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Feedback</span>
                      <span className="text-white">{params.pFeedback.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pFeedback}
                      onChange={(e) => setParams({...params, pFeedback: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Color Intensity</span>
                      <span className="text-white">{params.pColor.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pColor}
                      onChange={(e) => setParams({...params, pColor: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Eyes */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Eyes Effect</span>
                      <span className="text-white">{params.pEyes.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pEyes}
                      onChange={(e) => setParams({...params, pEyes: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Luma */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Brightness</span>
                      <span className="text-white">{params.pLuma.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pLuma}
                      onChange={(e) => setParams({...params, pLuma: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Warp */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Warp</span>
                      <span className="text-white">{params.pWarp.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pWarp}
                      onChange={(e) => setParams({...params, pWarp: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Hardmix */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Hardmix</span>
                      <span className="text-white">{params.pHardmix.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pHardmix}
                      onChange={(e) => setParams({...params, pHardmix: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Blending */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Blending</span>
                      <span className="text-white">{params.pBlending.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pBlending}
                      onChange={(e) => setParams({...params, pBlending: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Scroll */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Scroll</span>
                      <span className="text-white">{params.pScroll.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pScroll}
                      onChange={(e) => setParams({...params, pScroll: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Explode */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white/60">Explode</span>
                      <span className="text-white">{params.pExplode.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={params.pExplode}
                      onChange={(e) => setParams({...params, pExplode: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Status */}
              {(isUploading || uploadStatus) && (
                <div className="border border-white/20 px-4 py-3 text-xs font-mono text-white/80 bg-white/5">
                  {uploadStatus}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={randomizeParams}
                    disabled={isUploading}
                    className="flex-1 border border-white/20 px-4 py-2 text-sm font-mono hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Randomize
                  </button>
                  <button
                    onClick={testCapture}
                    disabled={isUploading}
                    className="flex-1 border border-yellow-500/50 px-4 py-2 text-sm font-mono hover:bg-yellow-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed text-yellow-500"
                  >
                    Test Capture
                  </button>
                </div>
                {isWalletConnected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleRandomMint}
                      disabled={isPending || isConfirming || isUploading}
                      className="flex-1 border border-white/20 px-4 py-2 text-sm font-mono hover:bg-white hover:text-black transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Creating...' : isPending || isConfirming ? 'Committing...' : 'Random Identity'}
                    </button>
                    <button
                      onClick={handleMint}
                      disabled={isPending || isConfirming || isUploading}
                      className="flex-1 border border-white px-4 py-2 text-sm font-mono bg-white text-black hover:bg-white/90 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Creating...' : isPending ? 'Approving...' : isConfirming ? 'Committing...' : 'Create Identity'}
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 text-xs text-white/60 font-mono text-center py-2">
                    Connect wallet to create identity
                  </div>
                )}
              </div>

              <div className="text-xs text-white/40 font-mono">
                <p>→ TRANSEVIL Draft2: Multi-layered face transformation</p>
                <p>→ Complex blend modes: Phoenix, Exclusion, Hardmix</p>
                <p>→ Move your mouse for interactive distortion effects</p>
                <p>→ 9 parameters control feedback, color, warping, and more</p>
                <p>→ Live-coded generative graphics by Verity Bascaran</p>
              </div>
            </div>
          </div>

          {/* Mint Interface */}
          <div>
            <h2 className="text-xl font-mono mb-4">Create Verity Identity</h2>
            <p className="text-xs font-mono opacity-50 mb-4 leading-relaxed">
              Mint your identity commitment as an NFT. This captures your current
              transformation state and commits it to the blockchain.
            </p>

            <div className="border border-white/20 p-6 space-y-6">
              {/* Contract Status */}
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Minted:</span>
                  <span>{totalMinted ? totalMinted.toString() : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Connection Status:</span>
                  <span className={isWalletConnected ? 'text-green-400' : 'text-red-400'}>
                    {isWalletConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-white/60">Mint Price:</span>
                  <span className="text-green-400">0.05 ETH</span>
                </div>
                {gasPrice && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Est. Gas Fee:</span>
                    <span className="text-xs text-white/80">
                      ~{formatEther(gasPrice * 300000n)} ETH
                      <span className="text-white/40 ml-1">
                        ({(parseFloat(formatEther(gasPrice * 300000n)) * 3000).toFixed(2)} USD)
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs border-t border-white/10 pt-2 mt-2">
                  <span className="text-white/60">Total Cost:</span>
                  <span className="text-white font-bold">
                    {gasPrice
                      ? `~${(0.05 + parseFloat(formatEther(gasPrice * 300000n))).toFixed(4)} ETH`
                      : '~0.05 ETH + gas'
                    }
                  </span>
                </div>
                {address && (
                  <>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-white/60">Your Address:</span>
                      <span className="text-xs">{address.slice(0, 6)}...{address.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Your Role:</span>
                      <span>{isOwner ? 'Owner (Can Mint)' : 'Collector'}</span>
                    </div>
                  </>
                )}
              </div>

              {!isWalletConnected ? (
                <div className="border-t border-white/10 pt-6">
                  <p className="text-sm text-white/60 font-mono mb-4">
                    Connect your wallet to create your Verity identity.
                  </p>
                  <p className="text-xs text-white/40 font-mono">
                    Each identity is a unique transformation captured as an NFT commitment.
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-t border-white/10 pt-6 space-y-4">
                    {/* Recipient Address */}
                    <div>
                      <label className="block text-xs text-white/60 font-mono mb-2">
                        Recipient Address (leave empty for self)
                      </label>
                      <input
                        type="text"
                        value={mintAddress}
                        onChange={(e) => setMintAddress(e.target.value)}
                        placeholder={address}
                        className="w-full bg-black border border-white/20 px-3 py-2 text-sm font-mono focus:outline-none focus:border-white"
                      />
                    </div>

                    {/* Witness Selection - NEW */}
                    <div className="border border-cyan-500/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-cyan-400">Witness Protocol</h3>
                        <button
                          onClick={() => setShowWitnessHelp(!showWitnessHelp)}
                          className="text-xs text-white/40 hover:text-white transition"
                        >
                          {showWitnessHelp ? 'Hide' : 'Show'} Help
                        </button>
                      </div>

                      {showWitnessHelp && (
                        <div className="text-xs text-white/60 space-y-2 pb-3 border-b border-white/10">
                          <p>Choose 3 addresses to witness your commitment without seeing it.</p>
                          <p className="text-yellow-400">⚠️ If you're caught lying, they lose reputation too.</p>
                          <p className="text-white/40">Leave empty to create without witnesses.</p>
                        </div>
                      )}

                      {[0, 1, 2].map((index) => (
                        <div key={index}>
                          <label className="block text-xs text-white/40 font-mono mb-1">
                            Witness {index + 1} (optional)
                          </label>
                          <input
                            type="text"
                            value={witnesses[index]}
                            onChange={(e) => {
                              const newWitnesses = [...witnesses];
                              newWitnesses[index] = e.target.value;
                              setWitnesses(newWitnesses);
                            }}
                            placeholder="0x..."
                            className="w-full bg-black border border-cyan-500/20 px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Upload Status */}
                    {uploadStatus && (
                      <div className="border border-white/20 px-4 py-3 text-xs font-mono text-white/80 bg-white/5">
                        {uploadStatus}
                      </div>
                    )}

                    {/* Create Identity Button */}
                    <button
                      onClick={handleMint}
                      disabled={isPending || isConfirming || isUploading}
                      className="w-full border border-white/20 px-6 py-3 text-sm font-mono hover:bg-white hover:text-black transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUploading ? uploadStatus || 'Creating identity...' :
                       isPending ? 'Waiting for approval...' :
                       isConfirming ? 'Committing identity...' :
                       'Create Verity Identity'}
                    </button>
                  </div>

                  {/* Transaction Status */}
                  {hash && (
                    <div className="border-t border-white/10 pt-4 text-xs font-mono space-y-2">
                      <p className="text-white/60">Transaction:</p>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-white underline break-all"
                      >
                        {hash}
                      </a>
                      {isSuccess && (
                        <p className="text-green-400 mt-2">✓ Identity created! You are now Verity.</p>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="border-t border-white/10 pt-4 text-xs font-mono text-red-400">
                      Error: {error.message}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 text-xs text-white/40 font-mono space-y-2">
              <p>→ Creating identity captures your current transformation state</p>
              <p>→ Your commitment is stored permanently on IPFS and blockchain</p>
              <p>→ This becomes your cryptographic proof of being Verity</p>
              <p>→ Denying your identity later will invalidate your token</p>
              <p>→ Proceeds fund facial feminisation surgery</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
