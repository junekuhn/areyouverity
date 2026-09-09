'use client';

import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState({
    topReputation: [],
    topChallengers: [],
    mostContradicted: [],
    bestWitnesses: [],
    mostRecognized: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reputation');

  const publicClient = usePublicClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read total tokens to iterate through
  const { data: censusStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCensusStats',
  });

  // Read Verity Registry for addresses
  const { data: verityRegistry } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVerityRegistry',
  });

  // Fetch all reputations and calculate leaderboards
  useEffect(() => {
    if (!mounted || !publicClient || !censusStats) return;

    const fetchLeaderboards = async () => {
      setLoading(true);

      try {
        const registry = verityRegistry || [];
        const totalTokens = Number(censusStats[3] || 0);

        // Collect all unique addresses from events
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock - 10000n;

        // Get all identity creation events to find all participants
        const identityEvents = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: CONTRACT_ABI.find(item => item.name === 'VerityIdentityCreated'),
          fromBlock,
          toBlock: 'latest'
        });

        const allAddresses = new Set();
        identityEvents.forEach(event => {
          if (event.args?.minter) allAddresses.add(event.args.minter);
        });

        // Fetch reputation for all addresses
        const reputationPromises = Array.from(allAddresses).map(async (addr) => {
          try {
            const rep = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getReputation',
              args: [addr]
            });

            return {
              address: addr,
              score: Number(rep.score || 0),
              successfulChallenges: Number(rep.successfulChallenges || 0),
              failedChallenges: Number(rep.failedChallenges || 0),
              timesContradicted: Number(rep.timesContradicted || 0),
              witnessedCorrectly: Number(rep.witnessedCorrectly || 0),
              witnessedIncorrectly: Number(rep.witnessedIncorrectly || 0)
            };
          } catch (err) {
            return null;
          }
        });

        const reputations = (await Promise.all(reputationPromises)).filter(r => r !== null);

        // Sort and create leaderboards
        const topReputation = [...reputations]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        const topChallengers = [...reputations]
          .filter(r => r.successfulChallenges > 0)
          .sort((a, b) => b.successfulChallenges - a.successfulChallenges)
          .slice(0, 10);

        const mostContradicted = [...reputations]
          .filter(r => r.timesContradicted > 0)
          .sort((a, b) => b.timesContradicted - a.timesContradicted)
          .slice(0, 10);

        const bestWitnesses = [...reputations]
          .filter(r => r.witnessedCorrectly > 0 || r.witnessedIncorrectly > 0)
          .sort((a, b) => {
            const aRatio = a.witnessedCorrectly / Math.max(1, a.witnessedCorrectly + a.witnessedIncorrectly);
            const bRatio = b.witnessedCorrectly / Math.max(1, b.witnessedCorrectly + b.witnessedIncorrectly);
            return bRatio - aRatio;
          })
          .slice(0, 10);

        // Get most recognized (need to count recognizedBy arrays)
        const recognitionPromises = Array.from(allAddresses).map(async (addr) => {
          try {
            const recognizedBy = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getRecognizedBy',
              args: [addr]
            });

            return {
              address: addr,
              recognitionCount: recognizedBy?.length || 0
            };
          } catch (err) {
            return { address: addr, recognitionCount: 0 };
          }
        });

        const recognitions = await Promise.all(recognitionPromises);
        const mostRecognized = recognitions
          .filter(r => r.recognitionCount > 0)
          .sort((a, b) => b.recognitionCount - a.recognitionCount)
          .slice(0, 10);

        setLeaderboardData({
          topReputation,
          topChallengers,
          mostContradicted,
          bestWitnesses,
          mostRecognized
        });

      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [mounted, publicClient, censusStats, verityRegistry]);

  if (!mounted) return null;

  const tabs = [
    { id: 'reputation', label: 'Top Reputation', icon: '⭐' },
    { id: 'challengers', label: 'Best Challengers', icon: '⚔️' },
    { id: 'contradicted', label: 'Most Contradicted', icon: '💥' },
    { id: 'witnesses', label: 'Best Witnesses', icon: '👁️' },
    { id: 'recognized', label: 'Most Recognized', icon: '🏆' }
  ];

  const getCurrentData = () => {
    switch(activeTab) {
      case 'reputation': return leaderboardData.topReputation;
      case 'challengers': return leaderboardData.topChallengers;
      case 'contradicted': return leaderboardData.mostContradicted;
      case 'witnesses': return leaderboardData.bestWitnesses;
      case 'recognized': return leaderboardData.mostRecognized;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-white/60 hover:text-white transition text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Leaderboards</h1>
          <p className="text-xl text-white/70">
            Hall of fame for the most distinguished Veritys
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-mono whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'border border-white/20 hover:border-white/40'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Content */}
        {loading ? (
          <div className="text-center py-20 text-white/40">
            <div className="text-4xl mb-4">⏳</div>
            Loading leaderboards...
          </div>
        ) : (
          <div className="border border-white/20">
            {getCurrentData().length > 0 ? (
              <div>
                {getCurrentData().map((item, index) => (
                  <LeaderboardRow
                    key={item.address}
                    rank={index + 1}
                    item={item}
                    category={activeTab}
                    userAddress={address}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-white/40">
                <div className="text-4xl mb-4">🏜️</div>
                No data yet. Be the first to make the leaderboard!
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 border border-white/20 p-6 bg-white/5">
          <h3 className="text-lg font-bold mb-4">How Rankings Work</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-white/70">
            <div>
              <div className="text-white font-mono mb-1">⭐ Reputation</div>
              <p className="text-xs">Highest overall reputation score. Earn through honest actions, challenges, and witnessing.</p>
            </div>
            <div>
              <div className="text-white font-mono mb-1">⚔️ Challengers</div>
              <p className="text-xs">Most successful challenges. Catch liars and win big.</p>
            </div>
            <div>
              <div className="text-white font-mono mb-1">💥 Contradicted</div>
              <p className="text-xs">Hall of shame - most times caught in contradictions.</p>
            </div>
            <div>
              <div className="text-white font-mono mb-1">👁️ Witnesses</div>
              <p className="text-xs">Best witness accuracy ratio. Vouch for the right people.</p>
            </div>
            <div>
              <div className="text-white font-mono mb-1">🏆 Recognized</div>
              <p className="text-xs">Most recognized by other Veritys. Build trust networks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Row Component
function LeaderboardRow({ rank, item, category, userAddress }) {
  const isUser = item.address?.toLowerCase() === userAddress?.toLowerCase();

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getStatDisplay = () => {
    switch(category) {
      case 'reputation':
        return (
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${item.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.score}
            </div>
            <div className="text-xs text-white/40">
              {item.successfulChallenges} wins / {item.failedChallenges} losses
            </div>
          </div>
        );
      case 'challengers':
        return (
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-yellow-400">
              {item.successfulChallenges}
            </div>
            <div className="text-xs text-white/40">
              successful challenges
            </div>
          </div>
        );
      case 'contradicted':
        return (
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-red-400">
              {item.timesContradicted}
            </div>
            <div className="text-xs text-white/40">
              contradictions caught
            </div>
          </div>
        );
      case 'witnesses':
        const totalWitnessed = item.witnessedCorrectly + item.witnessedIncorrectly;
        const accuracy = totalWitnessed > 0
          ? ((item.witnessedCorrectly / totalWitnessed) * 100).toFixed(1)
          : 0;
        return (
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-cyan-400">
              {accuracy}%
            </div>
            <div className="text-xs text-white/40">
              {item.witnessedCorrectly} correct / {item.witnessedIncorrectly} wrong
            </div>
          </div>
        );
      case 'recognized':
        return (
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-pink-400">
              {item.recognitionCount}
            </div>
            <div className="text-xs text-white/40">
              recognitions
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border-b border-white/10 p-4 flex items-center justify-between hover:bg-white/5 transition ${
      isUser ? 'bg-white/10' : ''
    }`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="text-2xl w-12 text-center">
          {getMedalIcon(rank)}
        </div>
        <div className="flex-1">
          <div className="font-mono text-sm flex items-center gap-2">
            <span className="text-blue-400">
              {item.address?.slice(0, 6)}...{item.address?.slice(-4)}
            </span>
            {isUser && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">YOU</span>
            )}
          </div>
        </div>
      </div>
      <div>
        {getStatDisplay()}
      </div>
    </div>
  );
}
