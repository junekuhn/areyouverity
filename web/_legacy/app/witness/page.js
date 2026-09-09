'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WalletConnect from '../components/WalletConnect';

const sections = [
  {
    text: 'This piece is a fundraiser for facial feminisation surgery for Verity, and a challenge to the ways we verify someone is who they say they are.',
  },
  {
    text: 'Trans people are often seen as deceivers because the basis for identity is often determined by a conflation of gender and sex assigned at birth.',
  },
  {
    text: 'This predicament often forces trans people to carry IDs that are both inaccurate and "outs" them to the whims of a legal verification system.',
  },
  {
    text: 'The basis for proving identity should be a matter of trust, not biological determination.',
  },
  {
    text: 'Zero-knowledge proofs are a form of cryptography that uses advanced mathematical algorithms to verify information without requiring the ID holder to reveal vulnerable information.',
  },
  {
    text: 'This affords the ID holder the ability to answer a more basic, simple question than revealing personally identifiable information.',
  },
  {
    text: 'The question "Are you Verity?" is the only relevant question, because that\u2019s the only piece of information that this system is looking for.',
  },
  {
    text: 'This doesn\u2019t mean there aren\u2019t consequences for your actions. The ZK-Proof in this system does not allow for inconsistencies.',
  },
  {
    text: 'Each generated art piece is a valid or invalid proof of identity, whether or not you are Verity.',
  },
  {
    text: 'You can be Verity, until you say that you\u2019re not.',
  },
];

const zkTerms = [
  { term: 'Prover', definition: 'You. The person making a claim about their identity.' },
  { term: 'Verifier', definition: 'The system. The smart contract that validates your claim.' },
  { term: 'Signals', definition: 'Your private parameter values. The data only you possess.' },
  { term: 'Circuit', definition: 'The mathematical rules that define what constitutes a valid proof.' },
  { term: 'Witness', definition: 'The file containing your signals. Your private key to your identity.' },
  { term: 'Constraints', definition: 'The conditions that must be satisfied for a proof to be valid.' },
  { term: 'Public Input', definition: 'Information the verifier can see. Your claim, not your evidence.' },
  { term: 'Public Output', definition: 'The result. Valid or Invalid. Nothing more.' },
  { term: 'Proof', definition: 'The cryptographic attestation. Proof you know something without showing it.' },
];

export default function WitnessPage() {
  const [mounted, setMounted] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Reveal sections one by one
    const interval = setInterval(() => {
      setVisibleSections((prev) => {
        if (prev >= sections.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-6 right-6 z-50">
        <WalletConnect />
      </div>

      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="text-white/30 font-mono text-xs tracking-widest hover:text-white/60 transition"
        >
          BACK
        </Link>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-24 space-y-20">
        {/* Title */}
        <div className="space-y-4 fade-in">
          <p className="text-white/30 font-mono text-xs tracking-widest uppercase">
            About &ldquo;Are You Verity&rdquo; and Zero-Knowledge Proofs
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-mono">
            Witness
          </h1>
        </div>

        {/* Content sections - revealed progressively */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <p
              key={i}
              className={`text-lg leading-relaxed transition-all duration-700 ${
                i < visibleSections
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              } ${
                i === sections.length - 1
                  ? 'text-white font-bold text-xl'
                  : 'text-white/70'
              }`}
            >
              {section.text}
            </p>
          ))}
        </div>

        {/* ZK Terminology */}
        {visibleSections >= sections.length && (
          <div className="space-y-8 fade-in">
            <h2 className="text-2xl font-bold font-mono text-white/90">
              Zero-Knowledge Terminology
            </h2>
            <div className="space-y-4">
              {zkTerms.map((item, i) => (
                <div key={i} className="border-l-2 border-white/10 pl-4 py-2 hover:border-white/40 transition">
                  <dt className="font-mono text-sm text-white/90 font-bold">
                    {item.term}
                  </dt>
                  <dd className="text-white/50 text-sm mt-1">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {visibleSections >= sections.length && (
          <div className="space-y-8 fade-in-delay">
            <div className="border border-white/10 p-6">
              <p className="text-white/30 font-mono text-xs">
                Disclaimer: This is a fictitious thing.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-8">
              <Link href="/" className="btn-secondary">
                BACK
              </Link>
              <Link href="/identity-creation/stage-1?type=invalid" className="btn-primary">
                VALIDATE AS NOT VERITY
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
