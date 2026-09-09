'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { generateAffirmationProof, formatProof } from '@/lib/zkProof';

export default function BecomeVerityPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [step, setStep] = useState(1); // 1: intent, 2: mint, 3: proof, 4: success
  const [generating, setGenerating] = useState(false);
  const [proof, setProof] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  const handleBeginMint = () => {
    // Go to mint page with affirmation intent
    router.push('/mint?intent=affirm');
  };

  const handleGenerateProof = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    setGenerating(true);

    try {
      // Generate cryptographic proof
      // For now, use tokenId 0 as placeholder (would get from contract)
      const proofData = await generateAffirmationProof(0, address);
      const formatted = formatProof(proofData);

      setProof(formatted);
      setStep(4);
    } catch (error) {
      console.error('Proof generation failed:', error);
      alert('Failed to generate proof. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Step 1: Intent declaration
  if (step === 1) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center text-green-400">
            BECOME VERITY
          </h1>

          <div className="border-2 border-green-500 p-12 space-y-8">
            <div className="text-center space-y-4">
              <p className="text-2xl font-mono">You answered: <span className="text-green-400">YES</span></p>
              <p className="text-sm font-mono opacity-70">
                You affirm being Verity
              </p>
            </div>

            <div className="border-t border-green-500/30 pt-8 space-y-6">
              <h3 className="text-sm font-mono text-green-400">WHAT THIS MEANS</h3>

              <p className="text-xs font-mono opacity-70 leading-relaxed">
                By saying YES, you commit to being Verity. This creates a cryptographic
                binding between you and the identity. You will:
              </p>

              <ul className="text-xs font-mono opacity-70 space-y-3 leading-relaxed">
                <li>• Mint a Verity identity NFT (0.05 ETH)</li>
                <li>• Create your Hydra transformation portrait</li>
                <li>• Be added to the public Verity Registry</li>
                <li>• Generate a cryptographic commitment proof</li>
                <li>• Join the network of other Veritys</li>
              </ul>

              <div className="p-6 bg-green-500/5 border border-green-500/20 mt-6">
                <h4 className="text-xs font-mono mb-3 text-green-400">COMMITMENT-BASED IDENTITY</h4>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  You are not proving biology. You are proving commitment.
                  Multiple people can be Verity. You can be you and also be Verity.
                  This is how identity works when freed from biological determinism.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
              >
                GO BACK
              </button>
              <button
                onClick={handleBeginMint}
                className="flex-1 border-2 border-green-500 text-green-500 px-6 py-4 font-mono hover:bg-green-500 hover:text-black transition"
              >
                BEGIN IDENTITY FORMATION
              </button>
            </div>
          </div>

          <div className="mt-8 text-xs font-mono opacity-30 text-center">
            <p>You are becoming Verity</p>
          </div>
        </div>
      </main>
    );
  }

  // Step 4: Success
  if (step === 4 && proof) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center text-green-400">
            YOU ARE VERITY
          </h1>

          <div className="border border-green-500 p-12 space-y-8">
            <div className="text-center space-y-6">
              <p className="text-green-400 font-mono text-2xl">
                ✓ COMMITMENT VERIFIED
              </p>
              <p className="text-sm font-mono opacity-70">
                Your cryptographic proof has been generated
              </p>
            </div>

            <div className="border-t border-green-500/30 pt-8 space-y-6">
              <h3 className="text-sm font-mono text-green-400">YOUR PROOF</h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-4 bg-green-500/5 border border-green-500/20">
                  <p className="opacity-50 mb-1">Commitment Hash:</p>
                  <p className="break-all opacity-70">{proof.publicSignals.commitmentHash}</p>
                </div>

                <div className="p-4 bg-green-500/5 border border-green-500/20">
                  <p className="opacity-50 mb-1">Nullifier:</p>
                  <p className="break-all opacity-70">{proof.publicSignals.nullifier}</p>
                </div>

                <div className="p-4 bg-green-500/5 border border-green-500/20">
                  <p className="opacity-50 mb-1">Timestamp:</p>
                  <p className="opacity-70">{proof.displayData.timestamp}</p>
                </div>

                {proof.proof.signature && (
                  <div className="p-4 bg-green-500/5 border border-green-500/20">
                    <p className="opacity-50 mb-1">Signature:</p>
                    <p className="break-all opacity-70 text-xs">
                      {proof.proof.signature.slice(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/20">
              <h4 className="text-xs font-mono mb-3 opacity-50">WHAT THIS PROVES</h4>
              <p className="text-xs font-mono opacity-70 leading-relaxed">
                This cryptographic proof demonstrates your commitment to being Verity.
                It's verifiable, timestamped, and bound to your wallet address.
                You have joined the Verity Registry.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/verity-registry')}
                className="flex-1 border border-green-500 px-6 py-4 font-mono hover:bg-green-500/10 transition"
              >
                VIEW VERITY REGISTRY
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
              >
                RETURN HOME
              </button>
            </div>
          </div>

          <div className="mt-8 text-xs font-mono opacity-30 text-center space-y-2">
            <p>You are Verity.</p>
            <p>You are not the only Verity.</p>
            <p>Identity is commitment.</p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
