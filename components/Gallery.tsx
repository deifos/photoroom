'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PhotoroomMasonry } from './photoroomMasonry';
import { ImageLightbox } from './imageLightbox';
import { useUpload } from '@/contexts/UploadContext';
import { Button } from '@heroui/button';

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

const IMAGES_PER_PAGE = 20;

export function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { uploadingCount } = useUpload();
  const previousUploadingCountRef = useRef(0);

  const fetchImages = useCallback(async (offset: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/images?limit=${IMAGES_PER_PAGE}&offset=${offset}`);
      const data = await response.json();

      if (data.success) {
        setImages(prev => append ? [...prev, ...data.images] : data.images);
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch images on mount only
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when upload completes (uploadingCount goes from > 0 to 0)
  useEffect(() => {
    if (previousUploadingCountRef.current > 0 && uploadingCount === 0) {
      fetchImages(0, false);
    }
    previousUploadingCountRef.current = uploadingCount;
  }, [uploadingCount, fetchImages]);

  const loadMore = () => {
    fetchImages(images.length, true);
  };

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

        {hasMore && (
          <div className="flex justify-center mt-8 mb-4">
            <Button
              onPress={loadMore}
              isLoading={loadingMore}
              disabled={loadingMore}
              size="lg"
              className="bg-rose-500 text-white"
            >
              {loadingMore ? 'Loading...' : `Load More (${images.length} of ${totalCount})`}
            </Button>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
