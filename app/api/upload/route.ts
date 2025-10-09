import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3Client';
import { addImage } from '@/lib/db';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to upload images' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${randomUUID()}.${fileExtension}`;
      const r2Key = `photoroom/images/${uniqueFilename}`;

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFARE_BUCKET_NAME!,
        Key: r2Key,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(command);

      // Construct proxy URL that will generate presigned URLs
      const proxyUrl = `/api/image?key=${encodeURIComponent(r2Key)}`;

      // Save to Supabase database via Prisma with userId
      const imageId = await addImage({
        filename: file.name,
        r2Key,
        url: proxyUrl,
        size: file.size,
        userId: session.user.id,
        uploadedAt: new Date().toISOString(),
      });

      uploadedImages.push({
        id: imageId,
        filename: file.name,
        r2Key,
        url: proxyUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
