'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatDistanceToNow } from 'date-fns';

export default function FeedPage() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, identities, challenges, reputation

  const publicClient = usePublicClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch events from contract
  useEffect(() => {
    if (!mounted || !publicClient) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock - 10000n; // Last ~10k blocks

        // Fetch all event types
        const [
          identityEvents,
          transformEvents,
          challengeEvents,
          challengeResolvedEvents,
          reputationEvents,
          witnessEvents,
          recognitionEvents
        ] = await Promise.all([
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'VerityIdentityCreated'),
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'StateTransformed'),
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'ChallengeCreated'),
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'ChallengeResolved'),
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'ReputationChanged'),
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'WitnessAdded'),
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: CONTRACT_ABI.find(item => item.name === 'VerityRecognized'),
            fromBlock,
            toBlock: 'latest'
          })
        ]);

        // Combine and sort events by block number
        const allEvents = [
          ...identityEvents.map(e => ({ ...e, type: 'identity' })),
          ...transformEvents.map(e => ({ ...e, type: 'transform' })),
          ...challengeEvents.map(e => ({ ...e, type: 'challenge' })),
          ...challengeResolvedEvents.map(e => ({ ...e, type: 'resolved' })),
          ...reputationEvents.map(e => ({ ...e, type: 'reputation' })),
          ...witnessEvents.map(e => ({ ...e, type: 'witness' })),
          ...recognitionEvents.map(e => ({ ...e, type: 'recognition' }))
        ].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 15000); // Refresh every 15s

    return () => clearInterval(interval);
  }, [mounted, publicClient]);

  if (!mounted) return null;

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'identities') return event.type === 'identity';
    if (filter === 'challenges') return event.type === 'challenge' || event.type === 'resolved';
    if (filter === 'reputation') return event.type === 'reputation' || event.type === 'transform';
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-white/60 hover:text-white transition text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Social Feed</h1>
          <p className="text-xl text-white/70">
            Live activity stream of all on-chain events
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'identities', 'challenges', 'reputation'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-mono transition ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border border-white/20 hover:border-white/40'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Events Feed */}
        {loading ? (
          <div className="text-center py-12 text-white/40">
            Loading events...
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <EventCard key={`${event.blockNumber}-${index}`} event={event} userAddress={address} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/40">
            No events yet. Be the first to create an identity!
          </div>
        )}

        {!loading && filteredEvents.length > 20 && (
          <div className="text-center mt-8 text-white/40 text-sm">
            Showing last {filteredEvents.length} events
          </div>
        )}
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event, userAddress }) {
  const getEventIcon = (type) => {
    switch(type) {
      case 'identity': return '🎭';
      case 'transform': return '⚡';
      case 'challenge': return '⚔️';
      case 'resolved': return '⚖️';
      case 'reputation': return '⭐';
      case 'witness': return '👁️';
      case 'recognition': return '🤝';
      default: return '📡';
    }
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'identity': return 'border-blue-500/30';
      case 'transform': return 'border-red-500/30';
      case 'challenge': return 'border-yellow-500/30';
      case 'resolved': return 'border-green-500/30';
      case 'reputation': return 'border-purple-500/30';
      case 'witness': return 'border-cyan-500/30';
      case 'recognition': return 'border-pink-500/30';
      default: return 'border-white/10';
    }
  };

  const renderEventContent = () => {
    const args = event.args || {};

    switch(event.type) {
      case 'identity':
        return (
          <div>
            <div className="font-mono text-sm mb-2">
              <span className="text-blue-400">
                {args.minter?.slice(0, 6)}...{args.minter?.slice(-4)}
              </span>
              <span className="text-white/60 mx-2">created identity</span>
              <span className="text-white">#{args.tokenId?.toString()}</span>
            </div>
            <div className="text-xs text-white/40">
              State: {args.initialState === 0 ? 'Affirmed' : 'Denied'}
            </div>
          </div>
        );

      case 'transform':
        return (
          <div>
            <div className="font-mono text-sm mb-2">
              <span className="text-red-400">
                {args.owner?.slice(0, 6)}...{args.owner?.slice(-4)}
              </span>
              <span className="text-white/60 mx-2">was contradicted</span>
            </div>
            {args.reason && (
              <div className="text-xs text-white/60 italic">"{args.reason}"</div>
            )}
          </div>
        );

      case 'challenge':
        return (
          <div>
            <div className="font-mono text-sm mb-2">
              <span className="text-yellow-400">
                {args.challenger?.slice(0, 6)}...{args.challenger?.slice(-4)}
              </span>
              <span className="text-white/60 mx-2">challenged</span>
              <span className="text-blue-400">
                {args.challenged?.slice(0, 6)}...{args.challenged?.slice(-4)}
              </span>
            </div>
            {args.reason && (
              <div className="text-xs text-white/60 italic mb-1">"{args.reason}"</div>
            )}
            <div className="text-xs text-yellow-400">
              Stake: {args.stake ? (Number(args.stake) / 1e18).toFixed(4) : '0'} ETH
            </div>
          </div>
        );

      case 'resolved':
        const successful = args.challengeSuccessful;
        return (
          <div>
            <div className="font-mono text-sm mb-2">
              <span className={successful ? 'text-green-400' : 'text-red-400'}>
                Challenge #{args.challengeId?.toString()} resolved
              </span>
            </div>
            <div className="text-xs text-white/60">
              Winner: {args.winner?.slice(0, 6)}...{args.winner?.slice(-4)}
            </div>
            <div className="text-xs text-green-400">
              Payout: {args.payout ? (Number(args.payout) / 1e18).toFixed(4) : '0'} ETH
            </div>
          </div>
        );

      case 'reputation':
        const change = Number(args.newScore) - Number(args.oldScore);
        return (
          <div>
            <div className="font-mono text-sm mb-2">
              <span className="text-purple-400">
                {args.user?.slice(0, 6)}...{args.user?.slice(-4)}
              </span>
              <span className="text-white/60 mx-2">reputation</span>
              <span className={change > 0 ? 'text-green-400' : 'text-red-400'}>
                {change > 0 ? '+' : ''}{change}
              </span>
            </div>
            {args.reason && (
              <div className="text-xs text-white/60 italic">"{args.reason}"</div>
            )}
          </div>
        );

      case 'witness':
        return (
          <div>
            <div className="font-mono text-sm mb-2">
              <span className="text-cyan-400">
                {args.witness?.slice(0, 6)}...{args.witness?.slice(-4)}
              </span>
              <span className="text-white/60 mx-2">witnessed for</span>
              <span className="text-blue-400">
                {args.subject?.slice(0, 6)}...{args.subject?.slice(-4)}
              </span>
            </div>
          </div>
        );

      case 'recognition':
        return (
          <div>
            <div className="font-mono text-sm mb-2">
              <span className="text-pink-400">
                {args.recognizer?.slice(0, 6)}...{args.recognizer?.slice(-4)}
              </span>
              <span className="text-white/60 mx-2">recognized</span>
              <span className="text-blue-400">
                {args.recognized?.slice(0, 6)}...{args.recognized?.slice(-4)}
              </span>
            </div>
          </div>
        );

      default:
        return <div className="text-xs text-white/40">Unknown event type</div>;
    }
  };

  const isUserInvolved = () => {
    if (!userAddress) return false;
    const args = event.args || {};
    const userLower = userAddress.toLowerCase();

    return Object.values(args).some(
      arg => typeof arg === 'string' && arg.toLowerCase() === userLower
    );
  };

  return (
    <div className={`border ${getEventColor(event.type)} p-4 hover:border-opacity-60 transition ${
      isUserInvolved() ? 'bg-white/5' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getEventIcon(event.type)}</div>
        <div className="flex-1">
          {renderEventContent()}
          <div className="text-xs text-white/30 mt-2">
            Block {event.blockNumber?.toString()}
            {isUserInvolved() && (
              <span className="ml-2 bg-white/10 px-2 py-0.5 rounded text-white/60">
                YOU
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
