'use client';

import { useRouter } from 'next/navigation';

export default function DenialConfirmedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-6xl font-mono mb-12 text-center text-red-500">
          DENIED
        </h1>

        <div className="border-2 border-red-500 p-12 space-y-8">
          <div className="text-center space-y-6">
            <p className="text-xl font-mono text-red-400">
              Your identity has been denied
            </p>

            <p className="text-sm font-mono opacity-70 leading-relaxed">
              Your NFT has been permanently altered.<br />
              Your denial has been recorded on-chain.<br />
              This action cannot be undone.
            </p>
          </div>

          <div className="border-t border-red-500/30 pt-8 space-y-6">
            <h3 className="text-sm font-mono text-red-400 text-center">THE CONTRADICTION</h3>

            <div className="space-y-4 text-xs font-mono opacity-70 leading-relaxed">
              <p>
                You once committed to being Verity. You minted an identity,
                captured a transformation, created a cryptographic commitment.
              </p>

              <p>
                But now you deny it. You say you are not Verity.
              </p>

              <p>
                In a biological system, you cannot escape your body.
                In a commitment system, you cannot escape your word without consequence.
              </p>

              <p className="text-white pt-4">
                The glitch in your NFT is the visual manifestation of this contradiction.
                It is the mark of broken commitment.
              </p>
            </div>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/20">
            <h4 className="text-xs font-mono mb-3 text-red-400">WHAT REMAINS</h4>
            <p className="text-xs font-mono opacity-70 leading-relaxed">
              Your token still exists in your wallet. But it is no longer proof
              of being Verity. It is proof of having been Verity and choosing to deny it.
              The glitch is permanent. The record is permanent. The denial is permanent.
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
          >
            RETURN
          </button>
        </div>

        <div className="mt-8 text-xs font-mono opacity-30 text-center space-y-2">
          <p>You were yourself, until you were not.</p>
          <p>Identity is commitment.</p>
        </div>
      </div>
    </main>
  );
}
