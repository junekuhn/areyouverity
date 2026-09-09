'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import IDCard from '../components/IDCard';
import { useIdentity } from '@/hooks/useIdentity';
import { isParadox } from '@/lib/identity';

const GREETINGS = {
  verity: { title: 'Hi, Verity.', sub: 'Your identity is valid.' },
  nonverity: {
    title: 'Hi, Nonverity.',
    sub: 'Your identity is valid.',
  },
};

function CollectionContent() {
  const searchParams = useSearchParams();
  const { tokens, ready } = useIdentity();

  // A personalised greeting only makes sense when a document exists to
  // greet — an empty registry gets the neutral title regardless of URL.
  const greeting =
    (tokens.length > 0 && GREETINGS[searchParams.get('hi')]) || {
      title: 'The Collection.',
      sub: 'Your collection of ID documents currently in your wallet.',
    };

  return (
    <div className="page page-wide">
      <div className="space-y-12">
        <div className="space-y-3 rise">
          <p className="kicker">Collection</p>
          <h1 className="question-lg glitch-hover">{greeting.title}</h1>
          <p className="prose-dim max-w-lg">{greeting.sub}</p>
          {isParadox(tokens) && (
            <p
              className="prose-dim max-w-lg text-[0.8rem]"
              style={{ color: 'var(--questioning)' }}
            >
              You hold a valid Verity and a valid Nonverity at once. Your secret is safe here.
            </p>
          )}
        </div>

        {ready && tokens.length === 0 ? (
          <div className="panel max-w-md rise d1 space-y-4">
            <p className="prose-dim">
              No identity documents exist in this registry yet. Everything
              begins with the question.
            </p>
            <Link href="/" className="btn btn-solid">
              Are you Verity?
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8 rise d1">
            {tokens.map((t) => (
              <div key={t.id} className="space-y-3">
                <IDCard token={t} />
                <div className="flex items-center justify-between">
                  <span
                    className={`chip ${
                      t.status === 'VALID'
                        ? 'valid'
                        : t.status === 'QUESTIONING'
                          ? 'questioning'
                          : 'void'
                    }`}
                  >
                    {t.status}
                  </span>
                  {t.status === 'VOID' && (
                    <span className="flex gap-4 items-center">
                      <Link
                        href={`/agreement?as=${
                          t.kind === 'NOTVERITY' ? 'nonverity' : 'verity'
                        }&renew=${encodeURIComponent(t.id)}`}
                        className="btn-quiet"
                      >
                        renew
                      </Link>
                      <Link
                        href={`/burn?id=${encodeURIComponent(t.id)}`}
                        className="btn-quiet"
                        style={{ color: 'var(--void)' }}
                      >
                        burn
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tokens.length > 0 && (
          <div className="flex flex-wrap gap-4 rise d2">
            <Link href="/agreement" className="btn">
              Create another ID
            </Link>
            <Link href="/" className="btn-quiet self-center">
              back to the question
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <CollectionContent />
    </Suspense>
  );
}
