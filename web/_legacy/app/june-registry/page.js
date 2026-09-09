'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export default function VerityRegistryPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [verityList, setVerityList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read Verity Registry from contract
  const { data: registryData, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVerityRegistry',
  });

  // Read total count
  const { data: verityCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVerityCount',
  });

  // Read if current user is in registry
  const { data: userIsVerity } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isVerity',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (registryData) {
      setVerityList(registryData);
      setLoading(false);
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [registryData, isLoading]);

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-mono mb-6">THE VERITY REGISTRY</h1>
          <p className="text-sm opacity-50 font-mono leading-relaxed max-w-2xl mx-auto">
            A public record of all who have affirmed being Verity.<br />
            Multiple people can be Verity. You are observing the network.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="border border-white/20 p-6 text-center">
            <div className="text-3xl font-mono mb-2">{Number(verityCount || 0)}</div>
            <div className="text-xs opacity-50 font-mono">Total Veritys</div>
          </div>

          <div className="border border-white/20 p-6 text-center">
            <div className="text-3xl font-mono mb-2">
              {userIsVerity ? '✓' : '–'}
            </div>
            <div className="text-xs opacity-50 font-mono">You Are Verity</div>
          </div>

          <div className="border border-white/20 p-6 text-center">
            <div className="text-3xl font-mono mb-2">
              {isConnected ? '✓' : '✗'}
            </div>
            <div className="text-xs opacity-50 font-mono">Wallet Connected</div>
          </div>
        </div>

        {/* Registry List */}
        <div className="border border-white/20 mb-8">
          <div className="border-b border-white/20 p-4 bg-white/5">
            <h2 className="text-sm font-mono">ALL AFFIRMED VERITYS</h2>
          </div>

          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-pulse text-sm font-mono opacity-50">
                  Loading registry...
                </div>
              </div>
            ) : verityList.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-mono opacity-50 mb-4">
                  No one has affirmed being Verity yet
                </p>
                <p className="text-xs font-mono opacity-30">
                  Be the first
                </p>
              </div>
            ) : (
              verityList.map((verityAddress, index) => {
                const isCurrentUser = address && verityAddress.toLowerCase() === address.toLowerCase();

                return (
                  <div
                    key={index}
                    className={`p-6 flex justify-between items-center hover:bg-white/5 transition ${
                      isCurrentUser ? 'bg-green-500/10 border-l-2 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-mono opacity-30">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-mono text-sm mb-1">
                          {formatAddress(verityAddress)}
                          {isCurrentUser && (
                            <span className="ml-3 text-xs text-green-400 border border-green-500/30 px-2 py-1">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-50 font-mono">
                          Verity Identity #{index + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(verityAddress);
                          alert('Address copied!');
                        }}
                        className="border border-white/20 px-3 py-2 text-xs font-mono hover:bg-white/10 transition"
                      >
                        COPY
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="border border-white/20 p-8 mb-8 space-y-6">
          <h3 className="text-sm font-mono opacity-50">ABOUT THE REGISTRY</h3>

          <div className="text-xs font-mono opacity-70 space-y-4 leading-relaxed">
            <p>
              This is a public record of all addresses that have affirmed being Verity.
              Each entry represents a cryptographic commitment to the Verity identity.
            </p>

            <p>
              <strong>Multiple people can be Verity.</strong> Identity is not 1:1 with bodies.
              This registry demonstrates that one identity can belong to many,
              and one person can hold multiple identities.
            </p>

            <p>
              Some Veritys may later deny their identity, creating a contradiction.
              Those addresses are removed from this affirmed registry but remain
              recorded in the blockchain history.
            </p>

            <p className="text-white pt-4">
              Identity is commitment. Trust is recorded. Denial has consequences.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {!userIsVerity && isConnected && (
            <button
              onClick={() => router.push('/become-verity')}
              className="flex-1 border-2 border-green-500 text-green-500 px-6 py-4 font-mono hover:bg-green-500 hover:text-black transition"
            >
              BECOME VERITY
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="flex-1 border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
          >
            {userIsVerity ? 'RETURN HOME' : 'GO BACK'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs font-mono opacity-30 space-y-2">
          <p>This is a commitment-based identity system</p>
          <p>Multiple realities can coexist</p>
          <p>You can be yourself and also be Verity</p>
        </div>
      </div>
    </main>
  );
}
