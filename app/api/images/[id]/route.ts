import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { s3Client } from "@/lib/s3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getImageById, deleteImage } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {id} =  await params;

    const imageId = parseInt(id);

    if (isNaN(imageId)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
    }

    // Get the image to verify ownership and get R2 key
    const image = await getImageById(imageId);

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check if the user owns this image
    if (image.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own images" },
        { status: 403 },
      );
    }

    // Delete from Cloudflare R2
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.CLOUDFARE_BUCKET_NAME!,
        Key: image.r2Key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error("Error deleting from R2:", error);
      // Continue with database deletion even if R2 deletion fails
      // This prevents orphaned database entries
    }

    // Delete from database
    await deleteImage(imageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
