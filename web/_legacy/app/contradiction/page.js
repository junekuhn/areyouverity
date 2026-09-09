'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { generateDenialProof } from '@/lib/zkProof';

export default function ContradictionPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const canvasRef = useRef(null);

  const [step, setStep] = useState(1); // 1: warning, 2: glitch, 3: confirm
  const [generating, setGenerating] = useState(false);
  const [glitchedImage, setGlitchedImage] = useState(null);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [proof, setProof] = useState(null);

  // Read user's balance
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const generateGlitchedNFT = async () => {
    setGenerating(true);
    setStep(2);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = 1200;
      canvas.height = 1600;

      // Create base image
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animate glitch intensity
      const interval = setInterval(() => {
        setGlitchIntensity(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 60);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate final glitched image
      const glitchPower = 50;

      // RGB shift glitch
      for (let i = 0; i < 20; i++) {
        const y = Math.random() * canvas.height;
        const height = Math.random() * 100;
        const offset = (Math.random() - 0.5) * glitchPower;

        ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
        ctx.fillRect(offset, y, canvas.width, height);

        ctx.fillStyle = `rgba(0, 0, 255, 0.3)`;
        ctx.fillRect(-offset, y, canvas.width, height);
      }

      // Horizontal tears
      for (let i = 0; i < 30; i++) {
        const y = Math.random() * canvas.height;
        const height = Math.random() * 5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, y, canvas.width, height);
      }

      // Scan lines
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // "CONTRADICTION" text overlay
      ctx.save();
      ctx.font = 'bold 80px monospace';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
      ctx.textAlign = 'center';
      ctx.rotate(-0.1);
      ctx.fillText('CONTRADICTION', canvas.width / 2, canvas.height / 2);
      ctx.restore();

      // Noise
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.95) {
          const noise = Math.random() * 255;
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      const glitchedDataUrl = canvas.toDataURL('image/png');
      setGlitchedImage(glitchedDataUrl);

      // Generate denial proof
      const denialProof = await generateDenialProof(0, address);
      setProof(denialProof);

      setGenerating(false);
      setStep(3);

    } catch (error) {
      console.error('Error generating glitch:', error);
      setGenerating(false);
    }
  };

  const handleConfirmTransformation = async () => {
    try {
      // TODO: Upload glitched image to IPFS
      // TODO: Call contract.transformToContradiction()
      // TODO: Submit denial proof

      console.log('Transforming to contradiction with proof:', proof);
      console.log('Glitched image:', glitchedImage);

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      router.push('/contradiction-confirmed');

    } catch (error) {
      console.error('Transformation failed:', error);
      alert('Failed to transform token. Please try again.');
    }
  };

  // Step 1: Warning
  if (step === 1) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center text-yellow-500">
            CONTRADICTION
          </h1>

          <div className="border-2 border-yellow-500 p-12 space-y-8">
            <div className="text-center space-y-4">
              <p className="text-xl font-mono text-yellow-400">⚠️ WARNING</p>
              <p className="text-sm font-mono opacity-70">
                You already own a Verity identity, but you want to say NO
              </p>
            </div>

            <div className="border-t border-yellow-500/30 pt-8 space-y-6">
              <h3 className="text-sm font-mono text-yellow-400">THIS CREATES A CONTRADICTION</h3>

              <p className="text-xs font-mono opacity-70 leading-relaxed">
                You previously committed to being Verity by minting an identity.
                If you now say NO, you create a paradox:
              </p>

              <ul className="text-xs font-mono opacity-70 space-y-3 leading-relaxed">
                <li>• Your NFT will be permanently transformed with a glitch effect</li>
                <li>• Token state changes: Affirmed → Denied → Contradicted</li>
                <li>• You'll be removed from the Verity Registry</li>
                <li>• The original cannot be recovered</li>
                <li>• This transformation makes your token RARER</li>
                <li>• Contradicted tokens are the smallest supply tier</li>
              </ul>

              <div className="p-6 bg-yellow-500/5 border border-yellow-500/20">
                <h4 className="text-xs font-mono mb-3 text-yellow-400">THE PARADOX</h4>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  You said you were Verity. Now you say you're not.
                  Both statements are recorded on-chain.
                  This is not a bug - it's the system working as designed.
                  Trans people often live in this space between commitments,
                  between who we were and who we are becoming.
                </p>
              </div>

              <div className="p-6 bg-red-500/10 border border-red-500/30">
                <h4 className="text-xs font-mono mb-3 text-red-400">RARITY TIER</h4>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  Contradicted tokens are ultra-rare (&lt;1% of supply).
                  Most people won't transform their tokens because they fear
                  the glitch. But the glitch is what makes them valuable.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
              >
                CANCEL
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-yellow-500 text-yellow-500 px-6 py-4 font-mono hover:bg-yellow-500 hover:text-black transition"
              >
                PROCEED WITH CONTRADICTION
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Step 2: Glitch generation
  if (step === 2) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-4xl font-mono mb-12 text-center text-yellow-500">
            CORRUPTING IDENTITY
          </h1>

          <div className="border border-yellow-500 p-12 space-y-8">
            <div className="text-center space-y-6">
              <div className="text-6xl font-mono text-yellow-400 mb-4">
                {glitchIntensity}%
              </div>

              <div className="relative h-4 bg-black border border-yellow-500/30">
                <div
                  className="absolute inset-y-0 left-0 bg-yellow-500 transition-all"
                  style={{ width: `${glitchIntensity}%` }}
                />
              </div>

              <p className="text-sm font-mono text-yellow-400">
                {glitchIntensity < 100 ? 'Applying corruption effect...' : 'Corruption complete'}
              </p>

              <p className="text-xs font-mono opacity-50">
                This process cannot be stopped
              </p>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {!generating && (
              <button
                onClick={generateGlitchedNFT}
                className="w-full border-2 border-yellow-500 text-yellow-500 px-6 py-6 font-mono hover:bg-yellow-500 hover:text-black transition"
              >
                BEGIN TRANSFORMATION
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Step 3: Confirm
  if (step === 3 && glitchedImage) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-mono mb-12 text-center text-yellow-500">
            CONFIRM CONTRADICTION
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Glitched preview */}
            <div className="border border-yellow-500 p-4">
              <h3 className="text-xs font-mono mb-4 text-yellow-400">
                YOUR TRANSFORMED NFT
              </h3>
              <img
                src={glitchedImage}
                alt="Contradicted NFT"
                className="w-full"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="border border-yellow-500/50 p-6 bg-yellow-500/5">
                <h3 className="text-sm font-mono text-yellow-400 mb-4">
                  STATE TRANSFORMATION
                </h3>
                <div className="text-xs font-mono opacity-70 space-y-2">
                  <p>Previous State: <span className="text-green-400">AFFIRMED</span></p>
                  <p>New State: <span className="text-yellow-400">CONTRADICTED</span></p>
                  <p>Rarity Tier: <span className="text-yellow-400">ULTRA-RARE (&lt;1%)</span></p>
                  <p>Reversible: <span className="text-red-400">NO</span></p>
                </div>
              </div>

              <div className="p-6 border border-white/20 bg-white/5">
                <h4 className="text-xs font-mono mb-3 opacity-50">WHAT THIS MEANS</h4>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  Your NFT will be permanently updated. The original is lost.
                  A cryptographic proof of your contradiction will be recorded.
                  You'll own one of the rarest tokens in the collection.
                </p>
              </div>

              <button
                onClick={handleConfirmTransformation}
                className="w-full border-2 border-yellow-500 text-yellow-500 px-6 py-6 font-mono hover:bg-yellow-500 hover:text-black transition"
              >
                CONFIRM CONTRADICTION
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
              >
                CANCEL (GO BACK)
              </button>
            </div>
          </div>

          <div className="text-xs font-mono opacity-30 text-center">
            <p>Once confirmed, your contradiction is permanent</p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
