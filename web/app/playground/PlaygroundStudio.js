'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createHydraEngine, resetBuffers } from '@/lib/hydraEngine';
import { HYDRA_MODES } from '@/lib/hydraModes';
import { downloadJSON } from '@/lib/commitment';

/**
 * A standalone instrument for the generative sketch — twenty registers,
 * ten sliders each. Nothing here touches the identity registry: no mint,
 * no proof, no memory beyond this tab. It exists to explore what the same
 * four source images can do beyond the fixed portrait graph.
 */

const CATEGORIES = [
  { key: 'core', label: 'Core' },
  { key: '3d', label: '3D' },
  { key: 'surveillance', label: 'Surveillance' },
  { key: 'surgical', label: 'Surgical' },
  { key: 'elaborate', label: 'Elaborate' },
];

const DEFAULT_MODE_ID = 'datamosh';

function defaultsFor(mode) {
  return Object.fromEntries(mode.params.map((p) => [p.key, p.default]));
}

function findMode(id) {
  return HYDRA_MODES.find((m) => m.id === id) || HYDRA_MODES[0];
}

export default function PlaygroundStudio() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null); // { hydra, w }
  const paramsByMode = useRef({}); // modeId -> { current: {...} }
  const [modeId, setModeId] = useState(DEFAULT_MODE_ID);
  const [display, setDisplay] = useState(() => defaultsFor(findMode(DEFAULT_MODE_ID)));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const mode = findMode(modeId);

  const paramsRefFor = useCallback((m) => {
    if (!paramsByMode.current[m.id]) {
      paramsByMode.current[m.id] = { current: defaultsFor(m) };
    }
    return paramsByMode.current[m.id];
  }, []);

  const mountMode = useCallback(
    (m) => {
      const engine = engineRef.current;
      if (!engine) return;
      const ref = paramsRefFor(m);
      resetBuffers(engine.w);
      m.run(engine.w, ref);
      setDisplay({ ...ref.current });
    },
    [paramsRefFor]
  );

  // engine: created once, kept alive across mode switches
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const engine = await createHydraEngine({ canvas, width: 640, height: 640 });
        if (cancelled) {
          engine.hydra?.hush?.();
          return;
        }
        engineRef.current = engine;
        setReady(true);
      } catch (e) {
        console.error('Playground engine failed to start:', e);
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
      try {
        engineRef.current?.hydra?.hush?.();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mode switch: re-run the new mode's graph on the same live context
  useEffect(() => {
    if (!ready) return;
    mountMode(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeId, ready]);

  const updateParam = (key, value) => {
    const ref = paramsRefFor(mode);
    const v = parseFloat(value);
    ref.current[key] = v;
    setDisplay((prev) => ({ ...prev, [key]: v }));
  };

  const randomize = () => {
    const ref = paramsRefFor(mode);
    const next = {};
    for (const p of mode.params) {
      const raw = p.min + Math.random() * (p.max - p.min);
      const snapped = Math.round(raw / p.step) * p.step;
      const clamped = Math.min(p.max, Math.max(p.min, snapped));
      ref.current[p.key] = clamped;
      next[p.key] = clamped;
    }
    setDisplay(next);
  };

  const resetMode = () => {
    const ref = paramsRefFor(mode);
    const defaults = defaultsFor(mode);
    Object.assign(ref.current, defaults);
    setDisplay(defaults);
  };

  const savePNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${mode.id}-frame.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const exportSettings = () => {
    downloadJSON({ mode: mode.id, params: display }, `${mode.id}-settings.json`);
  };

  return (
    <div className="page page-wide">
      <div className="space-y-3 rise">
        <p className="kicker">Playground</p>
        <h1 className="question-lg">The Hydra Instrument.</h1>
        <p className="prose-dim max-w-2xl">
          Forty registers, built from the same four sources as the identity
          piece — kaleidoscope, cellular modulation, feedback trails, glitch,
          chrome, and colour wash, pushed into pseudo-3D depth, neon
          surveillance, surgical/clinical registers, and a set of deeper,
          multi-buffer scenes with real cross-modulation between layers.
          Nothing here mints or is remembered; it exists only in this tab.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-10 items-start mt-10">
        <div className="space-y-4 rise d1">
          <div
            className="face-canvas mx-auto"
            style={{ width: 640, maxWidth: '100%', aspectRatio: '1 / 1', position: 'relative' }}
          >
            {!error ? (
              <canvas
                ref={canvasRef}
                width={640}
                height={640}
                role="img"
                aria-label={`The Hydra sketch in ${mode.name} mode`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center prose-dim text-[0.8rem] px-6 text-center">
                WebGL is unavailable in this browser — the playground needs it to run.
              </div>
            )}
            {!ready && !error && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ color: 'var(--ink-40)', fontSize: '0.75rem', letterSpacing: '0.14em' }}
              >
                <span className="cursor-blink">STARTING ENGINE</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn" onClick={randomize} disabled={!ready}>
              Randomize
            </button>
            <button className="btn" onClick={resetMode} disabled={!ready}>
              Reset mode
            </button>
            <button className="btn" onClick={savePNG} disabled={!ready}>
              Save frame (PNG)
            </button>
            <button className="btn" onClick={exportSettings} disabled={!ready}>
              Export settings (JSON)
            </button>
          </div>
        </div>

        <aside className="space-y-6 rise d2">
          <div className="panel space-y-4">
            <p className="panel-title">Registers</p>
            {CATEGORIES.map((cat) => {
              const modesInCat = HYDRA_MODES.filter((m) => m.category === cat.key);
              if (!modesInCat.length) return null;
              return (
                <div key={cat.key} className="space-y-2">
                  <p
                    className="text-[0.6rem] uppercase tracking-[0.22em]"
                    style={{ color: 'var(--ink-25)' }}
                  >
                    {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modesInCat.map((m) => (
                      <button
                        key={m.id}
                        className={m.id === modeId ? 'btn btn-solid' : 'btn'}
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.68rem' }}
                        onClick={() => setModeId(m.id)}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="prose-dim text-[0.78rem]">{mode.blurb}</p>
          </div>

          <div className="panel">
            <p className="panel-title">{mode.name} — controls</p>
            <div className="space-y-4">
              {mode.params.map((p) => (
                <div key={p.key} className="space-y-2">
                  <div className="flex justify-between">
                    <label
                      className="text-[0.65rem] uppercase tracking-[0.2em]"
                      style={{ color: 'var(--ink-40)' }}
                    >
                      {p.label}
                    </label>
                    <span className="text-[0.65rem]" style={{ color: 'var(--ink-40)' }}>
                      {Number(display[p.key] ?? p.default).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={display[p.key] ?? p.default}
                    aria-label={p.label}
                    onChange={(e) => updateParam(p.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Link href="/" className="btn-quiet">
            back to the question
          </Link>
        </aside>
      </div>
    </div>
  );
}
