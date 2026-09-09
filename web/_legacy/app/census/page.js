'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CensusPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read census stats
  const { data: censusStats, isLoading: loadingStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCensusStats',
  });

  // Read Verity Registry
  const { data: verityRegistry, isLoading: loadingRegistry } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVerityRegistry',
  });

  // Read active challenges
  const { data: activeChallenges, isLoading: loadingChallenges } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActiveChallenges',
  });

  if (!mounted) return null;

  const stats = censusStats || [0n, 0n, 0n, 0n, 0n];
  const totalAffirmed = Number(stats[0] || 0);
  const totalDenied = Number(stats[1] || 0);
  const totalContradicted = Number(stats[2] || 0);
  const totalTokens = Number(stats[3] || 0);
  const totalChallenges = Number(stats[4] || 0);

  const registry = verityRegistry || [];
  const challenges = activeChallenges || [];

  const affirmationRate = totalTokens > 0 ? (totalAffirmed / totalTokens * 100).toFixed(1) : 0;
  const denialRate = totalTokens > 0 ? (totalDenied / totalTokens * 100).toFixed(1) : 0;
  const contradictionRate = totalTokens > 0 ? (totalContradicted / totalTokens * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-white/60 hover:text-white transition text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Verity Census</h1>
          <p className="text-xl text-white/70">
            Real-time statistics of the collective identity paradox
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Identities */}
          <div className="border border-white/20 p-6 hover:border-white/40 transition">
            <div className="text-5xl font-bold text-white mb-2">{totalTokens}</div>
            <div className="text-white/60 text-sm">Total Identities Created</div>
          </div>

          {/* Affirmations */}
          <div className="border border-blue-500/30 p-6 hover:border-blue-500/60 transition">
            <div className="text-5xl font-bold text-blue-400 mb-2">{totalAffirmed}</div>
            <div className="text-white/60 text-sm">Affirmed "I am Verity"</div>
            <div className="text-xs text-blue-400/60 mt-1">{affirmationRate}% of total</div>
          </div>

          {/* Denials */}
          <div className="border border-purple-500/30 p-6 hover:border-purple-500/60 transition">
            <div className="text-5xl font-bold text-purple-400 mb-2">{totalDenied}</div>
            <div className="text-white/60 text-sm">Denied "Pure NO"</div>
            <div className="text-xs text-purple-400/60 mt-1">{denialRate}% of total</div>
          </div>

          {/* Contradictions */}
          <div className="border border-red-500/30 p-6 hover:border-red-500/60 transition">
            <div className="text-5xl font-bold text-red-400 mb-2">{totalContradicted}</div>
            <div className="text-white/60 text-sm">Contradictions Revealed</div>
            <div className="text-xs text-red-400/60 mt-1">{contradictionRate}% of total</div>
          </div>
        </div>

        {/* Visual Distribution */}
        <div className="border border-white/20 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Identity Distribution</h2>

          {totalTokens > 0 ? (
            <div className="space-y-6">
              {/* Affirmation Bar */}
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-blue-400">Affirmations</span>
                  <span className="text-white/60">{totalAffirmed} ({affirmationRate}%)</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                    style={{ width: `${affirmationRate}%` }}
                  />
                </div>
              </div>

              {/* Denial Bar */}
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-purple-400">Denials</span>
                  <span className="text-white/60">{totalDenied} ({denialRate}%)</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000"
                    style={{ width: `${denialRate}%` }}
                  />
                </div>
              </div>

              {/* Contradiction Bar */}
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-red-400">Contradictions</span>
                  <span className="text-white/60">{totalContradicted} ({contradictionRate}%)</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000"
                    style={{ width: `${contradictionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/40 py-8">
              No identities created yet. Be the first!
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Verity Registry */}
          <div className="border border-white/20 p-6">
            <h2 className="text-2xl font-bold mb-4">Verity Registry</h2>
            <p className="text-white/60 text-sm mb-6">
              Public list of all addresses who affirmed "I am Verity"
            </p>

            {loadingRegistry ? (
              <div className="text-center py-8 text-white/40">Loading registry...</div>
            ) : registry.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {registry.map((addr, index) => (
                  <div
                    key={addr}
                    className="flex items-center justify-between p-3 border border-white/10 hover:border-blue-500/40 transition font-mono text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/40">#{index + 1}</span>
                      <span className="text-blue-400">
                        {addr.slice(0, 6)}...{addr.slice(-4)}
                      </span>
                      {addr.toLowerCase() === address?.toLowerCase() && (
                        <span className="text-xs bg-white/10 px-2 py-1 rounded">YOU</span>
                      )}
                    </div>
                    <Link
                      href={`/profile/${addr}`}
                      className="text-white/40 hover:text-white transition text-xs"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                No Veritys yet. Will you be the first to affirm?
              </div>
            )}
          </div>

          {/* Active Challenges */}
          <div className="border border-red-500/30 p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Active Challenges</h2>
            <p className="text-white/60 text-sm mb-6">
              Ongoing challenges waiting for resolution
            </p>

            {loadingChallenges ? (
              <div className="text-center py-8 text-white/40">Loading challenges...</div>
            ) : challenges.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {challenges.slice(0, 10).map((challengeId) => (
                  <div
                    key={challengeId.toString()}
                    className="p-3 border border-red-500/20 hover:border-red-500/40 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">Challenge #{challengeId.toString()}</span>
                      <span className="text-xs text-red-400">ACTIVE</span>
                    </div>
                    <Link
                      href={`/arena?challenge=${challengeId.toString()}`}
                      className="text-sm text-white/70 hover:text-white transition"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                No active challenges. Be the first to challenge someone!
              </div>
            )}

            <Link
              href="/arena"
              className="block mt-6 w-full text-center border border-red-500/30 px-4 py-3 hover:bg-red-500/10 transition text-sm"
            >
              Go to Challenge Arena →
            </Link>
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="border border-white/20 p-8 mt-6">
          <h2 className="text-2xl font-bold mb-6">Challenge Activity</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-white mb-2">{totalChallenges}</div>
              <div className="text-white/60 text-sm">Total Challenges</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">{challenges.length}</div>
              <div className="text-white/60 text-sm">Active Now</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {totalChallenges - challenges.length}
              </div>
              <div className="text-white/60 text-sm">Resolved</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isConnected && (
          <div className="border border-white/20 p-8 mt-6 text-center">
            <p className="text-white/70 mb-4">Connect your wallet to participate in the census</p>
            <Link
              href="/mint"
              className="inline-block px-8 py-3 bg-white text-black font-mono hover:bg-white/90 transition"
            >
              Create Your Identity
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
