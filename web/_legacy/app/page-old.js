'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [checking, setChecking] = useState(true);
  const [hasIdentity, setHasIdentity] = useState(false);
  const [verityCount, setVerityCount] = useState(0);

  // Read user's token balance
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read Verity Registry count
  const { data: registryCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVerityCount',
  });

  useEffect(() => {
    if (registryCount) {
      setVerityCount(Number(registryCount));
    }
  }, [registryCount]);

  useEffect(() => {
    if (isConnected && address) {
      const checkIdentity = async () => {
        setChecking(true);

        if (balance && Number(balance) > 0) {
          setHasIdentity(true);
        } else {
          setHasIdentity(false);
        }

        setChecking(false);
      };

      checkIdentity();
    } else if (!isConnected) {
      setChecking(false);
    }
  }, [isConnected, address, balance]);

  const handlePath = async (path) => {
    if (!isConnected && path !== 'observe') {
      alert('Please connect your wallet first');
      return;
    }

    switch (path) {
      case 'yes':
        // YES path - become Verity
        router.push('/become-verity');
        break;
      case 'no':
        // NO path - deny Verity
        router.push('/deny-verity');
        break;
      case 'observe':
        // Observe path - just look
        router.push('/verity-registry');
        break;
      case 'contradiction':
        // Special path for people who already have identity
        router.push('/contradiction');
        break;
    }
  };

  if (checking && isConnected) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-xl font-mono opacity-50">
            Checking identity...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-5xl mx-auto p-8">
        {/* The Question */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-mono mb-8 tracking-tight">
            ARE YOU<br />VERITY?
          </h1>

          <p className="text-sm opacity-50 font-mono max-w-xl mx-auto mb-4 leading-relaxed">
            This is not a question of biology.<br />
            This is a question of commitment.
          </p>

          {verityCount > 0 && (
            <p className="text-xs font-mono opacity-30 mb-12">
              {verityCount} {verityCount === 1 ? 'person has' : 'people have'} affirmed being Verity
            </p>
          )}

          {/* Three Path System */}
          {!isConnected ? (
            <div className="space-y-8">
              <p className="text-sm font-mono opacity-70 mb-8">
                Connect your wallet to answer
              </p>
              <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto opacity-30">
                <div className="border-2 border-green-500 p-8 cursor-not-allowed">
                  <div className="text-3xl font-mono mb-4">YES</div>
                  <p className="text-xs opacity-70">Become Verity</p>
                </div>
                <div className="border-2 border-red-500 p-8 cursor-not-allowed">
                  <div className="text-3xl font-mono mb-4">NO</div>
                  <p className="text-xs opacity-70">Deny Verity</p>
                </div>
                <div className="border-2 border-white/30 p-8 cursor-not-allowed">
                  <div className="text-3xl font-mono mb-4">?</div>
                  <p className="text-xs opacity-70">Observe</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Show if they already have identity */}
              {hasIdentity && (
                <div className="border border-yellow-500/50 p-6 mb-8 max-w-2xl mx-auto">
                  <p className="text-yellow-400 font-mono mb-2 text-sm">
                    ⚠️ YOU ALREADY HAVE A VERITY IDENTITY
                  </p>
                  <p className="text-xs font-mono opacity-70 leading-relaxed">
                    You previously committed to being Verity. Choosing NO now
                    will create a contradiction in your identity record.
                  </p>
                  <button
                    onClick={() => handlePath('contradiction')}
                    className="mt-4 border border-yellow-500 px-6 py-2 text-sm font-mono hover:bg-yellow-500/10 transition"
                  >
                    EXPLORE YOUR CONTRADICTION
                  </button>
                </div>
              )}

              {/* Three Paths */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Path 1: YES - Become Verity */}
                <button
                  onClick={() => handlePath('yes')}
                  className="border-2 border-green-500 p-8 hover:bg-green-500/10 transition group"
                >
                  <div className="text-3xl font-mono mb-4 text-green-400">YES</div>
                  <p className="text-xs opacity-70 leading-relaxed mb-4">
                    Create a Verity identity and affirm your commitment
                  </p>
                  <div className="text-xs opacity-50 border-t border-green-500/20 pt-4 mt-4">
                    Mint: 0.05 ETH
                  </div>
                </button>

                {/* Path 2: NO - Deny Verity */}
                <button
                  onClick={() => handlePath('no')}
                  className="border-2 border-red-500 p-8 hover:bg-red-500/10 transition group"
                >
                  <div className="text-3xl font-mono mb-4 text-red-400">NO</div>
                  <p className="text-xs opacity-70 leading-relaxed mb-4">
                    Explicitly reject Verity identity. Receive denial certificate.
                  </p>
                  <div className="text-xs opacity-50 border-t border-red-500/20 pt-4 mt-4">
                    Mint: 0.08 ETH (rarer)
                  </div>
                </button>

                {/* Path 3: ? - Observe */}
                <button
                  onClick={() => handlePath('observe')}
                  className="border-2 border-white/30 p-8 hover:bg-white/5 transition group"
                >
                  <div className="text-3xl font-mono mb-4">?</div>
                  <p className="text-xs opacity-70 leading-relaxed mb-4">
                    View the Verity Registry without committing
                  </p>
                  <div className="text-xs opacity-50 border-t border-white/10 pt-4 mt-4">
                    Free to explore
                  </div>
                </button>
              </div>

              {hasIdentity && (
                <p className="text-xs font-mono opacity-50 mt-6 max-w-2xl mx-auto">
                  Note: If you already have a Verity identity and choose NO, your NFT will be transformed
                  into a glitched "Contradiction" state. This is permanent and changes the rarity tier.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Context Section */}
        <div className="mt-24 border-t border-white/20 pt-12">
          <div className="grid md:grid-cols-2 gap-12 text-xs font-mono opacity-70">
            <div>
              <h3 className="text-sm mb-4 opacity-100">ON DECEPTION</h3>
              <p className="leading-relaxed">
                Trans people are often seen as deceivers and fraudsters.
                This work creates a system where there is no clear boundary
                between deception and reality. We make the real deception
                and the deception real.
              </p>
            </div>

            <div>
              <h3 className="text-sm mb-4 opacity-100">ON TRUST</h3>
              <p className="leading-relaxed">
                At the heart of transmisogyny is a lack of trust. This work
                is a fundraiser for facial feminisation surgery, exploring
                identity verification through commitment, not biology.
              </p>
            </div>

            <div>
              <h3 className="text-sm mb-4 opacity-100">ON IDENTITY</h3>
              <p className="leading-relaxed">
                Multiple people can be Verity. One person can be multiple identities.
                The logic of one-body, one-identity is broken. You can be Verity
                and be you, once free of the biological model.
              </p>
            </div>

            <div>
              <h3 className="text-sm mb-4 opacity-100">ON CONSEQUENCES</h3>
              <p className="leading-relaxed">
                Your answer has consequences. ZK proofs validate who you say
                you are based on who you said you were at the moment of creation.
                Denial is permanent.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-xs font-mono opacity-30">
          <p>TRANSEVIL</p>
          <p className="mt-2">A study in deception, trust, and trans identity</p>
        </div>
      </div>
    </main>
  );
}
