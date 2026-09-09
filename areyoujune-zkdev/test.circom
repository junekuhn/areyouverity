pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";

template IsVerity() {

    // Private signals (never leave the browser)
    signal input pFeedback;
    signal input pExplode;
    signal input pWarp;
    signal input pColor;
    signal input pEyes;
    signal input pLuma;
    signal input pBlending;
    signal input pHardmix;
    signal input pScroll;
    signal input timestamp;

    // Public signals (known to the verifier)
    signal input commitmentHash;

    // Poseidon hasher for 10 inputs
    component hasher = Poseidon(10);

    // Wire private inputs into the hasher
    hasher.inputs[0] <== pFeedback;
    hasher.inputs[1] <== pExplode;
    hasher.inputs[2] <== pWarp;
    hasher.inputs[3] <== pColor;
    hasher.inputs[4] <== pEyes;
    hasher.inputs[5] <== pLuma;
    hasher.inputs[6] <== pBlending;
    hasher.inputs[7] <== pHardmix;
    hasher.inputs[8] <== pScroll;
    hasher.inputs[9] <== timestamp;

    // The single constraint that makes the proof meaningful
    commitmentHash === hasher.out;
}

// Declare the main component — commitmentHash is public, everything else is private
component main { public [commitmentHash] } = IsVerity();