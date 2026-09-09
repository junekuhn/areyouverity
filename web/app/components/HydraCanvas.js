'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PARAM_KEYS, PARAM_LABELS } from '@/lib/commitment';
import { mountHydraSketch, VERITY_PRESET, PARAM_RANGES, MIN_VALUES } from '@/lib/hydraSketch';

/**
 * The generative artwork (Hydra), with manual slider controls — used at
 * identity creation. Composes four source layers — base, forechin, eyes,
 * nose — through the eleven parameters that name the work's surgical
 * vocabulary. The parameter values are the private witness; the rendered
 * frame becomes the document's public face.
 *
 * If WebGL/Hydra is unavailable the sliders still function (the witness
 * stays intact) and a static base image stands in for the live render.
 */

const SLIDER_STEPS = {
  feedback: 0.05,
  boneExtraction: 0.02,
  warping: 0.05,
  hue: 0.03,
  lavender: 0.02,
  rhinoplasty: 0.02,
  transparency: 0.01,
  blending: 0.01,
  hardLighting: 0.005,
  squishiness: 0.04,
  idealProportions: 0.025,
};

export default function HydraCanvas({ onParametersChange, initialParams, param_range, mins }) {
  const canvasRef = useRef(null);
  const paramsRef = useRef({ ...initialParams });
  const rangeRef = useRef({...param_range});
  const minsRef = useRef({...mins});
  const [display, setDisplay] = useState(paramsRef.current);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  const updateParam = useCallback(
    (key, value) => {
      const v = parseFloat(value);
      paramsRef.current[key] = v; // mutate in place so the live sketch sees it
      setDisplay((prev) => {
        const next = { ...prev, [key]: v };
        onParametersChange?.(next);
        return next;
      });
    },
    [onParametersChange]
  );

  // report the starting parameters once
  useEffect(() => {
    onParametersChange?.(paramsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    let hydra = null;

    (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        hydra = await mountHydraSketch({ canvas, paramsRef, width: 600, height: 600 });
        if (cancelled) {
          hydra?.hush?.();
          return;
        }
        setReady(true);
      } catch (e) {
        console.error('Hydra init failed; falling back to static preview.', e);
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
      try {
        hydra?.hush?.();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div
        className="face-canvas mx-auto"
        style={{ width: 512, maxWidth: '100%', aspectRatio: '1 / 1', position: 'relative' }}
      >
        {!error ? (
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/artwork/base3.png"
            alt="Identity portrait preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {!ready && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: 'var(--ink-40)', fontSize: '0.75rem', letterSpacing: '0.14em' }}
          >
            <span className="cursor-blink">COMPOSING</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-xl mx-auto">
        {PARAM_KEYS.map((key) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between">
              <label
                className="text-[0.65rem] uppercase tracking-[0.2em]"
                style={{ color: 'var(--ink-40)' }}
              >
                {PARAM_LABELS[key]}
              </label>
              <span className="text-[0.65rem]" style={{ color: 'var(--ink-40)' }}>
                {Number(display[key]).toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={minsRef.current[key]}
              max={minsRef.current[key] + rangeRef.current[key]}
              step={SLIDER_STEPS[key]}
              value={display[key]}
              aria-label={PARAM_LABELS[key]}
              onChange={(e) => updateParam(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <p
        className="text-center text-[0.65rem] tracking-[0.14em]"
        style={{ color: 'var(--ink-25)' }}
      >
        MOVE THE PORTRAIT WITH YOUR CURSOR · ADJUST SLIDERS TO TRANSFORM
      </p>
    </div>
  );
}
