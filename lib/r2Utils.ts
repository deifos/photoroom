import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3Client';

export async function generatePresignedUrl(r2Key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFARE_BUCKET_NAME!,
    Key: r2Key,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn, // URL expires in seconds (default: 1 hour)
  });

  return presignedUrl;
}
