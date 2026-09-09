'use client';

import { useRouter } from 'next/navigation';

export default function ContradictionConfirmedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-6xl font-mono mb-12 text-center text-yellow-500">
          CONTRADICTED
        </h1>

        <div className="border-2 border-yellow-500 p-12 space-y-8">
          <div className="text-center space-y-6">
            <p className="text-xl font-mono text-yellow-400">
              Your contradiction has been recorded
            </p>

            <p className="text-sm font-mono opacity-70 leading-relaxed">
              Your NFT has been permanently transformed.<br />
              Your contradiction has been written to the blockchain.<br />
              This action cannot be undone.
            </p>
          </div>

          <div className="border-t border-yellow-500/30 pt-8 space-y-6">
            <h3 className="text-sm font-mono text-yellow-400 text-center">
              THE PARADOX
            </h3>

            <div className="space-y-4 text-xs font-mono opacity-70 leading-relaxed">
              <p>
                You once said you were Verity. You created an identity,
                captured a transformation, made a cryptographic commitment.
              </p>

              <p>
                But now you deny it. You say you are not Verity.
              </p>

              <p>
                Both statements exist on-chain. Both are true.
                Both are false. This is the space trans people often inhabit -
                between who we were and who we are becoming.
              </p>

              <p className="text-white pt-4">
                Your glitched NFT is the visual manifestation of this paradox.
                It is the mark of transformation, of change, of living
                between states.
              </p>
            </div>
          </div>

          <div className="p-6 bg-yellow-500/5 border border-yellow-500/20">
            <h4 className="text-xs font-mono mb-3 text-yellow-400">
              RARITY STATUS
            </h4>
            <p className="text-xs font-mono opacity-70 leading-relaxed">
              Your token is now in the CONTRADICTED state - the rarest
              tier in the collection (&lt;1% of supply). Most collectors
              won't transform their tokens. You did. This makes yours
              uniquely valuable.
            </p>
          </div>

          <div className="p-6 bg-white/5 border border-white/20">
            <h4 className="text-xs font-mono mb-3 opacity-50">WHAT REMAINS</h4>
            <p className="text-xs font-mono opacity-70 leading-relaxed">
              Your token still exists in your wallet. But it is no longer
              just proof of being Verity. It is proof of having been Verity,
              denying Verity, and living in the contradiction. The glitch is
              permanent. The record is permanent. The paradox is permanent.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/verity-registry')}
              className="flex-1 border border-yellow-500 px-6 py-4 font-mono hover:bg-yellow-500/10 transition"
            >
              VIEW VERITY REGISTRY
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 border border-white/30 px-6 py-4 font-mono hover:bg-white/10 transition"
            >
              RETURN HOME
            </button>
          </div>
        </div>

        <div className="mt-8 text-xs font-mono opacity-30 text-center space-y-2">
          <p>You were Verity, until you were not.</p>
          <p>Both states are real.</p>
          <p>Identity is transformation.</p>
        </div>
      </div>
    </main>
  );
}
