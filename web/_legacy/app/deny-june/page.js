'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { generateDenialProof, formatProof } from '@/lib/zkProof';

export default function DenyVerityPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [step, setStep] = useState(1); // 1: warning, 2: mint, 3: proof, 4: success
  const [generating, setGenerating] = useState(false);
  const [proof, setProof] = useState(null);

  const handleBeginMint = () => {
    // Go to mint page with denial intent
    router.push('/mint?intent=deny');
  };

  const handleGenerateProof = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    setGenerating(true);

    try {
      // Generate cryptographic denial proof
      const proofData = await generateDenialProof(0, address);
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

  // Step 1: Warning
  if (step === 1) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center text-red-500">
            DENY VERITY
          </h1>

          <div className="border-2 border-red-500 p-12 space-y-8">
            <div className="text-center space-y-4">
              <p className="text-2xl font-mono">You answered: <span className="text-red-400">NO</span></p>
              <p className="text-sm font-mono opacity-70">
                You explicitly deny being Verity
              </p>
            </div>

            <div className="border-t border-red-500/30 pt-8 space-y-6">
              <h3 className="text-sm font-mono text-red-400">WHAT THIS CREATES</h3>

              <p className="text-xs font-mono opacity-70 leading-relaxed">
                By saying NO without ever having been Verity, you create an explicit denial.
                This is not a contradiction - it's a clear statement of non-identity. You will:
              </p>

              <ul className="text-xs font-mono opacity-70 space-y-3 leading-relaxed">
                <li>• Mint a Denial Certificate NFT (0.08 ETH - rarer)</li>
                <li>• Create a glitched anti-Verity portrait</li>
                <li>• Generate a cryptographic denial proof</li>
                <li>• Be permanently recorded as having denied Verity</li>
                <li>• Own a more valuable denial variant</li>
              </ul>

              <div className="p-6 bg-red-500/5 border border-red-500/20 mt-6">
                <h4 className="text-xs font-mono mb-3 text-red-400">THE VALUE OF DENIAL</h4>
                <p className="text-xs font-mono opacity-70 leading-relaxed">
                  Denial certificates are rarer than affirmations (priced higher).
                  They represent the courage to explicitly reject an identity.
                  In a system that pressures you to be Verity, saying NO has value.
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
                className="flex-1 border-2 border-red-500 text-red-500 px-6 py-4 font-mono hover:bg-red-500 hover:text-white transition"
              >
                MINT DENIAL CERTIFICATE
              </button>
            </div>
          </div>

          <div className="mt-8 text-xs font-mono opacity-30 text-center">
            <p>Not everyone must be Verity</p>
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
          <h1 className="text-5xl font-mono mb-12 text-center text-red-500">
            DENIAL RECORDED
          </h1>

          <div className="border border-red-500 p-12 space-y-8">
            <div className="text-center space-y-6">
              <p className="text-red-400 font-mono text-2xl">
                ✓ DENIAL CERTIFIED
              </p>
              <p className="text-sm font-mono opacity-70">
                Your cryptographic denial has been generated
              </p>
            </div>

            <div className="border-t border-red-500/30 pt-8 space-y-6">
              <h3 className="text-sm font-mono text-red-400">YOUR DENIAL PROOF</h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-4 bg-red-500/5 border border-red-500/20">
                  <p className="opacity-50 mb-1">Commitment Hash:</p>
                  <p className="break-all opacity-70">{proof.publicSignals.commitmentHash}</p>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/20">
                  <p className="opacity-50 mb-1">Nullifier:</p>
                  <p className="break-all opacity-70">{proof.publicSignals.nullifier}</p>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/20">
                  <p className="opacity-50 mb-1">Type:</p>
                  <p className="opacity-70 text-red-400">EXPLICIT DENIAL (PureNO)</p>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/20">
                  <p className="opacity-50 mb-1">Timestamp:</p>
                  <p className="opacity-70">{proof.displayData.timestamp}</p>
                </div>

                {proof.proof.signature && (
                  <div className="p-4 bg-red-500/5 border border-red-500/20">
                    <p className="opacity-50 mb-1">Signature:</p>
                    <p className="break-all opacity-70 text-xs">
                      {proof.proof.signature.slice(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/20">
              <h4 className="text-xs font-mono mb-3 opacity-50">WHAT THIS MEANS</h4>
              <p className="text-xs font-mono opacity-70 leading-relaxed">
                Your denial is now cryptographically recorded. You own a rare
                Denial Certificate NFT. This is not a contradiction - it's a
                clear, explicit rejection of the Verity identity. Your glitched
                portrait represents this refusal.
              </p>
            </div>

            <div className="p-6 bg-red-500/10 border border-red-500/30">
              <h4 className="text-xs font-mono mb-3 text-red-400">RARITY NOTE</h4>
              <p className="text-xs font-mono opacity-70 leading-relaxed">
                Denial certificates are intentionally rarer and more expensive
                than affirmations. Fewer people will choose this path. Your
                token is part of a smaller, more exclusive collection.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/verity-registry')}
                className="flex-1 border border-red-500 px-6 py-4 font-mono hover:bg-red-500/10 transition"
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
            <p>You are not Verity.</p>
            <p>This is your choice.</p>
            <p>Denial is valid.</p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
