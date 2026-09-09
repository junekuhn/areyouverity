'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import WalletConnect from '../../components/WalletConnect';
import { useContract } from '@/hooks/useContract';

export default function Stage2Page() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { mint } = useContract();
  const [mounted, setMounted] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [parameters, setParameters] = useState(null);
  const [type, setType] = useState('valid');
  const [consented, setConsented] = useState(false);
  const [minting, setMinting] = useState(false);
  const [witnessData, setWitnessData] = useState(null);
  const [mintComplete, setMintComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const img = sessionStorage.getItem('areyouverity_image');
      const params = sessionStorage.getItem('areyouverity_params');
      const t = sessionStorage.getItem('areyouverity_type');
      if (img) setImageData(img);
      if (params) {
        try {
          setParameters(JSON.parse(params));
        } catch {
          // Corrupted session data; the "No identity data found" fallback renders
        }
      }
      if (t) setType(t);
    }
  }, []);

  const generateWitness = useCallback(() => {
    if (!parameters || !address) return;
    const timestamp = new Date().toISOString();
    const witness = {
      parameters: Object.fromEntries(
        Object.entries(parameters).map(([k, v]) => [k, Number(v).toFixed(4)])
      ),
      timestamp,
      address,
      type,
      nonce: Math.random().toString(36).substring(2, 15),
    };
    setWitnessData(witness);
    setConsented(true);
  }, [parameters, address, type]);

  const handleMint = useCallback(async () => {
    if (!consented || !witnessData) return;
    setMinting(true);
    try {
      // In production: upload image to IPFS, create metadata, mint
      await mint('ipfs://placeholder', type !== 'invalid');
      setMintComplete(true);
    } catch (err) {
      console.error('Mint failed:', err);
      setMinting(false);
    }
  }, [consented, witnessData, mint, type]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  if (!imageData || !parameters) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-mono text-white/50">No identity data found.</p>
          <Link href="/identity-creation/stage-1" className="btn-secondary">
            GO TO STAGE 1
          </Link>
        </div>
      </div>
    );
  }

  const isInvalid = type === 'invalid' || type === 'invalid-duplicate';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-6 right-6 z-50">
        <WalletConnect />
      </div>
      <div className="fixed top-6 left-6 z-50">
        <Link href="/identity-creation/stage-1" className="text-white/30 font-mono text-xs tracking-widest hover:text-white/60 transition">
          BACK
        </Link>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 fade-in">
          <p className="text-white/30 font-mono text-xs tracking-widest uppercase">
            Stage 2 of 2 &middot; Consent &amp; Mint
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-mono">
            {mintComplete ? 'Identity Created' : 'Commit to Your Identity'}
          </h1>
        </div>

        {mintComplete ? (
          /* === MINT COMPLETE === */
          <div className="space-y-8 text-center fade-in">
            <div className="mx-auto border border-white/10 inline-block">
              <img src={imageData} alt="Your identity" width={320} height={400} className="block" />
            </div>
            <div className="terminal-box max-w-lg mx-auto text-left">
              <p className="text-white/70">
                Your {isInvalid ? 'NOT-VERITY' : 'VERITY'} identity token has been created.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/collection" className="btn-primary">VIEW COLLECTION</Link>
              <Link href="/" className="btn-secondary">BACK TO MAIN</Link>
            </div>
          </div>
        ) : !consented ? (
          /* === CONSENT STAGE === */
          <div className="space-y-10 fade-in">
            {/* Preview */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="border border-white/10 shrink-0">
                <img src={imageData} alt="Your identity preview" width={256} height={320} className="block" />
              </div>
              <div className="space-y-6 flex-1">
                <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                  {isInvalid ? (
                    <>
                      <p>
                        You claim to NOT be Verity. To verify this, you will create
                        an identity token that serves as cryptographic proof of
                        your non-identity.
                      </p>
                      <p>
                        Your identity will be validated through zero-knowledge proofs,
                        proving your commitment without disclosure.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        You claim to be Verity, but you do not yet own a valid Verity
                        identity token. To verify that you are Verity, you must commit
                        to creating a token.
                      </p>
                      <p>
                        This process is a matter of transformation, by creating an
                        image that will be used to verify later on.
                      </p>
                      <p>
                        Your identity will be validated through zero-knowledge proofs,
                        proving commitment without disclosure.
                      </p>
                    </>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-2">
                    The Process
                  </p>
                  <ol className="space-y-2 text-white/50 text-sm font-mono">
                    <li className="flex gap-3">
                      <span className="text-white/20">01</span>
                      <span className="line-through text-white/30">Adjust sliders to customise appearance</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-white/20">02</span>
                      <span>Create your identity commitment</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-white/20">03</span>
                      <span>Mint your {isInvalid ? 'Not-Verity' : 'Verity'} token</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-white/20">04</span>
                      <span>Commit to {isInvalid ? 'not ' : ''}being Verity</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Consent button */}
            {isConnected ? (
              <div className="text-center">
                <button onClick={generateWitness} className="btn-primary">
                  I CONSENT &mdash; CREATE MY COMMITMENT
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-white/40 font-mono text-sm">Connect wallet to continue</p>
                <WalletConnect />
              </div>
            )}
          </div>
        ) : (
          /* === WITNESS DATA + MINT === */
          <div className="space-y-10 fade-in">
            {/* Witness data */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-sm text-white/50 uppercase tracking-wider">
                  Your Private Witness Data
                </h2>
                <span className="text-red-400 font-mono text-xs border border-red-400/30 px-2 py-0.5">
                  SAVE THIS
                </span>
              </div>
              <div className="terminal-box text-left overflow-x-auto">
                <pre className="text-xs text-white/60 whitespace-pre-wrap">
{JSON.stringify(witnessData, null, 2)}
                </pre>
              </div>
              <p className="text-white/30 font-mono text-xs">
                This is your <span className="text-white/60">witness</span> &mdash; the private
                signals that prove your identity commitment. Save this data.
                You will need it to generate proofs later.
              </p>
            </div>

            {/* Copy button */}
            <div className="text-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(witnessData, null, 2));
                }}
                className="btn-secondary text-sm"
              >
                COPY WITNESS DATA
              </button>
            </div>

            {/* ZK terminology context */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-white/10 p-3">
                <span className="text-white/30">Prover:</span>{' '}
                <span className="text-white/70">You</span>
              </div>
              <div className="border border-white/10 p-3">
                <span className="text-white/30">Verifier:</span>{' '}
                <span className="text-white/70">Smart Contract</span>
              </div>
              <div className="border border-white/10 p-3">
                <span className="text-white/30">Signals:</span>{' '}
                <span className="text-white/70">Your parameters</span>
              </div>
              <div className="border border-white/10 p-3">
                <span className="text-white/30">Witness:</span>{' '}
                <span className="text-white/70">The data above</span>
              </div>
            </div>

            {/* Mint button */}
            <div className="text-center space-y-4">
              <button
                onClick={handleMint}
                disabled={minting}
                className="btn-primary disabled:opacity-50"
              >
                {minting ? 'MINTING...' : 'PROCEED TO MINT'}
              </button>
              <p className="text-white/20 font-mono text-xs">
                This will create your identity token on-chain.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
