import { NextResponse } from 'next/server';
import { getAllImages } from '@/lib/db';

export async function GET() {
  try {
    const images = getAllImages();

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
