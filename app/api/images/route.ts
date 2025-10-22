import { NextRequest, NextResponse } from "next/server";

import { getAllImages, getImagesCount } from "@/lib/db";
import { generatePresignedUrl } from "@/lib/r2Utils";

// Configure caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined;

    const [images, totalCount] = await Promise.all([
      getAllImages(limit, offset),
      getImagesCount(),
    ]);

    // Generate presigned URLs for all images upfront (valid for 1 hour)
    const imagesWithPresignedUrls = await Promise.all(
      images.map(async (image) => {
        try {
          const presignedUrl = await generatePresignedUrl(image.r2Key, 3600);

          return {
            ...image,
            url: presignedUrl, // Replace proxy URL with actual presigned URL
          };
        } catch (error) {
          console.error(
            `Failed to generate presigned URL for ${image.r2Key}:`,
            error,
          );

          return image; // Return original if presigned URL generation fails
        }
      }),
    );

    const response = NextResponse.json({
      success: true,
      images: imagesWithPresignedUrls,
      totalCount,
      hasMore:
        limit && offset !== undefined
          ? offset + images.length < totalCount
          : false,
    });

    // Set cache control headers
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );

    return response;
  } catch (error) {
    console.error("Error fetching images:", error);

    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 },
    );
  }
}
