import { prisma } from "./prisma";

export interface Image {
  id?: number;
  filename: string;
  r2Key: string;
  url: string;
  width?: number | null;
  height?: number | null;
  size: number;
  uploadedAt: string | Date;
  userId: string;
}

export async function addImage(image: Omit<Image, "id">): Promise<number> {
  const result = await prisma.image.create({
    data: {
      filename: image.filename,
      r2Key: image.r2Key,
      url: image.url,
      width: image.width || null,
      height: image.height || null,
      size: image.size,
      userId: image.userId,
      uploadedAt:
        typeof image.uploadedAt === "string"
          ? new Date(image.uploadedAt)
          : image.uploadedAt,
    },
  });

  return result.id;
}

export async function getAllImages(
  limit?: number,
  offset?: number,
): Promise<any[]> {
  const images = await prisma.image.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
    ...(limit && { take: limit }),
    ...(offset && { skip: offset }),
  });

  // Convert Date objects to ISO strings for consistency
  return images.map((img) => ({
    ...img,
    uploadedAt: img.uploadedAt.toISOString(),
  }));
}

export async function getImagesCount(): Promise<number> {
  return await prisma.image.count();
}

export async function getImageById(id: number): Promise<Image | null> {
  const image = await prisma.image.findUnique({
    where: { id },
  });

  if (!image) return null;

  return {
    ...image,
    uploadedAt: image.uploadedAt.toISOString(),
  };
}

export async function deleteImage(id: number): Promise<void> {
  await prisma.image.delete({
    where: { id },
  });
}

// Export prisma for direct use if needed
export { prisma };
