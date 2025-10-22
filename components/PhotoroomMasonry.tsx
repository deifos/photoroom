'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { gsap } from 'gsap';
import NextImage from 'next/image';
import { Skeleton } from '@heroui/skeleton';

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number
): number => {
  const get = useCallback(
    () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue,
    [queries, values, defaultValue]
  );

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () =>
      queries.forEach(q =>
        matchMedia(q).removeEventListener('change', handler)
      );
  }, [queries, get]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

// Cache for image dimensions to prevent reloading
const dimensionCache = new Map<string, { width: number; height: number }>();

const preloadImages = async (
  urls: string[]
): Promise<{
  dimensions: { [key: string]: { width: number; height: number } }
}> => {
  const dimensions: { [key: string]: { width: number; height: number } } = {};

  // Filter out already cached URLs
  const uncachedUrls = urls.filter(url => !dimensionCache.has(url));

  // Load images to get dimensions for uncached URLs
  if (uncachedUrls.length > 0) {
    await Promise.all(
      uncachedUrls.map(
        (url) =>
          new Promise<void>(resolve => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
              const dim = {
                width: img.naturalWidth,
                height: img.naturalHeight,
              };
              dimensionCache.set(url, dim);
              dimensions[url] = dim;
              resolve();
            };
            img.onerror = () => {
              const fallback = { width: 800, height: 600 };
              dimensionCache.set(url, fallback);
              dimensions[url] = fallback;
              resolve();
            };
          })
      )
    );
  }

  // Add cached dimensions to results
  urls.forEach(url => {
    if (dimensionCache.has(url)) {
      dimensions[url] = dimensionCache.get(url)!;
    }
  });

  return { dimensions };
};

interface PhotoItem {
  id: number;
  url: string;
  filename: string;
  uploadedAt?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface GridItem extends PhotoItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PhotoroomMasonryProps {
  items: PhotoItem[];
  onImagesReady?: () => void;
  onImageClick?: (index: number) => void;
}

export function PhotoroomMasonry({
  items,
  onImagesReady,
  onImageClick,
}: PhotoroomMasonryProps) {
  const columns = useMedia(
    [
      '(min-width:1500px)',
      '(min-width:1000px)',
      '(min-width:600px)',
      '(min-width:400px)',
    ],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    [key: string]: { width: number; height: number };
  }>({});
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (items.length === 0) {
      onImagesReady?.();
      return;
    }

    // Filter out placeholder items (they have empty URLs)
    const realItems = items.filter(i => i.url && !(i as any).isPlaceholder);

    if (realItems.length === 0) {
      onImagesReady?.();
      return;
    }

    preloadImages(realItems.map(i => i.url))
      .then(({ dimensions }) => {
        setImageDimensions(dimensions);
        setImagesReady(true);
        onImagesReady?.();
      })
      .catch(error => {
        console.error('Error preloading images:', error);
        setImagesReady(true);
        onImagesReady?.();
      });
  }, [items, onImagesReady]);

  const grid = useMemo<GridItem[]>(() => {
    if (!width) {
      return [];
    }

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;

      // Check if this is a placeholder
      const isPlaceholder = (child as any).isPlaceholder || !child.url;

      // Calculate height based on actual image dimensions
      let height = 300; // fallback height

      if (isPlaceholder) {
        // Use a fixed height for placeholders
        height = columnWidth * 0.75; // 4:3 aspect ratio for placeholders
      } else {
        const imgDimensions = imageDimensions[child.url];
        if (imgDimensions) {
          const aspectRatio = imgDimensions.height / imgDimensions.width;
          height = columnWidth * aspectRatio;
        }
      }

      const y = colHeights[col];
      const gap = 12; // Gap between images
      colHeights[col] += height + gap;

      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width, imageDimensions]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (grid.length === 0) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      };

      const isPlaceholder = (item as any).isPlaceholder || !item.url;

      if (!hasMounted.current && !isPlaceholder) {
        // Only animate real images on first mount
        const initialState = {
          opacity: 0,
          x: item.x,
          y: item.y + 100,
          width: item.w,
          height: item.h,
          filter: 'blur(10px)',
        };

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
          delay: index * 0.05,
        });
      } else {
        // Just position items
        gsap.to(selector, {
          ...animationProps,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });

    hasMounted.current = true;
  }, [grid]);

  const handleMouseEnter = (item: GridItem) => {
    const selector = `[data-key="${item.id}"]`;
    gsap.to(selector, {
      scale: 0.98,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = (item: GridItem) => {
    const selector = `[data-key="${item.id}"]`;
    gsap.to(selector, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  // Calculate the height of the masonry grid
  const containerHeight = useMemo(() => {
    if (grid.length === 0) return 0;
    const colHeights = new Array(columns).fill(0);
    grid.forEach(item => {
      const col = Math.floor((item.x || 0) / (width / columns));
      const validCol = Math.max(0, Math.min(col, columns - 1));
      colHeights[validCol] = Math.max(
        colHeights[validCol],
        (item.y || 0) + (item.h || 0)
      );
    });
    return Math.max(...colHeights);
  }, [grid, columns, width]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${containerHeight}px` }}
    >
      {grid.map((item, index) => {
        const isLoaded = loadedImages.has(item.id);
        const isPlaceholder = (item as any).isPlaceholder || !item.url;

        return (
          <div
            key={item.id}
            data-key={item.id}
            className={`absolute will-change-transform z-10 p-2 ${!isPlaceholder ? 'cursor-pointer' : ''}`}
            style={{
              width: item.w,
              height: item.h,
              opacity: 1,
            }}
            onMouseEnter={() => !isPlaceholder && handleMouseEnter(item)}
            onMouseLeave={() => !isPlaceholder && handleMouseLeave(item)}
            onClick={() => !isPlaceholder && onImageClick?.(index)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col">
              <div className="relative flex-1">
                {(isPlaceholder || !isLoaded) && (
                  <Skeleton className="w-full h-full rounded-t-lg" />
                )}
                {!isPlaceholder && item.url && (
                  <NextImage
                    src={item.url}
                    alt={item.filename}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    onLoad={() => {
                      setLoadedImages(prev => new Set(prev).add(item.id));
                    }}
                    style={{ opacity: isLoaded ? 1 : 0 }}
                    unoptimized
                  />
                )}
              </div>
              {!isPlaceholder && item.user && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                  <p className="text-white text-xs font-medium">
                    Taken by {item.user.name.split(' ')[0]}
                  </p>
                  <p className="text-white/80 text-[10px]">
                    {new Date(item.uploadedAt || '').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
