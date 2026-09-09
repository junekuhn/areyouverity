'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export default function DenyIdentityPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const canvasRef = useRef(null);

  const [step, setStep] = useState(1); // 1: warning, 2: generate glitch, 3: confirm
  const [generating, setGenerating] = useState(false);
  const [glitchedImage, setGlitchedImage] = useState(null);
  const [zkProof, setZkProof] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // Read user's tokens
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Contract write for updating metadata
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isConnected || !balance || Number(balance) === 0) {
      router.push('/');
    }
  }, [isConnected, balance, router]);

  // Generate ZK proof for "NO" answer
  const generateNoProof = () => {
    // Proof should demonstrate: "I own a Verity NFT BUT I deny being Verity"
    // This creates a contradiction that must be recorded
    const proof = {
      type: 'commitment_denial',
      answer: 'NO',
      timestamp: Date.now(),
      address: address,
      proofData: {
        publicSignals: [
          '0x' + Math.random().toString(16).slice(2),
          '0x' + Math.random().toString(16).slice(2)
        ],
      },
      commitment: generateCommitmentHash('NO', address)
    };

    setZkProof(proof);
    return proof;
  };

  const generateCommitmentHash = (answer, addr) => {
    const data = `${answer}-${addr}-${Date.now()}`;
    return '0x' + Array.from(data).map(c =>
      c.charCodeAt(0).toString(16).padStart(2, '0')
    ).join('').slice(0, 64);
  };

  // Generate glitched version of NFT
  const generateGlitchedNFT = async () => {
    setGenerating(true);

    try {
      // TODO: Fetch actual NFT image from contract
      // For now, generate a glitch effect

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = 1200;
      canvas.height = 1600;

      // Create base image (would normally load user's actual NFT)
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add glitch effects
      const glitchIntensity = 50;

      // RGB shift glitch
      for (let i = 0; i < 20; i++) {
        const y = Math.random() * canvas.height;
        const height = Math.random() * 100;
        const offset = (Math.random() - 0.5) * glitchIntensity;

        // Red channel shift
        ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
        ctx.fillRect(offset, y, canvas.width, height);

        // Blue channel shift
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

      // Add "DENIED" text overlay
      ctx.save();
      ctx.font = 'bold 120px monospace';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.textAlign = 'center';
      ctx.rotate(-0.1);
      ctx.fillText('DENIED', canvas.width / 2, canvas.height / 2);
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

      // Get glitched image
      const glitchedDataUrl = canvas.toDataURL('image/png');
      setGlitchedImage(glitchedDataUrl);

      // Generate ZK proof for denial
      generateNoProof();

      setGenerating(false);
      setStep(3);

    } catch (error) {
      console.error('Error generating glitch:', error);
      setGenerating(false);
    }
  };

  const handleConfirmDenial = async () => {
    setConfirmed(true);

    try {
      // TODO: Upload glitched image to IPFS
      // TODO: Update NFT metadata on contract
      // TODO: Submit ZK proof of denial

      // For now, simulate the transaction
      console.log('Denying identity with proof:', zkProof);
      console.log('Updated image:', glitchedImage);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to confirmation
      router.push('/denial-confirmed');

    } catch (error) {
      console.error('Denial failed:', error);
      setConfirmed(false);
    }
  };

  // Step 1: Warning
  if (step === 1) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center text-red-500">
            DENY IDENTITY
          </h1>

          <div className="border-2 border-red-500 p-12 space-y-8">
            <div className="text-center space-y-4">
              <p className="text-2xl font-mono">You answered: <span className="text-red-400">NO</span></p>
              <p className="text-sm font-mono opacity-70">
                You deny being Verity
              </p>
            </div>

            <div className="border-t border-red-500/30 pt-8 space-y-6">
              <h3 className="text-sm font-mono text-red-400">CONSEQUENCES OF DENIAL</h3>

              <ul className="text-xs font-mono opacity-70 space-y-3 leading-relaxed">
                <li>• Your NFT will be permanently altered with a glitch effect</li>
                <li>• A ZK proof of your denial will be recorded on-chain</li>
                <li>• The denial is cryptographically binding and irreversible</li>
                <li>• Your token will be marked as "DENIED"</li>
                <li>• This contradicts your original identity commitment</li>
              </ul>

              <div className="p-6 bg-red-500/5 border border-red-500/20 mt-6">
                <h4 className="text-xs font-mono mb-3 text-red-400">THE CONTRADICTION</h4>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  You own a Verity identity token - which means you once committed
                  to being Verity. By denying this now, you create a permanent
                  contradiction in your identity record. This is the cost of
                  denial in a commitment-based system.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 border border-white px-6 py-4 font-mono hover:bg-white hover:text-black transition"
              >
                CANCEL
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-red-500 text-red-500 px-6 py-4 font-mono hover:bg-red-500 hover:text-white transition"
              >
                PROCEED WITH DENIAL
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Step 2: Generate glitch
  if (step === 2) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-4xl font-mono mb-12 text-center text-red-500">
            GENERATING DENIAL PROOF
          </h1>

          <div className="border border-red-500 p-12 space-y-8">
            {!generating ? (
              <>
                <p className="text-center text-sm font-mono opacity-70 mb-8">
                  We will now generate a glitched version of your NFT
                  and create a zero-knowledge proof of your denial.
                </p>

                <canvas ref={canvasRef} className="hidden" />

                <button
                  onClick={generateGlitchedNFT}
                  className="w-full border-2 border-red-500 text-red-500 px-6 py-6 font-mono hover:bg-red-500 hover:text-white transition"
                >
                  GENERATE GLITCH & PROOF
                </button>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="animate-pulse text-lg font-mono text-red-400">
                  Applying glitch effect...
                </div>
                <div className="text-xs font-mono opacity-50">
                  Generating zero-knowledge proof of denial...
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Step 3: Confirm denial
  if (step === 3) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-mono mb-12 text-center text-red-500">
            CONFIRM DENIAL
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Show glitched image */}
            <div className="border border-red-500 p-4">
              <h3 className="text-xs font-mono mb-4 text-red-400">YOUR NFT (AFTER DENIAL)</h3>
              {glitchedImage && (
                <img
                  src={glitchedImage}
                  alt="Glitched NFT"
                  className="w-full"
                />
              )}
            </div>

            {/* Denial details */}
            <div className="space-y-6">
              <div className="border border-red-500/50 p-6 bg-red-500/5">
                <h3 className="text-sm font-mono text-red-400 mb-4">ZK PROOF OF DENIAL</h3>
                <div className="text-xs font-mono opacity-70 space-y-2">
                  <p>Answer: <span className="text-red-400">NO (DENIED)</span></p>
                  <p>Timestamp: {zkProof && new Date(zkProof.timestamp).toLocaleString()}</p>
                  <p className="mt-4 break-all">Commitment: {zkProof?.commitment.slice(0, 40)}...</p>
                </div>
              </div>

              <div className="p-6 border border-white/20 bg-white/5">
                <h4 className="text-xs font-mono mb-3 opacity-50">WHAT THIS MEANS</h4>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  Your NFT will be permanently updated with this glitched version.
                  The original is lost. A cryptographic proof of your denial
                  will be recorded. This cannot be undone.
                </p>
              </div>

              <button
                onClick={handleConfirmDenial}
                disabled={confirmed}
                className="w-full border-2 border-red-500 text-red-500 px-6 py-6 font-mono hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirmed ? 'PROCESSING...' : 'CONFIRM DENIAL'}
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
            <p>Once confirmed, your denial is permanent</p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
