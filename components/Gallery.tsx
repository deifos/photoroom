'use client';

import { useState, useEffect } from 'react';
import { PhotoroomMasonry } from './PhotoroomMasonry';
import { ImageLightbox } from './ImageLightbox';

interface Image {
  id: number;
  filename: string;
  r2Key: string;
  url: string;
  width?: number;
  height?: number;
  size: number;
  uploadedAt: string;
}

export function Gallery() {
  const [images, setImages] = useState<Image[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<Image[]>([]);

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
        <div className="text-gray-500">Loading gallery...</div>
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

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4">
        <PhotoroomMasonry items={images} onImageClick={handleImageClick} />
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
