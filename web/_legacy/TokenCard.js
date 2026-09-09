'use client';

/**
 * Displays a single minted identity token in the collection grid.
 */
export default function TokenCard({ token }) {
  const isValid = !token.invalidated;

  return (
    <div className="border border-white/10 hover:border-white/30 transition-all group">
      {/* Image */}
      <div className="relative aspect-[4/5] bg-black/50 overflow-hidden">
        {token.image ? (
          <img
            src={token.image}
            alt={`Identity #${token.tokenId}`}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-white/20 text-xs">No Image</span>
          </div>
        )}

        {/* Status badge */}
        <div className={`absolute top-2 right-2 font-mono text-[10px] px-2 py-0.5 ${
          isValid
            ? 'bg-white text-black'
            : 'bg-red-500/80 text-white'
        }`}>
          {isValid ? 'VALID' : 'INVALID'}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-white/70">
            #{token.tokenId}
          </span>
          <span className="font-mono text-[10px] text-white/30">
            {token.mintTimestamp
              ? new Date(token.mintTimestamp).toLocaleDateString()
              : '---'}
          </span>
        </div>

        {token.owner && (
          <p className="font-mono text-[10px] text-white/20 truncate">
            {token.owner}
          </p>
        )}
      </div>
    </div>
  );
}
