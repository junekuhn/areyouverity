# ARE YOU VERITY?
## A Study in Deception, Trust, and Trans Identity

*Rewritten 2026-07-19 to the QUESTIONING canon (10 Verity 2026). The earlier
version of this document described a punitive model — permanent invalidation
and a permanent blocklist — that the work has renounced. It is preserved in
`docs/archive/` with the reasons for its retirement. Where this document and
the site disagree, the site and `web/lib/identity.js` are canon; the flow
diagrams in `areyouverity_export/` are the visual source of truth.*

### Core Concept

This work is a cohesive narrative exploring evil, transness, and deception
through the lens of identity verification systems. It combines:
- A speculative identity document
- Speculative surgery visualization
- An interaction layer that plays with fraud and deception

### The Narrative

Trans people are often seen as deceivers and fraudsters. This piece creates
a fictional interaction layer where there's no clear boundary between what
is 'deception' and what is 'real', at least conventionally. We unpack the
need for authenticity, making the real deception and the deception real,
rendering everything we know questionable.

**The basis for proving identity should be a matter of trust, not biological
determination.**

### The Context

This work, at its core, is a fundraiser for facial feminisation surgery,
which in itself could be seen as:
- A validation of identity in a world where biology connotes authenticity
- An act of deception from the perspective of those who view trans people as
  illegitimate

It's risky because at some point, traveling across the world to look
different, you may not be recognizable to someone who, through vision and
some sociocultural understandings of gender, validates you by comparing an
outdated photo to an updated face. This is the experience this work aims to
play with.

### The Root of Transmisogyny

At the heart of transmisogyny, in our view, is **a lack of trust**. People
do not believe when women say they are women, and their methods of
verification are based on misunderstandings of basic knowledge of sex and
gender.

Deception, however, is not something we as humans avoid at all cost. It's
all over the internet, through anonymity to role playing to actual fraud. We
invite collectors to participate in a system of deception, which of course
begs us to understand the system of trust, cryptography, and verification
that underlies how deception is even possible.

### The Mechanism: Are You Verity?

On the access point, we ask a single question: **Are you Verity?** Then a
second: **Do you have proof?**

Both answers are voluntary, and that is the point. Nothing here demands
proof — "Are you Verity?" is a question, not a checkpoint. A visitor who
answers without proof, or declines to answer at all, remains **NONE**: the
system knows nothing about them, and the door stays open. Systems that
demand you prove who you are before letting you exist are the subject of
this work, not its method.

For those who choose to enter, the process is:
1. **The Agreement** — signed as VERITY or NOTVERITY. A fictional legal
   document; its Article VII says so itself.
2. **Identity Creation** — a generative portrait composed from sliders;
   the slider values become a private witness that never leaves the
   holder's device.
3. **Mint** — a document is issued carrying a Poseidon commitment to that
   witness. The parameters go to the holder alone, as a file.
4. **Proof** — from the parameters, a proof can be generated at any time,
   and the question answered again.

There are no biomarkers anywhere in this process, and at first it seems like
anyone can just be anybody. But after the identification process, collectors
realize there are in fact **consequences to a trust-based system**, moving
reality from biology and physicality towards **commitment**.

### The Decision Tree (the QUESTIONING model)

Contradiction is not punished. It is *witnessed*.

- **Answer consistently with a valid document** → welcome home.
- **Contradict a valid document** → it is marked **QUESTIONING**. Nothing is
  taken; *valid + questioning is still valid*.
- **Reaffirm a questioning document** → the label lifts. It is VALID again.
- **Contradict a questioning document** → it is revoked: **VOID**. The void
  document remains in the collection — voidness is part of its history, and
  a legitimate and meaningful state of being. It may be burned, or kept. A
  new identity may be created beside it.
- **A verified proof whose commitment no registry knows** → VOID: a proof
  without a document is a memory without a body.

There is no blocklist. Answering "no" is not an offence; it is an identity.
A visitor who is not Verity may sign as NOTVERITY and receive the
nonidentification document — a groundbreaking kind of ID.

### The Paradox State

Our system permits holding a valid Verity and a valid Nonverity at once. This is
not an error, and the registry does not pretend it cannot happen: it names
the state **PARADOX** and leaves it with the holder. Each document is
consistent with itself; whether you are consistent across documents is your
own affair. Schrödinger keeps your file open. The registry does not resolve
you — only you can.

### The Trans Link

The link to trans identity is that **you are yourself, until you are not**.
It's hard to say whether the greater deception is:
- Deceiving yourself and others that you're cisgender when you know you're
  trans
- The imposter syndrome (or what feels like deception) that's felt as a
  result of assuming a new identity when it's not completely formed yet

In any case, a new identity must be created, and you add that identity until
a new one is necessitated. The QUESTIONING state is this document's heart: a
bureaucracy that metabolizes self-contradiction with grace instead of
punishment — the inverse of every real ID system trans people deal with.

### Breaking the One-Body, One-Identity Logic

The fear that 'anyone can be anybody' evaporates once the consequences of
interactions become apparent: the document remembers what you said, and
changing your answer is possible but never free.

The old motto of "don't trust, verify" in crypto means nothing if the system
of verification is flawed by prejudice and misunderstanding. **Community is
only possible through a system of trust in the verification system.**

Our system, deliberately, allows for:
- **Multiple people to become one person**
- **The assumption of multiple identities**

The question of "Are you Verity?" does not assume that Verity is one person, nor
that any person can only be Verity — only that you remain committed about the
identity(ies) that you assume. Verity is both a person who concretely exists
(the artist, whose surgery this work funds) and a commons that signers enter:
by the Agreement's Article IV, no singular authority determines the
boundaries of Verityness; its meaning is continuously constructed through
participation, declaration, recognition, and refusal. Both are true at once.
That is not a contradiction; it is the work.

The logic of one-body, one-identity is broken and a world of plurality
begins to open. **You can be Verity and be you once breaking free of the
biological model.**

It's possible that collectors will be deceived into believing that what
they're doing is deception the whole time.

### Technical Implementation (honest)

1. **Commitment scheme**: a real Poseidon hash over the private generative
   parameters + salt. The proof files are Groth16-shaped demonstrations
   (`groth16-demo`) until the circuit is live, and they say so on their
   face. The site declares its demonstration mode in-page.
2. **Identity Creation**: collectors compose a "Verity" identity using
   distorted facial imagery as reference. Slider values are the private
   witness; the captured portrait is the document's public face.
3. **State machine**: VERITY/NOTVERITY × VALID/QUESTIONING/VOID with reaffirm,
   implemented in `web/lib/identity.js` and mirrored on-chain by
   `contracts/VerityIdentityNFT_v4.sol` (verifier-ready: a real Groth16
   verifier can be set once and locked forever).
4. **Multiple Verity Support**: multiple collectors can all be Verity
   simultaneously; one collector can be Verity and Nonverity simultaneously
   (PARADOX).
5. **No blocklist, no confiscation, no denial premium**: renounced, on
   purpose, with the punitive model.

### Artistic Statement

This is not just about proving you are who you say you are. It's about the
commitment to identity in the face of a world that demands biological proof.
It's about the freedom to become, to multiply, to exist in plurality — and
the right to be questioned without being revoked. It's about trust as the
foundation of community, not verification through violence.

**Are you Verity?**
