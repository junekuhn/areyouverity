'use client';

import { Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';
import html2canvas from 'html2canvas';

function AgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [signAs, setSignAs] = useState(
    searchParams.get('as') === 'nonverity' ? 'nonverity' : 'verity'
  );
  const renew = searchParams.get('renew') || null;
  const [signing, setSigning] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const articleRef = useRef(null);

  const execute = async () => {
    setSigning(true);
    setDeclined(false);
    const declaration = signAs === 'verity' ? 'VERITY' : 'NONVERITY';
    let signature = 'SYMBOLIC';
    try {
      if (isConnected) {
        signature = await signMessageAsync({
          message: `THE AGREEMENT\n\nSigned this day as: ${declaration}\n\nA Declaration of Identity, Proof, and Participation.`,
        });
      }
    } catch {
      setSigning(false);
      setDeclined(true);
      return;
    }
    // Re-signing under a different declaration voids any face locked in
    // under the previous one — the mint kind follows the live signature.
    try {
      const pending = JSON.parse(sessionStorage.getItem('ayj.pending') || 'null');
      const kind = signAs === 'nonverity' ? 'NONVERITY' : 'VERITY';
      if (pending && pending.kind !== kind) {
        sessionStorage.removeItem('ayj.pending');
      }
    } catch {
      sessionStorage.removeItem('ayj.pending');
    }
    sessionStorage.setItem('ayj.signedAs', signAs);
    sessionStorage.setItem('ayj.signature', signature);
    router.push(
      `/create?as=${signAs}${renew ? `&renew=${encodeURIComponent(renew)}` : ''}`
    );
  };

 const downloadAsImage = async () => {
  if (!articleRef.current) return;
  setDownloading(true);

  try {
    // Temporarily apply inline styles for better capture
    const originalStyle = articleRef.current.style.cssText;
    articleRef.current.style.cssText += `
      color: #000000 !important;
      background-color: #ffffff !important;
    `;

    const canvas = await html2canvas(articleRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, // Increase to 3x for sharper image
      logging: false,
      useCORS: true,
      windowWidth: articleRef.current.scrollWidth,
      windowHeight: articleRef.current.scrollHeight,
    });

    // Restore original styles
    articleRef.current.style.cssText = originalStyle;

    canvas.toBlob((blob) => {
      if (!blob) {
        setDownloading(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const declaration = signAs === 'verity' ? 'VERITY' : 'NONVERITY';
      link.download = `THE-AGREEMENT-${declaration}-${Date.now()}.png`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 'image/png');
  } catch (error) {
    console.error('Error capturing image:', error);
    setDownloading(false);
  }
};
  return (
    <div className="page">
      <article className="document rise" ref={articleRef}>
        <p className="doc-kicker">For execution by cryptographic signature</p>
        <h1>The Agreement</h1>
        <p
          className="mono"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--paper-faint)',
          }}
        >
          Step 1 of 4: A Declaration of Identity, Proof, and Participation
        </p>

        <hr className="doc-rule" />

        <p>
          <strong>THIS AGREEMENT</strong> (&ldquo;The Agreement&rdquo;) is
          entered into voluntarily by the undersigned party (&ldquo;The
          Signer&rdquo;), hereafter referred to as <strong>Verity</strong> or{' '}
          <strong>Nonverity</strong>, on the date of execution through
          cryptographic transaction and symbolic signature.
        </p>

        <h2>Preamble</h2>
        <p>
          <strong>WHEREAS</strong>, this Agreement forms part of an artistic
          fundraising work in support of Verity&rsquo;s facial feminisation
          surgery and serves as an examination of the mechanisms by which
          identity is verified, authenticated, and socially recognised;
        </p>
        <p>
          <strong>WHEREAS</strong>, systems of legal and bureaucratic
          identification have historically relied upon the disclosure of
          biological and personal information, including sex assigned at
          birth, resulting in circumstances where trans individuals may be
          required to carry documents that misrepresent them or expose them to
          the judgement and limitations of external legal verification
          systems;
        </p>
        <p>
          <strong>WHEREAS</strong>, this work proposes an alternative basis
          for identification founded not upon biological determination, but
          upon trust, self-declaration, and a simple question:
        </p>
        <p>
          <strong>ARE YOU VERITY?</strong>
        </p>

        <h2>Article I — On Zero-Knowledge Proof</h2>
        <p>
          The Signer acknowledges that this work employs the concept of
          Zero-Knowledge Proofs (ZK-Proofs), a form of cryptographic
          verification through which the validity of a statement may be
          demonstrated without revealing the underlying private information
          from which that validity is derived.
        </p>
        <p>
          The Signer recognises that, within this system, information such as
          gender, sex assigned at birth, age, nationality, or other personally
          identifiable characteristics (e.g. generative slider parameters and
          timestamp of Inception) are neither required nor requested. The only
          information relevant to this Agreement is the truthfulness of the
          statement in this moment:
        </p>
        <p>
          <strong>I AM VERITY or I AM NONVERITY</strong>
        </p>

        <h2>Article II — On the Creation of Private Knowledge</h2>
        <p>
          The Signer acknowledges that, prior to entering this Agreement, they
          created a personalised avatar through the selection of specific
          parameters and the frame capture of an animation at a particular
          moment.
        </p>
        <p>
          These selections constitute private knowledge and function as a
          symbolic representation of biological information that, within the
          logic of this work, should not be disclosed or transferred to
          another person, ever. This website does not store this information,
          only generating a cryptographic hash that{' '}
          <strong>verifies that the information exists on the blockchain.</strong>
        </p>
        <p>
          The transfer or sale of any associated NFT artwork does not transfer
          this private knowledge. Any subsequent holder must undertake their
          own process of declaration and proof in order to establish their own
          Verityness. Upon transfer or sale of NFT artwork, Verityness remains.
        </p>

        <h2>Article III — On Validity and Voidness</h2>
        <p>
          The Signer understands that each generated artwork constitutes a
          proof of identity and may be determined as either valid or void
          according to the internal rules of this system. The Signer may exist
          as Verity until such time as they declare otherwise.
        </p>
        <p>
          Voidness shall not constitute punishment, exclusion, or loss of
          access to previously obtained works, collections, or interactions.
          The Signatory retains the right to undergo the process of
          declaration again and seek a new state of valid Verityness.
        </p>
        <p>
          The Signer further acknowledges that voidness may itself represent
          a legitimate and meaningful state of being.
        </p>

        <h2>Article IV — On the Collective Definition of Verity</h2>
        <p>
          By entering into this Agreement, the Signer joins all other signers
          in the ongoing and collective determination of what it means to be
          Verity.
        </p>
        <p>
          No singular authority shall determine the boundaries of Verityness.
          Its meaning is continuously constructed through participation,
          declaration, recognition, and refusal.
        </p>

        <h2>Article V — On the Right to Renounce Verityness</h2>
        <p>
          Should the Signatory determine that they no longer possess an
          affinity with their Verityness, they may challenge their own identity
          by returning to the primary interface, submitting their proof, and
          answering the foundational question:
        </p>
        <p>
          <strong>ARE YOU VERITY?</strong>
        </p>
        <p>with a different declaration.</p>

        <h2>Article VI — Execution and Signature</h2>
        <p>
          The Signatory acknowledges that the formal execution of this
          Agreement shall occur through the cryptographic signature of their
          wallet address.
        </p>
        <p>
          For the purposes of this document, however, the Signatory shall sign
          only as:
        </p>
        <p>
          <strong>VERITY</strong>
          <br />
          or
          <br />
          <strong>NONVERITY</strong>
        </p>
        <p>No further identification shall be required.</p>

        <h2>Article VII — Disclaimer and Limitation of Effect</h2>
        <p>
          This Agreement is a fictional and artistic document and shall carry
          no legal authority, contractual force, or enforceable obligation in
          any jurisdiction. Execution of this Agreement does not alter the
          Signer&rsquo;s legal identity, rights, responsibilities, or status.
          Its sole function is to grant access to specific content,
          interactions, and experiences within this website and the artwork to
          which it belongs.
        </p>

        <hr className="doc-rule" />

        <p
          className="mono"
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: 'var(--paper-faint)',
            textTransform: 'uppercase',
          }}
        >
          Exhibition notice — this instance runs in demonstration mode. The
          registry of documents lives in this browser only; no blockchain
          transaction occurs, and proofs are Poseidon commitments in Groth16
          form. When the Verity contract and circuits are deployed, execution
          becomes on-chain without changing this Agreement.
        </p>

        <hr className="doc-rule" />

        {/* ---- signature block ---- */}
        <div className="mono space-y-5" style={{ fontSize: '0.8rem' }}>
          <p
            style={{
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Signed this day as:
          </p>

          <label className="checkline">
            <input
              type="radio"
              name="signAs"
              checked={signAs === 'verity'}
              onChange={() => setSignAs('verity')}
            />
            <span className="box" />
            <span style={{ letterSpacing: '0.14em' }}>VERITY</span>
          </label>

          <label className="checkline">
            <input
              type="radio"
              name="signAs"
              checked={signAs === 'nonverity'}
              onChange={() => setSignAs('nonverity')}
            />
            <span className="box" />
            <span style={{ letterSpacing: '0.14em' }}>NONVERITY</span>
          </label>

          <div
            style={{
              borderTop: '1px solid var(--paper-line)',
              paddingTop: '1.2rem',
              color: 'var(--paper-faint)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
            }}
          >
            <p style={{ margin: '0.2rem 0' }}>
              WALLET ADDRESS (CRYPTOGRAPHIC EXECUTION):{' '}
              {isConnected ? address : '— no wallet connected · signature will be symbolic —'}
            </p>
            <p style={{ margin: '0.2rem 0' }}>
              SIGNATURE (SYMBOLIC DECLARATION): {signAs.toUpperCase()}
            </p>
          </div>

          {declined && (
            <p style={{ color: 'var(--void)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              SIGNATURE DECLINED — the Agreement remains unexecuted.
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="btn"
              style={{
                background: 'var(--paper-ink)',
                color: 'var(--paper)',
                borderColor: 'var(--paper-ink)',
              }}
              disabled={signing}
              onClick={execute}
            >
              {signing ? 'Awaiting signature…' : `Execute as ${signAs === 'verity' ? 'Verity' : 'Nonverity'}`}
            </button>
            <button
              className="btn"
              style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-ink)' }}
              onClick={() => router.push('/')}
            >
              Back
            </button>
            <button
              onClick={downloadAsImage}
              className="btn"
              style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-ink)' }}
              disabled={downloading}
            >
              {downloading ? 'Downloading…' : 'Download Agreement'}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <AgreementContent />
    </Suspense>
  );
}
