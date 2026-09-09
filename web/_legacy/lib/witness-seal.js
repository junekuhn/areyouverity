/**
 * Generate a subtle witness seal overlay for witnessed tokens
 * This is applied on top of the original artwork to mark it as witnessed
 * without destroying or obscuring the original
 */

export function createWitnessSeal(canvas, tokenId, witnessTimestamp) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Save current state
  ctx.save();

  // Very subtle overlay - barely perceptible
  ctx.globalAlpha = 0.08;

  // Create a subtle gradient overlay
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add a very faint border
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Add a tiny witness mark in the corner (almost invisible)
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.floor(width / 50)}px monospace`;
  ctx.fillText('○', width - 30, height - 15);

  // Restore
  ctx.restore();
}

/**
 * Apply witness seal to an image element
 * Returns a new canvas with the seal applied
 */
export async function applyWitnessSeal(imageUrl, tokenId) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply seal
      createWitnessSeal(canvas, tokenId, Date.now());

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}
