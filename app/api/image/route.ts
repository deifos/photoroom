import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/r2Utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing key parameter' },
        { status: 400 }
      );
    }

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await generatePresignedUrl(key, 3600);

    // Return JSON with presigned URL instead of redirecting
    return NextResponse.json({
      success: true,
      url: presignedUrl,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate image URL' },
      { status: 500 }
    );
  }
}
