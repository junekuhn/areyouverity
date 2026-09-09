'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  computeCommitment,
  buildProofFile,
  downloadJSON,
  shortRef,
  PARAM_KEYS,
  PARAM_LABELS,
} from '@/lib/commitment';

function ProofContent() {
  const searchParams = useSearchParams();
  const fileRef = useRef(null);
  const isFresh = searchParams.get('fresh') === '1';

  const [source, setSource] = useState(null); // {tokenId, commitment, kind, params?}
  const [showParams, setShowParams] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Fresh mode: the mint that just happened left its public half in session.
  useEffect(() => {
    if (!isFresh) return;
    try {
      const last = JSON.parse(sessionStorage.getItem('ayj.lastMint') || 'null');
      if (last) setSource(last);
    } catch {
      /* fall through to upload mode */
    }
  }, [isFresh]);

  const handleParamsFile = async (file) => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const json = JSON.parse(await file.text());
      if (json?.type !== 'areyouverity-private-parameters') {
        setError('This is not a private parameters file.');
        return;
      }
      const commitment = await computeCommitment(json.parameters, json.salt);
      if (commitment.toLowerCase() !== String(json.commitment).toLowerCase()) {
        setError('These parameters do not reproduce their commitment. The file may be altered.');
        return;
      }
      setSource({
        tokenId: json.tokenId,
        commitment,
        kind: json.kind,
        params: json.parameters,
      });
    } catch {
      setError('The file could not be read.');
    } finally {
      setBusy(false);
    }
  };

  const generate = async () => {
    if (!source || busy) return;
    setBusy(true);
    try {
      const proof = await buildProofFile(source);
      downloadJSON(proof, `${shortRef(source.commitment)}-proof.json`);
      setGenerated(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="space-y-10">
        <div className="space-y-3 rise">
          <p className="kicker">
            {isFresh && source
              ? 'Identity Inception · Step 4 of 4'
              : 'Proof regeneration'}
          </p>
          <h1 className="question-lg">Zero-Knowledge Proof</h1>
        </div>

        <div className="prose-dim space-y-3 rise d1">
          {isFresh && source ? (
            <p>
              Now that you&rsquo;ve created, minted and signed your Verityness,
              you may proceed to generating the proof, based on the parameters
              selected on the earlier page.
            </p>
          ) : (
            <p>
              If you have lost your proof, you may generate a new one from parameter values used in creating your ID (slider values and timestamp).  Do not share these with anyone. 
            </p>
          )}
          <p>
            This website <strong style={{ color: 'var(--ink)' }}>does not store the parameters.</strong>{' '}
            Store them in a safe and secure location, like you would a main
            password or a crypto wallet recovery code.
          </p>
          <p>
            The proof takes the form of a Groth16 proof of three coordinate pairs bound to your commitment in the NFT smart contract.
          </p>
          <p>
            Remember, as per{' '}
            {/* <Link href="/agreement" className="underline underline-offset-4"> */}
              the Agreement
            {/* </Link> */}
            : even if you sell the token (NFT) associated with your ID, you can still prove your Verityness on this site. The buyer of your token will have to go through the same process and sign the Agreement to prove whether or not they&rsquo;re Verity, as you did.
          </p>
        </div>

        {/* source of the proof */}
        {!source ? (
          <div className="space-y-4 rise d2">
            <div
              className={`dropzone ${dragging ? 'drag' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleParamsFile(e.dataTransfer.files?.[0]);
              }}
            >
              {busy ? (
                <span className="cursor-blink">READING PARAMETERS</span>
              ) : (
                <>
                  DROP YOUR PRIVATE PARAMETERS FILE HERE
                  <br />
                  <span className="text-[0.65rem] opacity-60 tracking-widest">
                    ····-PRIVATE-PARAMETERS.json
                  </span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => handleParamsFile(e.target.files?.[0])}
              />
            </div>
            {error && (
              <p className="text-[0.72rem] tracking-wider" style={{ color: 'var(--void)' }}>
                REJECTED — {error}
              </p>
            )}
            <p className="text-[0.72rem] tracking-wider" style={{ color: 'var(--ink-25)' }}>
              NO PARAMETERS FILE? START WITH{' '}
              <Link href="/" className="underline underline-offset-4">
                THE QUESTION
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-6 rise d2">
            <div className="panel">
              <p className="panel-title">Proof source</p>
              <div className="datarow">
                <span className="k">Domain</span>
                <span className="v">{source.kind}</span>
              </div>
              <div className="datarow">
                <span className="k">Commitment</span>
                <span className="v">{source.commitment}</span>
              </div>
              {showParams &&
                source.params &&
                PARAM_KEYS.map((k) => (
                  <div className="datarow" key={k}>
                    <span className="k">{PARAM_LABELS[k] || k}</span>
                    <span className="v">{source.params[k]}</span>
                  </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-4">
              {source.params && (
                <button className="btn" onClick={() => setShowParams((s) => !s)}>
                  {showParams ? 'Hide parameters' : 'View parameters'}
                </button>
              )}
              <button className="btn btn-solid" onClick={generate} disabled={busy}>
                {busy ? (
                  <span className="cursor-blink">Deriving curve points</span>
                ) : (
                  'Generate & download proof'
                )}
              </button>
            </div>

            {generated && (
              <div className="panel space-y-4" style={{ borderColor: 'rgba(15,122,61,0.35)' }}>
                <p className="text-[0.75rem] tracking-[0.14em]" style={{ color: 'var(--valid)' }}>
                  PROOF DOWNLOADED. YOU MAY NOW ANSWER THE QUESTION.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/" className="btn btn-solid">
                    Return to the question
                  </Link>
                  <Link href="/collection" className="btn">
                    View collection
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rise d3">
          <Link href="/about" className="btn-quiet">
            what is a zk-proof?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProofPage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <ProofContent />
    </Suspense>
  );
}
