'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function DenyPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [denied, setDenied] = useState(false);

  const handleDeny = async () => {
    try {
      setProcessing(true);

      // TODO: Call smart contract to invalidate token
      // await contract.denyBeingVerity(tokenId);

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      setDenied(true);
      setProcessing(false);
    } catch (error) {
      console.error('Error denying identity:', error);
      setProcessing(false);
    }
  };

  if (denied) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center text-red-500">
            IDENTITY INVALIDATED
          </h1>

          <div className="border-2 border-red-500 p-12 mb-8">
            <p className="text-xl font-mono mb-8 text-center leading-relaxed">
              You are no longer Verity.
            </p>

            <div className="space-y-6 text-sm font-mono opacity-70 leading-relaxed">
              <p>
                Your Verity identity token has been permanently invalidated.
                It remains in your wallet as a record of this denial, but
                it no longer grants access or verification.
              </p>

              <p>
                You chose to deny who you claimed to be. In a system based
                on commitment rather than biology, this denial has consequences.
              </p>

              <p>
                The token cannot be restored. This decision is final.
              </p>
            </div>

            <div className="mt-12 p-6 bg-red-500/10 border border-red-500/50">
              <p className="text-xs font-mono text-center leading-relaxed">
                You were yourself, until you were not.<br />
                The greater deception may have been claiming to be Verity<br />
                when you knew you were not committed.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full border border-white/30 px-6 py-4 font-mono hover:bg-white hover:text-black transition opacity-50 hover:opacity-100"
          >
            RETURN TO START
          </button>

          <div className="mt-8 text-xs font-mono opacity-30 text-center">
            <p>The commitment is broken.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-5xl font-mono mb-12 text-center text-red-500">
          DENY IDENTITY
        </h1>

        <div className="border-2 border-red-500 p-12 mb-8">
          <div className="mb-12">
            <p className="text-xl font-mono mb-8 text-center leading-relaxed">
              Are you certain you want to deny being Verity?
            </p>

            <div className="space-y-6 text-sm font-mono opacity-70 leading-relaxed">
              <p>
                You own a Verity identity token. This token represents a cryptographic
                commitment to the identity you created. By denying this identity,
                you are breaking that commitment.
              </p>

              <p>
                This action will permanently invalidate your token. It will remain
                in your wallet as evidence of this denial, but it will no longer
                function as proof of identity or grant any access.
              </p>

              <p>
                You cannot undo this action. You cannot reclaim this identity.
                If you wish to become Verity again in the future, you will need
                to create a new identity and mint a new token.
              </p>

              <div className="mt-8 p-6 bg-red-500/10 border border-red-500/50">
                <h3 className="text-sm mb-4">CONSEQUENCES</h3>
                <ul className="text-xs space-y-2">
                  <li>• Your token will be permanently invalidated</li>
                  <li>• You will lose all access granted to Verity identities</li>
                  <li>• This action cannot be reversed</li>
                  <li>• The token will remain in your wallet as a record</li>
                  <li>• You can create a new identity, but this one is lost forever</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-xs font-mono">
                I understand that this action is permanent and irreversible
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/verify')}
              className="border border-white px-6 py-4 font-mono hover:bg-white hover:text-black transition"
            >
              CANCEL
            </button>

            <button
              onClick={handleDeny}
              disabled={!confirmed || processing}
              className="border-2 border-red-500 text-red-500 px-6 py-4 font-mono hover:bg-red-500 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {processing ? 'PROCESSING...' : 'DENY IDENTITY'}
            </button>
          </div>
        </div>

        <div className="text-xs font-mono opacity-50 text-center space-y-2">
          <p>In the biological model, you cannot escape yourself.</p>
          <p>In the commitment model, denial is a choice with consequences.</p>
        </div>
      </div>
    </main>
  );
}
