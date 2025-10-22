import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFARE_BUCKET_API,
  credentials: {
    accessKeyId: process.env.CLOUDFARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFARE_SECRET_ACCESS_KEY!,
  },
});
