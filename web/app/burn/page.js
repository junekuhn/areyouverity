'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import IDCard from '../components/IDCard';
import { useIdentity } from '@/hooks/useIdentity';
import { burnToken } from '@/lib/identity';

const EMBERS = [
  { left: '18%', drift: '-24px', delay: '0s' },
  { left: '32%', drift: '16px', delay: '0.3s' },
  { left: '47%', drift: '-10px', delay: '0.1s' },
  { left: '61%', drift: '22px', delay: '0.5s' },
  { left: '74%', drift: '-18px', delay: '0.25s' },
  { left: '86%', drift: '8px', delay: '0.6s' },
];

function BurnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tokens, ready } = useIdentity();
  const id = searchParams.get('id');
  const [phase, setPhase] = useState('idle'); // idle | burning | gone

  const token = useMemo(
    () => tokens.find((t) => t.id === id) || null,
    [tokens, id]
  );

  const burnable = token && token.status === 'VOID';

  const light = () => {
    if (!burnable || phase !== 'idle') return;
    setPhase('burning');
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const wait = reduce ? 300 : 3400;
    window.setTimeout(() => {
      burnToken(id);
      setPhase('gone');
    }, wait);
  };

  // once burnt, drift back to the collection
  useEffect(() => {
    if (phase !== 'gone') return;
    const t = window.setTimeout(() => router.push('/collection'), 2200);
    return () => window.clearTimeout(t);
  }, [phase, router]);

  // Wait for the registry before deciding what to show — otherwise the
  // idle "burn this?" heading flashes for a frame on a missing/non-void id.
  if (!ready) return <div className="page" />;

  if (!token) {
    return (
      <div className="page">
        <div className="space-y-6 rise">
          <p className="kicker">The Pyre</p>
          <h1 className="question-lg">There is nothing here to burn.</h1>
          <p className="prose-dim max-w-md">
            This document is not in the registry, or has already turned to
            ash.
          </p>
          <Link href="/collection" className="btn btn-solid">
            Back to the collection
          </Link>
        </div>
      </div>
    );
  }

  if (!burnable) {
    return (
      <div className="page">
        <div className="space-y-6 rise">
          <p className="kicker">The Pyre</p>
          <h1 className="question-lg">Only void documents may be burned.</h1>
          <p className="prose-dim max-w-md">
            This identity still holds. The fire is only for what has already
            been let go.
          </p>
          <Link href="/collection" className="btn btn-solid">
            Back to the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="rise max-w-md w-full mx-auto lg:mx-0">
          {phase !== 'gone' ? (
            <div className={`pyre ${phase === 'burning' ? 'lit' : ''}`}>
              {phase === 'burning' &&
                EMBERS.map((e, i) => (
                  <span
                    key={i}
                    className="ember"
                    style={{ left: e.left, '--drift': e.drift, animationDelay: e.delay }}
                  />
                ))}
              {token && <IDCard token={token} />}
            </div>
          ) : (
            <div
              className="text-center prose-dim"
              style={{ padding: '3rem 0', letterSpacing: '0.2em' }}
            >
              ASH.
            </div>
          )}
        </div>

        <div className="space-y-6">
          {phase === 'idle' && (
            <>
              <div className="space-y-3 rise">
                <p className="kicker" style={{ color: 'var(--void)' }}>
                  The Pyre
                </p>
                <h1 className="question-lg">Burn this void identity?</h1>
              </div>
              <p className="prose-dim max-w-md rise d1">
                What is void can be released. Burning removes the document from
                the registry for good — there is no ash to sweep back together.
                A new identity can always be declared from the question.
              </p>
              <div className="flex flex-wrap gap-4 rise d2">
                <button className="btn btn-danger btn-lg" onClick={light}>
                  Light the pyre
                </button>
                <Link href="/collection" className="btn btn-lg">
                  Keep it
                </Link>
              </div>
            </>
          )}
          {phase === 'burning' && (
            <div className="space-y-3 rise">
              <p className="kicker" style={{ color: 'var(--void)' }}>
                The Pyre
              </p>
              <h1 className="question-lg">
                <span className="cursor-blink">Burning</span>
              </h1>
            </div>
          )}
          {phase === 'gone' && (
            <div className="space-y-3 rise">
              <p className="kicker">The Pyre</p>
              <h1 className="question-lg">It is gone.</h1>
              <p className="prose-dim max-w-md">
                Returning you to the collection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BurnPage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <BurnContent />
    </Suspense>
  );
}
