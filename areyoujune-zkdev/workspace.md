GROTH16                           POSEIDON
───────                           ────────
The proof SYSTEM                  The hash FUNCTION

How the proof is                  How your 10 values
generated and verified            get fingerprinted
                                  inside the circuit


Poseidon = a blender
           throws your 10 values in, outputs one hash

Groth16  = a notary
           certifies that you used the blender correctly
           without you showing what you put in

npm install circomlib

Operators

Operator	Does	                Use when
<==	        Assigns + constrains	Almost always — use this by default
<--	        Assigns only	        Only for complex calculations that need manual constraining
===	        Constrains only	        When value is already assigned elsewhere


