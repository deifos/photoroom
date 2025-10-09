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

const resolvePresignedUrl = async (proxyUrl: string): Promise<string> => {
  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    if (data.success && data.url) {
      return data.url;
    }
    return proxyUrl;
  } catch (error) {
    console.error('Failed to resolve presigned URL:', error);
    return proxyUrl;
  }
};

const preloadImages = async (
  urls: string[]
): Promise<{
  dimensions: { [key: string]: { width: number; height: number } },
  resolvedUrls: { [key: string]: string }
}> => {
  const dimensions: { [key: string]: { width: number; height: number } } = {};
  const resolvedUrls: { [key: string]: string } = {};

  // First, resolve all presigned URLs
  const urlPromises = urls.map(async (proxyUrl) => {
    const actualUrl = await resolvePresignedUrl(proxyUrl);
    resolvedUrls[proxyUrl] = actualUrl;
    return { proxyUrl, actualUrl };
  });

  const resolvedUrlPairs = await Promise.all(urlPromises);

  // Then load images with resolved URLs
  await Promise.all(
    resolvedUrlPairs.map(
      ({ proxyUrl, actualUrl }) =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.src = actualUrl;
          img.onload = () => {
            dimensions[proxyUrl] = {
              width: img.naturalWidth,
              height: img.naturalHeight,
            };
            resolve();
          };
          img.onerror = () => {
            dimensions[proxyUrl] = { width: 800, height: 600 }; // fallback
            resolve();
          };
        })
    )
  );

  return { dimensions, resolvedUrls };
};

interface PhotoItem {
  id: number;
  url: string;
  filename: string;
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
  const [resolvedUrls, setResolvedUrls] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (items.length === 0) {
      onImagesReady?.();
      return;
    }

    preloadImages(items.map(i => i.url))
      .then(({ dimensions, resolvedUrls }) => {
        setImageDimensions(dimensions);
        setResolvedUrls(resolvedUrls);
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
    if (!width || Object.keys(imageDimensions).length === 0) {
      return [];
    }

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;

      // Calculate height based on actual image dimensions
      const imgDimensions = imageDimensions[child.url];
      let height = 300; // fallback height

      if (imgDimensions) {
        const aspectRatio = imgDimensions.height / imgDimensions.width;
        height = columnWidth * aspectRatio;
      }

      const y = colHeights[col];
      const gap = 12; // Gap between images
      colHeights[col] += height + gap;

      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width, imageDimensions]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      };

      if (!hasMounted.current) {
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
        gsap.to(selector, {
          ...animationProps,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady]);

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
        const actualUrl = resolvedUrls[item.url] || item.url;

        return (
          <div
            key={item.id}
            data-key={item.id}
            className="absolute will-change-transform z-10 p-2 cursor-pointer"
            style={{
              width: item.w,
              height: item.h,
              opacity: 1,
            }}
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={() => handleMouseLeave(item)}
            onClick={() => onImageClick?.(index)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full h-full">
              <NextImage
                src={actualUrl}
                alt={item.filename}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
