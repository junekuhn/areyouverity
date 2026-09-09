'use client';

import { use } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import EvolutionTree from '@/components/EvolutionTree';

export default function ProfilePage({ params }) {
  const unwrappedParams = use(params);
  const profileAddress = unwrappedParams.address;

  const { address: userAddress } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [evolutionHistory, setEvolutionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const publicClient = usePublicClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read user's reputation
  const { data: reputation } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReputation',
    args: profileAddress ? [profileAddress] : undefined,
  });

  // Read user's tokens
  const { data: userTokens } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTokensByAddress',
    args: profileAddress ? [profileAddress] : undefined,
  });

  // Read who they recognize
  const { data: recognizes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRecognizes',
    args: profileAddress ? [profileAddress] : undefined,
  });

  // Read who recognizes them
  const { data: recognizedBy } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRecognizedBy',
    args: profileAddress ? [profileAddress] : undefined,
  });

  // Read if they're in Verity Registry
  const { data: isVerity } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isVerity',
    args: profileAddress ? [profileAddress] : undefined,
  });

  // Fetch evolution history from events
  useEffect(() => {
    if (!mounted || !publicClient || !profileAddress) return;

    const fetchHistory = async () => {
      setLoading(true);

      try {
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock - 10000n;

        // Get all state transformation events for this address
        const [creationEvents, transformEvents] = await Promise.all([
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'VerityIdentityCreated'),
            args: { minter: profileAddress },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'StateTransformed'),
            args: { owner: profileAddress },
            fromBlock,
            toBlock: 'latest'
          })
        ]);

        // Build evolution history
        const history = [];

        // Add creation event
        if (creationEvents.length > 0) {
          const event = creationEvents[0];
          const stateNames = ['Affirmed', 'Denied', 'PureNO', 'Contradicted'];
          history.push({
            state: stateNames[Number(event.args.initialState)] || 'Unknown',
            timestamp: event.args.timestamp,
            reason: 'Initial creation',
            blockNumber: event.blockNumber
          });
        }

        // Add transformation events
        transformEvents.forEach(event => {
          const stateNames = ['Affirmed', 'Denied', 'PureNO', 'Contradicted'];
          history.push({
            state: stateNames[Number(event.args.newState)] || 'Unknown',
            timestamp: event.args.timestamp,
            reason: event.args.reason,
            blockNumber: event.blockNumber
          });
        });

        // Sort by block number
        history.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

        setEvolutionHistory(history);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [mounted, publicClient, profileAddress]);

  if (!mounted) return null;

  const isOwnProfile = profileAddress?.toLowerCase() === userAddress?.toLowerCase();
  const tokens = userTokens || [];
  const rep = reputation || { score: 0n, successfulChallenges: 0n, failedChallenges: 0n, timesContradicted: 0n };
  const repScore = Number(rep.score || 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-white/60 hover:text-white transition text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold font-mono">
              {profileAddress?.slice(0, 6)}...{profileAddress?.slice(-4)}
            </h1>
            {isOwnProfile && (
              <span className="text-sm bg-white/20 px-3 py-1 rounded">YOUR PROFILE</span>
            )}
            {isVerity && (
              <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded border border-blue-500/30">
                ✓ VERITY
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Reputation Card */}
            <div className="border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4">Reputation</h3>
              <div className={`text-5xl font-bold mb-4 ${
                repScore >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {repScore}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Successful Challenges:</span>
                  <span className="text-green-400">{rep.successfulChallenges?.toString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Failed Challenges:</span>
                  <span className="text-red-400">{rep.failedChallenges?.toString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Times Contradicted:</span>
                  <span className="text-red-400">{rep.timesContradicted?.toString() || '0'}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="text-white/60">Win Rate:</span>
                  <span className="text-white">
                    {Number(rep.successfulChallenges) + Number(rep.failedChallenges) > 0
                      ? ((Number(rep.successfulChallenges) / (Number(rep.successfulChallenges) + Number(rep.failedChallenges))) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tokens Card */}
            <div className="border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4">Identities Owned</h3>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {tokens.length}
              </div>
              {tokens.length > 0 && (
                <div className="text-xs text-white/60 space-y-1">
                  {tokens.slice(0, 5).map(tokenId => (
                    <div key={tokenId.toString()} className="font-mono">
                      Token #{tokenId.toString()}
                    </div>
                  ))}
                  {tokens.length > 5 && (
                    <div className="text-white/40">
                      +{tokens.length - 5} more...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recognition Network */}
            <div className="border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4">Recognition Network</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-white/60 mb-1">Recognizes:</div>
                  <div className="text-2xl font-bold text-pink-400">
                    {recognizes?.length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-white/60 mb-1">Recognized By:</div>
                  <div className="text-2xl font-bold text-pink-400">
                    {recognizedBy?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Evolution Tree */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="border border-white/20 p-12 text-center">
                <div className="text-white/40">Loading evolution history...</div>
              </div>
            ) : (
              <EvolutionTree
                history={evolutionHistory}
                currentState={evolutionHistory[evolutionHistory.length - 1]?.state}
              />
            )}

            {/* Full History Timeline */}
            <div className="mt-6 border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4">Complete History</h3>
              {evolutionHistory.length > 0 ? (
                <div className="space-y-3">
                  {evolutionHistory.map((event, index) => (
                    <div
                      key={index}
                      className="border-l-2 pl-4 py-2"
                      style={{ borderColor: getStateColor(event.state) }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-bold"
                          style={{ color: getStateColor(event.state) }}
                        >
                          {event.state}
                        </span>
                        {index === evolutionHistory.length - 1 && (
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">CURRENT</span>
                        )}
                      </div>
                      <div className="text-xs text-white/60 mb-1">
                        {new Date(Number(event.timestamp) * 1000).toLocaleString()}
                      </div>
                      {event.reason && (
                        <div className="text-xs text-white/70 italic">
                          "{event.reason}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40">
                  No history available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStateColor(state) {
  switch(state) {
    case 'Affirmed': return '#60a5fa';
    case 'Denied': return '#a78bfa';
    case 'PureNO': return '#c084fc';
    case 'Contradicted': return '#f87171';
    default: return '#9ca3af';
  }
}
