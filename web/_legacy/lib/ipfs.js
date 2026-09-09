/**
 * IPFS utilities for uploading images and metadata
 * Uses Next.js API routes to proxy Pinata uploads
 */

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * Upload an image blob to IPFS via our API route
 * @param {Blob} imageBlob - The image blob to upload
 * @param {string} filename - The filename for the image
 * @returns {Promise<{ipfsHash: string, url: string, ipfsUri: string}>}
 */
export async function uploadImageToIPFS(imageBlob, filename = 'hydra-sketch.png') {
  console.log('Uploading image to IPFS via API route...');
  console.log('Image blob size:', imageBlob.size);

  const formData = new FormData();
  formData.append('file', imageBlob, filename);
  formData.append('filename', filename);

  try {
    const response = await fetch('/api/ipfs/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Image upload error:', error);
      throw new Error(error.error || 'Image upload failed');
    }

    const data = await response.json();
    console.log('Image upload success:', data);

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Upload metadata JSON to IPFS via our API route
 * @param {object} metadata - The metadata object
 * @returns {Promise<{ipfsHash: string, url: string, ipfsUri: string}>}
 */
export async function uploadMetadataToIPFS(metadata) {
  console.log('Uploading metadata to IPFS via API route...');

  try {
    const response = await fetch('/api/ipfs/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Metadata upload error:', error);
      throw new Error(error.error || 'Metadata upload failed');
    }

    const data = await response.json();
    console.log('Metadata upload success:', data);

    return data;
  } catch (error) {
    console.error('Metadata upload error:', error);
    throw error;
  }
}

/**
 * Capture Hydra canvas as a blob
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} mimeType - The MIME type for the image (default: image/png)
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, mimeType = 'image/png', quality = 1.0) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting canvas capture...');
      console.log('Canvas details:', {
        width: canvas.width,
        height: canvas.height,
        tagName: canvas.tagName
      });

      // Don't call render() - it might resize the canvas
      // Just wait for the current animation frame to complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              console.log('Attempting toDataURL...');
              const dataUrl = canvas.toDataURL(mimeType, quality);

              console.log('DataURL captured!');
              console.log('Length:', dataUrl.length, 'characters');
              console.log('Preview:', dataUrl.substring(0, 100));

              // Convert data URL to blob
              const byteString = atob(dataUrl.split(',')[1]);
              const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);

              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }

              const blob = new Blob([ab], { type: mimeString });

              console.log('Canvas converted to blob successfully!');
              console.log('Blob size:', blob.size, 'bytes');
              console.log('Blob type:', blob.type);

              if (blob.size < 5000) {
                console.error('WARNING: Blob size is suspiciously small!');
                console.error('This might be a blank/black image');
              }

              resolve(blob);
            } catch (error) {
              console.error('Error capturing canvas:', error);
              reject(error);
            }
          });
        });
      });
    } catch (error) {
      console.error('Error in canvasToBlob:', error);
      reject(error);
    }
  });
}

/**
 * Create NFT metadata following ERC721 metadata standard
 * @param {object} params - Parameters for metadata
 * @param {number} params.tokenId - The token ID
 * @param {string} params.imageIpfsUri - IPFS URI for the image
 * @param {string} params.sketchName - Name of the Hydra sketch
 * @param {object} params.parameters - Hydra parameters used
 * @returns {object} NFT metadata object
 */
export function createNFTMetadata({ tokenId, imageIpfsUri, sketchName, parameters }) {
  return {
    name: `TRANSEVIL #${tokenId}`,
    description: `TRANSEVIL: Zero-knowledge constrained crypto-art. This piece was generated using Hydra Synth with the "${sketchName}" sketch, creating a unique transformation of the TRANSEVIL portrait.`,
    image: imageIpfsUri,
    external_url: 'https://transevil.art',
    attributes: [
      {
        trait_type: 'Sketch',
        value: sketchName,
      },
      {
        trait_type: 'Noise Amount',
        value: parameters.noiseAmount,
      },
      {
        trait_type: 'Noise Speed',
        value: parameters.noiseSpeed,
      },
      {
        trait_type: 'Threshold',
        value: parameters.threshold,
      },
      {
        trait_type: 'Luma Threshold',
        value: parameters.lumaThreshold,
      },
      {
        trait_type: 'Luma Smooth',
        value: parameters.lumaSmooth,
      },
      {
        trait_type: 'Modulate Amount',
        value: parameters.modulateAmount,
      },
      {
        trait_type: 'Feedback Amount',
        value: parameters.feedbackAmount,
      },
      {
        trait_type: 'Generation Timestamp',
        value: new Date().toISOString(),
      },
    ],
    properties: {
      artist: 'Verity Bascaran',
      technology: 'Hydra Synth',
      category: 'Generative Art',
    },
  };
}

/**
 * Complete workflow: capture canvas, upload to IPFS, create metadata, upload metadata
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} tokenId - The token ID
 * @param {string} sketchName - Name of the sketch
 * @param {object} parameters - Hydra parameters
 * @returns {Promise<{imageIpfsUri: string, metadataIpfsUri: string, imageUrl: string, metadataUrl: string}>}
 */
export async function uploadNFTToIPFS(canvas, tokenId, sketchName, parameters) {
  console.log('🚀 ========================================');
  console.log('🚀 STARTING NFT UPLOAD TO IPFS');
  console.log('🚀 Token ID:', tokenId);
  console.log('🚀 Sketch:', sketchName);
  console.log('🚀 ========================================');

  // Step 1: Capture canvas as blob
  console.log('📸 STEP 1: Capturing canvas as blob...');
  const imageBlob = await canvasToBlob(canvas);
  console.log('✅ Canvas captured successfully!');
  console.log('   Blob size:', imageBlob.size, 'bytes');
  console.log('   Blob type:', imageBlob.type);

  // Step 2: Upload image to IPFS
  console.log('☁️  STEP 2: Uploading image to IPFS via Pinata...');
  const imageResult = await uploadImageToIPFS(imageBlob, `transevil-${tokenId}.png`);
  console.log('✅ Image uploaded to IPFS!');
  console.log('   IPFS Hash:', imageResult.ipfsHash);
  console.log('   IPFS URI:', imageResult.ipfsUri);
  console.log('   Gateway URL:', imageResult.url);

  // Step 3: Create metadata
  console.log('📝 STEP 3: Creating NFT metadata...');
  const metadata = createNFTMetadata({
    tokenId,
    imageIpfsUri: imageResult.ipfsUri,
    sketchName,
    parameters,
  });
  console.log('✅ Metadata created!');
  console.log('   Name:', metadata.name);
  console.log('   Image URI:', metadata.image);
  console.log('   Attributes:', metadata.attributes.length);

  // Step 4: Upload metadata to IPFS
  console.log('☁️  STEP 4: Uploading metadata to IPFS via Pinata...');
  const metadataResult = await uploadMetadataToIPFS(metadata);
  console.log('✅ Metadata uploaded to IPFS!');
  console.log('   IPFS Hash:', metadataResult.ipfsHash);
  console.log('   IPFS URI:', metadataResult.ipfsUri);
  console.log('   Gateway URL:', metadataResult.url);

  console.log('🎉 ========================================');
  console.log('🎉 IPFS UPLOAD COMPLETE!');
  console.log('🎉 Image IPFS:', imageResult.ipfsUri);
  console.log('🎉 Metadata IPFS:', metadataResult.ipfsUri);
  console.log('🎉 ========================================');

  return {
    imageIpfsUri: imageResult.ipfsUri,
    imageUrl: imageResult.url,
    imageHash: imageResult.ipfsHash,
    metadataIpfsUri: metadataResult.ipfsUri,
    metadataUrl: metadataResult.url,
    metadataHash: metadataResult.ipfsHash,
  };
}
