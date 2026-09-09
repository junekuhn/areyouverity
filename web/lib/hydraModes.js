'use client';

/**
 * Registers of the same generative sketch that powers the identity piece —
 * the same four sources (base face, forechin, eyes, nose), pushed through
 * different corners of Hydra's vocabulary to see what the piece's visual
 * language can do beyond the fixed portrait graph.
 *
 * Each mode is `{ id, category, name, blurb, params, run(w, paramsRef) }`.
 * `params` lists exactly ten sliders; `run` reads them live via arrow
 * functions closing over `paramsRef.current`, exactly like the main
 * sketch — move a slider and the render updates on the next frame, no
 * re-mount. Categories: core (the original ten), 3d, surveillance,
 * surgical, elaborate (multi-buffer feedback / cross-modulated scenes).
 */

export const HYDRA_MODES = [
  {
    id: 'portrait',
    category: 'core',
    name: 'Portrait',
    blurb: 'The calm register — the same warps, light and proportion as the identity piece.',
    params: [
      { key: 'feedback', label: 'Feedback', min: 0, max: 1, step: 0.05, default: 0 },
      { key: 'warp', label: 'Warp', min: 0, max: 1, step: 0.05, default: 0 },
      { key: 'boneExtraction', label: 'Bone Extraction', min: 0, max: 1, step: 0.02, default: 0 },
      { key: 'rhinoplasty', label: 'Rhinoplasty', min: 0, max: 1, step: 0.02, default: 0 },
      { key: 'lavender', label: 'Lavender', min: 0, max: 1, step: 0.02, default: 0 },
      { key: 'transparency', label: 'Transparency', min: 0, max: 1, step: 0.01, default: 0 },
      { key: 'blending', label: 'Blending', min: 0, max: 1, step: 0.01, default: 0 },
      { key: 'hardLighting', label: 'Hard Lighting', min: 0, max: 1, step: 0.005, default: 0 },
      { key: 'squishiness', label: 'Squishiness', min: 0, max: 1, step: 0.04, default: 0 },
      { key: 'idealProportions', label: 'Ideal Proportions', min: 0, max: 1, step: 0.025, default: 0 },
    ],
   nonverityparams: [
      { key: 'feedback', label: 'Feedback', min: 1, max: 5, step: 0.05, default: 1 },
      { key: 'warp', label: 'Warp', min: 3, max: 6, step: 0.05, default: 0 },
      { key: 'boneExtraction', label: 'Bone Extraction', min: 0, max: 2, step: 0.02, default: 0 },
      { key: 'rhinoplasty', label: 'Rhinoplasty', min: 0, max: 2, step: 0.02, default: 0 },
      { key: 'lavender', label: 'Lavender', min: 0, max: 2, step: 0.02, default: 0 },
      { key: 'transparency', label: 'Transparency', min: 0, max: 1, step: 0.01, default: 0 },
      { key: 'blending', label: 'Blending', min: 0, max: 1, step: 0.01, default: 0 },
      { key: 'hardLighting', label: 'Hard Lighting', min: 0, max: .1, step: 0.005, default: 0 },
      { key: 'squishiness', label: 'Squishiness', min: 0, max: 4, step: 0.04, default: 0 },
      { key: 'idealProportions', label: 'Ideal Proportions', min: 0.5, max: 2.5, step: 0.025, default: 0 },
    ],
    run(w, paramsRef) {
      const { src, osc, solid, shape, noise, voronoi } = w;
      const { s0, s1, s2, s3, o0, o1, o2, o3 } = w;
      const shape2 = w.shape2;
      const P = paramsRef.current;

      src(s2)
        .pheonix(
          src(s2).scale(1, () => P.rhinoplasty * 0.1 + 1, () => P.rhinoplasty * 0.4 + 1).scrollY(-0.02).colorama(() => 2 * P.rhinoplasty),
          () => P.rhinoplasty
        )
        .layer(src(s3).scale(1, () => 1 - P.rhinoplasty * 0.2, () => P.rhinoplasty * 0.8 + 1))
        .out(o1);

      src(s0).modulateRotate(voronoi(() => 1 + P.warp, 0.1, 5), () => P.warp * 0.2, 0).out(o2);

      src(s1)
        .modulateScale(
          voronoi(() => 7 * P.boneExtraction, 0.2, 1.5)
            .mult(shape2(() => -w.mouse.x / 1000 + 0.5, () => -w.mouse.y / 1000 + 0.5))
            .thresh(0.5, 0.9),
          () => P.boneExtraction * 4,
          1
        )
        .out(o3);

      src(o0)
        .blend(solid(() => 1 - P.lavender * 0.4, () => 1 - P.lavender * 0.8, () => 1 - P.lavender * 0.2), () => 0.08 + P.lavender * 0.9)
        .layer(src(o2))
        .layer(src(o1))
        .layer(src(o3))
        .excl(shape(100, 0.2, 0.5).invert().scale(1.1, 0.72, 1).scrollY(0.025).thresh(0.5, 0), () => P.idealProportions)
        .modulateScale(noise(5, 0.01), () => P.feedback * 0.15, () => (P.feedback + 0.5) * 0.1 + 0.95)
        .luma(() => 0.1 + P.transparency * 0.6, () => 0.6 - P.transparency * 0.6)
        .hardmix(src(s0).layer(s1).posterize(5), () => P.hardLighting)
        .mult(s0, () => P.blending * 0.7)
        .blend(o0, () => P.blending * 0.7)
        .contrast(() => 1.1 - P.blending * 0.2)
        .modulateScrollX(
          osc(() => 15 * P.squishiness + 5, 0).modulateRotate(shape(4, 0.3, 0.5), () => 0.3 * P.squishiness),
          () => 0.04 * P.squishiness
        )
        .out(o0);
    },
  },

  {
    id: 'kaleidobody',
    category: 'core',
    name: 'Kaleidobody',
    blurb: 'Symmetry, colour cycling, fractured repetition.',
    params: [
      { key: 'sides', label: 'Sides', min: 2, max: 24, step: 1, default: 6 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: 0, max: 2, step: 0.02, default: 0.3 },
      { key: 'colorCycle', label: 'Colour Cycle', min: 0, max: 3, step: 0.03, default: 0.8 },
      { key: 'fragmentScale', label: 'Fragment Scale', min: 0.5, max: 3, step: 0.02, default: 1.2 },
      { key: 'eyeBloom', label: 'Eye Bloom', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'noseBloom', label: 'Nose Bloom', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'mirrorRepeat', label: 'Mirror Repeat', min: 1, max: 6, step: 1, default: 2 },
      { key: 'saturation', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 1.6 },
      { key: 'brightness', label: 'Brightness', min: -0.5, max: 0.5, step: 0.01, default: 0.05 },
      { key: 'zoom', label: 'Zoom', min: 0.4, max: 2.5, step: 0.02, default: 1 },
    ],
    run(w, paramsRef) {
      const { src, osc } = w;
      const { s0, s2, s3, o0, o1 } = w;
      const P = paramsRef.current;

      src(s2).layer(src(s3).scale(() => P.noseBloom + 0.6)).out(o1);

      src(s0)
        .scale(() => P.zoom)
        .layer(src(o1).scale(() => P.eyeBloom + 0.2).blend(o1, () => P.eyeBloom))
        .kaleid(() => P.sides)
        .rotate(0, () => P.rotationSpeed)
        .modulateHue(osc(() => P.colorCycle * 6 + 2, 0.15, () => P.colorCycle), () => P.colorCycle)
        .repeat(() => P.mirrorRepeat, () => P.mirrorRepeat)
        .scale(() => P.fragmentScale)
        .saturate(() => P.saturation)
        .brightness(() => P.brightness)
        .out(o0);
    },
  },

  {
    id: 'datamosh',
    category: 'core',
    name: 'Datamosh',
    blurb: 'Compression artefacts, scanlines, chroma error.',
    params: [
      { key: 'glitchDensity', label: 'Glitch Density', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'scanlineHeight', label: 'Scanline Height', min: 1, max: 40, step: 1, default: 6 },
      { key: 'rgbSplit', label: 'RGB Split', min: 0, max: 0.5, step: 0.005, default: 0.08 },
      { key: 'pixelation', label: 'Pixelation', min: 4, max: 200, step: 2, default: 60 },
      { key: 'displacement', label: 'Displacement', min: 0, max: 2, step: 0.02, default: 0.6 },
      { key: 'displacementSpeed', label: 'Displacement Speed', min: 0, max: 3, step: 0.02, default: 0.8 },
      { key: 'colorBlocks', label: 'Colour Blocks', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'noiseScale', label: 'Noise Scale', min: 1, max: 40, step: 0.5, default: 10 },
      { key: 'feedbackSmear', label: 'Feedback Smear', min: 0, max: 0.95, step: 0.01, default: 0.3 },
      { key: 'chromaDrift', label: 'Chroma Drift', min: 0, max: 2, step: 0.02, default: 0.4 },
    ],
    run(w, paramsRef) {
      const { src, noise } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .modulateScrollX(noise(() => P.noiseScale, () => P.displacementSpeed), () => P.displacement * 0.3, () => P.displacementSpeed)
        .modulateScrollY(noise(() => P.noiseScale * 0.6, () => P.displacementSpeed * 1.3), () => P.displacement * 0.15, 0)
        .pixelate(() => P.pixelation, () => Math.max(2, P.scanlineHeight))
        .posterize(() => Math.round(2 + P.colorBlocks * 14), 0.6)
        .layer(
          src(s0)
            .shift(() => P.rgbSplit, 0, () => P.chromaDrift * 0.3)
            .mask(noise(() => P.noiseScale, () => P.displacementSpeed * 0.7).thresh(() => 1 - P.glitchDensity, 0.15))
        )
        .layer(
          src(s0)
            .shift(0, () => P.rgbSplit * 0.6, () => -P.chromaDrift * 0.3)
            .mask(noise(() => P.noiseScale * 1.4, () => P.displacementSpeed * 0.5).thresh(() => 1 - P.glitchDensity * 0.7, 0.15))
        )
        .modulateScale(noise(3, () => P.displacementSpeed * 0.5), () => P.feedbackSmear * 0.1, () => 1 - P.feedbackSmear * 0.05)
        .blend(o0, () => P.feedbackSmear)
        .out(o0);
    },
  },

  {
    id: 'voronoiSkin',
    category: 'core',
    name: 'Voronoi Skin',
    blurb: 'Cellular membrane, organic modulation.',
    params: [
      { key: 'cellScale', label: 'Cell Scale', min: 1, max: 40, step: 0.5, default: 12 },
      { key: 'cellSpeed', label: 'Cell Speed', min: 0, max: 2, step: 0.02, default: 0.3 },
      { key: 'cellBlending', label: 'Cell Blending', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'modulationAmount', label: 'Modulation', min: 0, max: 3, step: 0.02, default: 0.8 },
      { key: 'baseOpacity', label: 'Base Opacity', min: 0, max: 1, step: 0.01, default: 0.7 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.4 },
      { key: 'tintWarmth', label: 'Tint Warmth', min: -1, max: 1, step: 0.01, default: 0.2 },
      { key: 'edgeSharpness', label: 'Edge Sharpness', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'layerMix', label: 'Layer Mix', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'pulse', label: 'Pulse', min: 0, max: 2, step: 0.02, default: 0.4 },
    ],
    run(w, paramsRef) {
      const { src, voronoi, solid } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const cells = () => voronoi(() => P.cellScale, () => P.cellSpeed, () => P.cellBlending);

      src(s0)
        .modulate(cells(), () => P.modulationAmount * 0.3)
        .layer(
          cells()
            .thresh(() => 0.4 + P.edgeSharpness * 0.3, 0.05)
            .color(() => 0.85 + P.tintWarmth * 0.15, 0.8, () => 0.85 - P.tintWarmth * 0.15, () => P.layerMix * 0.6)
        )
        .modulateScale(cells(), () => P.pulse * 0.1, () => 1 + P.pulse * 0.05)
        .contrast(() => P.contrastAmt)
        .blend(solid(1, 1, 1, 1), () => (1 - P.baseOpacity) * 0.15)
        .out(o0);
    },
  },

  {
    id: 'liquidChrome',
    category: 'core',
    name: 'Liquid Chrome',
    blurb: 'Molten reflections, metallic banding.',
    params: [
      { key: 'flowSpeed', label: 'Flow Speed', min: 0, max: 2, step: 0.02, default: 0.4 },
      { key: 'flowAmount', label: 'Flow Amount', min: 0, max: 2, step: 0.02, default: 0.7 },
      { key: 'chromeBands', label: 'Chrome Bands', min: 2, max: 24, step: 1, default: 6 },
      { key: 'mirrorAmount', label: 'Mirror Amount', min: 1, max: 5, step: 1, default: 2 },
      { key: 'reflectionAngle', label: 'Reflection Angle', min: 0, max: 6.28, step: 0.02, default: 1.2 },
      { key: 'metallicContrast', label: 'Metallic Contrast', min: 0.5, max: 3, step: 0.02, default: 1.8 },
      { key: 'invertPulse', label: 'Invert Pulse', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'highlight', label: 'Highlight', min: -0.3, max: 0.5, step: 0.01, default: 0.1 },
      { key: 'rippleScale', label: 'Ripple Scale', min: 1, max: 20, step: 0.5, default: 6 },
      { key: 'surfaceSmoothness', label: 'Surface Smoothness', min: 0, max: 0.9, step: 0.01, default: 0.3 },
    ],
    run(w, paramsRef) {
      const { src, noise } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .modulateScale(noise(() => P.rippleScale, () => P.flowSpeed), () => P.flowAmount * 0.3, () => 1 - P.flowAmount * 0.1)
        .modulateRotate(noise(() => P.rippleScale * 0.6, () => P.flowSpeed * 0.7), () => P.flowAmount, () => P.reflectionAngle)
        .repeat(() => P.mirrorAmount, () => P.mirrorAmount)
        .posterize(() => P.chromeBands, 0.5)
        .contrast(() => P.metallicContrast)
        .invert(() => P.invertPulse)
        .brightness(() => P.highlight)
        .modulateScale(noise(4, () => P.flowSpeed * 0.3), () => P.surfaceSmoothness * 0.08, () => 1 - P.surfaceSmoothness * 0.04)
        .out(o0);
    },
  },

  {
    id: 'bloomBone',
    category: 'core',
    name: 'Bloom & Bone',
    blurb: 'Ghost trails and skeletal, mouse-reactive displacement.',
    params: [
      { key: 'trailLength', label: 'Trail Length', min: 0, max: 0.95, step: 0.01, default: 0.55 },
      { key: 'trailFade', label: 'Trail Fade', min: 0, max: 60, step: 1, default: 12 },
      { key: 'boneDisplacement', label: 'Bone Displacement', min: 0, max: 3, step: 0.02, default: 1 },
      { key: 'displacementReach', label: 'Displacement Reach', min: 0, max: 8, step: 0.1, default: 3 },
      { key: 'glowThreshold', label: 'Glow Threshold', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'glowColor', label: 'Glow Colour', min: 0, max: 1, step: 0.01, default: 0.6 },
      { key: 'motionBlur', label: 'Motion Blur', min: 0, max: 0.9, step: 0.01, default: 0.25 },
      { key: 'mouseReactivity', label: 'Mouse Reactivity', min: 0, max: 2, step: 0.02, default: 0.7 },
      { key: 'echoDelay', label: 'Echo Delay', min: 0, max: 0.8, step: 0.01, default: 0.2 },
      { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
    run(w, paramsRef) {
      const { src, voronoi, shape } = w;
      const { s0, s1, o0, o3 } = w;
      const shape2 = w.shape2;
      const P = paramsRef.current;

      src(s1)
        .modulateScale(
          voronoi(() => 4 + P.displacementReach, 0.2, 1.5)
            .mult(shape2(() => (-w.mouse.x / 1000 + 0.5) * P.mouseReactivity, () => (-w.mouse.y / 1000 + 0.5) * P.mouseReactivity))
            .thresh(0.5, 0.9),
          () => P.boneDisplacement * 3,
          1
        )
        .out(o3);

      src(s0)
        .layer(src(o3).modulateHue(src(o3), () => P.glowColor).luma(() => P.glowThreshold, 0.2))
        .blend(o0, () => P.trailLength)
        .brightness(() => -P.trailFade / 300)
        .layer(src(o3).luma(() => P.glowThreshold + 0.2, 0.15).color(1, 1, 1, () => P.echoDelay))
        .modulateScale(voronoi(6, () => P.motionBlur * 0.6, 0.5), () => P.motionBlur * 0.05, () => 1 - P.motionBlur * 0.03)
        .mask(shape(60, () => 0.25 + P.vignette * 0.4, 0.2))
        .out(o0);
    },
  },

  {
    id: 'fracture',
    category: 'core',
    name: 'Fracture',
    blurb: 'Sliced panels, rotating shards.',
    params: [
      { key: 'sliceCount', label: 'Slice Count', min: 2, max: 24, step: 1, default: 8 },
      { key: 'sliceOffset', label: 'Slice Offset', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'sliceSpeed', label: 'Slice Speed', min: 0, max: 2, step: 0.02, default: 0.4 },
      { key: 'rotationJitter', label: 'Rotation Jitter', min: 0, max: 2, step: 0.02, default: 0.5 },
      { key: 'colorBlocks', label: 'Colour Blocks', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'edgeContrast', label: 'Edge Contrast', min: 0.5, max: 3, step: 0.02, default: 1.5 },
      { key: 'panelGap', label: 'Panel Gap', min: 0.8, max: 2, step: 0.01, default: 1.1 },
      { key: 'chaos', label: 'Chaos', min: 0, max: 2, step: 0.02, default: 0.6 },
      { key: 'symmetry', label: 'Symmetry', min: 1, max: 12, step: 1, default: 1 },
      { key: 'sourceMix', label: 'Source Mix', min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
    run(w, paramsRef) {
      const { src, noise } = w;
      const { s0, s1, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .repeatX(() => P.sliceCount, () => P.sliceOffset)
        .modulateRotate(noise(4, () => P.sliceSpeed), () => P.rotationJitter, () => P.sliceSpeed)
        .scale(() => P.panelGap)
        .layer(src(s1).mult(noise(() => P.sliceCount * 2, () => P.chaos * 0.5)).mask(src(s0)).color(1, 1, 1, () => P.sourceMix))
        .kaleid(() => P.symmetry)
        .posterize(() => Math.round(2 + P.colorBlocks * 14), 0.6)
        .contrast(() => P.edgeContrast)
        .modulateScrollX(noise(6, () => P.sliceSpeed * 0.4), () => P.chaos * 0.05, () => P.sliceSpeed)
        .out(o0);
    },
  },

  {
    id: 'aurora',
    category: 'core',
    name: 'Aurora',
    blurb: 'Atmospheric colour wash, slow drift.',
    params: [
      { key: 'washIntensity', label: 'Wash Intensity', min: 0, max: 1, step: 0.01, default: 0.55 },
      { key: 'hueDriftSpeed', label: 'Hue Drift Speed', min: 0, max: 1, step: 0.01, default: 0.15 },
      { key: 'colorSpread', label: 'Colour Spread', min: 1, max: 20, step: 0.2, default: 6 },
      { key: 'softness', label: 'Softness', min: 0.02, max: 0.6, step: 0.01, default: 0.25 },
      { key: 'layerOpacity', label: 'Layer Opacity', min: 0, max: 1, step: 0.01, default: 0.6 },
      { key: 'warmCoolBalance', label: 'Warm / Cool', min: -1, max: 1, step: 0.01, default: 0.1 },
      { key: 'verticalFlow', label: 'Vertical Flow', min: -1, max: 1, step: 0.01, default: 0.1 },
      { key: 'horizontalFlow', label: 'Horizontal Flow', min: -1, max: 1, step: 0.01, default: 0 },
      { key: 'glow', label: 'Glow', min: -0.3, max: 0.5, step: 0.01, default: 0.08 },
      { key: 'faceVisibility', label: 'Face Visibility', min: 0, max: 1, step: 0.01, default: 0.45 },
    ],
    run(w, paramsRef) {
      const { src, osc } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      osc(() => P.colorSpread, 0.05, () => P.hueDriftSpeed)
        .color(() => 0.6 + P.warmCoolBalance * 0.3, 0.55, () => 0.65 - P.warmCoolBalance * 0.3, 1)
        .scrollX(() => P.horizontalFlow * 0.1, () => P.horizontalFlow * 0.05)
        .scrollY(() => P.verticalFlow * 0.1, () => P.verticalFlow * 0.05)
        .brightness(() => P.glow)
        .blend(src(s0).luma(() => P.softness, () => P.softness * 0.8), () => P.washIntensity)
        .layer(src(s0).color(1, 1, 1, () => P.faceVisibility * P.layerOpacity))
        .out(o0);
    },
  },

  {
    id: 'membrane',
    category: 'core',
    name: 'Membrane',
    blurb: 'Stretched tissue, exclusion and hard-mix.',
    params: [
      { key: 'stretch', label: 'Stretch', min: 0.5, max: 3, step: 0.02, default: 1.4 },
      { key: 'tissueDensity', label: 'Tissue Density', min: 1, max: 8, step: 1, default: 3 },
      { key: 'translucency', label: 'Translucency', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'veinContrast', label: 'Vein Contrast', min: 0.5, max: 3, step: 0.02, default: 1.6 },
      { key: 'pulseRate', label: 'Pulse Rate', min: 0, max: 2, step: 0.02, default: 0.5 },
      { key: 'fragmentJitter', label: 'Fragment Jitter', min: 0, max: 2, step: 0.02, default: 0.4 },
      { key: 'hardmixIntensity', label: 'Hardmix Intensity', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'exclusionIntensity', label: 'Exclusion Intensity', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'colorUndertone', label: 'Colour Undertone', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'grain', label: 'Grain', min: 0, max: 1, step: 0.01, default: 0.2 },
    ],
    run(w, paramsRef) {
      const { src, noise } = w;
      const { s0, s2, s3, o0 } = w;
      const P = paramsRef.current;

      src(s3)
        .scale(() => P.stretch, 1, () => P.stretch * 0.6)
        .repeat(() => P.tissueDensity, () => P.tissueDensity)
        .modulateScale(noise(6, () => P.pulseRate), () => P.fragmentJitter * 0.1, () => 1 - P.fragmentJitter * 0.05)
        .layer(src(s2).scale(() => P.stretch * 0.8).repeat(() => P.tissueDensity, () => P.tissueDensity))
        .excl(src(s0), () => P.exclusionIntensity)
        .hardmix(src(s0).posterize(4), () => P.hardmixIntensity)
        .luma(() => P.translucency * 0.4, 0.3)
        .contrast(() => P.veinContrast)
        .color(() => 1 - P.colorUndertone * 0.2, 1, () => 1 - P.colorUndertone * 0.4)
        .add(noise(() => 40 + P.grain * 60, 2).luma(0.5, 0.3), () => P.grain * 0.3)
        .out(o0);
    },
  },

  {
    id: 'entropy',
    category: 'core',
    name: 'Entropy',
    blurb: 'Maximal chaos — everything, at once.',
    params: [
      { key: 'chaosAmount', label: 'Chaos Amount', min: 0, max: 2, step: 0.02, default: 0.8 },
      { key: 'kaleidSides', label: 'Kaleid Sides', min: 1, max: 30, step: 1, default: 9 },
      { key: 'voronoiTurbulence', label: 'Voronoi Turbulence', min: 0, max: 3, step: 0.02, default: 1 },
      { key: 'noiseGrain', label: 'Noise Grain', min: 1, max: 60, step: 1, default: 20 },
      { key: 'feedbackRunaway', label: 'Feedback Runaway', min: 0, max: 0.92, step: 0.01, default: 0.4 },
      { key: 'colorShiftSpeed', label: 'Colour Shift Speed', min: 0, max: 3, step: 0.02, default: 1 },
      { key: 'pixelShatter', label: 'Pixel Shatter', min: 4, max: 200, step: 2, default: 40 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: -2, max: 2, step: 0.02, default: 0.5 },
      { key: 'contrastExtreme', label: 'Contrast Extreme', min: 0.5, max: 4, step: 0.02, default: 2 },
      { key: 'seed', label: 'Seed', min: 0, max: 100, step: 1, default: 0 },
    ],
    run(w, paramsRef) {
      const { src, noise, voronoi, osc } = w;
      const { s0, s1, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .layer(src(s1))
        .modulate(voronoi(() => 3 + P.voronoiTurbulence * 10 + P.seed * 0.05, () => P.voronoiTurbulence, 0.3), () => P.chaosAmount * 0.4)
        .kaleid(() => P.kaleidSides)
        .modulateRotate(noise(4, () => P.chaosAmount), () => P.chaosAmount, () => P.rotationSpeed)
        .pixelate(() => P.pixelShatter, () => P.pixelShatter)
        .modulateHue(osc(() => P.colorShiftSpeed * 4 + P.seed * 0.1, 0.1, () => P.colorShiftSpeed), () => P.chaosAmount)
        .add(noise(() => P.noiseGrain, () => P.chaosAmount), () => P.chaosAmount * 0.25)
        .contrast(() => P.contrastExtreme)
        .blend(o0, () => P.feedbackRunaway)
        .out(o0);
    },
  },

  /* ============================================================
     3D — pseudo-depth: parallax, stereo, extrusion
     ============================================================ */

  {
    id: 'parallaxDepth',
    category: '3d',
    name: 'Parallax Depth',
    blurb: 'Stacked depth planes, mouse-driven perspective.',
    params: [
      { key: 'mouseParallax', label: 'Mouse Parallax', min: 0, max: 3, step: 0.02, default: 1 },
      { key: 'stackSpacing', label: 'Stack Spacing', min: 0, max: 3, step: 0.02, default: 1 },
      { key: 'stackShrink', label: 'Stack Shrink', min: 0, max: 2, step: 0.02, default: 0.6 },
      { key: 'fogAmount', label: 'Depth Fog', min: 0, max: 2, step: 0.02, default: 0.7 },
      { key: 'rimLight', label: 'Rim Light', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'rimColor', label: 'Rim Colour', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'rotation3D', label: 'Rotation (Y)', min: -2, max: 2, step: 0.02, default: 0.3 },
      { key: 'verticalTilt', label: 'Tilt (X)', min: -2, max: 2, step: 0.02, default: 0 },
      { key: 'fieldOfView', label: 'Field Of View', min: 0.6, max: 1.6, step: 0.01, default: 1 },
      { key: 'ambientTone', label: 'Ambient Tone', min: -1, max: 1, step: 0.01, default: 0.2 },
    ],
    run(w, paramsRef) {
      const { src, noise } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const mx = () => -w.mouse.x / 1000 + 0.5;
      const my = () => -w.mouse.y / 1000 + 0.5;
      const edges = () => src(s0).diff(src(s0).scale(1.02)).luma(0.06, 0.05);

      let chain = src(s0)
        .scale(() => P.fieldOfView)
        .modulateRotate(noise(3, 0.05), () => Math.abs(P.rotation3D) * 0.2, () => P.rotation3D * 0.3);

      for (let depth = 1; depth <= 4; depth++) {
        chain = chain.layer(
          src(s0)
            .scale(
              () => P.fieldOfView * (1 - P.stackShrink * depth * 0.1),
              1,
              1,
              () => 0.5 + (mx() - 0.5) * P.mouseParallax * depth * 0.1,
              () => 0.5 + (my() - 0.5) * P.mouseParallax * depth * 0.1 + P.verticalTilt * depth * 0.02
            )
            .scrollY(() => P.stackSpacing * depth * 0.015, 0)
            .brightness(() => -P.fogAmount * depth * 0.12)
            .saturate(() => Math.max(0.2, 1 - P.fogAmount * depth * 0.15))
            .color(1, 1, () => 1 + P.ambientTone * 0.3, () => Math.max(0, 1 - depth * 0.16))
        );
      }

      chain
        .layer(
          edges().color(
            () => 1 - P.rimColor * 0.5,
            () => 0.5 + P.rimColor * 0.5,
            () => 0.5 + P.rimColor * 0.3,
            () => P.rimLight
          )
        )
        .out(o0);
    },
  },

  {
    id: 'anaglyph',
    category: '3d',
    name: 'Anaglyph',
    blurb: 'Red/cyan stereo offset — put on the glasses.',
    params: [
      { key: 'eyeSeparation', label: 'Eye Separation', min: 0, max: 0.15, step: 0.001, default: 0.03 },
      { key: 'depthWarp', label: 'Depth Warp', min: 0, max: 2, step: 0.02, default: 0.5 },
      { key: 'redBalance', label: 'Red Balance', min: 0, max: 2, step: 0.02, default: 1 },
      { key: 'cyanBalance', label: 'Cyan Balance', min: 0, max: 2, step: 0.02, default: 1 },
      { key: 'convergence', label: 'Convergence', min: -0.05, max: 0.05, step: 0.001, default: 0 },
      { key: 'grain', label: 'Grain', min: 0, max: 1, step: 0.01, default: 0.15 },
      { key: 'warpAmount', label: 'Warp Amount', min: 0, max: 2, step: 0.02, default: 0.3 },
      { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.3 },
      { key: 'brightnessAmt', label: 'Brightness', min: -0.3, max: 0.3, step: 0.01, default: 0 },
    ],
    run(w, paramsRef) {
      const { src, noise, shape } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      const base = () =>
        src(s0).modulateScale(noise(4, 0.1), () => P.depthWarp * 0.05, () => 1 - P.depthWarp * 0.02);

      base()
        .scrollX(() => P.eyeSeparation + P.convergence, 0)
        .color(() => P.redBalance, 0, 0)
        .add(
          base()
            .scrollX(() => -P.eyeSeparation + P.convergence, 0)
            .color(0, () => P.cyanBalance, () => P.cyanBalance),
          1
        )
        .modulateScale(noise(6, 0.15), () => P.warpAmount * 0.03, () => 1 - P.warpAmount * 0.015)
        .add(noise(200, () => P.grain * 3).luma(0.5, 0.4), () => P.grain * 0.2)
        .mask(shape(80, () => 0.5 - P.vignette * 0.15, 0.25))
        .contrast(() => P.contrastAmt)
        .brightness(() => P.brightnessAmt)
        .out(o0);
    },
  },

  {
    id: 'wireframeExtrude',
    category: '3d',
    name: 'Wireframe Extrude',
    blurb: 'Edge-lit mesh lines, extruded into depth.',
    params: [
      { key: 'lineThickness', label: 'Line Thickness', min: 0.005, max: 0.15, step: 0.002, default: 0.04 },
      { key: 'extrudeSpacing', label: 'Extrude Spacing', min: 0, max: 3, step: 0.02, default: 1 },
      { key: 'extrudeFalloff', label: 'Extrude Falloff', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'glowColor', label: 'Glow Colour', min: 0, max: 1, step: 0.01, default: 0.55 },
      { key: 'glowIntensity', label: 'Glow Intensity', min: 0, max: 2, step: 0.02, default: 1 },
      { key: 'gridDensity', label: 'Grid Density', min: 2, max: 60, step: 1, default: 18 },
      { key: 'gridOpacity', label: 'Grid Opacity', min: 0, max: 1, step: 0.01, default: 0.25 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: -1, max: 1, step: 0.01, default: 0.15 },
      { key: 'backgroundDarkness', label: 'Background Darkness', min: 0, max: 1, step: 0.01, default: 0.85 },
      { key: 'meshDistortion', label: 'Mesh Distortion', min: 0, max: 2, step: 0.02, default: 0.3 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc, solid } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      const wire = (offset) =>
        src(s0)
          .modulateRotate(noise(4, 0.1), () => P.meshDistortion * 0.15, () => offset * 0.02 + P.rotationSpeed)
          .scale(() => 1 + offset * P.extrudeSpacing * 0.03)
          .diff(src(s0).scale(() => 1 + offset * P.extrudeSpacing * 0.03 + P.lineThickness))
          .luma(() => 0.03 + P.lineThickness * 0.1, 0.04)
          .color(
            () => 1 - P.glowColor * 0.5,
            () => 0.4 + P.glowColor * 0.6,
            () => 0.6 + P.glowColor * 0.4,
            () => P.glowIntensity * (1 - offset * P.extrudeFalloff * 0.2)
          );

      solid(() => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, 1)
        .layer(wire(4))
        .layer(wire(3))
        .layer(wire(2))
        .layer(wire(1))
        .layer(wire(0))
        .layer(
          osc(() => P.gridDensity, 0, 0.5)
            .add(osc(() => P.gridDensity, 0, 0.5).rotate(1.5708), 1)
            .thresh(0.85, 0.05)
            .color(
              () => 1 - P.glowColor * 0.5,
              () => 0.4 + P.glowColor * 0.6,
              () => 0.6 + P.glowColor * 0.4,
              () => P.gridOpacity
            )
        )
        .out(o0);
    },
  },

  /* ============================================================
     SURVEILLANCE — neon core: CCTV, cyberpunk edges, thermal, multi-feed
     ============================================================ */

  {
    id: 'cctvGrid',
    category: 'surveillance',
    name: 'CCTV Grid',
    blurb: 'Monochrome scan, targeting reticle, VHS grain.',
    params: [
      { key: 'tintHue', label: 'Tint Hue', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'scanlineDensity', label: 'Scanline Density', min: 2, max: 200, step: 2, default: 90 },
      { key: 'scanlineOpacity', label: 'Scanline Opacity', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'grainAmount', label: 'Grain', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'vignetteAmt', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'reticleSize', label: 'Reticle Size', min: 0.1, max: 0.9, step: 0.01, default: 0.55 },
      { key: 'reticleOpacity', label: 'Reticle Opacity', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'flicker', label: 'Flicker', min: 0, max: 1, step: 0.01, default: 0.15 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.6 },
      { key: 'sweepSpeed', label: 'Sweep Speed', min: 0, max: 2, step: 0.02, default: 0.4 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc, shape } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .luma(0.15, 0.5)
        .color(() => 0.15 + P.tintHue * 0.1, () => 0.7 + P.tintHue * 0.2, () => 0.15 + P.tintHue * 0.5)
        .contrast(() => P.contrastAmt)
        .modulateScale(noise(3, () => P.flicker * 2), 0, () => 1 - P.flicker * 0.03)
        .layer(osc(1, 0, 0).scrollY(0, () => P.sweepSpeed * 0.1).thresh(0.96, 0.03).color(1, 1, 1, 0.35))
        .add(osc(() => P.scanlineDensity, 0, 0).thresh(0.5, 0.5), () => P.scanlineOpacity * -0.4)
        .add(noise(250, 2).luma(0.5, 0.4), () => P.grainAmount * 0.3)
        .layer(
          shape(4, () => P.reticleSize, 0.01)
            .thresh(0.4, 0.35)
            .color(() => 0.2 + P.tintHue * 0.1, 0.9, () => 0.2 + P.tintHue * 0.3, () => P.reticleOpacity * 0.5)
        )
        .mask(shape(60, () => 0.5 - P.vignetteAmt * 0.15, 0.3))
        .out(o0);
    },
  },

  {
    id: 'neonGrid',
    category: 'surveillance',
    name: 'Neon Grid',
    blurb: 'Cyberpunk edge glow, two-tone neon, bloom trails.',
    params: [
      { key: 'neonHueA', label: 'Neon Hue A', min: 0, max: 1, step: 0.01, default: 0.85 },
      { key: 'neonHueB', label: 'Neon Hue B', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'edgeGlow', label: 'Edge Glow', min: 0, max: 2, step: 0.02, default: 1 },
      { key: 'glowSpread', label: 'Glow Spread', min: 0, max: 0.9, step: 0.01, default: 0.4 },
      { key: 'gridDensity', label: 'Grid Density', min: 2, max: 60, step: 1, default: 14 },
      { key: 'gridOpacity', label: 'Grid Opacity', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.2 },
      { key: 'backgroundDarkness', label: 'Background Darkness', min: 0, max: 1, step: 0.01, default: 0.92 },
      { key: 'pulseSpeed', label: 'Pulse Speed', min: 0, max: 2, step: 0.02, default: 0.5 },
      { key: 'chromaShift', label: 'Chroma Shift', min: 0, max: 0.1, step: 0.001, default: 0.015 },
    ],
    run(w, paramsRef) {
      const { src, osc, solid } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      const edges = () => src(s0).diff(src(s0).scale(1.015)).luma(0.05, 0.05);

      solid(() => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, 1)
        .layer(
          edges()
            .shift(() => P.chromaShift, 0, () => P.chromaShift * 1.5)
            .color(1, () => 0.1 + P.neonHueA * 0.2, () => 0.5 + P.neonHueA * 0.5, () => P.edgeGlow * 0.6)
        )
        .layer(
          edges()
            .scale(1.03)
            .color(() => 0.1 + P.neonHueB * 0.3, () => 0.5 + P.neonHueB * 0.5, 1, () => P.edgeGlow * 0.4)
        )
        .add(
          osc(() => P.gridDensity, 0, () => P.pulseSpeed)
            .add(osc(() => P.gridDensity, 0, () => P.pulseSpeed).rotate(1.5708), 1)
            .thresh(0.9, 0.04),
          () => P.gridOpacity * 0.5
        )
        .saturate(() => P.saturationAmt)
        .blend(o0, () => P.glowSpread)
        .out(o0);
    },
  },

  {
    id: 'thermalScan',
    category: 'surveillance',
    name: 'Thermal Scan',
    blurb: 'False-colour heat map, scanning sweep.',
    params: [
      { key: 'coldHue', label: 'Cold Hue', min: 0, max: 1, step: 0.01, default: 0.62 },
      { key: 'hotHue', label: 'Hot Hue', min: 0, max: 1, step: 0.01, default: 0.02 },
      { key: 'thresholdLow', label: 'Threshold Low', min: 0, max: 1, step: 0.01, default: 0.25 },
      { key: 'thresholdMid', label: 'Threshold Mid', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'thresholdHigh', label: 'Threshold High', min: 0, max: 1, step: 0.01, default: 0.75 },
      { key: 'bandSoftness', label: 'Band Softness', min: 0.02, max: 0.4, step: 0.01, default: 0.12 },
      { key: 'sweepSpeed', label: 'Sweep Speed', min: 0, max: 2, step: 0.02, default: 0.3 },
      { key: 'sweepWidth', label: 'Sweep Width', min: 0.01, max: 0.3, step: 0.01, default: 0.05 },
      { key: 'noiseAmount', label: 'Noise', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.4 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const grayFace = () => src(s0).luma(0.05, 0.5).contrast(() => P.contrastAmt);

      grayFace()
        .mask(grayFace().thresh(() => P.thresholdLow, () => P.bandSoftness).invert())
        .color(() => 0.05 + P.coldHue * 0.3, () => 0.05 + P.coldHue * 0.2, () => 0.3 + P.coldHue * 0.5)
        .layer(
          grayFace()
            .mask(grayFace().thresh(() => P.thresholdMid, () => P.bandSoftness))
            .color(0.9, () => 0.7 - P.hotHue * 0.3, () => 0.1 + P.hotHue * 0.2)
        )
        .layer(
          grayFace()
            .mask(grayFace().thresh(() => P.thresholdHigh, () => P.bandSoftness))
            .color(1, () => 0.9 - P.hotHue * 0.5, () => P.hotHue * 0.3)
        )
        .layer(osc(1, 0, 0).scrollY(0, () => P.sweepSpeed * 0.08).thresh(() => 1 - P.sweepWidth, 0.02).color(1, 1, 1, 0.4))
        .add(noise(180, 1).luma(0.5, 0.3), () => P.noiseAmount * 0.25)
        .out(o0);
    },
  },

  {
    id: 'panopticon',
    category: 'surveillance',
    name: 'Panopticon',
    blurb: 'Four feeds, layered — a wall of watching eyes.',
    params: [
      { key: 'glitchAmount', label: 'Glitch Amount', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'scanlineOpacity', label: 'Scanline Opacity', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'tintVariance', label: 'Tint Variance', min: 0, max: 1, step: 0.01, default: 0.6 },
      { key: 'noiseAmount', label: 'Noise', min: 0, max: 1, step: 0.01, default: 0.25 },
      { key: 'feedOffset', label: 'Feed Offset', min: 0, max: 0.2, step: 0.002, default: 0.04 },
      { key: 'flicker', label: 'Flicker', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'zoomVariance', label: 'Zoom Variance', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'desaturation', label: 'Desaturation', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'vignetteAmt', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'feedDelay', label: 'Feed Delay', min: 0, max: 0.85, step: 0.01, default: 0.15 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc, shape } = w;
      const { s0, s1, s2, s3, o0 } = w;
      const P = paramsRef.current;

      const feed = (source, tintR, tintG, tintB, dx, dy, phase) =>
        src(source)
          .scrollX(() => dx * P.feedOffset, 0)
          .scrollY(() => dy * P.feedOffset, 0)
          .modulateScale(noise(4, () => 0.3 + phase), () => P.glitchAmount * 0.12, () => 1 - P.zoomVariance * 0.08)
          .saturate(() => 1 - P.desaturation)
          .color(
            () => 1 - P.tintVariance * (1 - tintR),
            () => 1 - P.tintVariance * (1 - tintG),
            () => 1 - P.tintVariance * (1 - tintB),
            0.5
          )
          .add(osc(140, 0, 0).thresh(0.5, 0.5), () => -P.scanlineOpacity * 0.25)
          .brightness(() => Math.sin(phase * 6.28) * P.flicker * 0.08);

      feed(s0, 0.6, 1, 1, -1, 1, 0.1)
        .layer(feed(s1, 1, 0.6, 1, 1, 1, 0.35))
        .layer(feed(s2, 1, 1, 0.6, -1, -1, 0.6))
        .layer(feed(s3, 0.7, 0.8, 1, 1, -1, 0.85))
        .add(noise(200, 2).luma(0.5, 0.4), () => P.noiseAmount * 0.2)
        .blend(o0, () => P.feedDelay)
        .mask(shape(60, () => 0.55 - P.vignetteAmt * 0.15, 0.3))
        .out(o0);
    },
  },

  /* ============================================================
     SURGICAL — clinical markings, cross-section, radiograph
     ============================================================ */

  {
    id: 'surgicalGrid',
    category: 'surgical',
    name: 'Surgical Grid',
    blurb: 'Clinical markings, measurement lines, incision paths.',
    params: [
      { key: 'skinDesaturation', label: 'Skin Desaturation', min: 0, max: 1, step: 0.01, default: 0.6 },
      { key: 'gridDensity', label: 'Grid Density', min: 2, max: 60, step: 1, default: 24 },
      { key: 'gridOpacity', label: 'Grid Opacity', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'incisionThreshold', label: 'Incision Threshold', min: 0.01, max: 0.3, step: 0.005, default: 0.06 },
      { key: 'incisionColor', label: 'Incision Colour', min: 0, max: 1, step: 0.01, default: 0.02 },
      { key: 'incisionGlow', label: 'Incision Glow', min: 0, max: 2, step: 0.02, default: 1 },
      { key: 'paperTone', label: 'Paper Tone', min: 0, max: 1, step: 0.01, default: 0.15 },
      { key: 'markerDots', label: 'Marker Dots', min: 0, max: 40, step: 1, default: 14 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 2.5, step: 0.02, default: 1.2 },
      { key: 'cleanliness', label: 'Cleanliness', min: -0.3, max: 0.5, step: 0.01, default: 0.15 },
    ],
    run(w, paramsRef) {
      const { src, osc, voronoi } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const edges = () => src(s0).diff(src(s0).scale(1.012)).luma(() => P.incisionThreshold, 0.04);

      src(s0)
        .saturate(() => 1 - P.skinDesaturation)
        .color(() => 1 - P.paperTone * 0.05, () => 1 - P.paperTone * 0.1, () => 1 - P.paperTone * 0.02)
        .contrast(() => P.contrastAmt)
        .brightness(() => P.cleanliness)
        .layer(edges().color(() => 0.85 + P.incisionColor * 0.15, 0.05, () => 0.05 + P.incisionColor * 0.1, () => P.incisionGlow))
        .add(
          osc(() => P.gridDensity, 0, 0).add(osc(() => P.gridDensity, 0, 0).rotate(1.5708), 1).thresh(0.92, 0.03),
          () => P.gridOpacity * 0.4
        )
        .layer(voronoi(() => P.markerDots + 2, 0, 0.15).thresh(0.94, 0.02).color(0.85, 0.05, 0.05, 0.5))
        .out(o0);
    },
  },

  {
    id: 'anatomicalLayers',
    category: 'surgical',
    name: 'Anatomical Layers',
    blurb: 'Cross-section bands — skin, muscle, bone.',
    params: [
      { key: 'layerSeparation', label: 'Layer Separation', min: 0, max: 0.3, step: 0.005, default: 0.08 },
      { key: 'muscleColor', label: 'Muscle Tone', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'boneColor', label: 'Bone Tone', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'skinColor', label: 'Skin Tone', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'bandCount', label: 'Band Count', min: 2, max: 10, step: 1, default: 4 },
      { key: 'exclusionAmt', label: 'Exclusion', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'hardmixAmt', label: 'Hard Mix', min: 0, max: 1, step: 0.01, default: 0.25 },
      { key: 'fragmentSpread', label: 'Fragment Spread', min: 0, max: 2, step: 0.02, default: 0.6 },
      { key: 'translucency', label: 'Translucency', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'depthShading', label: 'Depth Shading', min: 0, max: 1, step: 0.01, default: 0.4 },
    ],
    run(w, paramsRef) {
      const { src } = w;
      const { s0, s1, s2, s3, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .posterize(() => P.bandCount, 0.5)
        .layer(
          src(s1)
            .scale(() => 1 + P.fragmentSpread * 0.1)
            .scrollX(() => P.layerSeparation, 0)
            .excl(src(s0), () => P.exclusionAmt)
            .color(
              () => 0.6 + P.muscleColor * 0.3,
              () => 0.05 + P.muscleColor * 0.1,
              () => 0.05 + P.muscleColor * 0.05,
              () => P.translucency
            )
        )
        .layer(
          src(s2)
            .layer(s3)
            .scale(() => 1 + P.fragmentSpread * 0.05)
            .scrollY(() => -P.layerSeparation, 0)
            .hardmix(src(s0).posterize(3), () => P.hardmixAmt)
            .color(
              () => 0.85 + P.boneColor * 0.15,
              () => 0.82 + P.boneColor * 0.1,
              () => 0.7 + P.boneColor * 0.2,
              () => P.translucency * 0.8
            )
        )
        .mult(src(s0).brightness(() => -P.depthShading * 0.3), () => P.depthShading)
        .color(() => 1 - (1 - P.skinColor) * 0.1, () => 1 - (1 - P.skinColor) * 0.15, () => 1 - (1 - P.skinColor) * 0.2)
        .out(o0);
    },
  },

  {
    id: 'xrayScan',
    category: 'surgical',
    name: 'X-Ray Scan',
    blurb: 'Radiographic density, bone-white edges, scan sweep.',
    params: [
      { key: 'invertAmt', label: 'Invert', min: 0, max: 1, step: 0.01, default: 0.85 },
      { key: 'boneWhite', label: 'Bone White', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.8 },
      { key: 'blueTint', label: 'Blue Tint', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'edgeEmphasis', label: 'Edge Emphasis', min: 0, max: 2, step: 0.02, default: 0.8 },
      { key: 'scanSweepSpeed', label: 'Sweep Speed', min: 0, max: 2, step: 0.02, default: 0.35 },
      { key: 'scanSweepWidth', label: 'Sweep Width', min: 0.01, max: 0.3, step: 0.01, default: 0.06 },
      { key: 'grainAmount', label: 'Grain', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'densityBands', label: 'Density Bands', min: 2, max: 12, step: 1, default: 6 },
      { key: 'vignetteAmt', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.45 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc, shape } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const edges = () => src(s0).diff(src(s0).scale(1.015)).luma(0.05, 0.05);

      src(s0)
        .luma(0.02, 0.6)
        .posterize(() => P.densityBands, 0.5)
        .invert(() => P.invertAmt)
        .contrast(() => P.contrastAmt)
        .color(() => 1 - P.blueTint * 0.15, () => 1 - P.blueTint * 0.05, 1)
        .layer(edges().color(1, 1, 1, () => P.edgeEmphasis * P.boneWhite))
        .layer(
          osc(1, 0, 0)
            .scrollY(0, () => P.scanSweepSpeed * 0.08)
            .thresh(() => 1 - P.scanSweepWidth, 0.02)
            .color(() => 0.6 + P.boneWhite * 0.4, 0.9, 1, 0.35)
        )
        .add(noise(200, 1).luma(0.5, 0.4), () => P.grainAmount * 0.2)
        .mask(shape(60, () => 0.5 - P.vignetteAmt * 0.15, 0.3))
        .out(o0);
    },
  },

  /* ============================================================
     ELABORATE — multi-buffer feedback, cross-modulation, layered scenes.
     Every mode below uses at least two of: cross-buffer feedback (o0
     reads its own prior frame while o1/o2 feed fresh or secondary
     content into it), cross-modulation (one generator's output warps
     another generator, not just the source face), or multi-octave
     layering (several noise/voronoi scales combined before use).
     ============================================================ */

  {
    id: 'cathedral',
    category: 'elaborate',
    name: 'Cathedral',
    blurb: 'Rose-window symmetry, leaded glass, radiant bands.',
    params: [
      { key: 'kaleidSides', label: 'Kaleid Sides', min: 3, max: 24, step: 1, default: 8 },
      { key: 'windowRings', label: 'Window Rings', min: 1, max: 8, step: 1, default: 4 },
      { key: 'glassBands', label: 'Glass Bands', min: 2, max: 12, step: 1, default: 6 },
      { key: 'leadLineWeight', label: 'Lead Line Weight', min: 0.01, max: 0.2, step: 0.005, default: 0.05 },
      { key: 'hueSpread', label: 'Hue Spread', min: 0, max: 3, step: 0.02, default: 1.2 },
      { key: 'radiance', label: 'Radiance', min: 0, max: 1.5, step: 0.02, default: 0.6 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: -1, max: 1, step: 0.01, default: 0.12 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2 },
      { key: 'archHeight', label: 'Arch Height', min: 0.6, max: 2, step: 0.02, default: 1.2 },
      { key: 'lightShaft', label: 'Light Shaft', min: 0, max: 1, step: 0.01, default: 0.4 },
    ],
    run(w, paramsRef) {
      const { src, osc, shape, voronoi } = w;
      const { s0, s2, s3, o0, o1, o2, o3 } = w;
      const P = paramsRef.current;

      // o1: the "glass" — face fragments posterized into jewel-tone bands
      src(s0)
        .layer(src(s2).scale(1.15))
        .layer(src(s3).scale(1.08))
        .scale(1, () => P.archHeight, 1)
        .posterize(() => P.glassBands, 0.4)
        .modulateHue(osc(() => P.hueSpread * 8 + 2, 0.1, () => P.hueSpread), () => P.hueSpread)
        .saturate(() => P.saturationAmt)
        .out(o1);

      // o2: concentric "lead came" rings, cross-modulated by cell noise.
      // shape()'s background is opaque (alpha 1), not transparent — luma()
      // derives real per-pixel alpha from brightness so the rings can sit
      // over the glass instead of blotting it out.
      shape(() => P.kaleidSides * 2, 0.85, () => P.leadLineWeight)
        .layer(shape(() => P.kaleidSides * 2, 0.6, () => P.leadLineWeight))
        .layer(shape(() => P.kaleidSides * 2, 0.35, () => P.leadLineWeight))
        .modulateScale(voronoi(() => P.windowRings * 2, 0.05, 0.3), 0.1)
        .luma(0.3, 0.15)
        .out(o2);

      // o3: a slow radiant light shaft sweeping across — same luma fix
      osc(1, 0, 0)
        .rotate(0.7)
        .scrollX(0, () => P.lightShaft * 0.06)
        .color(1, 0.95, 0.8)
        .luma(() => 1 - P.lightShaft * 0.3, 0.08)
        .out(o3);

      src(o1)
        .kaleid(() => P.kaleidSides)
        .rotate(0, () => P.rotationSpeed)
        .layer(src(o2).kaleid(() => P.kaleidSides))
        .layer(src(o3).kaleid(() => P.kaleidSides))
        .contrast(() => 1 + P.radiance * 0.4)
        .brightness(() => P.radiance * 0.08)
        .out(o0);
    },
  },

  {
    id: 'deepFeedback',
    category: 'elaborate',
    name: 'Deep Feedback',
    blurb: 'A camera pointed at its own monitor — recursive, drifting, folding.',
    params: [
      { key: 'feedbackZoom', label: 'Feedback Zoom', min: 0.9, max: 1.1, step: 0.001, default: 1.015 },
      { key: 'feedbackRotate', label: 'Feedback Rotate', min: -0.05, max: 0.05, step: 0.001, default: 0.008 },
      { key: 'feedbackHueDrift', label: 'Hue Drift', min: 0, max: 0.05, step: 0.001, default: 0.008 },
      { key: 'trailPersistence', label: 'Trail Persistence', min: 0.5, max: 0.97, step: 0.005, default: 0.88 },
      { key: 'seedInjection', label: 'Seed Injection', min: 0, max: 0.3, step: 0.005, default: 0.06 },
      { key: 'secondaryEcho', label: 'Secondary Echo', min: 0, max: 0.6, step: 0.01, default: 0.2 },
      { key: 'colorBleed', label: 'Colour Bleed', min: 0, max: 0.05, step: 0.001, default: 0.006 },
      { key: 'symmetryFold', label: 'Symmetry Fold', min: 1, max: 12, step: 1, default: 1 },
      { key: 'decayFade', label: 'Decay Fade', min: 0, max: 0.1, step: 0.001, default: 0.01 },
      { key: 'centerPull', label: 'Centre Pull', min: -0.02, max: 0.02, step: 0.0005, default: 0.003 },
    ],
    run(w, paramsRef) {
      const { src, noise } = w;
      const { s0, o0, o1, o2 } = w;
      const P = paramsRef.current;

      // o1: fresh seed content, lightly warped — prevents total decay into abstraction
      src(s0).modulateScale(noise(4, 0.08), 0.03, 1).out(o1);

      // o2: a secondary echo — last frame's o0, re-folded differently
      src(o0)
        .scale(() => 1 + P.centerPull * 2)
        .kaleid(() => Math.max(1, P.symmetryFold))
        .hue(() => P.feedbackHueDrift * 3)
        .out(o2);

      // o0: the main recursive chamber — self-feeds with zoom/rotate/hue/decay,
      // topped up by fresh seed (o1) and the differently-folded echo (o2)
      src(o0)
        .scale(() => P.feedbackZoom, 1, 1, () => 0.5 + P.centerPull, 0.5)
        .rotate(() => P.feedbackRotate, 0)
        .hue(() => P.feedbackHueDrift)
        .shift(() => P.colorBleed, 0, () => P.colorBleed * 1.5)
        .brightness(() => -P.decayFade)
        .layer(src(o1).color(1, 1, 1, () => P.seedInjection))
        .layer(src(o2).color(1, 1, 1, () => P.secondaryEcho * 0.4))
        .kaleid(() => Math.max(1, P.symmetryFold))
        .contrast(() => 0.97 + P.trailPersistence * 0.03)
        .out(o0);
    },
  },

  {
    id: 'coralGrowth',
    category: 'elaborate',
    name: 'Coral Growth',
    blurb: 'Cross-scale cellular branching, reef colour, bleaching.',
    params: [
      { key: 'macroScale', label: 'Macro Scale', min: 1, max: 20, step: 0.5, default: 6 },
      { key: 'microScale', label: 'Micro Scale', min: 5, max: 80, step: 1, default: 28 },
      { key: 'branchDensity', label: 'Branch Density', min: 0, max: 2, step: 0.02, default: 0.8 },
      { key: 'growthSpeed', label: 'Growth Speed', min: 0, max: 1.5, step: 0.02, default: 0.25 },
      { key: 'coralHue', label: 'Coral Hue', min: 0, max: 1, step: 0.01, default: 0.05 },
      { key: 'bleachAmount', label: 'Bleach', min: 0, max: 1, step: 0.01, default: 0.15 },
      { key: 'polypDetail', label: 'Polyp Detail', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'faceVisibility', label: 'Face Visibility', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'depthGradient', label: 'Depth Gradient', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'pulseRate', label: 'Pulse Rate', min: 0, max: 2, step: 0.02, default: 0.4 },
    ],
    run(w, paramsRef) {
      const { src, voronoi, noise, solid } = w;
      const { s0, s2, o0 } = w;
      const P = paramsRef.current;

      const macro = () => voronoi(() => P.macroScale, () => P.growthSpeed, 0.3);
      const micro = () => voronoi(() => P.microScale, () => P.growthSpeed * 1.6, 0.15);
      // cross-scale: macro cells modulate where micro cells appear
      const branching = () => micro().modulateScale(macro(), () => P.branchDensity * 0.4);

      branching()
        .modulate(noise(() => P.polypDetail * 30 + 4, () => P.pulseRate), () => P.polypDetail * 0.15)
        .thresh(0.45, 0.25)
        .color(
          () => 0.9 - P.bleachAmount * 0.5,
          () => 0.4 + P.coralHue * 0.4 + P.bleachAmount * 0.4,
          () => 0.3 + P.coralHue * 0.3 + P.bleachAmount * 0.5
        )
        .layer(
          src(s0)
            .layer(s2)
            .mask(macro().thresh(0.55, 0.1))
            .color(1, 1, 1, () => P.faceVisibility)
        )
        .blend(
          solid(
            () => 0.05 + P.depthGradient * 0.1,
            () => 0.15 + P.depthGradient * 0.2,
            () => 0.3 + P.depthGradient * 0.3
          ),
          () => P.depthGradient * 0.35
        )
        .out(o0);
    },
  },

  {
    id: 'cathodeRay',
    category: 'elaborate',
    name: 'Cathode Ray',
    blurb: 'CRT screen — curvature, phosphor glow, subpixel mask, roll.',
    params: [
      { key: 'curvature', label: 'Curvature', min: 0, max: 0.5, step: 0.01, default: 0.15 },
      { key: 'scanlineIntensity', label: 'Scanline Intensity', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'phosphorGlow', label: 'Phosphor Glow', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'subpixelMask', label: 'Subpixel Mask', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'flicker', label: 'Flicker', min: 0, max: 1, step: 0.01, default: 0.15 },
      { key: 'colorBleed', label: 'Colour Bleed', min: 0, max: 0.05, step: 0.001, default: 0.012 },
      { key: 'vignetteAmt', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.55 },
      { key: 'rollGlitch', label: 'Roll Glitch', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'brightnessAmt', label: 'Brightness', min: -0.3, max: 0.3, step: 0.01, default: 0.05 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 2.5, step: 0.02, default: 1.2 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc, shape, voronoi } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      const curved = () =>
        src(s0).modulateScale(voronoi(2, 0, 0.5), () => P.curvature * 0.15, () => 1 - P.curvature * 0.08);

      curved()
        .modulateScrollY(noise(2, () => P.rollGlitch * 0.4), () => P.rollGlitch * 0.06, () => P.rollGlitch * 0.02)
        .shift(() => P.colorBleed, 0, () => P.colorBleed * 1.4)
        .saturate(() => P.saturationAmt)
        .layer(curved().brightness(() => P.phosphorGlow * 0.25).color(1, 1, 1, () => P.phosphorGlow * 0.35))
        .add(osc(260, 0, 0).thresh(0.5, 0.5), () => -P.subpixelMask * 0.15)
        .add(osc(320, 0, 0).rotate(1.5708).thresh(0.5, 0.5), () => -P.scanlineIntensity * 0.35)
        .modulateScale(noise(3, () => P.flicker * 3), 0, () => 1 - P.flicker * 0.02)
        .brightness(() => P.brightnessAmt)
        .mask(shape(80, () => 0.55 - P.vignetteAmt * 0.18, 0.28))
        .out(o0);
    },
  },

  {
    id: 'mobiusWeave',
    category: 'elaborate',
    name: 'Möbius Weave',
    blurb: 'Two kaleidoscopes cross-folded into an infinite braid.',
    params: [
      { key: 'primarySides', label: 'Primary Sides', min: 3, max: 20, step: 1, default: 7 },
      { key: 'secondarySides', label: 'Secondary Sides', min: 3, max: 20, step: 1, default: 5 },
      { key: 'weaveTightness', label: 'Weave Tightness', min: 0, max: 2, step: 0.02, default: 0.8 },
      { key: 'strandOffset', label: 'Strand Offset', min: 0, max: 0.3, step: 0.005, default: 0.08 },
      { key: 'colorAlternation', label: 'Colour Alternation', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'rotationSpeedA', label: 'Rotation A', min: -1, max: 1, step: 0.01, default: 0.2 },
      { key: 'rotationSpeedB', label: 'Rotation B', min: -1, max: 1, step: 0.01, default: -0.15 },
      { key: 'threadThickness', label: 'Thread Thickness', min: 2, max: 10, step: 1, default: 5 },
      { key: 'luminosity', label: 'Luminosity', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'strandMix', label: 'Strand Mix', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
    run(w, paramsRef) {
      const { src, osc } = w;
      const { s0, s1, s2, s3, o0, o1, o2 } = w;
      const P = paramsRef.current;

      // strand A: base + eyes, one kaleid family
      src(s0)
        .layer(src(s2).color(1, 1, 1, () => P.strandMix))
        .kaleid(() => P.primarySides)
        .rotate(0, () => P.rotationSpeedA)
        .scrollX(() => P.strandOffset, 0)
        .out(o1);

      // strand B: forechin + nose, a different kaleid family
      src(s1)
        .layer(src(s3).color(1, 1, 1, () => 1 - P.strandMix))
        .kaleid(() => P.secondarySides)
        .rotate(0, () => P.rotationSpeedB)
        .scrollX(() => -P.strandOffset, 0)
        .out(o2);

      // weave: each strand's kaleid is further distorted by the OTHER strand —
      // genuine cross-modulation, not just layering
      src(o1)
        .modulateKaleid(src(o2), () => P.primarySides)
        .layer(
          src(o2)
            .modulateKaleid(src(o1), () => P.secondarySides)
            .modulateHue(osc(() => P.threadThickness, 0, 0), () => P.colorAlternation)
            .color(1, 1, 1, () => P.weaveTightness * 0.5)
        )
        .posterize(() => P.threadThickness * 2, 0.5)
        .brightness(() => P.luminosity * 0.15 - 0.05)
        .out(o0);
    },
  },

  {
    id: 'solarFlare',
    category: 'elaborate',
    name: 'Solar Flare',
    blurb: 'Radial burst, bloom, corona — the face dissolving into light.',
    params: [
      { key: 'rayCount', label: 'Ray Count', min: 4, max: 40, step: 1, default: 16 },
      { key: 'rayIntensity', label: 'Ray Intensity', min: 0, max: 1.5, step: 0.02, default: 0.7 },
      { key: 'flareSpread', label: 'Flare Spread', min: 0, max: 0.15, step: 0.002, default: 0.04 },
      { key: 'coreHeat', label: 'Core Heat', min: 0, max: 1, step: 0.01, default: 0.6 },
      { key: 'bloomAmount', label: 'Bloom', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'secondaryFlares', label: 'Secondary Flares', min: 0, max: 6, step: 1, default: 3 },
      { key: 'dissolveAmount', label: 'Dissolve', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'rotationDrift', label: 'Rotation Drift', min: -1, max: 1, step: 0.01, default: 0.1 },
      { key: 'chromaticFringe', label: 'Chromatic Fringe', min: 0, max: 0.05, step: 0.001, default: 0.01 },
      { key: 'coronaReach', label: 'Corona Reach', min: 0.3, max: 1.5, step: 0.02, default: 0.8 },
    ],
    run(w, paramsRef) {
      const { src, shape } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      const rays = () =>
        w.osc(() => P.rayCount, 0, 0)
          .kaleid(() => P.rayCount)
          .rotate(0, () => P.rotationDrift)
          .thresh(() => 1 - P.rayIntensity * 0.4, 0.1)
          .color(1, () => 0.6 + P.coreHeat * 0.3, () => 0.2 + P.coreHeat * 0.2);

      src(s0)
        .blend(rays(), () => P.dissolveAmount * 0.6)
        .layer(rays().color(1, 0.9, 0.7, () => P.rayIntensity * 0.3))
        .modulateScale(rays(), () => P.flareSpread)
        .shift(() => P.chromaticFringe, 0, () => P.chromaticFringe * 1.5)
        .layer(
          shape(() => Math.max(3, P.secondaryFlares) * 2, 0.06, 0.15)
            .repeat(3, 3)
            .thresh(0.8, 0.15)
            .color(1, 1, () => 0.7 + P.coreHeat * 0.3, () => (P.secondaryFlares > 0 ? 0.35 : 0))
        )
        .brightness(() => P.bloomAmount * 0.25)
        .mask(shape(80, () => 0.4 + P.coronaReach * 0.3, 0.4))
        .out(o0);
    },
  },

  {
    id: 'tidal',
    category: 'elaborate',
    name: 'Tidal',
    blurb: 'Multi-octave turbulence, horizon gradient, reflection.',
    params: [
      { key: 'octave1Scale', label: 'Octave 1 Scale', min: 1, max: 10, step: 0.2, default: 3 },
      { key: 'octave2Scale', label: 'Octave 2 Scale', min: 4, max: 30, step: 0.5, default: 11 },
      { key: 'octave3Scale', label: 'Octave 3 Scale', min: 15, max: 80, step: 1, default: 34 },
      { key: 'turbulenceSpeed', label: 'Turbulence Speed', min: 0, max: 1.5, step: 0.02, default: 0.35 },
      { key: 'waveHeight', label: 'Wave Height', min: 0, max: 0.3, step: 0.005, default: 0.09 },
      { key: 'horizonLevel', label: 'Horizon Level', min: 0.1, max: 0.9, step: 0.01, default: 0.5 },
      { key: 'skyWarmth', label: 'Sky Warmth', min: -1, max: 1, step: 0.01, default: 0.2 },
      { key: 'seaDepth', label: 'Sea Depth', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'reflectionStrength', label: 'Reflection', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'foamThreshold', label: 'Foam Threshold', min: 0.5, max: 0.98, step: 0.01, default: 0.82 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc, solid } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      // three noise octaves at different scales/speeds, cross-modulated together
      const turbulence = () =>
        noise(() => P.octave1Scale, () => P.turbulenceSpeed)
          .modulateScale(noise(() => P.octave2Scale, () => P.turbulenceSpeed * 1.7), 0.15)
          .add(noise(() => P.octave3Scale, () => P.turbulenceSpeed * 2.4), 0.3);

      const skyMask = () => osc(0.6, 0, () => (P.horizonLevel - 0.5) * 2).rotate(1.5708).thresh(0.5, 0.35);
      const sky = () =>
        solid(() => 0.5 + P.skyWarmth * 0.3, () => 0.55 + P.skyWarmth * 0.15, () => 0.7 - P.skyWarmth * 0.2);
      const sea = () =>
        solid(() => 0.02 + P.seaDepth * 0.1, () => 0.1 + P.seaDepth * 0.2, () => 0.2 + P.seaDepth * 0.35);

      src(s0)
        .modulate(turbulence(), () => P.waveHeight)
        .layer(
          src(s0)
            .scale(1, -1, 1)
            .modulateScale(turbulence(), () => P.waveHeight * 0.5, 1)
            .color(1, 1, 1, () => P.reflectionStrength * 0.4)
            .mask(skyMask().invert())
        )
        .blend(sky().mask(skyMask()), 0.25)
        .blend(sea().mask(skyMask().invert()), 0.2)
        .layer(turbulence().thresh(() => P.foamThreshold, 0.03).color(1, 1, 1, 0.4))
        .out(o0);
    },
  },

  {
    id: 'crossStitch',
    category: 'elaborate',
    name: 'Cross-Stitch',
    blurb: 'Perpendicular weave patterns, glowing seams, fabric distortion.',
    params: [
      { key: 'weaveDensityX', label: 'Weave Density X', min: 4, max: 60, step: 1, default: 20 },
      { key: 'weaveDensityY', label: 'Weave Density Y', min: 4, max: 60, step: 1, default: 20 },
      { key: 'threadThickness', label: 'Thread Thickness', min: 0.05, max: 0.5, step: 0.01, default: 0.22 },
      { key: 'seamGlow', label: 'Seam Glow', min: 0, max: 1.5, step: 0.02, default: 0.6 },
      { key: 'warpDistortion', label: 'Warp Distortion', min: 0, max: 0.15, step: 0.002, default: 0.03 },
      { key: 'fabricHue', label: 'Fabric Hue', min: 0, max: 1, step: 0.01, default: 0.55 },
      { key: 'stitchHue', label: 'Stitch Hue', min: 0, max: 1, step: 0.01, default: 0.02 },
      { key: 'fabricContrast', label: 'Fabric Contrast', min: 0.5, max: 2.5, step: 0.02, default: 1.3 },
      { key: 'microWeave', label: 'Micro Weave', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'tension', label: 'Tension', min: 0, max: 1, step: 0.01, default: 0.25 },
    ],
    run(w, paramsRef) {
      const { src, osc, noise } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      const weave = () =>
        osc(() => P.weaveDensityX, 0, 0)
          .thresh(() => 1 - P.threadThickness, 0.08)
          .add(osc(() => P.weaveDensityY, 0, 0).rotate(1.5708).thresh(() => 1 - P.threadThickness, 0.08), 1);

      const microWeaveTex = () =>
        osc(() => P.weaveDensityX * 2.3, 0, 0)
          .thresh(() => 1 - P.threadThickness * 0.6, 0.05)
          .add(
            osc(() => P.weaveDensityY * 2.3, 0, 0).rotate(1.5708).thresh(() => 1 - P.threadThickness * 0.6, 0.05),
            1
          );

      src(s0)
        .modulate(weave(), () => P.warpDistortion)
        .modulateScale(noise(4, () => P.tension * 2), () => P.tension * 0.02, 1)
        .layer(weave().color(() => 0.15 + P.stitchHue * 0.6, 0.05, () => 0.05 + P.stitchHue * 0.3, () => P.seamGlow * 0.5))
        .layer(microWeaveTex().color(1, 1, 1, () => P.microWeave * 0.15))
        .contrast(() => P.fabricContrast)
        .hue(() => P.fabricHue * 0.3)
        .out(o0);
    },
  },

  {
    id: 'oracle',
    category: 'elaborate',
    name: 'Oracle',
    blurb: 'Mandala framing, radiating symmetry, glyph ring, glowing aura.',
    params: [
      { key: 'mandalaRings', label: 'Mandala Rings', min: 1, max: 8, step: 1, default: 4 },
      { key: 'kaleidSymmetry', label: 'Kaleid Symmetry', min: 3, max: 24, step: 1, default: 10 },
      { key: 'glyphCount', label: 'Glyph Count', min: 3, max: 24, step: 1, default: 12 },
      { key: 'glyphSize', label: 'Glyph Size', min: 0.02, max: 0.2, step: 0.005, default: 0.06 },
      { key: 'jewelSaturation', label: 'Jewel Saturation', min: 0, max: 4, step: 0.02, default: 2.2 },
      { key: 'rimGlow', label: 'Rim Glow', min: 0, max: 1.5, step: 0.02, default: 0.7 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: -1, max: 1, step: 0.01, default: 0.08 },
      { key: 'centerFocus', label: 'Centre Focus', min: 0.5, max: 2, step: 0.02, default: 1 },
      { key: 'auraColor', label: 'Aura Colour', min: 0, max: 1, step: 0.01, default: 0.75 },
      { key: 'pulseBreath', label: 'Pulse Breath', min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
    run(w, paramsRef) {
      const { src, shape, osc, voronoi } = w;
      const { s0, s2, o0, o1 } = w;
      const P = paramsRef.current;

      // o1: the glyph ring — small repeated shapes arranged around the edge.
      // luma() last so the gaps between glyphs turn transparent instead of
      // staying opaque black and blotting out the mandala beneath.
      shape(5, () => P.glyphSize, 0.02)
        .repeat(() => P.glyphCount, 1)
        .modulateScale(voronoi(3, 0, 0.5), 0.05)
        .color(() => 0.8 + P.auraColor * 0.2, () => 0.6 + P.auraColor * 0.2, 0.9)
        .luma(0.25, 0.15)
        .out(o1);

      src(s0)
        .layer(src(s2).color(1, 1, 1, 0.5))
        .scale(() => P.centerFocus)
        .kaleid(() => P.kaleidSymmetry)
        .rotate(0, () => P.rotationSpeed)
        .saturate(() => P.jewelSaturation)
        .layer(src(o1).kaleid(() => P.kaleidSymmetry).rotate(0, () => -P.rotationSpeed * 0.6))
        .modulateScale(osc(() => P.mandalaRings * 2, 0, () => P.pulseBreath), () => P.pulseBreath * 0.04, 1)
        .brightness(() => P.rimGlow * 0.1)
        .out(o0);
    },
  },

  {
    id: 'singularity',
    category: 'elaborate',
    name: 'Singularity',
    blurb: 'Gravity well — radial pull, spiral smear, event horizon, accretion ring.',
    params: [
      { key: 'pullStrength', label: 'Pull Strength', min: 0, max: 0.3, step: 0.005, default: 0.09 },
      { key: 'spiralTwist', label: 'Spiral Twist', min: -2, max: 2, step: 0.02, default: 0.8 },
      { key: 'eventHorizonSize', label: 'Event Horizon', min: 0.05, max: 0.4, step: 0.01, default: 0.15 },
      { key: 'accretionGlow', label: 'Accretion Glow', min: 0, max: 1.5, step: 0.02, default: 0.8 },
      { key: 'accretionHue', label: 'Accretion Hue', min: 0, max: 1, step: 0.01, default: 0.08 },
      { key: 'timeDilation', label: 'Time Dilation', min: 0, max: 0.9, step: 0.01, default: 0.4 },
      { key: 'instability', label: 'Instability', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'redshift', label: 'Redshift', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'collapseRate', label: 'Collapse Rate', min: 0.5, max: 3, step: 0.02, default: 1.4 },
      { key: 'starField', label: 'Star Field', min: 0, max: 1, step: 0.01, default: 0.25 },
    ],
    run(w, paramsRef) {
      const { src, noise, shape, voronoi } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .modulateScale(shape(64, () => P.eventHorizonSize, 0.4).invert(), () => -P.pullStrength * P.collapseRate, 1)
        .modulateRotate(
          shape(64, () => P.eventHorizonSize * 1.5, 0.5).invert(),
          () => P.spiralTwist * 0.5,
          () => P.spiralTwist * 0.3
        )
        .modulateScale(noise(6, () => P.instability * 2), () => P.instability * 0.04, 1)
        .colorama(() => P.redshift * 0.02)
        .shift(() => P.redshift * 0.02, 0, () => -P.redshift * 0.01)
        .blend(o0, () => P.timeDilation)
        .mask(shape(64, () => P.eventHorizonSize * 0.7, 0.03).invert())
        .layer(
          shape(64, () => P.eventHorizonSize, 0.02)
            .invert()
            .mult(shape(64, () => P.eventHorizonSize * 1.4, 0.08))
            .color(1, () => 0.5 + P.accretionHue * 0.4, () => P.accretionHue * 0.3, () => P.accretionGlow * 0.6)
        )
        .add(voronoi(() => 60 + P.starField * 40, 0, 0).thresh(0.96, 0.02), () => P.starField * 0.3)
        .out(o0);
    },
  },

  /* ============================================================
     More 3D / surveillance / surgical — pushed toward higher
     saturation and colour than the first pass at these categories.
     Every overlay buffer below follows the rule learned from the
     Cathedral/Oracle bug: colour FIRST, `.luma()` LAST, right before
     `.out()` or `.layer()` — never a `.color()` call after `.luma()`,
     since shape()/osc() are opaque everywhere (not just their bright
     fill) until luma derives real per-pixel alpha from brightness.
     ============================================================ */

  {
    id: 'holographicProjection',
    category: '3d',
    name: 'Holographic Projection',
    blurb: 'Iridescent interference, rainbow shimmer, scanline flicker.',
    params: [
      { key: 'hueSpread', label: 'Hue Spread', min: 0, max: 3, step: 0.02, default: 1.4 },
      { key: 'shimmerSpeed', label: 'Shimmer Speed', min: 0, max: 2, step: 0.02, default: 0.5 },
      { key: 'scanlineDensity', label: 'Scanline Density', min: 4, max: 200, step: 2, default: 80 },
      { key: 'scanlineOpacity', label: 'Scanline Opacity', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.6 },
      { key: 'depthParallax', label: 'Depth Parallax', min: 0, max: 2, step: 0.02, default: 0.8 },
      { key: 'flickerAmount', label: 'Flicker', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'chromaticSpread', label: 'Chromatic Spread', min: 0, max: 0.06, step: 0.001, default: 0.018 },
      { key: 'glowIntensity', label: 'Glow Intensity', min: 0, max: 1.5, step: 0.02, default: 0.7 },
      { key: 'rotationDrift', label: 'Rotation Drift', min: -1, max: 1, step: 0.01, default: 0.15 },
    ],
    run(w, paramsRef) {
      const { src, osc, noise } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const mx = () => -w.mouse.x / 1000 + 0.5;
      const my = () => -w.mouse.y / 1000 + 0.5;

      src(s0)
        .modulateScale(noise(4, () => P.shimmerSpeed), () => (mx() - 0.5) * P.depthParallax * 0.06, 1)
        .modulateRotate(
          noise(3, () => P.shimmerSpeed * 0.7),
          () => P.rotationDrift * 0.3,
          () => (my() - 0.5) * P.depthParallax * 0.2
        )
        .modulateHue(osc(() => P.hueSpread * 6 + 3, 0.1, () => P.shimmerSpeed), () => P.hueSpread)
        .saturate(() => P.saturationAmt)
        .shift(() => P.chromaticSpread, 0, () => P.chromaticSpread * 1.4)
        .add(osc(() => P.scanlineDensity, 0, 0).thresh(0.5, 0.5), () => -P.scanlineOpacity * 0.35)
        .modulateScale(noise(3, () => P.flickerAmount * 3), 0, () => 1 - P.flickerAmount * 0.02)
        .brightness(() => P.glowIntensity * 0.12)
        .out(o0);
    },
  },

  {
    id: 'prismSplit',
    category: '3d',
    name: 'Prism Split',
    blurb: 'Refracted layers, extreme chromatic dispersion, rainbow fringe.',
    params: [
      { key: 'dispersionAmount', label: 'Dispersion', min: 0, max: 0.1, step: 0.001, default: 0.03 },
      { key: 'refractionAngle', label: 'Refraction Angle', min: 0, max: 6.28, step: 0.02, default: 2.1 },
      { key: 'rainbowIntensity', label: 'Rainbow Intensity', min: 0, max: 1, step: 0.01, default: 0.45 },
      { key: 'planeSpacing', label: 'Plane Spacing', min: 0, max: 0.08, step: 0.001, default: 0.02 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.4 },
      { key: 'edgeGlow', label: 'Edge Glow', min: 0, max: 1.5, step: 0.02, default: 0.6 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: -1, max: 1, step: 0.01, default: 0.1 },
      { key: 'prismSkew', label: 'Prism Skew', min: -0.3, max: 0.3, step: 0.005, default: 0.08 },
      { key: 'causticShimmer', label: 'Caustic Shimmer', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'brightnessAmt', label: 'Brightness', min: -0.2, max: 0.3, step: 0.01, default: 0.05 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      const plane = (i) =>
        src(s0)
          .scale(
            1, 1, 1,
            () => 0.5 + Math.cos(P.refractionAngle) * P.planeSpacing * i,
            () => 0.5 + Math.sin(P.refractionAngle) * P.planeSpacing * i
          )
          .modulateScale(noise(5, () => P.causticShimmer), () => P.causticShimmer * 0.04, 1);

      plane(1)
        .color(1, 0, 0)
        .add(plane(0).color(0, 1, 0), 1)
        .add(plane(-1).color(0, 0, 1), 1)
        .shift(() => P.dispersionAmount, 0, () => -P.dispersionAmount)
        .rotate(() => P.prismSkew, () => P.rotationSpeed)
        .saturate(() => P.saturationAmt)
        .layer(
          osc(8, 0.1, () => P.refractionAngle)
            .modulateHue(src(s0), 0.5)
            .luma(() => 1 - P.rainbowIntensity * 0.5, 0.3)
        )
        .brightness(() => P.brightnessAmt + P.edgeGlow * 0.08)
        .out(o0);
    },
  },

  {
    id: 'volumetricScan',
    category: '3d',
    name: 'Volumetric Scan',
    blurb: 'Rotating slice reconstruction, depth-colourised, medical-vivid.',
    params: [
      { key: 'sliceCount', label: 'Slice Count', min: 3, max: 16, step: 1, default: 8 },
      { key: 'sliceSpacing', label: 'Slice Spacing', min: 0, max: 0.05, step: 0.001, default: 0.014 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: -1, max: 1, step: 0.01, default: 0.25 },
      { key: 'depthHueA', label: 'Depth Hue Near', min: 0, max: 1, step: 0.01, default: 0.55 },
      { key: 'depthHueB', label: 'Depth Hue Far', min: 0, max: 1, step: 0.01, default: 0.02 },
      { key: 'volumeDensity', label: 'Volume Density', min: 0.1, max: 1, step: 0.01, default: 0.5 },
      { key: 'coreGlow', label: 'Core Glow', min: 0, max: 1.5, step: 0.02, default: 0.6 },
      { key: 'scanPlaneSweep', label: 'Scan Plane Sweep', min: 0, max: 2, step: 0.02, default: 0.4 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.2 },
      { key: 'noiseTexture', label: 'Noise Texture', min: 0, max: 1, step: 0.01, default: 0.25 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      let stack = src(s0).color(
        () => 0.3 + P.depthHueA * 0.5,
        () => 0.3 + P.depthHueA * 0.3,
        () => 0.5 - P.depthHueA * 0.3
      );
      for (let i = 1; i <= 6; i++) {
        stack = stack.layer(
          src(s0)
            .scale(() => 1 - i * P.sliceSpacing, 1, 1)
            .modulateRotate(noise(3, 0.05), 0, () => P.rotationSpeed * i * 0.1)
            .color(
              () => 0.3 + P.depthHueA * 0.5 - (i / 6) * (P.depthHueA - P.depthHueB) * 0.5,
              () => 0.3 - (i / 6) * 0.2,
              () => 0.5 - P.depthHueA * 0.3 + (i / 6) * P.depthHueB * 0.5,
              () => P.volumeDensity * (1 - i / 8)
            )
        );
      }

      stack
        .saturate(() => P.saturationAmt)
        .modulateScale(noise(4, () => P.noiseTexture * 2), 0, () => 1 - P.noiseTexture * 0.03)
        .layer(
          osc(1, 0, 0)
            .scrollY(0, () => P.scanPlaneSweep * 0.08)
            .color(() => 0.6 + P.depthHueA * 0.4, 1, 1)
            .luma(0.9, 0.05)
        )
        .brightness(() => P.coreGlow * 0.12)
        .out(o0);
    },
  },

  {
    id: 'isometricFold',
    category: '3d',
    name: 'Isometric Fold',
    blurb: 'Low-poly facets, per-cell colour and light, folded depth.',
    params: [
      { key: 'facetScale', label: 'Facet Scale', min: 3, max: 40, step: 0.5, default: 14 },
      { key: 'facetJitter', label: 'Facet Jitter', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'lightAngle', label: 'Light Angle', min: 0, max: 6.28, step: 0.02, default: 2.4 },
      { key: 'colorSpread', label: 'Colour Spread', min: 0, max: 2, step: 0.02, default: 1.1 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.5 },
      { key: 'edgeDarkness', label: 'Edge Darkness', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'foldDepth', label: 'Fold Depth', min: 0, max: 0.05, step: 0.001, default: 0.015 },
      { key: 'rotationSpeed', label: 'Rotation Speed', min: -1, max: 1, step: 0.01, default: 0.1 },
      { key: 'glossHighlight', label: 'Gloss Highlight', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'backgroundShade', label: 'Background Shade', min: 0, max: 1, step: 0.01, default: 0.15 },
    ],
    run(w, paramsRef) {
      const { src, voronoi, osc } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const facets = () => voronoi(() => P.facetScale, 0.1, () => P.facetJitter);

      src(s0)
        .modulate(facets(), () => 0.25 + P.facetJitter * 0.25)
        .modulatePixelate(facets(), () => P.facetScale * 2, () => P.facetScale)
        .modulateHue(osc(() => P.colorSpread * 6, 0.15, () => P.lightAngle), () => P.colorSpread * 2)
        .saturate(() => P.saturationAmt)
        .layer(
          facets()
            .thresh(() => 0.5 + Math.sin(P.lightAngle) * 0.3, 0.05)
            .color(1, 1, 1)
            .luma(() => 1 - P.edgeDarkness * 0.5, 0.2)
        )
        .modulateScale(facets(), () => P.foldDepth)
        .add(facets().thresh(0.9, 0.05), () => P.glossHighlight * 0.25)
        .brightness(() => -P.backgroundShade * 0.15)
        .out(o0);
    },
  },

  {
    id: 'chromaticSurveillance',
    category: 'surveillance',
    name: 'Chromatic Surveillance',
    blurb: 'False-colour multi-spectral feed, vivid banding, targeting grid.',
    params: [
      { key: 'spectrumShift', label: 'Spectrum Shift', min: 0, max: 3, step: 0.02, default: 1.2 },
      { key: 'bandCount', label: 'Band Count', min: 3, max: 14, step: 1, default: 7 },
      { key: 'gridDensity', label: 'Grid Density', min: 2, max: 60, step: 1, default: 16 },
      { key: 'gridOpacity', label: 'Grid Opacity', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'reticleSize', label: 'Reticle Size', min: 0.1, max: 0.9, step: 0.01, default: 0.5 },
      { key: 'scanSweep', label: 'Scan Sweep', min: 0, max: 2, step: 0.02, default: 0.4 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.8 },
      { key: 'noiseGrain', label: 'Noise Grain', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'vignetteAmt', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.5 },
    ],
    run(w, paramsRef) {
      const { src, osc, noise, shape } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .posterize(() => P.bandCount, 0.5)
        .modulateHue(osc(() => P.spectrumShift * 8 + 2, 0.12, () => P.spectrumShift), () => P.spectrumShift * 1.5)
        .saturate(() => P.saturationAmt)
        .contrast(() => P.contrastAmt)
        .layer(
          osc(() => P.gridDensity, 0, 0)
            .add(osc(() => P.gridDensity, 0, 0).rotate(1.5708), 1)
            .luma(() => 1 - P.gridOpacity * 0.3, 0.05)
        )
        .layer(shape(4, () => P.reticleSize * 0.3, 0.015).thresh(0.5, 0.05).color(1, 1, 1).luma(0.5, 0.3))
        .layer(osc(1, 0, 0).scrollY(0, () => P.scanSweep * 0.08).luma(() => 1 - P.scanSweep * 0.25, 0.04))
        .add(noise(() => 200, 1).luma(0.5, 0.4), () => P.noiseGrain * 0.25)
        .mask(shape(60, () => 0.55 - P.vignetteAmt * 0.15, 0.3))
        .out(o0);
    },
  },

  {
    id: 'laserGrid',
    category: 'surveillance',
    name: 'Laser Grid',
    blurb: 'Criss-crossing security beams, saturated glow, motion sensors.',
    params: [
      { key: 'beamDensity', label: 'Beam Density', min: 2, max: 30, step: 1, default: 9 },
      { key: 'beamThickness', label: 'Beam Thickness', min: 0.01, max: 0.3, step: 0.005, default: 0.06 },
      { key: 'beamColorA', label: 'Beam Colour A', min: 0, max: 1, step: 0.01, default: 0.98 },
      { key: 'beamColorB', label: 'Beam Colour B', min: 0, max: 1, step: 0.01, default: 0.33 },
      { key: 'beamAngle', label: 'Beam Angle', min: 0, max: 1.57, step: 0.01, default: 0.4 },
      { key: 'glowIntensity', label: 'Glow Intensity', min: 0, max: 1.5, step: 0.02, default: 0.8 },
      { key: 'flicker', label: 'Flicker', min: 0, max: 1, step: 0.01, default: 0.15 },
      { key: 'intersectionGlow', label: 'Intersection Glow', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'backgroundDarkness', label: 'Background Darkness', min: 0, max: 1, step: 0.01, default: 0.85 },
      { key: 'faceVisibility', label: 'Face Visibility', min: 0, max: 1, step: 0.01, default: 0.4 },
    ],
    run(w, paramsRef) {
      const { src, osc, noise, solid } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      // thresh FIRST (crisp binary line, unaffected by later tinting),
      // then colour, then a wide/forgiving luma last — "some colour" vs
      // "exactly black" is a much more reliable split than trying to hit
      // an exact luminance threshold after a dim tint.
      const beamsA = () =>
        osc(() => P.beamDensity, 0, 0)
          .rotate(() => P.beamAngle)
          .thresh(() => 1 - P.beamThickness, 0.02)
          .color(() => 0.9 + P.beamColorA * 0.1, () => P.beamColorA * 0.3, () => P.beamColorA * 0.1)
          .luma(0.4, 0.35);
      const beamsB = () =>
        osc(() => P.beamDensity * 1.3, 0, 0)
          .rotate(() => P.beamAngle + 1.0)
          .thresh(() => 1 - P.beamThickness, 0.02)
          .color(() => P.beamColorB * 0.2, () => 0.6 + P.beamColorB * 0.4, 0.9)
          .luma(0.4, 0.35);

      solid(() => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, 1)
        .blend(src(s0), () => P.faceVisibility * 0.5)
        .layer(beamsA())
        .layer(beamsB())
        .add(beamsA().mult(beamsB()), () => P.intersectionGlow * 0.5)
        .modulateScale(noise(4, () => P.flicker * 3), 0, () => 1 - P.flicker * 0.02)
        .brightness(() => P.glowIntensity * 0.1)
        .out(o0);
    },
  },

  {
    id: 'biometricScan',
    category: 'surveillance',
    name: 'Biometric Scan',
    blurb: 'Iris-scan rings, radial detail, confidence colour coding.',
    params: [
      { key: 'ringCount', label: 'Ring Count', min: 3, max: 24, step: 1, default: 10 },
      { key: 'ringHueSpread', label: 'Ring Hue Spread', min: 0, max: 3, step: 0.02, default: 1.5 },
      { key: 'scanSpeed', label: 'Scan Speed', min: 0, max: 2, step: 0.02, default: 0.4 },
      { key: 'irisDetail', label: 'Iris Detail', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'pupilSize', label: 'Pupil Size', min: 0.05, max: 0.4, step: 0.005, default: 0.15 },
      { key: 'glowIntensity', label: 'Glow Intensity', min: 0, max: 1.5, step: 0.02, default: 0.6 },
      { key: 'dataOverlay', label: 'Data Overlay', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.6 },
      { key: 'matchConfidence', label: 'Match Confidence', min: 0, max: 1, step: 0.01, default: 0.7 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.4 },
    ],
    run(w, paramsRef) {
      const { src, osc, voronoi, shape } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .luma(0.1, 0.5)
        .modulateHue(osc(() => P.ringCount * 2, 0.15, () => P.scanSpeed), () => P.ringHueSpread)
        .saturate(() => P.saturationAmt)
        .contrast(() => P.contrastAmt)
        .layer(voronoi(() => P.ringCount * 3, () => P.scanSpeed * 0.5, () => P.irisDetail).luma(0.55, 0.2))
        .layer(
          shape(50, () => P.pupilSize, 0.05)
            .color(() => 1 - P.matchConfidence, () => P.matchConfidence, 0.1)
            .luma(0.4, 0.15)
        )
        .layer(
          osc(1, 0, 0)
            .scrollY(0, () => P.scanSpeed * 0.1)
            .color(1, 1, 1)
            .luma(() => 1 - P.dataOverlay * 0.2, 0.04)
        )
        .mask(shape(80, 0.5, 0.25))
        .brightness(() => P.glowIntensity * 0.1)
        .out(o0);
    },
  },

  {
    id: 'ultrasound',
    category: 'surgical',
    name: 'Ultrasound',
    blurb: 'Sonar sweep, speckle tissue, vivid Doppler-flow colour.',
    params: [
      { key: 'sweepAngle', label: 'Sweep Angle', min: 0.3, max: 1.4, step: 0.01, default: 0.7 },
      { key: 'sweepSpeed', label: 'Sweep Speed', min: 0, max: 2, step: 0.02, default: 0.5 },
      { key: 'grayscaleDepth', label: 'Grayscale Depth', min: 0.5, max: 3, step: 0.02, default: 1.4 },
      { key: 'speckleNoise', label: 'Speckle Noise', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'dopplerFlow', label: 'Doppler Flow', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'dopplerThreshold', label: 'Doppler Threshold', min: 0.3, max: 0.9, step: 0.01, default: 0.6 },
      { key: 'coneWidth', label: 'Cone Width', min: 0.2, max: 1, step: 0.01, default: 0.55 },
      { key: 'glowIntensity', label: 'Glow Intensity', min: 0, max: 1.5, step: 0.02, default: 0.5 },
      { key: 'depthFade', label: 'Depth Fade', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'tealTint', label: 'Teal Tint', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc, shape } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      src(s0)
        .luma(0.05, 0.55)
        .contrast(() => P.grayscaleDepth)
        .color(() => 0.7 - P.tealTint * 0.3, 0.85, () => 0.8 + P.tealTint * 0.2)
        .add(noise(90, 3).luma(0.5, 0.3), () => P.speckleNoise * 0.3)
        .layer(osc(1, 0, 0).rotate(0, () => P.sweepSpeed * 0.15).color(1, 1, 1).luma(0.9, 0.05))
        .layer(
          src(s0)
            .modulateHue(osc(4, 0, () => P.sweepSpeed), 1)
            .saturate(3)
            .color(() => 1 - P.dopplerFlow, 0.2, () => P.dopplerFlow)
            .luma(() => P.dopplerThreshold, 0.1)
        )
        .brightness(() => P.glowIntensity * 0.08 - P.depthFade * 0.1)
        .mask(shape(3, () => P.coneWidth, 0.3))
        .out(o0);
    },
  },

  {
    id: 'mriBloom',
    category: 'surgical',
    name: 'MRI Bloom',
    blurb: 'fMRI activation colour, cross-section bands, glowing blooms.',
    params: [
      { key: 'activationThreshold', label: 'Activation Threshold', min: 0.1, max: 0.8, step: 0.01, default: 0.4 },
      { key: 'coldHue', label: 'Cold Hue', min: 0, max: 1, step: 0.01, default: 0.6 },
      { key: 'hotHue', label: 'Hot Hue', min: 0, max: 1, step: 0.01, default: 0.02 },
      { key: 'sliceBands', label: 'Slice Bands', min: 2, max: 14, step: 1, default: 6 },
      { key: 'bloomIntensity', label: 'Bloom Intensity', min: 0, max: 1.5, step: 0.02, default: 0.7 },
      { key: 'noiseTexture', label: 'Noise Texture', min: 0, max: 1, step: 0.01, default: 0.2 },
      { key: 'contrastAmt', label: 'Contrast', min: 0.5, max: 3, step: 0.02, default: 1.5 },
      { key: 'saturationAmt', label: 'Saturation', min: 0, max: 4, step: 0.02, default: 2.5 },
      { key: 'scanSpeed', label: 'Scan Speed', min: 0, max: 2, step: 0.02, default: 0.3 },
      { key: 'edgeSharpness', label: 'Edge Sharpness', min: 0.02, max: 0.4, step: 0.01, default: 0.15 },
    ],
    run(w, paramsRef) {
      const { src, noise, osc } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;
      const grayBrain = () =>
        src(s0).luma(0.05, 0.55).posterize(() => P.sliceBands, 0.5).contrast(() => P.contrastAmt);

      grayBrain()
        .color(() => 0.1 + P.coldHue * 0.3, () => 0.1 + P.coldHue * 0.2, () => 0.3 + P.coldHue * 0.5)
        .layer(
          grayBrain()
            .color(1, () => 0.8 - P.hotHue * 0.3, () => 0.1 + P.hotHue * 0.3)
            .luma(() => P.activationThreshold, () => P.edgeSharpness)
        )
        .layer(
          grayBrain()
            .color(1, 1, () => 0.3 + P.hotHue * 0.3)
            .luma(() => P.activationThreshold + 0.25, () => P.edgeSharpness)
        )
        .saturate(() => P.saturationAmt)
        .modulateScale(noise(4, () => P.scanSpeed), 0, () => 1 - P.noiseTexture * 0.02)
        .add(noise(150, 1).luma(0.5, 0.3), () => P.noiseTexture * 0.2)
        .brightness(() => P.bloomIntensity * 0.1)
        .out(o0);
    },
  },

  {
    id: 'vitalSigns',
    category: 'surgical',
    name: 'Vital Signs',
    blurb: 'Scrolling ECG traces, graph-paper grid, pulse-driven glow.',
    params: [
      { key: 'traceSpeed', label: 'Trace Speed', min: 0, max: 3, step: 0.02, default: 1.2 },
      { key: 'gridDensity', label: 'Grid Density', min: 4, max: 60, step: 1, default: 20 },
      { key: 'gridOpacity', label: 'Grid Opacity', min: 0, max: 1, step: 0.01, default: 0.25 },
      { key: 'ecgAmplitude', label: 'ECG Amplitude', min: 0, max: 2, step: 0.02, default: 0.8 },
      { key: 'heartRateHue', label: 'Heart Rate Hue', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'oxygenHue', label: 'Oxygen Hue', min: 0, max: 1, step: 0.01, default: 0.55 },
      { key: 'pulseRate', label: 'Pulse Rate', min: 0, max: 3, step: 0.02, default: 1.1 },
      { key: 'traceGlow', label: 'Trace Glow', min: 0, max: 1.5, step: 0.02, default: 0.7 },
      { key: 'backgroundDarkness', label: 'Background Darkness', min: 0, max: 1, step: 0.01, default: 0.9 },
      { key: 'faceVisibility', label: 'Face Visibility', min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
    run(w, paramsRef) {
      const { src, osc, noise, solid } = w;
      const { s0, o0 } = w;
      const P = paramsRef.current;

      // freqFn/speedFn are always functions so the trace stays reactive to
      // its own slider even though the helper is called with different
      // values per trace line.
      const trace = (freqFn, speedFn, r, g, b) =>
        osc(freqFn, 0, () => speedFn() * 2)
          .modulateRotate(noise(3, () => P.pulseRate), 0.15, 0)
          .color(r, g, b)
          .luma(() => 1 - P.ecgAmplitude * 0.15, 0.2);

      solid(() => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, () => 1 - P.backgroundDarkness, 1)
        .blend(src(s0), () => P.faceVisibility * 0.5)
        .layer(
          osc(() => P.gridDensity, 0, 0)
            .add(osc(() => P.gridDensity, 0, 0).rotate(1.5708), 1)
            .color(() => 0.1 + P.heartRateHue * 0.2, 0.4, 0.2)
            .luma(() => 1 - P.gridOpacity * 0.3, 0.05)
        )
        .layer(
          trace(
            () => 6 + P.traceSpeed * 3,
            () => P.traceSpeed,
            () => 0.1 + P.heartRateHue * 0.3,
            1,
            () => 0.2 + P.heartRateHue * 0.2
          )
        )
        .layer(
          trace(
            () => 4 + P.traceSpeed * 2,
            () => P.traceSpeed * 1.3,
            0.1,
            () => 0.6 + P.oxygenHue * 0.4,
            1
          )
        )
        .brightness(() => Math.sin(P.pulseRate * 3) * P.traceGlow * 0.05)
        .out(o0);
    },
  },
];
