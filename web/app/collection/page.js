'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import IDCard from '../components/IDCard';
import { useIdentity } from '@/hooks/useIdentity';
import { isParadox } from '@/lib/identity';
import html2canvas from 'html2canvas';

const GREETINGS = {
  verity: { title: 'Hi, Verity.', sub: 'Your identity is valid.' },
  nonverity: {
    title: 'Hi, Nonverity.',
    sub: 'Your identity is valid.',
  },
};

function CollectionContent() {
  const searchParams = useSearchParams();
  const { tokens, ready } = useIdentity();
  const itemRefs = useRef(new Map());
  const [downloading, setDownloading] = useState(false);

  // A personalised greeting only makes sense when a document exists to
  // greet — an empty registry gets the neutral title regardless of URL.
  const greeting =
    (tokens.length > 0 && GREETINGS[searchParams.get('hi')]) || {
      title: 'The Collection.',
      sub: 'Your collection of ID documents currently in your wallet.',
    };

 const downloadAsImage = async (index) => {

        const element = itemRefs.current.get(index);
        console.log(element)
        if (!element) return;
        setDownloading(true);

        try {
          // Temporarily apply inline styles for better capture
          const originalStyle = element.style.cssText;
          element.style.cssText += `
            color: #000000 !important;
            background-color: #ffffff !important;
          `;

          const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Increase to 3x for sharper image
        logging: false,
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Restore original styles
      element.style.cssText = originalStyle;

      canvas.toBlob((blob) => {
        if (!blob) {
          setDownloading(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
    
        link.download = `ID-CARD-${Date.now()}.png`;
        
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
    <div className="page page-wide">
      <div className="space-y-12">
        <div className="space-y-3 rise">
          <p className="kicker">Collection</p>
          <h1 className="question-lg glitch-hover">{greeting.title}</h1>
          <p className="prose-dim max-w-lg">{greeting.sub}</p>
          {isParadox(tokens) && (
            <p
              className="prose-dim max-w-lg text-[0.8rem]"
              style={{ color: 'var(--questioning)' }}
            >
              You hold a valid Verity and a valid Nonverity at once. Your secret is safe here.
            </p>
          )}
        </div>

        {ready && tokens.length === 0 ? (
          <div className="panel max-w-md rise d1 space-y-4">
            <p className="prose-dim">
              No identity documents exist in this registry yet. Everything
              begins with the question.
            </p>
            <Link href="/" className="btn btn-solid">
              Are you Verity?
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 xl:grid-cols-2 gap-8 rise d1">
            {tokens.map((t, index) => (
              <div key={t.id} className="space-y-3">
                <IDCard token={t} key={index}
                    ref={(el) => 
                      itemRefs.current.set(index, el)}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={`chip ${
                      t.status === 'VALID'
                        ? 'valid'
                        : t.status === 'QUESTIONING'
                          ? 'questioning'
                          : 'void'
                    }`}
                  >
                    {t.status}
                  </span>
                  {t.status === 'VOID' && (
                    <span className="flex gap-4 items-center">
                      <Link
                        href={`/agreement?as=${
                          t.kind === 'NOTVERITY' ? 'nonverity' : 'verity'
                        }&renew=${encodeURIComponent(t.id)}`}
                        className="btn-quiet"
                      >
                        renew
                      </Link>
                      <Link
                        href={`/burn?id=${encodeURIComponent(t.id)}`}
                        className="btn-quiet"
                        style={{ color: 'var(--void)' }}
                      >
                        burn
                      </Link>
                    </span>
                  )}
                <button
                    onClick={() => downloadAsImage(index)}
                    className="btn"
                    style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-ink)' }}
                    disabled={downloading}
                  >
                    {downloading ? 'Downloading…' : 'Download ID'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tokens.length > 0 && (
          <div className="flex flex-wrap gap-4 rise d2">
            <Link href="/agreement" className="btn">
              Create another ID
            </Link>
            <Link href="/" className="btn-quiet self-center">
              back to the question
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <CollectionContent />
    </Suspense>
  );
}
