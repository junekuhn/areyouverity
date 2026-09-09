'use client';

import { useRouter } from 'next/navigation';

export default function CreditsPage() {
  const router = useRouter();

  return (
    <div className="page">
      <article className="document rise">
        <p className="doc-kicker">Colophon</p>
        <h1>Credits / Statement of AI Usage</h1>

        <hr className="doc-rule" />

        <p className="mono" style={{ lineHeight: 2 }}>
          Artist and Developer: June Kuhn
          <br />
          Curator and Developer: Atay Ilgun
          <br />
          Studio: Softworld
        </p>

        <h2>AI has been used in some of the structural components of this work, including</h2>
        <ul>
          <li>Website scaffolding and smart contract generation</li>
          <li>Recommendations for ZK-proof algorithm choice and development</li>
          <li>Template for THE AGREEMENT</li>
        </ul>

        <h2>AI has NOT been used for</h2>
        <ul>
          <li>Hydra code or generative video art</li>
          <li>Artistic statements</li>
          <li>Political stances or research therein</li>
          <li>Systems development or UX design</li>
          <li>Textual content</li>
        </ul>

        <hr className="doc-rule" />

        <button
          className="btn"
          style={{ color: 'var(--paper-ink)', borderColor: 'var(--paper-ink)' }}
          onClick={() => router.back()}
        >
          Back
        </button>
      </article>
    </div>
  );
}
