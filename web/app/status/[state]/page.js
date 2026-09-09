'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import IDCard from '../../components/IDCard';
import { useIdentity } from '@/hooks/useIdentity';
import { recallVerifiedToken } from '@/lib/identity';

const KNOWN_STATES = {
  questioning: 'QUESTIONING',
  invalid: 'VOID',
  void: 'VOID',
};

function StatusContent({ state }) {
  const searchParams = useSearchParams();
  const { tokens } = useIdentity();

  const verifiedId =
    typeof window !== 'undefined' ? recallVerifiedToken() : null;
  // Only show a document whose actual status matches the page's claim —
  // a stale session token must never illustrate a state it isn't in.
  const candidate = tokens.find((t) => t.id === verifiedId) || null;
  const token =
    candidate && candidate.status === KNOWN_STATES[state] ? candidate : null;

  // The registry has no such status.
  if (!KNOWN_STATES[state]) {
    return (
      <div className="page">
        <div className="space-y-6 rise">
          <p className="kicker">Status · Unknown</p>
          <h1 className="question-lg">This is not a state the registry recognises.</h1>
          <p className="prose-dim max-w-md">
            Identity documents here are valid, questioning, or void. Nothing
            else has been defined — yet.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="btn btn-solid">
              Back to the question
            </Link>
            <Link href="/collection" className="btn">
              View collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let view;

  if (state === 'questioning') {
    view = {
      accent: 'var(--questioning)',
      kicker: 'Status · Questioning',
      title: 'You seem to be questioning your identity.',
      body: (
        <>
          <p>
            This page appears when you hold a valid ID and declare the opposite of what it says.  Your identity has been labelled 
            <strong style={{ color: 'var(--questioning)' }}>QUESTIONING</strong>
            . Don&rsquo;t worry, a status of questioning still counts as valid.
          </p>
          <p>
            If you are sure you would like to change your identity, follow the same steps that brought you here: return to the question, submit your proof, and contradict your answer once more. Your ID will then be VOIDED, and you may create a new one.
          </p>
          <p>
            Answering consistently with the proof you have reads keeps the document valid to hold, but the status of questioning remains.
          </p>
        </>
      ),
      actions: (
        <>
          <Link href="/" className="btn btn-solid">
            Back to the question
          </Link>
          <Link href="/collection" className="btn">
            View collection
          </Link>
          <Link href="/about" className="btn-quiet self-center">
            learn more about zk-proofs
          </Link>
        </>
      ),
    };
  } else if (state === 'invalid') {
    view = {
      accent: 'var(--void)',
      kicker: 'Status · VOID',
      title: 'This ID is void. Please create a new document.',
      body: (
        <>
          <p>
            You questioned your identity again, so your identity as{' '}
            {token?.kind === 'NOTVERITY' ? 'Nonverity' : 'Verity'} has been revoked
            and the document is now{' '}
            <strong style={{ color: 'var(--void)' }}>VOID</strong>.
          </p>
          <p>You are one step closer to your new identity.</p>
          <p>
            It&rsquo;s ok to have changed your mind. You can go back to the way things were, it is a speculative identity journey, after all. The void document remains in your collection as a legitimate and meaningful state of being.
          </p>
        </>
      ),
      actions: (
        <>
          <Link
            href={`/agreement?as=${token?.kind === 'NOTVERITY' ? 'nonverity' : 'verity'}${
              token ? `&renew=${encodeURIComponent(token.id)}` : ''
            }`}
            className="btn btn-solid"
          >
            Create a new identity
          </Link>
          <Link href="/collection" className="btn">
            View collection
          </Link>
          <Link href="/" className="btn-quiet self-center">
            back to THE QUESTION
          </Link>
        </>
      ),
    };
  } else {
    // void
    const claimsVerity = searchParams.get('claim') !== 'nonverity';
    const unknown = searchParams.get('unknown') === '1';
    view = {
      accent: 'var(--void)',
      kicker: 'Status · Void',
      title: claimsVerity
        ? 'Your ID is void, Verity.'
        : 'Ok — you’re not Verity.',
      body: (
        <>
          {unknown ? (
            <p>
            Your proof verifies, but its commitment is unknown to this registry. A proof without an ID document means your Verityness is unrealised: <strong style={{ color: 'var(--void)' }}>VOID</strong>.
            </p>
          ) : (
            <p>
              The document you proved has been voided after a successful questioning of your identity.
            </p>
          )}
          {claimsVerity ? (
            <p>
              Ready for a new ID? Renewing this one creates a new valid
              identity in its place. Sign the Agreement again and undergo the
              process of Inception.
            </p>
          ) : (
            <p>
              Would you like to sign for it? Not being Verity is also an
              identity thorugh a valid Nonverity document, the nonidentification ID. A disavowal, if you will. 
            </p>
          )}
        </>
      ),
      actions: (
        <>
          <Link
            href={`/agreement?as=${claimsVerity ? 'verity' : 'nonverity'}${
              token ? `&renew=${encodeURIComponent(token.id)}` : ''
            }`}
            className="btn btn-solid"
          >
            {claimsVerity ? 'Sign for a new Verity ID' : 'Sign as Nonverity'}
          </Link>
          <Link href="/collection" className="btn">
            View collection
          </Link>
          <Link href="/" className="btn-quiet self-center">
            back to THE QUESTION
          </Link>
        </>
      ),
    };
  }

  return (
    <div className="page page-wide">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-3 rise">
            <p className="kicker" style={{ color: view.accent }}>
              {view.kicker}
            </p>
            <h1 className="question-lg">{view.title}</h1>
          </div>
          <div className="prose-dim space-y-3 rise d1">{view.body}</div>
          <div className="flex flex-wrap gap-4 rise d2">{view.actions}</div>
        </div>

        {token && (
          <div className="rise d2 max-w-xl w-full mx-auto lg:mx-0">
            <IDCard token={token} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatusPage({ params }) {
  return (
    <Suspense fallback={<div className="page" />}>
      <StatusContent state={params.state} />
    </Suspense>
  );
}
