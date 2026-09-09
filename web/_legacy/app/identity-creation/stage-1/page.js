'use client';

import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import WalletConnect from '../../components/WalletConnect';

const FaceCanvas = dynamic(() => import('../../components/FaceCanvas'), { ssr: false });

function Stage1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'valid';
  const canvasRef = useRef(null);
  const [parameters, setParameters] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleParametersChange = useCallback((params) => {
    setParameters(params);
  }, []);

  const handleLockIn = useCallback(() => {
    if (!parameters) return;
    // Store parameters and canvas data in sessionStorage for Stage 2
    sessionStorage.setItem('areyouverity_params', JSON.stringify(parameters));
    sessionStorage.setItem('areyouverity_type', type);

    // Capture canvas as data URL
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        sessionStorage.setItem('areyouverity_image', dataUrl);
      } catch (e) {
        console.error('Failed to capture canvas:', e);
      }
    }

    router.push('/identity-creation/stage-2');
  }, [parameters, type, router]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const isInvalid = type === 'invalid' || type === 'invalid-duplicate';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-6 right-6 z-50">
        <WalletConnect />
      </div>
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="text-white/30 font-mono text-xs tracking-widest hover:text-white/60 transition">
          BACK
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 fade-in">
          <p className="text-white/30 font-mono text-xs tracking-widest uppercase">
            Stage 1 of 2 &middot; Identity Creation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-mono">
            Generate Your ID
          </h1>
          {isInvalid ? (
            <p className="text-white/50 font-mono text-sm max-w-lg mx-auto">
              You are creating a NOT-VERITY identity token. Transform the portrait
              below. This image will serve as your proof of non-identity.
            </p>
          ) : (
            <p className="text-white/50 font-mono text-sm max-w-lg mx-auto">
              Transform the portrait below to create your identity commitment.
              Each adjustment becomes part of your private witness data.
            </p>
          )}
        </div>

        {/* Canvas */}
        <div className="fade-in-delay">
          <FaceCanvas ref={canvasRef} onParametersChange={handleParametersChange} />
        </div>

        {/* Lock in button */}
        <div className="text-center space-y-4 fade-in-delay-2">
          <button
            onClick={handleLockIn}
            disabled={!parameters}
            className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            LOCK IN THIS FACE
          </button>
          <p className="text-white/20 font-mono text-xs">
            Your parameter values will be saved as your private witness data.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Stage1Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Stage1Content />
    </Suspense>
  );
}
