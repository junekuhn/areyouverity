import { NextResponse } from 'next/server';

const PINATA_API_URL = 'https://api.pinata.cloud';

export async function POST(request) {
  try {
    console.log('📤 [API] Received metadata upload request');

    const metadata = await request.json();

    console.log('📤 [API] Metadata details:', {
      name: metadata?.name,
      image: metadata?.image,
      attributes: metadata?.attributes?.length
    });

    if (!metadata) {
      console.error('❌ [API] No metadata provided in request');
      return NextResponse.json({ error: 'No metadata provided' }, { status: 400 });
    }

    console.log('📤 [API] Uploading metadata to Pinata...');

    // Upload to Pinata using JWT
    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `TRANSEVIL-metadata-${metadata.name || 'unknown'}`,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Pinata metadata error:', response.status, errorText);
      return NextResponse.json(
        { error: `Pinata metadata upload failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('✅ [API] Metadata uploaded successfully!');
    console.log('   IPFS Hash:', data.IpfsHash);
    console.log('   Gateway URL: https://gateway.pinata.cloud/ipfs/' + data.IpfsHash);

    return NextResponse.json({
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      ipfsUri: `ipfs://${data.IpfsHash}`
    });
  } catch (error) {
    console.error('❌ [API] Metadata upload error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
