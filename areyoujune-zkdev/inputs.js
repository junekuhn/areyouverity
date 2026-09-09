// lib/prepareInputs.js

//min -10, max 10

const SCALE     = 1000;   // 3 decimal places of precision
const SHIFT     = 10000;  // offset to eliminate negatives

export function toCircuitValue(float) {
  return Math.round(float * SCALE) + SHIFT;
}

export function prepareCircuitInputs(params, timestamp) {
  return {
    pFeedback:  toCircuitValue(params.pFeedback),
    pExplode:   toCircuitValue(params.pExplode),
    pWarp:      toCircuitValue(params.pWarp),
    pColor:     toCircuitValue(params.pColor),
    pEyes:      toCircuitValue(params.pEyes),
    pLuma:      toCircuitValue(params.pLuma),
    pBlending:  toCircuitValue(params.pBlending),
    pHardmix:   toCircuitValue(params.pHardmix),
    pScroll:    toCircuitValue(params.pScroll),
    timestamp:  Date.now(),   // already an integer
  };
}