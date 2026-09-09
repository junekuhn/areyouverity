'use client';

/**
 * Generic Hydra engine for the playground: instantiates Hydra, registers
 * the sketch's custom blend/shape functions, and loads the four source
 * images once. Each playground mode then builds its own graph on top via
 * `run(w, paramsRef)` — see hydraModes.js. Switching modes just calls a
 * different `run()` on the same live context; no re-init needed.
 */

export async function createHydraEngine({ canvas, width = 640, height = 640 }) {
  try {
    canvas.getContext('webgl', { preserveDrawingBuffer: true });
  } catch {
    /* ignore — frame capture will simply be blank */
  }

  const mod = await import('hydra-synth');
  const Hydra = mod.default || mod;

  const hydra = new Hydra({
    canvas,
    width,
    height,
    detectAudio: false,
    makeGlobal: true,
    numSources: 4,
    numOutputs: 4,
  });

  const w = window;
  registerCustomFunctions(w.setFunction);

  const { s0, s1, s2, s3 } = w;
  s0.initImage('/artwork/base3.png');
  s1.initImage('/artwork/forechin.png');
  s2.initImage('/artwork/eyes.png');
  s3.initImage('/artwork/nose.png');

  return { hydra, w };
}

function registerCustomFunctions(setFunction) {
  setFunction({
    name: 'pheonix',
    type: 'combine',
    inputs: [{ name: 'amount', type: 'float', default: 1 }],
    glsl: `
vec3 rgb;
rgb.r = min(_c0.r,_c1.r)-max(_c0.r,_c1.r)+1.0;
rgb.g = min(_c0.g,_c1.g)-max(_c0.g,_c1.g)+1.0;
rgb.b = min(_c0.b,_c1.b)-max(_c0.b,_c1.b)+1.0;
_c1.a *= amount;
vec4 blended = vec4(mix(_c0.rgb, rgb, _c1.a), 1.0);
vec4 over = _c1 + (_c0 * (1.0 - _c1.a));
return mix(blended, over, 1.0 - _c0.a);`,
  });
  setFunction({
    name: 'excl',
    type: 'combine',
    inputs: [{ name: 'amount', type: 'float', default: 1 }],
    glsl: `
vec3 rgb;
rgb.r = _c0.r+_c1.r-2.0*_c0.r*_c1.r;
rgb.g = _c0.g+_c1.g-2.0*_c0.g*_c1.g;
rgb.b = _c0.b+_c1.b-2.0*_c0.b*_c1.b;
_c1.a *= amount;
vec4 blended = vec4(mix(_c0.rgb, rgb, _c1.a), 1.0);
vec4 over = _c1 + (_c0 * (1.0 - _c1.a));
return mix(blended, over, 1.0 - _c0.a);`,
  });
  setFunction({
    name: 'hardmix',
    type: 'combine',
    inputs: [{ name: 'amount', type: 'float', default: 1 }],
    glsl: `
vec3 rgb;
rgb.r = (((_c1.r<0.5)?((_c1.r==0.0)?(_c1.r):max((1.0-((1.0-_c0.r)/(2.0*_c1.r))),0.0)):(((2.0*(_c1.r-0.5))==1.0)?(2.0*(_c1.r-0.5)):min(_c0.r/(1.0-(2.0*(_c1.r-0.5))),1.0)))<0.5)?0.0:1.0;
rgb.g = (((_c1.g<0.5)?((_c1.g==0.0)?(_c1.g):max((1.0-((1.0-_c0.g)/(2.0*_c1.g))),0.0)):(((2.0*(_c1.g-0.5))==1.0)?(2.0*(_c1.g-0.5)):min(_c0.g/(1.0-(2.0*(_c1.g-0.5))),1.0)))<0.5)?0.0:1.0;
rgb.b = (((_c1.b<0.5)?((_c1.b==0.0)?(_c1.b):max((1.0-((1.0-_c0.b)/(2.0*_c1.b))),0.0)):(((2.0*(_c1.b-0.5))==1.0)?(2.0*(_c1.b-0.5)):min(_c0.b/(1.0-(2.0*(_c1.b-0.5))),1.0)))<0.5)?0.0:1.0;
_c1.a *= amount;
vec4 blended = vec4(mix(_c0.rgb, rgb, _c1.a), 1.0);
vec4 over = _c1 + (_c0 * (1.0 - _c1.a));
return mix(blended, over, 1.0 - _c0.a);`,
  });
  setFunction({
    name: 'shape2',
    type: 'src',
    inputs: [
      { type: 'float', name: 'width', default: 0.2 },
      { type: 'float', name: 'height', default: 0.3 },
      { type: 'float', name: 'radius', default: 0.01 },
    ],
    glsl: `vec2 st = _st * 2. - 1.;
st = vec2(st.x + width, st.y + height);
float x = length(st)-radius;
vec3 col = vec3(1.-x);
return vec4(col, 1.0);`,
  });
}

/**
 * Blank all four output buffers — call before mounting a different mode
 * so a previous mode's stale graph can never bleed into the next one.
 */
export function resetBuffers(w) {
  const { solid } = w;
  const { o0, o1, o2, o3 } = w;
  [o0, o1, o2, o3].forEach((o) => solid(0, 0, 0, 1).out(o));
}
