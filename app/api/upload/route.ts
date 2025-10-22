import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { s3Client } from "@/lib/s3Client";
import { addImage } from "@/lib/db";
import { auth } from "@/lib/auth";

// Configure route for longer execution time
export const maxDuration = 60; // 60 seconds for Pro/Team plans, 10s for Hobby

// Get whitelist of allowed emails from environment variable
const ALLOWED_EMAILS = process.env.AUTHORIZED_EMAILS
  ? process.env.AUTHORIZED_EMAILS.split(",").map((email) =>
      email.trim().toLowerCase(),
    )
  : [];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 10;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to upload images" },
        { status: 401 },
      );
    }

    // Double-check email whitelist
    if (!ALLOWED_EMAILS.includes(session.user.email.toLowerCase())) {
      return NextResponse.json(
        { error: "Your email is not authorized to upload images" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate file count
    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request` },
        { status: 400 },
      );
    }

    const uploadedImages = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name}: Not an image file`);
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File too large (max 10MB)`);
          continue;
        }

        // Generate unique filename
        const fileExtension = file.name.split(".").pop();
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
      } catch (fileError) {
        console.error(`Error uploading ${file.name}:`, fileError);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    // Return response with errors if any
    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { error: "No images were uploaded successfully", errors },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 },
    );
  }
}
