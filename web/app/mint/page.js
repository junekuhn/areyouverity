'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import IDCard from '../components/IDCard';
import { mintToken } from '@/lib/identity';
import {
  computeCommitment,
  randomSalt,
  buildParametersFile,
  downloadJSON,
  shortRef,
} from '@/lib/commitment';

export default function MintPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [pending, setPending] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | committing | done
  const [minted, setMinted] = useState(null);
  const [mintError, setMintError] = useState(null);
  const [paramsFile, setParamsFile] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('ayj.pending');
    if (!raw) {
      router.replace('/create');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      // A face locked in under one declaration must not mint under
      // another: re-signing the Agreement invalidates the old lock-in.
      const signed = sessionStorage.getItem('ayj.signedAs');
      const signedKind = signed === 'nonverity' ? 'NOTVERITY' : 'VERITY';
      if (signed && parsed.kind !== signedKind) {
        sessionStorage.removeItem('ayj.pending');
        router.replace('/create');
        return;
      }
      setPending(parsed);
    } catch {
      router.replace('/create');
    }
  }, [router]);

  const mint = async () => {
    if (!pending || phase !== 'idle') return;
    setPhase('committing');
    setMintError(null);
    try {
      const salt = randomSalt();
      const commitment = await computeCommitment(pending.params, salt);
      const token = mintToken({
        kind: pending.kind,
        image: pending.image,
        commitment,
        address: isConnected ? address : undefined,
        replaces: pending.replaces,
      });

      // The private witness leaves in a file, never in our storage.
      const filename = `${shortRef(commitment)}-parameters.json`;
      const file = buildParametersFile({ token, params: pending.params, salt });
      downloadJSON(file, filename);
      setParamsFile({ file, filename });

      sessionStorage.setItem(
        'ayj.lastMint',
        JSON.stringify({ tokenId: token.id, commitment, kind: token.kind })
      );
      sessionStorage.removeItem('ayj.pending');
      setMinted(token);
      setPhase('done');
    } catch (e) {
      console.error('Mint failed:', e);
      setMintError(
        'The document could not be issued. If this browser’s registry storage is full, burn a void document or clear space, then try again.'
      );
      setPhase('idle');
    }
  };

  if (!pending) return <div className="page" />;

  const kindLabel = pending.kind === 'NOTVERITY' ? 'Nonverity' : 'Verity';
  const preview = minted || {
    kind: pending.kind,
    status: 'VALID',
    image: pending.image,
    commitment: null,
    address: isConnected ? address : 'UNCONNECTED',
    inception: new Date().toISOString(),
  };

  return (
    <div className="page page-wide">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* the document being issued */}
        <div className="rise max-w-xl w-full mx-auto lg:mx-0">
          <IDCard token={preview} />
        </div>

        <div className="space-y-8">
          {phase !== 'done' ? (
            <>
              <div className="space-y-3 rise">
                <p className="kicker">Identity Inception · Step 3 of 4</p>
                <h1 className="question-lg">Mint your {kindLabel} ID.</h1>
              </div>

              <div className="prose-dim space-y-3 rise d1">
                <p>
                  Minting your token generates a cryptographic “commitment” from the parameters you chose. In this case a Poseidon hash function is used.
                </p>
                <p>
                  <strong style={{ color: 'var(--ink)' }}>
                    This website does not store your parameters.
                  </strong>{' '}
                  Store the file in a safe and secure location, like you would
                  a main password or a crypto wallet recovery code. They are
                  the only way to prove your {kindLabel}ness if you sell your token or your wallet is compromised. 
                </p>
                {!isConnected && (
                  <p style={{ color: 'var(--questioning)' }}>
                    Connect a wallet above to bind your token to your wallet address.
                  </p>
                )}
              </div>

              <div className="rise d2 space-y-4">
                <button
                  className="btn btn-solid btn-lg"
                  onClick={mint}
                  disabled={phase !== 'idle'}
                >
                  {phase === 'committing' ? (
                    <span className="cursor-blink">Committing</span>
                  ) : (
                    'MINT AND DOWNLOAD PRIVATE PARAMETERS'
                  )}
                </button>
                {mintError && (
                  <p
                    className="text-[0.72rem] tracking-wider"
                    style={{ color: 'var(--void)' }}
                  >
                    MINT FAILED — {mintError}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 rise">
                <p className="kicker">Document issued</p>
                <h1 className="question-lg">Hello, {kindLabel}.</h1>
              </div>
              <div className="prose-dim space-y-3 rise d1">
                <p>
                  Your private parameters have been downloaded. Guard the
                  file — it cannot be recovered once you leave this page.
                  One step remains: generating the proof that lets you
                  answer the question.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 rise d2">
                <button
                  className="btn btn-solid btn-lg"
                  onClick={() => router.push('/proof?fresh=1')}
                >
                  Proceed to proof
                </button>
                {paramsFile && (
                  <button
                    className="btn"
                    onClick={() => downloadJSON(paramsFile.file, paramsFile.filename)}
                  >
                    Download parameters again
                  </button>
                )}
                {/* <button className="btn" onClick={() => router.push('/collection')}>
                  Skip — view collection
                </button> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
