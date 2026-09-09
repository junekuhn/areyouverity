'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import Link from 'next/link';

export default function ArenaPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [challengeAddress, setChallengeAddress] = useState('');
  const [challengeTokenId, setChallengeTokenId] = useState('');
  const [challengeReason, setChallengeReason] = useState('');
  const [challengeStake, setChallengeStake] = useState('0.01');
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read active challenges
  const { data: activeChallenges } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActiveChallenges',
  });

  // Read min stake
  const { data: minStake } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'minimumChallengeStake',
  });

  // Read user's reputation
  const { data: userReputation } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReputation',
    args: address ? [address] : undefined,
  });

  // Create challenge
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCreateChallenge = async () => {
    if (!challengeAddress || !challengeTokenId || !challengeReason) {
      alert('Please fill all fields');
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createChallenge',
        args: [challengeAddress, BigInt(challengeTokenId), challengeReason],
        value: parseEther(challengeStake),
      });
    } catch (error) {
      console.error('Challenge error:', error);
      alert('Failed to create challenge: ' + error.message);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      alert('Challenge created successfully!');
      setChallengeAddress('');
      setChallengeTokenId('');
      setChallengeReason('');
    }
  }, [isSuccess]);

  if (!mounted) return null;

  const challenges = activeChallenges || [];
  const minStakeEth = minStake ? formatEther(minStake) : '0.01';
  const reputation = userReputation || { score: 0n, successfulChallenges: 0n, failedChallenges: 0n };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-white/60 hover:text-white transition text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-red-400">Challenge Arena</h1>
          <p className="text-xl text-white/70">
            Stake ETH to challenge identities. Winner takes all.
          </p>
        </div>

        {!isConnected ? (
          <div className="border border-white/20 p-12 text-center">
            <p className="text-xl text-white/70 mb-6">
              Connect your wallet to participate in challenges
            </p>
            <div className="text-sm text-white/50">
              Challenges require staking ETH. Only those with reputation  &gt; -50 can challenge.
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Create Challenge Form */}
            <div className="border border-red-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Create Challenge</h2>

              {/* Your Reputation */}
              <div className="mb-6 p-4 border border-white/10 bg-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">Your Reputation:</span>
                  <span className={`text-2xl font-bold ${
                    Number(reputation.score) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {reputation.score.toString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                  <div>
                    <div className="text-white/40">Successful:</div>
                    <div className="text-green-400">{reputation.successfulChallenges?.toString() || '0'}</div>
                  </div>
                  <div>
                    <div className="text-white/40">Failed:</div>
                    <div className="text-red-400">{reputation.failedChallenges?.toString() || '0'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Target Address</label>
                  <input
                    type="text"
                    value={challengeAddress}
                    onChange={(e) => setChallengeAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-black border border-white/20 px-4 py-3 text-sm font-mono focus:border-red-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Token ID</label>
                  <input
                    type="number"
                    value={challengeTokenId}
                    onChange={(e) => setChallengeTokenId(e.target.value)}
                    placeholder="0"
                    className="w-full bg-black border border-white/20 px-4 py-3 text-sm font-mono focus:border-red-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Reason for Challenge</label>
                  <textarea
                    value={challengeReason}
                    onChange={(e) => setChallengeReason(e.target.value)}
                    placeholder="Why do you think they're lying?"
                    rows={3}
                    className="w-full bg-black border border-white/20 px-4 py-3 text-sm focus:border-red-500/50 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Stake Amount (min: {minStakeEth} ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={challengeStake}
                    onChange={(e) => setChallengeStake(e.target.value)}
                    placeholder={minStakeEth}
                    className="w-full bg-black border border-white/20 px-4 py-3 text-sm font-mono focus:border-red-500/50 outline-none"
                  />
                  <div className="text-xs text-white/40 mt-2">
                    Higher stakes = higher rewards if you win
                  </div>
                </div>

                <button
                  onClick={handleCreateChallenge}
                  disabled={isPending || isConfirming || Number(reputation.score) <= -50}
                  className="w-full border border-red-500/50 bg-red-500/10 px-6 py-4 text-sm font-mono hover:bg-red-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? 'Creating Challenge...' : 'Create Challenge'}
                </button>

                {Number(reputation.score) <= -50 && (
                  <div className="text-xs text-red-400 text-center">
                    Reputation too low to create challenges
                  </div>
                )}
              </div>

              {/* How It Works */}
              <div className="mt-8 p-4 border border-white/10 bg-white/5">
                <h3 className="text-sm font-bold mb-3">How Challenges Work:</h3>
                <div className="text-xs text-white/60 space-y-2">
                  <p>1. Stake ETH to challenge someone's identity</p>
                  <p>2. They must respond within 7 days</p>
                  <p>3. If caught lying: You win 2x your stake</p>
                  <p>4. If they're honest: They win 2x your stake</p>
                  <p>5. Their witnesses are punished if they lied</p>
                </div>
              </div>
            </div>

            {/* Active Challenges List */}
            <div className="border border-white/20 p-8">
              <h2 className="text-2xl font-bold mb-6">Active Challenges ({challenges.length})</h2>

              {challenges.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {challenges.map((challengeId) => (
                    <ChallengeCard
                      key={challengeId.toString()}
                      challengeId={challengeId}
                      userAddress={address}
                      onSelect={setSelectedChallenge}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  No active challenges yet. Be the first to create one!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-12 border border-white/20 p-8">
          <h2 className="text-2xl font-bold mb-6">Challenge Leaderboard</h2>
          <div className="text-center text-white/40 py-8">
            Coming soon: Top challengers and most challenged addresses
          </div>
        </div>
      </div>
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({ challengeId, userAddress, onSelect }) {
  const { data: challenge } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getChallenge',
    args: [challengeId],
  });

  if (!challenge) return null;

  const isChallenger = challenge.challenger?.toLowerCase() === userAddress?.toLowerCase();
  const isChallenged = challenge.challenged?.toLowerCase() === userAddress?.toLowerCase();
  const stake = challenge.stake ? formatEther(challenge.stake) : '0';

  return (
    <div className="border border-red-500/20 p-4 hover:border-red-500/40 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-white/40 mb-1">Challenge #{challengeId.toString()}</div>
          <div className="text-sm font-mono">
            <span className="text-red-400">
              {challenge.challenger?.slice(0, 6)}...{challenge.challenger?.slice(-4)}
            </span>
            <span className="text-white/40 mx-2">→</span>
            <span className="text-blue-400">
              {challenge.challenged?.slice(0, 6)}...{challenge.challenged?.slice(-4)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">Stake</div>
          <div className="text-yellow-400 font-bold">{stake} ETH</div>
        </div>
      </div>

      {challenge.reason && (
        <div className="text-xs text-white/60 mb-3 italic">
          "{challenge.reason}"
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40">
          Token #{challenge.tokenId?.toString()}
        </div>
        {(isChallenger || isChallenged) && (
          <span className="text-xs bg-white/10 px-2 py-1 rounded">
            {isChallenger ? 'YOU CHALLENGED' : 'YOU WERE CHALLENGED'}
          </span>
        )}
      </div>
    </div>
  );
}
