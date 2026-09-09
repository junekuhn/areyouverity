'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function CreateIdentityPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const canvasRef = useRef(null);

  const [step, setStep] = useState(1);
  const [identityData, setIdentityData] = useState(null);
  const [minting, setMinting] = useState(false);

  const hydraRef = useRef(null);
  const mouseRef = useRef({ x: 500, y: 500 });

  // Hydra parameters for identity distortion
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

  // Sync params to window for Hydra
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Object.entries(params).forEach(([key, value]) => {
        window[key] = value;
      });
    }
  }, [params]);

  // Mouse tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mouse = mouseRef.current;
      window.getMousePosition = () => mouse;

      try {
        if (!window.mouse || typeof window.mouse !== 'object') {
          window.mouse = mouse;
        }
      } catch (e) {
        console.log('Using getMousePosition() fallback');
      }

      const handleMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };

      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Initialize Hydra when entering step 2
  useEffect(() => {
    if (step === 2 && canvasRef.current && !hydraRef.current && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hydra-synth/dist/hydra-synth.js';
      script.async = true;

      script.onload = () => {
        try {
          if (canvasRef.current) {
            canvasRef.current.width = 1200;
            canvasRef.current.height = 1600;
          }

          const hydra = new window.Hydra({
            canvas: canvasRef.current,
            detectAudio: false,
            makeGlobal: true,
            numSources: 4,
            numOutputs: 4,
            width: 1200,
            height: 1600,
            pb: {
              antialias: true,
              preserveDrawingBuffer: true,
              premultipliedAlpha: false
            }
          });

          hydraRef.current = hydra;

          // Load images
          s0.initImage('/images/base_2.png');
          s1.initImage('/images/forechin.png');
          s2.initImage('/images/eyes.png');
          s3.initImage('/images/ears.png');

          // Define custom blend modes
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

          // Run main composition
          setTimeout(() => {
            generateHydraIdentity();
          }, 1000);

        } catch (err) {
          console.error('Hydra initialization error:', err);
        }
      };

      document.head.appendChild(script);
    }
  }, [step]);

  // Generate Hydra identity visualization
  const generateHydraIdentity = () => {
    if (!hydraRef.current) return;

    try {
      const getMouse = () => window.getMousePosition ? window.getMousePosition() : (window.mouse || { x: 500, y: 500 });
      const pFeedback = window.pFeedback !== undefined ? window.pFeedback : 1;
      const pColor = window.pColor !== undefined ? window.pColor : 1;
      const pLuma = window.pLuma !== undefined ? window.pLuma : 1;
      const pHardmix = window.pHardmix !== undefined ? window.pHardmix : 1;
      const pBlending = window.pBlending !== undefined ? window.pBlending : 0;
      const pScroll = window.pScroll !== undefined ? window.pScroll : 1;
      const pEyes = window.pEyes !== undefined ? window.pEyes : 1;
      const pWarp = window.pWarp !== undefined ? window.pWarp : 1;
      const pExplode = window.pExplode !== undefined ? window.pExplode : 0;

      // Eyes layer (o1)
      src(s2)
        .pheonix(src(s2).scale(pEyes*0.2+1).colorama(3*pEyes), pEyes+0.3)
        .layer(src(s3).scale(pEyes*0.5+1))
        .out(o1);

      // Warped base (o2)
      src(s0)
        .modulateRotate(voronoi(1+pWarp, .1, 5), pWarp*0.2, 0)
        .out(o2);

      // Exploded chin (o3)
      src(s1)
        .modulateScale(voronoi(9*pExplode ,0.2, 0).mult(shape2(()=>-getMouse().x/1000+.5, ()=>-getMouse().y/1000+.5))
        .thresh(0.5, 0.9), pExplode*1.5)
        .out(o3);

      // Main composite (o0)
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

      render(o0);
    } catch (err) {
      console.error('Hydra generation error:', err);
    }
  };

  // Randomize identity parameters
  const randomizeIdentity = () => {
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

    // Wait a bit then regenerate
    setTimeout(() => {
      generateHydraIdentity();
    }, 100);
  };

  const createIdentityCommitment = async () => {
    // Get Hydra canvas
    let hydraCanvas = canvasRef.current;
    if (hydraRef.current && hydraRef.current.canvas) {
      hydraCanvas = hydraRef.current.canvas;
    }

    if (!hydraCanvas) {
      alert('Canvas not ready');
      return;
    }

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 200));

    const imageData = hydraCanvas.toDataURL('image/png', 1.0);

    // Create a commitment hash with Hydra parameters
    const commitment = {
      imageData,
      params,
      timestamp: Date.now(),
      address: address,
    };

    setIdentityData(commitment);
    setStep(3);
  };

  const handleMint = async () => {
    try {
      setMinting(true);

      // TODO: Implement actual minting with smart contract
      // 1. Generate ZK proof commitment
      // 2. Call contract.createVerityIdentity()
      // 3. Upload metadata to IPFS
      // 4. Wait for confirmation

      // Simulate minting
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirect to success page
      router.push('/identity-created');
    } catch (error) {
      console.error('Error minting:', error);
      setMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-mono mb-8">CONNECT WALLET</h1>
          <p className="text-sm opacity-70 font-mono">
            To create a Verity identity, you must connect your wallet.
          </p>
        </div>
      </main>
    );
  }

  // Step 1: Introduction
  if (step === 1) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center">
            BECOMING VERITY
          </h1>

          <div className="border border-white p-12 mb-8">
            <div className="space-y-8 text-sm font-mono opacity-70 leading-relaxed">
              <p>
                You are about to create a Verity identity. This is not a representation
                of a biological reality. This is a commitment to an identity that exists
                beyond the physical.
              </p>

              <p>
                You will be shown distorted imagery derived from the artist's face.
                These are not biomarkers. These are reference points for identity creation
                in a system that rejects biological determinism.
              </p>

              <p>
                Your identity commitment will be stored as a cryptographic hash.
                Zero-knowledge proofs will verify your identity without revealing
                the underlying data.
              </p>

              <p>
                Once you create this identity, you are Verity. You can be Verity and be yourself.
                Multiple people can be Verity. The logic of one-body, one-identity is broken here.
              </p>

              <div className="p-6 bg-white/5 border border-white/20 mt-8">
                <h3 className="text-sm mb-4">CONSEQUENCES OF CREATION</h3>
                <ul className="text-xs space-y-2 opacity-70">
                  <li>• You will mint a Verity identity NFT (0.001 ETH)</li>
                  <li>• Your identity will be verified through ZK proofs</li>
                  <li>• Denying your identity later will invalidate your token</li>
                  <li>• You must remain committed to who you claim to be</li>
                  <li>• Proceeds fund facial feminisation surgery</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-12 border-2 border-white px-6 py-6 font-mono hover:bg-white hover:text-black transition text-lg"
            >
              BEGIN CREATION
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Step 2: Identity Creation
  if (step === 2) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-mono mb-8 text-center">
            IDENTITY FORMATION
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Canvas for distorted imagery */}
            <div className="border border-white p-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={500}
                className="w-full"
              />
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-mono mb-4">TRANSFORMATION PARAMETERS</h3>
                <p className="text-xs font-mono opacity-50 mb-4 leading-relaxed">
                  Adjust the parameters to distort and transform the face.
                  Move your mouse over the canvas for interactive effects.
                  Choose parameters that feel right for your Verity identity.
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
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
                    onChange={(e) => { setParams({...params, pFeedback: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
                    className="w-full"
                  />
                </div>

                {/* Color */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-white/60">Color</span>
                    <span className="text-white">{params.pColor.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={params.pColor}
                    onChange={(e) => { setParams({...params, pColor: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
                    className="w-full"
                  />
                </div>

                {/* Eyes */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-white/60">Eyes</span>
                    <span className="text-white">{params.pEyes.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={params.pEyes}
                    onChange={(e) => { setParams({...params, pEyes: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
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
                    onChange={(e) => { setParams({...params, pWarp: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
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
                    onChange={(e) => { setParams({...params, pLuma: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
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
                    onChange={(e) => { setParams({...params, pHardmix: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
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
                    onChange={(e) => { setParams({...params, pBlending: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
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
                    onChange={(e) => { setParams({...params, pScroll: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
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
                    onChange={(e) => { setParams({...params, pExplode: parseFloat(e.target.value)}); setTimeout(generateHydraIdentity, 50); }}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="border border-white/20 p-4 bg-white/5">
                <h3 className="text-sm font-mono mb-3">ABOUT THIS IDENTITY</h3>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  This is a live transformation of facial imagery using complex
                  blend modes and distortion algorithms. It contains no biometric
                  data. This is your commitment to identity beyond biology.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={randomizeIdentity}
                  className="w-full border border-white/20 px-6 py-3 font-mono hover:bg-white/10 transition"
                >
                  RANDOMIZE IDENTITY
                </button>
                <button
                  onClick={createIdentityCommitment}
                  className="w-full border-2 border-white px-6 py-4 font-mono hover:bg-white hover:text-black transition"
                >
                  CREATE COMMITMENT
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono opacity-30 text-center">
            <p>This image will be used to generate your identity commitment hash</p>
          </div>
        </div>
      </main>
    );
  }

  // Step 3: Confirmation and Minting
  if (step === 3) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center">
            CONFIRM IDENTITY
          </h1>

          <div className="border border-white p-12 mb-8">
            <div className="mb-8 flex justify-center">
              <div className="border border-white p-4 inline-block">
                {identityData?.imageData && (
                  <img
                    src={identityData.imageData}
                    alt="Your Verity Identity"
                    className="w-48 h-64 object-cover opacity-50"
                  />
                )}
              </div>
            </div>

            <div className="space-y-6 text-sm font-mono leading-relaxed mb-8">
              <p className="text-center opacity-70">
                This is your Verity identity commitment.
              </p>

              <div className="p-6 bg-white/5 border border-white/20">
                <h3 className="text-xs mb-4 opacity-50">COMMITMENT DETAILS</h3>
                <div className="text-xs font-mono space-y-1 opacity-70">
                  <p>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  <p>Timestamp: {new Date(identityData?.timestamp).toLocaleString()}</p>
                  <p className="mt-3 pt-3 border-t border-white/20 opacity-50">Parameters:</p>
                  <p>Feedback: {identityData?.params?.pFeedback?.toFixed(2)}</p>
                  <p>Color: {identityData?.params?.pColor?.toFixed(2)}</p>
                  <p>Eyes: {identityData?.params?.pEyes?.toFixed(2)}</p>
                  <p>Warp: {identityData?.params?.pWarp?.toFixed(2)}</p>
                  <p>Brightness: {identityData?.params?.pLuma?.toFixed(2)}</p>
                  <p className="mt-3 pt-3 border-t border-white/20">
                    Hash: {identityData ? '0x' + Math.random().toString(16).slice(2, 18) : ''}...
                  </p>
                </div>
              </div>

              <p className="text-xs text-center opacity-50 pt-6">
                By minting this token, you commit to being Verity.
                <br />
                This commitment is permanent and binding.
                <br />
                Denying this identity will invalidate your token.
              </p>
            </div>

            <button
              onClick={handleMint}
              disabled={minting}
              className="w-full border-2 border-white px-6 py-6 font-mono hover:bg-white hover:text-black transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {minting ? 'MINTING...' : 'MINT VERITY IDENTITY (0.001 ETH)'}
            </button>
          </div>

          <div className="text-xs font-mono opacity-30 text-center space-y-2">
            <p>Once minted, you are Verity.</p>
            <p>You can be Verity and be you.</p>
            <p>Multiple people can be Verity.</p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
