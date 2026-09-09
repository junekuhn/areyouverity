'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  decide,
  applyEffect,
  findByCommitment,
  rememberAnswer,
  rememberVerifiedToken,
  clearVerifiedToken,
} from '@/lib/identity';
import { verifyUploadedFile } from '@/lib/commitment';
import { IDLE_PRESET, VERITY_PRESET, NOTVERITY_PRESET } from '@/lib/hydraSketch';

const HydraStage = dynamic(() => import('./components/HydraStage'), {
  ssr: false,
});

const REJECTIONS = {
  MALFORMED_PROOF: 'This proof file is missing its public signals.',
  INVALID_PROOF: 'The curve points do not verify against the commitment.',
  PARAMETER_MISMATCH: 'These parameters do not reproduce their commitment.',
  UNRECOGNISED_FILE: 'This is not a proof or parameters file.',
  VERIFICATION_ERROR: 'The file could not be read.',
};

export default function LandingPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [answer, setAnswer] = useState(null); // null | true | false
  const [wantsUpload, setWantsUpload] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rejection, setRejection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [pulse, setPulse] = useState(null);
  const pulseId = useRef(0);

  // The art's target state — it eases toward this as the visitor answers.
  const target = answer === null ? IDLE_PRESET : answer ? VERITY_PRESET : NOTVERITY_PRESET;

  const firePulse = useCallback((strength = 1) => {
    pulseId.current += 1;
    setPulse({ id: pulseId.current, strength });
  }, []);

  const chooseAnswer = (claimsVerity) => {
    rememberAnswer(claimsVerity);
    setAnswer(claimsVerity);
    setRejection(null);
    setWantsUpload(false);
  };

  const proceedWithoutProof = () => {
    const { route } = decide(answer, null);
    router.push(route);
  };

  const handleFile = useCallback(
    async (file) => {
      if (!file || verifying || answer === null) return;
      setVerifying(true);
      firePulse(0.8); // a brief flicker while the proof is read
      setRejection(null);
      try {
        const json = JSON.parse(await file.text());
        const result = await verifyUploadedFile(json);
        if (!result.ok) {
          setRejection(REJECTIONS[result.reason] || REJECTIONS.VERIFICATION_ERROR);
          firePulse(1.5); // a sharper jolt on rejection
          return;
        }
        const token = findByCommitment(result.commitment);
        if (token) {
          rememberVerifiedToken(token.id);
        } else {
          // A stale session token must not haunt the void page.
          clearVerifiedToken();
        }
        const { route, effect } = decide(answer, token, true);
        applyEffect(effect);
        router.push(route);
      } catch {
        setRejection(REJECTIONS.VERIFICATION_ERROR);
        firePulse(1.5);
      } finally {
        setVerifying(false);
      }
    },
    [answer, router, verifying, firePulse]
  );

  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-10 pb-16 text-center gap-12">
      <HydraStage target={target} pulse={pulse} className="rise" />

      {answer === null ? (
        /* ---------------- step one: the question ---------------- */
        <div className="w-full max-w-3xl space-y-14">
          <div className="space-y-6">
            <h1 className="question-xl glitch-now rise d1">
              Are You
              <br />
              Verity?
            </h1>
            <div className="space-y-3"></div>
          </div>



          <p className="kicker rise space-y-3">
              An ID system powered by computational art and zero-knowledge proofs
            </p>

          <div className="flex flex-wrap gap-4 justify-center rise d2">
            <button className="choice" onClick={() => chooseAnswer(true)}>
              Yes
            </button>
            <button className="choice" onClick={() => chooseAnswer(false)}>
              No
            </button>
          </div>

          <div className="rise d3">
            <Link href="/about" className="btn-quiet">
              what is this?
            </Link>
          </div>
        </div>
      ) : (
        /* ---------------- step two: the proof ---------------- */
        <div className="w-full max-w-2xl space-y-12">
          <div className="space-y-5">
            <p className="kicker rise">
              You said: I am {answer ? 'Verity' : 'not Verity'}
            </p>
            <h1 className="question-lg rise d1">Do you have proof?</h1>
            <p className="prose-dim max-w-md mx-auto rise d2">
              A Groth16 proof verifies whether you&rsquo;re Verity without revealing any other information
            </p>
          </div>

          {!wantsUpload ? (
            <div className="flex flex-wrap gap-4 justify-center rise d2">
              <button className="btn btn-lg" onClick={() => setWantsUpload(true)}>
                Yes — submit proof
              </button>
              <button className="btn btn-lg" onClick={proceedWithoutProof}>
                No
              </button>
              <Link href="/proof" className="btn btn-lg">
                I need to re-generate it
              </Link>
            </div>
          ) : (
            <div className="space-y-4 rise">
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
                  handleFile(e.dataTransfer.files?.[0]);
                }}
              >
                {verifying ? (
                  <span className="cursor-blink">VERIFYING PROOF</span>
                ) : (
                  <>
                    DROP YOUR PROOF FILE HERE
                    <br />
                    <span className="text-[0.65rem] opacity-60 tracking-widest">
                      .json proof file 
                    </span>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              {rejection && (
                <p className="text-[0.72rem] tracking-wider" style={{ color: 'var(--void)' }}>
                  PROOF REJECTED — {rejection}
                </p>
              )}

              <div className="flex gap-6 justify-center">
                <button
                  className="btn-quiet"
                  disabled={verifying}
                  onClick={() => setWantsUpload(false)}
                >
                  back
                </button>
                {/* <button
                  className="btn-quiet"
                  disabled={verifying}
                  onClick={proceedWithoutProof}
                >
                  continue without proof
                </button> */}
              </div>
            </div>
          )}

          <div className="rise d3">
            <button
              className="btn-quiet"
              disabled={verifying}
              onClick={() => setAnswer(null)}
            >
              change my answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
