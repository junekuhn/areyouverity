'use client';

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

/**
 * Interactive face-alteration canvas using p5.js.
 * Loads the base portrait and allows users to distort, smudge, paint,
 * and apply visual effects via sliders and mouse interaction.
 *
 * Parameter values are tracked precisely for ZK witness generation.
 */
const FaceCanvas = forwardRef(function FaceCanvas({ onParametersChange, initialParams }, ref) {
  const containerRef = useRef(null);
  const p5Ref = useRef(null);
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Parameter state
  const [params, setParams] = useState({
    distortion: 0.5,
    noiseAmount: 0.3,
    colorShift: 0.0,
    glitchIntensity: 0.2,
    smudgeRadius: 30,
    blendMode: 0,
    feedback: 0.1,
    ...initialParams,
  });

  // The p5 sketch is created once; it reads params through this ref so
  // slider changes reach the draw loop without re-mounting the sketch.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const updateParam = useCallback((key, value) => {
    setParams((prev) => {
      const next = { ...prev, [key]: parseFloat(value) };
      onParametersChange?.(next);
      return next;
    });
  }, [onParametersChange]);

  // Report the default parameters once so the parent can enable
  // "lock in" without requiring a slider move first.
  useEffect(() => {
    onParametersChange?.(paramsRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose canvas element and params to parent
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getParameters: () => params,
  }));

  useEffect(() => {
    let p5Instance = null;
    let cancelled = false;

    async function init() {
      const p5Module = await import('p5');
      const p5 = p5Module.default;
      if (cancelled || !containerRef.current) return;

      p5Instance = new p5((sketch) => {
        let baseImg;
        let buffer;
        let paintLayer;
        let mousePressed = false;
        let prevMouse = { x: 0, y: 0 };

        const W = 512;
        const H = 640;

        sketch.preload = () => {
          baseImg = sketch.loadImage('/images/base_2.png');
        };

        sketch.setup = () => {
          const canvas = sketch.createCanvas(W, H);
          canvas.parent(containerRef.current);
          canvasRef.current = canvas.elt;

          buffer = sketch.createGraphics(W, H);
          paintLayer = sketch.createGraphics(W, H);
          paintLayer.clear();

          // Draw base image to buffer
          buffer.image(baseImg, 0, 0, W, H);
          setLoaded(true);
        };

        sketch.draw = () => {
          const p = paramsRef.current;

          // Start from base
          sketch.image(buffer, 0, 0);

          // Apply distortion
          if (p.distortion > 0.01) {
            sketch.loadPixels();
            const d = sketch.pixelDensity();
            const w = W * d;
            const h = H * d;
            const pix = sketch.pixels;
            const time = sketch.frameCount * 0.02;

            for (let y = 0; y < h; y += 2) {
              for (let x = 0; x < w; x += 2) {
                const idx = (y * w + x) * 4;
                const offsetX = Math.sin(y * 0.01 + time) * p.distortion * 10 * d;
                const srcX = Math.min(Math.max(Math.floor(x + offsetX), 0), w - 1);
                const srcIdx = (y * w + srcX) * 4;

                pix[idx] = pix[srcIdx];
                pix[idx + 1] = pix[srcIdx + 1];
                pix[idx + 2] = pix[srcIdx + 2];
              }
            }
            sketch.updatePixels();
          }

          // Noise overlay
          if (p.noiseAmount > 0.01) {
            sketch.loadPixels();
            const d = sketch.pixelDensity();
            const total = W * d * H * d * 4;
            for (let i = 0; i < total; i += 4) {
              const n = (Math.random() - 0.5) * p.noiseAmount * 100;
              sketch.pixels[i] += n;
              sketch.pixels[i + 1] += n;
              sketch.pixels[i + 2] += n;
            }
            sketch.updatePixels();
          }

          // Color shift (RGB channel separation)
          if (p.colorShift > 0.01) {
            const shift = Math.floor(p.colorShift * 15);
            sketch.loadPixels();
            const d = sketch.pixelDensity();
            const w = W * d;
            const pix = [...sketch.pixels];

            for (let i = 0; i < pix.length; i += 4) {
              const col = (i / 4) % w;
              if (col + shift < w) {
                sketch.pixels[i] = pix[i + shift * 4]; // R shift
              }
              if (col - shift >= 0) {
                sketch.pixels[i + 2] = pix[i + 2 - shift * 4]; // B shift
              }
            }
            sketch.updatePixels();
          }

          // Inversion blend — crossfade toward the negative
          if (p.blendMode > 0.01) {
            sketch.loadPixels();
            const b = p.blendMode;
            const pix = sketch.pixels;
            for (let i = 0; i < pix.length; i += 4) {
              pix[i] = pix[i] * (1 - b) + (255 - pix[i]) * b;
              pix[i + 1] = pix[i + 1] * (1 - b) + (255 - pix[i + 1]) * b;
              pix[i + 2] = pix[i + 2] * (1 - b) + (255 - pix[i + 2]) * b;
            }
            sketch.updatePixels();
          }

          // Glitch lines
          if (p.glitchIntensity > 0.01 && sketch.frameCount % 4 === 0) {
            const numLines = Math.floor(p.glitchIntensity * 8);
            for (let i = 0; i < numLines; i++) {
              const y = Math.floor(Math.random() * H);
              const h = Math.floor(Math.random() * 4) + 1;
              const offset = (Math.random() - 0.5) * p.glitchIntensity * 40;
              const section = sketch.get(0, y, W, h);
              sketch.image(section, offset, y);
            }
          }

          // Paint layer overlay
          sketch.image(paintLayer, 0, 0);

          // Feedback effect
          if (p.feedback > 0.01) {
            buffer.tint(255, 255 - p.feedback * 30);
            buffer.image(sketch.get(), 0, 0);
            buffer.noTint();
          }
        };

        sketch.mousePressed = () => {
          if (sketch.mouseX >= 0 && sketch.mouseX <= W &&
              sketch.mouseY >= 0 && sketch.mouseY <= H) {
            mousePressed = true;
            prevMouse = { x: sketch.mouseX, y: sketch.mouseY };
          }
        };

        sketch.mouseReleased = () => {
          mousePressed = false;
        };

        sketch.mouseDragged = () => {
          if (!mousePressed) return;
          if (sketch.mouseX < 0 || sketch.mouseX > W ||
              sketch.mouseY < 0 || sketch.mouseY > H) return;

          const r = paramsRef.current.smudgeRadius;

          // Smudge effect on buffer
          const region = buffer.get(
            Math.floor(prevMouse.x - r / 2),
            Math.floor(prevMouse.y - r / 2),
            r, r
          );
          buffer.tint(255, 200);
          buffer.image(region,
            sketch.mouseX - r / 2,
            sketch.mouseY - r / 2,
            r, r
          );
          buffer.noTint();

          // Paint marks
          paintLayer.noStroke();
          paintLayer.fill(255, 255, 255, 15);
          paintLayer.ellipse(sketch.mouseX, sketch.mouseY, r * 0.3);

          prevMouse = { x: sketch.mouseX, y: sketch.mouseY };
        };
      }, containerRef.current);

      p5Ref.current = p5Instance;
    }

    init();

    return () => {
      cancelled = true;
      if (p5Instance) p5Instance.remove();
    };
  // We intentionally only run this once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sliders = [
    { key: 'distortion', label: 'Distortion', min: 0, max: 1, step: 0.01 },
    { key: 'noiseAmount', label: 'Noise', min: 0, max: 1, step: 0.01 },
    { key: 'colorShift', label: 'Color Shift', min: 0, max: 1, step: 0.01 },
    { key: 'glitchIntensity', label: 'Glitch', min: 0, max: 1, step: 0.01 },
    { key: 'smudgeRadius', label: 'Smudge Size', min: 10, max: 80, step: 1 },
    { key: 'blendMode', label: 'Inversion', min: 0, max: 1, step: 0.01 },
    { key: 'feedback', label: 'Feedback', min: 0, max: 1, step: 0.01 },
  ];

  return (
    <div className="space-y-6">
      {/* Canvas */}
      <div className="relative">
        <div
          ref={containerRef}
          className="face-canvas mx-auto"
          style={{ width: 512, maxWidth: '100%', aspectRatio: '512 / 640' }}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-raised)' }}>
            <p className="text-sm cursor-blink" style={{ color: 'var(--ink-40)' }}>Loading portrait</p>
          </div>
        )}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-xl mx-auto">
        {sliders.map((s) => (
          <div key={s.key} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[0.65rem] uppercase tracking-[0.2em]" style={{ color: 'var(--ink-40)' }}>
                {s.label}
              </label>
              <span className="text-[0.65rem]" style={{ color: 'var(--ink-25)' }}>
                {Number(params[s.key]).toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={params[s.key]}
              onChange={(e) => updateParam(s.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <p className="text-center text-[0.65rem] tracking-[0.14em]" style={{ color: 'var(--ink-25)' }}>
        CLICK AND DRAG THE PORTRAIT TO SMUDGE · ADJUST SLIDERS TO TRANSFORM
      </p>
    </div>
  );
});

export default FaceCanvas;
