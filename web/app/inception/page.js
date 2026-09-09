'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function InceptionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [signAs, setSignAs] = useState('verity');
    const [isReady, setIsReady] = useState(false);

    // Get the 'as' parameter from URL to determine if user is Verity or Nonverity
    useEffect(() => {
        const asParam = searchParams.get('as');
        if (asParam === 'nonverity') {
            setSignAs('nonverity');
        } else {
            setSignAs('verity');
        }
        setIsReady(true);
    }, [searchParams]);

    const isVerity = signAs === 'verity';
    const renew = searchParams.get('renew') || null;

    const handleContinue = () => {
        // Navigate to the Agreement page with the same parameters
        router.push(
            `/agreement?as=${signAs}${renew ? `&renew=${encodeURIComponent(renew)}` : ''}`
        );
    };

    if (!isReady) {
        return <div className="page" />;
    }

    return (
        <div className="page">
            <article className="document rise">
                {/* <p className="doc-kicker">Colophon</p> */}
                <h1>Identity Inception</h1>

                <p>
                    You claim to be {isVerity ? 'Verity' : 'Nonverity'}, but you do not yet have a{' '}
                    {isVerity ? 'Verity' : 'Nonverity'} ID token or proof.
                </p>

                <p>
                    To verify that you are {isVerity ? 'Verity' : 'Nonverity'}, you must commit by
                    creating a token. This process is a matter of transformation, by creating an image
                    whose data will be used to verify you later on.
                </p>

                <p>The process for verification is as follows:</p>
                <ul>
                    <li>Sign THE AGREEMENT</li>
                    <li>Customise your ID (NFT Token)</li>
                    <li>Mint your ID</li>
                    <li>Generate a Zero-Knowledge Proof</li>
                    <li>
                        Celebrate the accomplishment of ratifying whether you&rsquo;re Verity
                    </li>
                </ul>

                <div className="flex flex-wrap gap-3 pt-4">
                    <button
                        className="btn"
                        style={{
                            background: 'var(--paper-ink)',
                            color: 'var(--paper)',
                            borderColor: 'var(--paper-ink)',
                        }}
                        onClick={handleContinue}
                    >
                        Continue
                    </button>

                    <button
                        className="btn"
                        style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-ink)' }}
                        onClick={() => router.back()}
                    >
                        Back
                    </button>
                </div>
            </article>
        </div>
    );
}

export default function InceptionPage() {
    return (
        <Suspense fallback={<div className="page" />}>
            <InceptionContent />
        </Suspense>
    );
}
