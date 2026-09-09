'use client';

import { useRouter } from 'next/navigation';

export default function IdentityCreatedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-6xl font-mono mb-12 text-center">
          YOU ARE<br />VERITY
        </h1>

        <div className="border border-white p-12 mb-8">
          <div className="space-y-8 text-sm font-mono leading-relaxed">
            <p className="text-center text-xl mb-8">
              Your identity has been created.
            </p>

            <div className="space-y-4 opacity-70">
              <p>
                Your Verity identity token has been minted and is now in your wallet.
                A cryptographic commitment has been stored on-chain, binding you
                to this identity.
              </p>

              <p>
                You are now part of a system where identity is based on commitment,
                not biology. Where multiple people can be one person, and one person
                can be many.
              </p>

              <p>
                Your zero-knowledge proof allows you to verify your identity as Verity
                without revealing any personal data. You can prove who you are without
                disclosure.
              </p>

              <p>
                Remember: denying your identity later will permanently invalidate
                your token. Your commitment binds you.
              </p>
            </div>

            <div className="mt-12 p-6 bg-white/5 border border-white/20">
              <h3 className="text-sm mb-4">WHAT HAPPENS NOW</h3>
              <ul className="text-xs space-y-3 opacity-70">
                <li>• Your token is stored in your wallet</li>
                <li>• You can verify your identity at any time using ZK proofs</li>
                <li>• You have access to Verity-exclusive content and experiences</li>
                <li>• Your contribution funds facial feminisation surgery</li>
                <li>• You are committed to being Verity</li>
              </ul>
            </div>

            <div className="mt-12 space-y-4">
              <button
                onClick={() => router.push('/collection')}
                className="w-full border border-white px-6 py-4 font-mono hover:bg-white hover:text-black transition"
              >
                VIEW YOUR COLLECTION
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full border border-white/30 px-6 py-4 font-mono hover:bg-white hover:text-black transition opacity-50 hover:opacity-100"
              >
                RETURN TO START
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono opacity-30 text-center space-y-2">
          <p>Welcome to a world beyond biological determinism.</p>
          <p>You are Verity. You are yourself.</p>
          <p>Identity is commitment.</p>
        </div>
      </div>
    </main>
  );
}
