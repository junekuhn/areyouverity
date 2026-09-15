'use client';

import { forwardRef } from 'react';

/**
 * The speculative identity document — interim frame.
 * Status is shown only by a coloured dot (green / purple / blue); no
 * stamps, no serial number, no machine-readable zone. A fuller frame
 * design is coming from the artist.
 */

const STATUS = {
  VALID: { label: 'Valid', color: 'var(--valid)' },
  QUESTIONING: { label: 'Questioning', color: 'var(--questioning)' },
  VOID: { label: 'Void', color: 'var(--void)' },
};

const IDCard = forwardRef(({ token, className = '' }, ref) => {
  if (!token) return null;

  const { kind, status, image, commitment, address, inception } = token;
  const s = STATUS[status] || STATUS.VALID;

  return (
    <div
      ref={ref}
      className={`idcard ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      <div className="id-head">
        <span>Verity Identity Document</span>
        <span className="id-status" style={{ '--dot': s.color, color: s.color }}>
          {s.label}
        </span>
      </div>

      <div className="id-body">
        <div className="id-photo">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={`Identity portrait (${s.label})`} />
          ) : null}
        </div>

        <div className="id-fields">
          <div className="id-field">
            <span className="lbl">Name</span>
            <span className="val">{kind === 'VERITY' ? 'Verity' : 'Nonverity'}</span>
          </div>
          <div className="id-field">
            <span className="lbl">Inception</span>
            <span className="val">
              {inception ? inception.slice(0, 10) : '—'}
            </span>
          </div>
          <div className="id-field">
            <span className="lbl">Holder</span>
            <span className="val">{truncate(address, 14)}</span>
          </div>
          <div className="id-field">
            <span className="lbl">Commitment</span>
            <span className="val">{truncate(commitment, 66)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

IDCard.displayName = 'IDCard';

export default IDCard;

function truncate(str, n) {
  if (!str) return '—';
  return str.length > n ? `${str.slice(0, n)}…` : str;
}