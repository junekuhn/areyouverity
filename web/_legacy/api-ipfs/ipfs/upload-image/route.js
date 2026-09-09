import { NextResponse } from 'next/server';

const PINATA_API_URL = 'https://api.pinata.cloud';

export async function POST(request) {
  try {
    console.log('📤 [API] Received image upload request');

    const formData = await request.formData();
    const file = formData.get('file');
    const filename = formData.get('filename') || 'hydra-sketch.png';

    console.log('📤 [API] File details:', {
      filename,
      size: file?.size,
      type: file?.type
    });

    if (!file) {
      console.error('❌ [API] No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create new FormData for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file, filename);

    console.log('📤 [API] Uploading to Pinata...');

    // Upload to Pinata using JWT
    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Pinata error:', response.status, errorText);
      return NextResponse.json(
        { error: `Pinata upload failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('✅ [API] Image uploaded successfully!');
    console.log('   IPFS Hash:', data.IpfsHash);
    console.log('   Gateway URL: https://gateway.pinata.cloud/ipfs/' + data.IpfsHash);

    return NextResponse.json({
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      ipfsUri: `ipfs://${data.IpfsHash}`
    });
  } catch (error) {
    console.error('❌ [API] Upload error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
