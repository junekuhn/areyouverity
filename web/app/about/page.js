'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="page">
      <article className="document rise">
        <p className="doc-kicker">Curatorial statement · Explainer</p>
        <h1>About &ldquo;Are You Verity?&rdquo; and Zero Knowledge Proofs</h1>

        <hr className="doc-rule" />

        <p>
        This piece is a fundraiser for facial feminisation surgery for June, and a challenge to the ways we verify someone is who they say they are. Trans people are often seen as deceivers, because the basis for identity is often determined by a conflation of gender and sex assigned at birth. This predicament often forces trans people to carry ID&lsquo;s that are both inaccurate and &lsquo;out&lsquo; them to the whims of a legal verification system. <strong>The basis for proving identity should be a matter of trust, not biological determination.</strong>
        </p>

        <p>
        Zero-Knowledge Proofs (ZK-proofs) are a form of cryptography that uses advanced mathematical algorithms to verify information in a way that doesn&lsquo;t require the ID holder to reveal vulnerable information, like gender, sex assigned at birth, age, or nationality. This affords the ID holder the ability to answer a more basic, simple question than revealing personally identifiable information. The question <strong>“Are you Verity?”</strong> is the only relevant question, because that&lsquo;s the only piece of information that this system is looking for.
        </p>

        <p>
          This doesn&rsquo;t mean there aren&rsquo;t consequences for your
          actions, however. The ZK-proof in this system does not allow a
          document to be inconsistent with itself. Each generated art piece
          is a valid or void proof of identity, whether or not you are
          Verity.{' '}
          <strong>You can be Verity, until you say that you&rsquo;re not.</strong>{' '}
        </p>

        <p>
        After reading this you may have come to the realisation that you are, in fact, Verity. Click &ldquo;Back&rdquo; to go back to the front page.
        </p>

        <hr className="doc-rule" />

        <h2 style={{ fontSize: '0.9rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Index of Terminology
        </h2>

        <ul>
          <li>Zero-Knowledge Proofs: A form of cryptography that uses advanced mathematical algorithms to verify information</li>
          <li>
            Prover: You
          </li>
          <li>Verifier: This Website</li>
          <li>Signals: Private information that you don&lsquo;t want revealed, in this case slider (parameter) values used in the creation of an ID and a timestamp</li>
          <li>Groth16: Format for the proof, three coordinate pairs bound to your commitment in the NFT smart contract.</li>
          <li>Commitment: Cryptographic hash stored on smart contract used to verify the proof</li>
          <li>Smart Contract: Code stored on the blockchain that can be executed by wallet interactions on this site and holds the NFT contract</li>
          <li>Non-Fungible Token (NFT): Your digital ID &lsquo;card&lsquo;, stored on a smart contract on the blockchain. This is not the proof.</li>
          <li>Poseidon: a type of hash function used to compute the commitment from the parameters</li>
        </ul>

        {/* <hr className="doc-rule" />

        <h2 style={{ fontSize: '0.9rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Protocol status
        </h2>
        <p style={{ fontSize: '0.85rem' }}>
          This website is a simple implementation of a ZK Proof, asking a single question, while an NFT itself is not valid on its own.  
        </p> */}

        <hr className="doc-rule" />

        <div className="flex flex-wrap gap-3 not-prose">
          <button
            className="btn"
            style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-ink)' }}
            onClick={() => router.push('/')}
          >
            Back
          </button>
          {/* <Link
            href="/agreement?as=nonverity"
            className="btn"
            style={{
              background: 'var(--paper-ink)',
              color: 'var(--paper)',
              borderColor: 'var(--paper-ink)',
            }}
          >
            Validate as Not Verity
          </Link> */}
          <Link
            href="/credits"
            className="btn"
            style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-line)' }}
          >
            Credits / AI usage statement
          </Link>
        </div>
      </article>
    </div>
  );
}
