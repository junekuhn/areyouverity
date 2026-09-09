'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function VerifyPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [ownsToken, setOwnsToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tokenIds, setTokenIds] = useState([]);

  useEffect(() => {
    if (isConnected && address) {
      checkTokenOwnership();
    }
  }, [isConnected, address]);

  const checkTokenOwnership = async () => {
    try {
      setChecking(true);
      // TODO: Implement actual contract call to check if address owns Verity tokens
      // For now, simulate the check
      const hasTokens = false; // Replace with actual contract call

      setOwnsToken(hasTokens);

      if (hasTokens) {
        // Get token IDs owned by this address
        // setTokenIds(tokens);
      }
    } catch (error) {
      console.error('Error checking token ownership:', error);
    } finally {
      setChecking(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-mono mb-8">CONNECT WALLET</h1>
          <p className="text-sm opacity-70 font-mono mb-8">
            To verify your identity as Verity, you must connect your wallet.
          </p>
          <button className="border border-white px-8 py-4 font-mono hover:bg-white hover:text-black transition">
            Connect Wallet
          </button>
        </div>
      </main>
    );
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="animate-pulse text-2xl font-mono">
            Checking identity...
          </div>
        </div>
      </main>
    );
  }

  // Scenario 1: Owns token + said yes
  if (ownsToken) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-8 text-center">IDENTITY VERIFICATION</h1>

          <div className="border border-white p-8 mb-8">
            <p className="text-sm font-mono mb-8 leading-relaxed opacity-70">
              You claim to be Verity, and you own a Verity identity token.
              <br /><br />
              To access the work, you must verify your identity using the
              zero-knowledge proof system. This proves you are who you say
              you are without revealing any data.
            </p>

            <div className="space-y-4 mb-8">
              <div className="text-xs font-mono opacity-50">
                Your Verity Tokens: {tokenIds.join(', ')}
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full border border-white px-6 py-4 font-mono hover:bg-white hover:text-black transition">
                VERIFY IDENTITY
              </button>

              <button
                onClick={() => router.push('/deny')}
                className="w-full border border-red-500 text-red-500 px-6 py-4 font-mono hover:bg-red-500 hover:text-white transition"
              >
                DENY BEING VERITY (PERMANENT)
              </button>
            </div>
          </div>

          <div className="text-xs font-mono opacity-50 text-center">
            <p>Warning: Denying your identity will permanently invalidate your token.</p>
            <p className="mt-2">This action cannot be undone.</p>
          </div>
        </div>
      </main>
    );
  }

  // Scenario 3: Doesn't own token + said yes
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-5xl font-mono mb-8 text-center">IDENTITY CREATION</h1>

        <div className="border border-white p-8 mb-8">
          <p className="text-sm font-mono mb-8 leading-relaxed opacity-70">
            You claim to be Verity, but you do not yet own a Verity identity token.
            <br /><br />
            To become Verity, you must create an identity commitment. This process
            uses distorted imagery of the artist's face as a reference point,
            with no biological markers.
            <br /><br />
            Your identity will be validated through zero-knowledge proofs,
            proving commitment without disclosure.
          </p>

          <div className="mb-8 p-6 bg-white/5 border border-white/20">
            <h3 className="text-sm font-mono mb-4">THE PROCESS</h3>
            <ol className="text-xs font-mono opacity-70 space-y-2 leading-relaxed">
              <li>1. View distorted reference imagery</li>
              <li>2. Create your identity commitment</li>
              <li>3. Mint your Verity identity token (0.001 ETH)</li>
              <li>4. Commit to being Verity</li>
            </ol>
          </div>

          <button
            onClick={() => router.push('/mint')}
            className="w-full border border-white px-6 py-4 font-mono hover:bg-white hover:text-black transition text-lg"
          >
            BEGIN IDENTITY CREATION
          </button>
        </div>

        <div className="text-xs font-mono opacity-50 text-center space-y-2">
          <p>This is a fundraiser for facial feminisation surgery.</p>
          <p>Proceeds support trans healthcare access.</p>
          <p className="mt-4">Once you create a Verity identity, you must remain committed.</p>
          <p>Multiple people can be Verity. You can be Verity and be you.</p>
        </div>
      </div>
    </main>
  );
}
