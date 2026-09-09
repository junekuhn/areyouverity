'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { VERITY_MIN, VERITY_PRESET, NOT_PARAM_RANGES, NOTVERITY_MIN, NOTVERITY_PRESET, PARAM_RANGES } from '@/lib/hydraSketch';

const HydraCanvas = dynamic(() => import('../components/HydraCanvas'), {
  ssr: false,
});

function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [params, setParams] = useState(null);
  const [signedAs, setSignedAs] = useState(null);

  const renew = searchParams.get('renew') || null;
  const asParam = searchParams.get('as');
  const asNotVerity = asParam
    ? asParam === 'nonverity'
    : typeof window !== 'undefined' &&
      sessionStorage.getItem('ayj.signedAs') === 'nonverity';

  // Creation requires an executed Agreement.
  useEffect(() => {
    const signed = sessionStorage.getItem('ayj.signedAs');
    if (!signed) {
      // Preserve the renew target across the detour so a mid-renew refresh
      // still replaces rather than accumulates.
      router.replace(
        `/agreement?as=${asNotVerity ? 'nonverity' : 'verity'}${
          renew ? `&renew=${encodeURIComponent(renew)}` : ''
        }`
      );
    } else {
      setSignedAs(signed);
    }
  }, [router, asNotVerity, renew]);

  const handleParametersChange = useCallback((p) => setParams(p), []);

  const lockIn = useCallback(() => {
    if (!params) return;
    let image = null;
    // next/dynamic does not forward refs — reach the canvas via the DOM.
    const canvas = document.querySelector('.face-canvas canvas');
    if (canvas) {
      try {
        // Composite onto paper so the ID photo reads like a printed
        // document photo.
        const out = document.createElement('canvas');
        out.width = 288;
        out.height = 360;
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#eae5d9';
        ctx.fillRect(0, 0, out.width, out.height);
        // cover-crop the square render into the portrait frame
        const size = Math.min(canvas.width, canvas.height);
        const sx = (canvas.width - size) / 2;
        const sy = (canvas.height - size) / 2;
        ctx.drawImage(canvas, sx, sy, size, size, 0, 0, out.width, out.height);
        image = out.toDataURL('image/jpeg', 0.82);
      } catch (e) {
        console.error('Failed to capture canvas:', e);
      }
    }
    sessionStorage.setItem(
      'ayj.pending',
      JSON.stringify({
        params,
        image,
        kind: signedAs === 'nonverity' ? 'NOTVERITY' : 'VERITY',
        replaces: renew,
      })
    );
    router.push('/mint');
  }, [params, signedAs, router, renew]);

  if (!signedAs) return <div className="page" />;

  const isNotVerity = signedAs === 'nonverity';

  return (
    <div className="page page-wide">
      <div className="grid lg:grid-cols-[1fr_20rem] gap-12 items-center">
        {/* canvas column */}
        <div className="space-y-8 rise">
          <div className="space-y-5">
            <p className="kicker">Identity Inception · Step 2 of 4</p>
            <h1 className="question-lg glitch-hover">
              {isNotVerity ? 'Compose your non-identity.' : 'Compose your Verityness.'}
            </h1>
          </div>
          <HydraCanvas
            onParametersChange={handleParametersChange}
            initialParams={isNotVerity ? NOTVERITY_PRESET : VERITY_PRESET}
            param_range={isNotVerity ? NOT_PARAM_RANGES : PARAM_RANGES}
            mins={isNotVerity ? NOTVERITY_MIN : VERITY_MIN }
          />
        </div>


        <aside className="space-y-6 rise d2 lg:sticky lg:top-8">
          {/* <div className="panel">
            <p className="panel-title">Main points</p>
            <div className="prose-dim space-y-3 text-[0.78rem]">
              <p>
                You claim to be {isNotVerity ? 'Nonverity' : 'Verity'}, but you do
                not yet own a valid {isNotVerity ? 'Nonverity' : 'Verity'} identity
                token.
              </p>
              <p>
                To verify this, you must commit to creating a token. This
                process is a matter of transformation — creating an image that
                will be used to verify later on.
              </p>
              <p>
                Your identity will be validated through zero-knowledge proofs,
                proving commitment without disclosure.
              </p>
            </div>
          </div>

          <div className="panel">
            <p className="panel-title">The process</p>
            <ol className="prose-dim space-y-2 text-[0.78rem] list-decimal list-inside">
              <li>Adjust the sliders to customise your appearance</li>
              <li>Create your identity commitment</li>
              <li>Mint your {isNotVerity ? 'Nonverity' : 'Verity'} token</li>
              <li>Commit to being {isNotVerity ? 'Nonverity' : 'Verity'}</li>
            </ol>
          </div> */}

        </aside>
                  <button
            className="btn btn-solid btn-lg w-full"
            disabled={!params}
            onClick={lockIn}
          >
            COMMIT TO THIS LIKENESS
          </button>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <CreateContent />
    </Suspense>
  );
}
