'use client';

import dynamic from 'next/dynamic';

const PlaygroundStudio = dynamic(() => import('./PlaygroundStudio'), {
  ssr: false,
});

export default function PlaygroundPage() {
  return <PlaygroundStudio />;
}
