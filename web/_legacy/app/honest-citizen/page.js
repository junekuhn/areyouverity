'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function HonestCitizenPage() {
  const { address, isConnected } = useAccount();
  const [ownsToken, setOwnsToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkStatus();
    }
  }, [isConnected, address]);

  const checkStatus = async () => {
    try {
      setChecking(true);
      // TODO: Implement actual contract calls
      // Check if owns token
      const hasTokens = false;
      setOwnsToken(hasTokens);

      // Check if already blocked
      const isBlocked = false;
      setBlocked(isBlocked);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handlePermanentBlock = async () => {
    try {
      // Call smart contract to permanently block this address
      // await contract.permanentlyBlockSelf();
      setBlocked(true);
    } catch (error) {
      console.error('Error blocking address:', error);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-mono mb-8">CONNECT WALLET</h1>
          <p className="text-sm opacity-70 font-mono">
            To process your response, connect your wallet.
          </p>
        </div>
      </main>
    );
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="animate-pulse text-2xl font-mono">
            Processing...
          </div>
        </div>
      </main>
    );
  }

  // Scenario 2: Owns token + said no
  if (ownsToken) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center text-red-500">
            IDENTITY DENIED
          </h1>

          <div className="border-2 border-red-500 p-12 mb-8">
            <p className="text-xl font-mono mb-8 text-center leading-relaxed">
              You own a Verity identity token,<br />
              yet you deny being Verity.
            </p>

            <div className="space-y-6 text-sm font-mono opacity-70 leading-relaxed">
              <p>
                This is a contradiction that cannot be resolved. You cannot
                simultaneously possess the identity and reject it.
              </p>

              <p>
                Your Verity identity token will now be permanently invalidated.
                It will remain in your wallet as a record of this denial,
                but it will no longer grant access or verification.
              </p>

              <p>
                This is the consequence of denying who you claimed to be.
              </p>
            </div>

            <div className="mt-12 p-6 bg-red-500/10 border border-red-500/50">
              <p className="text-xs font-mono text-center">
                In the biological model, you cannot escape yourself.<br />
                In the commitment model, denial is a choice with consequences.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono opacity-50 text-center space-y-2">
            <p>Your token has been invalidated.</p>
            <p>You are no longer Verity.</p>
            <p className="mt-4">This action is permanent and cannot be undone.</p>
          </div>
        </div>
      </main>
    );
  }

  // Scenario 4: Doesn't own token + said no
  if (blocked) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-5xl font-mono mb-12 text-center">
            PERMANENTLY BLOCKED
          </h1>

          <div className="border border-white/30 p-12 mb-8 opacity-50">
            <p className="text-xl font-mono mb-8 text-center leading-relaxed">
              You have been permanently blocked<br />
              from becoming Verity.
            </p>

            <div className="space-y-6 text-sm font-mono leading-relaxed">
              <p>
                You cannot become what you claim you are not.
              </p>

              <p>
                This wallet address will never be able to mint a Verity
                identity token. This decision is permanent.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono opacity-30 text-center">
            <p>The door is closed.</p>
          </div>
        </div>
      </main>
    );
  }

  // Initial state: doesn't own token, said no, confirming action
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-5xl font-mono mb-12 text-center">
          GOOD LITTLE CITIZEN
        </h1>

        <div className="border border-white p-12 mb-8">
          <p className="text-xl font-mono mb-8 text-center leading-relaxed">
            Thank you for your honesty.
            <br />
            Yes, you are such a good little citizen.
          </p>

          <div className="space-y-6 text-sm font-mono opacity-70 leading-relaxed mb-12">
            <p>
              You have stated that you are not Verity. Since Verity already exists,
              and you are not Verity, you can never become Verity.
            </p>

            <p>
              To maintain the integrity of the identity system, you must be
              permanently blocked from acquiring a Verity identity token.
            </p>

            <p>
              This is not punishment. This is consequence. In a world where
              identity is commitment rather than biology, your words bind you.
            </p>
          </div>

          <div className="p-6 bg-white/5 border border-white/20 mb-8">
            <h3 className="text-sm font-mono mb-4 text-center">THE REASONING</h3>
            <p className="text-xs font-mono opacity-70 leading-relaxed">
              If you are not Verity now, you cannot become Verity later, because
              Verity already exists. To become Verity when you are not Verity is
              to engage in deception. But we have established that you are
              honest. Therefore, you must remain not-Verity.
            </p>
          </div>

          <button
            onClick={handlePermanentBlock}
            className="w-full border-2 border-white px-6 py-6 font-mono hover:bg-white hover:text-black transition text-lg"
          >
            ACCEPT PERMANENT BLOCK
          </button>

          <p className="text-xs font-mono opacity-50 text-center mt-6">
            By clicking above, you acknowledge that you will never be able to
            purchase or create a Verity identity with this wallet address.
          </p>
        </div>

        <div className="text-xs font-mono opacity-30 text-center space-y-2">
          <p>Honesty has consequences in a world built on commitment.</p>
          <p className="mt-4">You chose truth. You chose permanence.</p>
        </div>
      </div>
    </main>
  );
}
