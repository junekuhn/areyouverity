'use client';

/**
 * The generative sketch (Hydra) — extracted so both the manual /create
 * sliders and the auto-animated landing stage can mount the same graph;
 * only the parameter source differs. All eleven parameters are read live
 * every frame via arrow functions closing over `paramsRef`, so whoever
 * owns the ref controls the art with no re-mount.
 */



export const VERITY_MIN = {
  feedback: 0,
  boneExtraction: 0,
  warping: 0,
  hue: 0,
  lavender: 0,
  rhinoplasty: 0,
  transparency: 0,
  blending: 0,
  hardLighting: 0,
  squishiness: 0,
  idealProportions: 0,
};

export const NOTVERITY_MIN = {
  feedback: 1,
  boneExtraction: 0,
  warping: 3,
  hue: 0,
  lavender: 0,
  rhinoplasty: 0,
  transparency: 0,
  blending: 0,
  hardLighting: 0,
  squishiness: 0,
  idealProportions: 0.5,
};

// slider ranges, from the artist's parameters file (0 → maximum)
export const PARAM_RANGES = {
  feedback: 1,
  boneExtraction: 1,
  warping: 1,
  hue: 1,
  lavender: 1,
  rhinoplasty: 1,
  transparency: 1,
  blending: 1,
  hardLighting: 1,
  squishiness: 1,
  idealProportions: 1,
};

export const NOT_PARAM_RANGES = {
  feedback: 4,
  boneExtraction:2,
  warping: 3,
  hue: 3,
  lavender: 2,
  rhinoplasty: 2,
  transparency: 1,
  blending: 1,
  hardLighting: 0.1,
  squishiness: 4,
  idealProportions: 2,
};

// Verity baseline — the gentler "minimum" preset
export const VERITY_PRESET = {
  feedback: 0,
  boneExtraction: 0,
  warping: 0,
  hue: 0,
  lavender: 0,
  rhinoplasty: 0,
  transparency: 0,
  blending: 0,
  hardLighting: 0,
  squishiness: 0,
  idealProportions: 0,
};

// Nonverity baseline — the abstract "maximum" preset
export const NOTVERITY_PRESET = {
  feedback: 2,
  boneExtraction: 0.1,
  warping: 4,
  hue: 0.1,
  lavender: 0.4,
  rhinoplasty: 0,
  transparency: 0,
  blending: 0,
  hardLighting: 0,
  squishiness: 0,
  idealProportions: 0.6,
};

// Undeclared — before any answer. Calm but alive; a whisper of the
// questioning purple since nothing has been settled yet.
export const IDLE_PRESET = {
  feedback: 1,
  boneExtraction: 0.4,
  warping: 1,
  hue: 0.48,
  lavender: 0,
  rhinoplasty: 0,
  transparency: 1,
  blending: 0.16,
  hardLighting: 0.7,
  squishiness: 0,
  idealProportions: 0,
};

/**
 * Mount the sketch onto `canvas`, reading its parameters live from
 * `paramsRef.current` every frame. Returns the Hydra instance — call
 * `.hush()` on it when unmounting.
 */
export async function mountHydraSketch({ canvas, paramsRef, width = 600, height = 600 }) {
  // Acquire the context with preserveDrawingBuffer first, so a frame can
  // be read back later (e.g. the ID photo capture on /create).
  try {
    canvas.getContext('webgl', { preserveDrawingBuffer: true });
  } catch {
    /* ignore — capture will simply be blank */
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
  const { src, osc, solid, shape, noise, voronoi, setFunction } = w;
  const { s0, s1, s2, s3, o0, o1, o2, o3 } = w;

  // ---- custom blend + shape functions from the sketch ----
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
  const shape2 = w.shape2;

  // ---- sources ----
  s0.initImage('/artwork/base3.png');
  s1.initImage('/artwork/forechin.png');
  s2.initImage('/artwork/eyes.png');
  s3.initImage('/artwork/nose.png');

  const P = paramsRef.current; // mutated in place by whoever drives it

  // ---- o1: eyes (rhinoplasty) + nose ----
  src(s2)
    .pheonix(
      src(s2)
        .scale(1, () => P.rhinoplasty * 0.1 + 1, () => P.rhinoplasty * 0.4 + 1)
        .scrollY(-0.02)
        .colorama(() => 2 * P.rhinoplasty),
      () => P.rhinoplasty
    )
    .layer(
      src(s3).scale(1, () => 1 - P.rhinoplasty * 0.2, () => P.rhinoplasty * 0.8 + 1)
    )
    .out(o1);

  // ---- o2: base warped ----
  src(s0)
    .modulateRotate(voronoi(() => 1 + P.warping, 0.1, 5), () => P.warping * 0.2, 0)
    .out(o2);

  // ---- o3: forechin, bone extraction (mouse-reactive) ----
  src(s1)
    .modulateScale(
      voronoi(() => 7 * P.boneExtraction, 0.2, 1.5)
        .mult(
          shape2(
            () => -w.mouse.x / 1000 + 0.5,
            () => -w.mouse.y / 1000 + 0.5
          )
        )
        .thresh(0.5, 0.9),
      () => P.boneExtraction * 4,
      1
    )
    .out(o3);

  // ---- o0: the composite ----
  src(o0)
    .blend(
      solid(
        () => 1 - P.lavender * 0.4,
        () => 1 - P.lavender * 0.8,
        () => 1 - P.lavender * 0.2
      ),
      () => 0.08 + P.lavender * 0.9
    )
    .layer(src(o2))
    .layer(src(o1))
    .layer(src(o3))
    .excl(
      src(s1).excl(
        osc(() => P.hue * 10 + 1, 0.1, () => P.hue * 2)
          .kaleid(40)
          .add(osc(1, 0, () => P.hue * 2).posterize(5)),
        () => P.hue + 0.5
      ),
      () => P.hue * 0.8
    )
    .excl(
      shape(100, 0.2, 0.5).invert().scale(1.1, 0.72, 1).scrollY(0.025).thresh(0.5, 0),
      () => P.idealProportions
    )
    .modulateScale(
      noise(5, 0.01),
      () => P.feedback * 0.15,
      () => (P.feedback + 0.5) * 0.1 + 0.95
    )
    .luma(() => 0.1 + P.transparency * 0.6, () => 0.6 - P.transparency * 0.6)
    .hardmix(
      src(s0).layer(s1).posterize(5).hue(() => P.hardLighting),
      () => P.hardLighting
    )
    .mult(s0, () => P.blending * 0.7)
    .blend(o0, () => P.blending * 0.7)
    .contrast(() => 1.1 - P.blending * 0.2)
    .modulateScrollX(
      osc(() => 15 * P.squishiness + 5, 0).modulateRotate(
        shape(4, 0.3, 0.5),
        () => 0.3 * P.squishiness
      ),
      () => 0.04 * P.squishiness
    )
    .out(o0);

  return hydra;
}
