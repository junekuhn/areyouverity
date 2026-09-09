# TRANSEVIL: Architecture Overview

## System Design

TRANSEVIL is a crypto-art project using zero-knowledge proofs poetically to enforce constraint without disclosure. The system consists of three main components:

### 1. Zero-Knowledge Circuits (Circom)

**Location**: `zk/circuits/`

Two circuits implement the cryptographic constraints:

#### merkle_proof.circom (Artist Finale)
- Proves knowledge of a leaf in a pre-committed Merkle tree
- Public input: Merkle root (committed on-chain at project start)
- Private inputs: Selected leaf, path indices, siblings
- Output: Groth16 proof that doesn't reveal which leaf

**What this proves**: "I selected one outcome from a pre-committed set."
**What this does NOT prove**: Which outcome was selected.

#### witness_proof.circom (Collector Witness)
- Proves possession of a valid witness credential
- Public inputs: Commitment, token ID
- Private inputs: Secret, nullifier
- Output: Groth16 proof without revealing the secret

**What this proves**: "I encountered a sealed state under the system's rules."
**What this does NOT prove**: What was witnessed, or any objective truth.

### 2. Smart Contracts (Solidity)

**Location**: `contracts/`

#### TransevilFinale.sol
Main NFT contract implementing:
- ERC-721 standard (250 tokens + 1 RELIC)
- Merkle root storage (committed at deployment)
- Finale verification (`finalize()` with ZK proof)
- Witness tracking (`submitWitness()` with ZK proof)
- EIP-4906 metadata update events
- Non-transferrable RELIC (token 1000001)

#### MerkleProofVerifier.sol & WitnessProofVerifier.sol
Auto-generated Groth16 verifiers from circuits.

### 3. Off-Chain Components

#### ZK Scripts (`zk/scripts/`)
- **build-merkle-tree.js**: Generate Merkle root from end-states
- **generate-finale-proof.js**: Create artist finale proof
- **generate-witness-proof.js**: Create collector witness proof
- **setup-*.js**: Circuit compilation and trusted setup

#### Metadata Generator (`metadata/`)
- Generates ERC-721 metadata
- Creates per-token HTML viewers
- Pins to IPFS via Pinata
- Includes witness/resolved state in attributes

#### Web UI (`web/`)
- Minimal Next.js application
- `/finale`: Artist proof submission
- `/witness`: Token-gated collector proof submission
- No gamification or progress indicators

#### Viewers (`viewers/`)
- Self-contained HTML time capsules
- Deterministic replay from embedded params
- View-only (no interaction)

## Data Flow

### Artist Finale Flow

```
1. Project Start:
   - Artist defines possible end-states in end-states.json
   - build-merkle-tree.js generates Merkle root
   - Contract deployed with root commitment

2. Project End:
   - Artist runs: generate-finale-proof.js <chosen-leaf-index>
   - Generates ZK proof of membership (doesn't reveal index)
   - Artist submits proof via /finale UI
   - Contract verifies proof, sets resolved=true
   - Emits BatchMetadataUpdate (tokens 1-250)
   - Emits MetadataUpdate (RELIC 1000001)

Result: Everyone knows an outcome was selected, no one knows which.
```

### Collector Witness Flow

```
1. Token Holder visits /witness:
   - Connects wallet
   - Selects token to witness
   - Generates witness credential (secret)

2. Proof Generation:
   - Runs: generate-witness-proof.js <tokenId> <secret>
   - Generates ZK proof of credential possession
   - Submits proof via /witness UI

3. Contract Verification:
   - Verifies proof
   - Marks token as witnessed
   - Increments witnessCount
   - Emits MetadataUpdate (token + RELIC)

Result: Token marked as witnessed, RELIC evolves, no disclosure of what was witnessed.
```

## Metadata Updates (EIP-4906)

The contract emits EIP-4906 events to signal metadata changes:

### On Finale:
```solidity
emit BatchMetadataUpdate(1, 250);  // All collector tokens
emit MetadataUpdate(1000001);      // RELIC
```

### On Witness:
```solidity
emit MetadataUpdate(tokenId);      // Witnessed token
emit MetadataUpdate(1000001);      // RELIC evolves
```

Marketplaces supporting EIP-4906 automatically refresh metadata when events are emitted.

## Trust Model

This system **does NOT eliminate trust**. It **formalises trust without surveillance**.

### What is trusted:
- Artist's commitment to honor the selected outcome
- System's rule enforcement (ZK circuits)
- Witness credential issuance process

### What is NOT trusted:
- Any claim about bodily truth
- Medical attestations
- Identity verification
- Biometric data

The system proves **adherence to constraints**, not **objective truth**.

## Security Considerations

### Trusted Setup (Groth16)
- Uses public Powers of Tau ceremony (Hermez)
- Phase 2 contribution with timestamped entropy
- For production: consider MPC ceremony or PLONK/STARK

### Witness Credentials
- Current: client-side generation (prototype)
- Production: server-signed JWT with expiry/nonce
- Rate limiting and anti-Sybil measures needed

### RELIC Protection
- Non-transferrable via `_update()` override
- Only contract address allowed as recipient
- Prevents accidental/malicious transfers

### Metadata Integrity
- On-chain state is source of truth
- Metadata generator should query contract state
- IPFS provides content-addressed immutability

## Philosophy

### Opacity as Feature
The inability to know which outcome was selected is **intentional and essential**. This is not a limitation to be worked around—it's the core artistic statement.

### Constraint Without Disclosure
Zero-knowledge proofs enforce rules without revealing content:
- Artist can't prove an invalid outcome (constrained)
- No one can determine which outcome (disclosed)

### Trust Formalised, Not Eliminated
The system doesn't replace trust with cryptography. It makes trust **explicit and structured** while preserving **privacy and autonomy**.

## Design Principles

1. **Minimal Disclosure**: Reveal only what's necessary for verification
2. **Maximum Opacity**: Hide everything else
3. **Respectful Interaction**: No gamification, no extraction
4. **Symbolic Evolution**: RELIC changes are subtle, not dramatic
5. **Documentation Tone**: Emphasise constraint, not truth

## Technical Stack

- **Circuits**: Circom 2.0+ (Poseidon hash, Groth16 proofs)
- **Contracts**: Solidity 0.8.20, OpenZeppelin, EIP-4906
- **ZK Tools**: snarkjs, circomlibjs
- **Build**: Hardhat for contracts, native circom for circuits
- **Web**: Next.js 14, wagmi, viem
- **Storage**: IPFS via Pinata API
- **Network**: Sepolia testnet (expandable to mainnet)

## Deployment Checklist

- [ ] Define end-states in `zk/inputs/end-states.json`
- [ ] Build Merkle tree (`node build-merkle-tree.js`)
- [ ] Compile circuits (`cd zk/circuits && npm run compile`)
- [ ] Setup circuits (`npm run setup`)
- [ ] Compile contracts (`cd hydra-visualiser && npx hardhat compile`)
- [ ] Deploy contracts (`cd scripts && node deploy-transevil.js`)
- [ ] Generate metadata (`cd metadata && node generate-metadata.js`)
- [ ] Update BASE_URI in contract
- [ ] Configure web UI with contract address
- [ ] Test finale proof generation and submission
- [ ] Test witness proof generation and submission

## Future Enhancements

### Technical
- PLONK circuits (no trusted setup)
- Server-side credential issuance
- Dynamic metadata API
- Multi-party computation for setup
- Hardware wallet integration

### Artistic
- RELIC evolution visualization
- Institutional exhibition interface
- Time-based reveal mechanics
- Multi-chain deployment

## Ethical Boundaries

**This system must NEVER:**
- Claim to prove bodily truth
- Verify medical procedures
- Extract biometric data
- Enable surveillance
- Gamify witnessing
- Create extractive incentives

**This system ALWAYS:**
- Respects privacy and autonomy
- Maintains opacity
- Formalises trust without surveillance
- Uses cryptography poetically, not extractively

---

**The art is in the constraint, not the revelation.**
