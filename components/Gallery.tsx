'use client';

import { useState, useEffect } from 'react';
import { PhotoroomMasonry } from './photoroomMasonry';
import { ImageLightbox } from './imageLightbox';
import { useUpload } from '@/contexts/UploadContext';

interface Image {
  id: number;
  filename: string;
  r2Key: string;
  url: string;
  width?: number;
  height?: number;
  size: number;
  uploadedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

// Placeholder for uploading images
interface PlaceholderImage extends Image {
  isPlaceholder: true;
}

export function Gallery() {
  const [images, setImages] = useState<Image[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<Image[]>([]);
  const { uploadingCount } = useUpload();

  useEffect(() => {
    fetchImages();

    // Poll for new images every 5 seconds
    const interval = setInterval(fetchImages, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchImages() {
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  }

  // Resolve presigned URLs when lightbox opens
  useEffect(() => {
    if (!lightboxOpen || !images || images.length === 0) return;

    const resolveUrls = async () => {
      const resolved = await Promise.all(
        images.map(async (img) => {
          try {
            const response = await fetch(img.url);
            const data = await response.json();
            if (data.success && data.url) {
              return { ...img, url: data.url };
            }
            return img;
          } catch (error) {
            console.error('Failed to resolve URL:', error);
            return img;
          }
        })
      );
      setResolvedImages(resolved);
    };

    resolveUrls();
  }, [lightboxOpen, images]);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          <div className="text-default-500">Loading gallery...</div>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="text-6xl mb-4">📷</div>
        <p className="text-lg">No images yet</p>
        <p className="text-sm">Upload some photos to get started</p>
      </div>
    );
  }

  // Create placeholder items for uploading images
  const placeholders: any[] = Array.from({ length: uploadingCount }, (_, i) => ({
    id: -1 - i, // Negative IDs for placeholders
    filename: 'Uploading...',
    r2Key: '',
    url: '', // Empty URL for skeleton
    size: 0,
    uploadedAt: new Date().toISOString(),
    isPlaceholder: true,
  }));

  const displayItems = [...placeholders, ...(images || [])];

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4">
        <PhotoroomMasonry items={displayItems} onImageClick={handleImageClick} />
      </div>

      {resolvedImages.length > 0 && (
        <ImageLightbox
          images={resolvedImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
