'use client';

import { useEffect, useRef, useState } from 'react';
import { PARAM_KEYS } from '@/lib/commitment';
import { mountHydraSketch, IDLE_PRESET } from '@/lib/hydraSketch';

/**
 * The artwork, ambient and reactive — no sliders. Mounted on the landing
 * page above the question. Its parameters ease toward `target` (idle,
 * Verity, or Nonverity) as the visitor answers, with a gentle idle wander so
 * it never sits fully still, plus a brief `pulse` on proof verification
 * or rejection. Manual control lives only at /create, once an identity
 * is actually being composed.
 */

const LERP_RATE = 0.035; // per frame — eases into a new target over ~1.5-2s
const REDUCED_LERP_RATE = 0.4; // near-instant, for prefers-reduced-motion

// only a few "alive" parameters wander at idle — the rest hold still so
// the piece reads as composed, not agitated
const WANDER = {
  feedback: 3,
  warping: 0.7,
  lavender: 0.2,
  hardLighting: 0.2,
  idealProportions: 0,
};

// which parameters spike on a pulse (verifying / rejected), and by how much
const PULSE_WEIGHT = {
  warping: 2,
  feedback: 2,
  blending: 0,
  hardLighting: 0,
  boneExtraction: 0.25,
};

function phase(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 997;
  return (h / 997) * Math.PI * 2;
}

export default function HydraStage({ target, pulse, className = '' }) {
  const canvasRef = useRef(null);
  const paramsRef = useRef({ ...IDLE_PRESET });
  const targetRef = useRef(target || IDLE_PRESET);
  const pulseAmountRef = useRef(0);
  const lastPulseId = useRef(null);
  const reduceMotionRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    targetRef.current = target || IDLE_PRESET;
  }, [target]);

  useEffect(() => {
    if (!pulse || pulse.id === lastPulseId.current) return;
    lastPulseId.current = pulse.id;
    pulseAmountRef.current = pulse.strength ?? 1;
  }, [pulse]);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let hydra = null;
    let raf = null;
    let t0 = null;

    (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        hydra = await mountHydraSketch({ canvas, paramsRef, width: 640, height: 640 });
        if (cancelled) {
          hydra?.hush?.();
          return;
        }
        setReady(true);

        const tick = (now) => {
          if (cancelled) return;
          if (t0 === null) t0 = now;
          const time = (now - t0) / 1000;
          const reduce = reduceMotionRef.current;
          const tgt = targetRef.current;

          pulseAmountRef.current *= 0.92; // decays each frame
          const pulseAmt = pulseAmountRef.current;

          for (const key of PARAM_KEYS) {
            const base = tgt[key] ?? 0;
            const wander = reduce ? 0 : (WANDER[key] || 0) * Math.sin(time * 0.35 + phase(key));
            const spike = pulseAmt > 0.01 ? pulseAmt * (PULSE_WEIGHT[key] || 0) : 0;
            const effective = Math.max(0, base + wander + spike);
            const current = paramsRef.current[key] ?? 0;
            const rate = reduce ? REDUCED_LERP_RATE : LERP_RATE;
            paramsRef.current[key] = current + (effective - current) * rate;
          }

          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        console.error('HydraStage init failed; falling back to static preview.', e);
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      try {
        hydra?.hush?.();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`face-canvas ${className}`}
      style={{ width: 'min(100%, 420px)', margin: '0 auto', aspectRatio: '1 / 1', position: 'relative' }}
    >
      {!error ? (
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          role="img"
          aria-label="A generative portrait that shifts as you answer"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/artwork/base3.png"
          alt="A generative portrait that shifts as you answer"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
      {!ready && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: 'var(--ink-40)', fontSize: '0.75rem', letterSpacing: '0.14em' }}
        >
          <span className="cursor-blink">···</span>
        </div>
      )}
    </div>
  );
}
