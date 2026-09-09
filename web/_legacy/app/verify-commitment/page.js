'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export default function VerifyCommitmentPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [verifying, setVerifying] = useState(false);
  const [zkProof, setZkProof] = useState(null);
  const [verified, setVerified] = useState(false);

  // Read user's tokens
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Generate ZK proof for "YES" answer
  const generateYesProof = async () => {
    setVerifying(true);

    try {
      // Simulate ZK proof generation
      // In production: use proper ZK circuit (circom, snarkjs)
      // The proof should prove: "I own a Verity NFT AND I claim to be Verity"
      // without revealing which specific token

      const proof = {
        type: 'commitment_verification',
        answer: 'YES',
        timestamp: Date.now(),
        address: address,
        // Simplified proof - in production use actual ZK-SNARK
        proofData: {
          publicSignals: [
            '0x' + Math.random().toString(16).slice(2),
            '0x' + Math.random().toString(16).slice(2)
          ],
          proof: {
            pi_a: ['0x...', '0x...', '0x...'],
            pi_b: [['0x...', '0x...'], ['0x...', '0x...'], ['0x...', '0x...']],
            pi_c: ['0x...', '0x...', '0x...']
          }
        },
        // Hash of the answer commitment
        commitment: generateCommitmentHash('YES', address)
      };

      // Wait to simulate proof generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setZkProof(proof);
      setVerified(true);
      setVerifying(false);

      // TODO: Submit proof to smart contract
      // await contract.submitCommitment(proof)

    } catch (error) {
      console.error('Proof generation failed:', error);
      setVerifying(false);
    }
  };

  const generateCommitmentHash = (answer, addr) => {
    // Simplified commitment hash
    // In production: use proper cryptographic commitment
    const data = `${answer}-${addr}-${Date.now()}`;
    return '0x' + Array.from(data).map(c =>
      c.charCodeAt(0).toString(16).padStart(2, '0')
    ).join('').slice(0, 64);
  };

  useEffect(() => {
    if (!isConnected || !balance || Number(balance) === 0) {
      router.push('/');
    }
  }, [isConnected, balance, router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-5xl font-mono mb-12 text-center">
          VERIFY COMMITMENT
        </h1>

        <div className="border border-white p-12 space-y-8">
          <div className="text-center space-y-4">
            <p className="text-2xl font-mono">You answered: <span className="text-green-400">YES</span></p>
            <p className="text-sm font-mono opacity-70">
              You claim to be Verity
            </p>
          </div>

          <div className="border-t border-white/20 pt-8 space-y-6">
            <h3 className="text-sm font-mono text-white/60">ZERO-KNOWLEDGE VERIFICATION</h3>

            <p className="text-xs font-mono opacity-70 leading-relaxed">
              To verify your commitment without revealing your identity,
              we will generate a zero-knowledge proof that proves:
            </p>

            <ul className="text-xs font-mono opacity-70 space-y-2 leading-relaxed">
              <li>• You own at least one Verity identity token</li>
              <li>• You are answering "YES" to being Verity</li>
              <li>• Your commitment is cryptographically binding</li>
              <li className="text-white/40">• WITHOUT revealing which token you own</li>
              <li className="text-white/40">• WITHOUT revealing any biometric data</li>
            </ul>

            <div className="p-6 bg-white/5 border border-white/20 mt-6">
              <h4 className="text-xs font-mono mb-3 opacity-50">WHAT THIS PROVES</h4>
              <p className="text-xs font-mono opacity-70 leading-relaxed">
                The ZK proof creates a cryptographic commitment to your answer.
                You are saying "I am Verity" and this statement is now verifiable
                but not reversible. This is how trust works in a commitment-based
                identity system.
              </p>
            </div>
          </div>

          {!verified ? (
            <button
              onClick={generateYesProof}
              disabled={verifying}
              className="w-full border-2 border-white px-6 py-6 font-mono hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? 'GENERATING PROOF...' : 'GENERATE ZK PROOF'}
            </button>
          ) : (
            <div className="space-y-6">
              <div className="border border-green-500/50 p-6 bg-green-500/5">
                <p className="text-green-400 font-mono mb-4 text-center">
                  ✓ PROOF GENERATED
                </p>
                <div className="text-xs font-mono opacity-50 space-y-2">
                  <p>Commitment Hash:</p>
                  <p className="break-all opacity-70">{zkProof?.commitment}</p>
                  <p className="mt-4">Timestamp: {new Date(zkProof?.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="text-center text-xs font-mono opacity-70 leading-relaxed space-y-4">
                <p>Your commitment has been verified.</p>
                <p>You have proven you are Verity without revealing which token you own.</p>
                <p className="text-white">You remain Verity.</p>
              </div>

              <button
                onClick={() => router.push('/')}
                className="w-full border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
              >
                RETURN
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-xs font-mono opacity-30 text-center space-y-2">
          <p>Commitment-based identity verification</p>
          <p>Trust formalized without disclosure</p>
        </div>
      </div>
    </main>
  );
}
