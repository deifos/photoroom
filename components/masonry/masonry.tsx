"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { gsap } from "gsap";
import NextImage from "next/image";
import { Button } from "@heroui/button";
import { Plus, Check } from "lucide-react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";

import "./background-gallery-masonry.css";

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number,
): number => {
  const get = useCallback(
    () =>
      values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue,
    [queries, values, defaultValue],
  );

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);

    queries.forEach((q) => matchMedia(q).addEventListener("change", handler));

    return () =>
      queries.forEach((q) =>
        matchMedia(q).removeEventListener("change", handler),
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

const preloadImages = async (
  urls: string[],
): Promise<{ [key: string]: { width: number; height: number } }> => {
  const dimensions: { [key: string]: { width: number; height: number } } = {};

  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();

          img.src = src;
          img.onload = () => {
            dimensions[src] = {
              width: img.naturalWidth,
              height: img.naturalHeight,
            };
            resolve();
          };
          img.onerror = () => {
            dimensions[src] = { width: 300, height: 300 }; // fallback square
            resolve();
          };
        }),
    ),
  );

  return dimensions;
};

interface BackgroundItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  tags: string[];
  description?: string | null;
  isPremium: boolean;
  timesAdded: number;
}

interface GridItem extends BackgroundItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BackgroundGalleryMasonryProps {
  items: BackgroundItem[];
  isAuthenticated: boolean;
  onImagesReady?: () => void;
}

export function BackgroundGalleryMasonry({
  items,
  isAuthenticated,
  onImagesReady,
}: BackgroundGalleryMasonryProps) {
  const router = useRouter();
  const columns = useMedia(
    [
      "(min-width:1500px)",
      "(min-width:1000px)",
      "(min-width:600px)",
      "(min-width:400px)",
    ],
    [5, 4, 3, 2],
    1,
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    [key: string]: { width: number; height: number };
  }>({});
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Fetch user's library to check which backgrounds are already added
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserLibrary = async () => {
      try {
        const response = await fetch("/api/background-library");

        if (response.ok) {
          const data = await response.json();
          const libraryItems = data.backgroundLibraryItems || [];

          // Get all sourcePublicIds from user's library
          const addedPublicIds = new Set<string>(
            libraryItems
              .filter((item: any) => item.sourcePublicId)
              .map((item: any) => item.sourcePublicId as string),
          );

          setAddedIds(addedPublicIds);
        }
      } catch (error) {
        console.error("Failed to fetch user library:", error);
      }
    };

    fetchUserLibrary();
  }, [isAuthenticated]);

  useEffect(() => {
    if (items.length === 0) {
      onImagesReady?.();

      return;
    }

    preloadImages(items.map((i) => i.imageUrl))
      .then((dimensions) => {
        setImageDimensions(dimensions);
        setImagesReady(true);
        onImagesReady?.();
      })
      .catch((error) => {
        console.error("Background Gallery: Error preloading images:", error);
        setImagesReady(true);
        onImagesReady?.();
      });
  }, [items, onImagesReady]);

  const handleAddToLibrary = useCallback(
    async (backgroundId: string) => {
      if (!isAuthenticated) {
        router.push("/auth/sign-in");

        return;
      }

      setAddingIds((prev) => new Set(prev).add(backgroundId));

      try {
        const response = await fetch("/api/public-backgrounds/add-to-library", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicBackgroundId: backgroundId }),
        });

        if (!response.ok) {
          const error = await response.json();

          throw new Error(error.error || "Failed to add background");
        }

        setAddedIds((prev) => new Set(prev).add(backgroundId));
        addToast({
          title: "Background added to your library!",
          timeout: 3000,
        });
      } catch (error) {
        console.error("Failed to add background:", error);
        addToast({
          title:
            error instanceof Error ? error.message : "Failed to add background",
          timeout: 3000,
        });
      } finally {
        setAddingIds((prev) => {
          const next = new Set(prev);

          next.delete(backgroundId);

          return next;
        });
      }
    },
    [isAuthenticated, router],
  );

  const grid = useMemo<GridItem[]>(() => {
    if (!width || Object.keys(imageDimensions).length === 0) {
      return [];
    }

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;

      // Calculate height based on actual image dimensions
      const imgDimensions = imageDimensions[child.imageUrl];
      let height = 300; // fallback height

      if (imgDimensions) {
        const aspectRatio = imgDimensions.height / imgDimensions.width;

        height = columnWidth * aspectRatio;
      }

      const y = colHeights[col];

      colHeights[col] += height + 16; // Add 16px gap (Pinterest-style)

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
          filter: "blur(10px)",
        };

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          delay: index * 0.05,
        });
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration: 0.6,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady]);

  const handleMouseEnter = (item: GridItem) => {
    const selector = `[data-key="${item.id}"]`;

    gsap.to(selector, {
      scale: 0.95,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (item: GridItem) => {
    const selector = `[data-key="${item.id}"]`;

    gsap.to(selector, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  // Calculate the height of the masonry grid
  const containerHeight = useMemo(() => {
    if (grid.length === 0) return 0;
    const colHeights = new Array(columns).fill(0);

    grid.forEach((item) => {
      const col = Math.floor((item.x || 0) / (width / columns));
      const validCol = Math.max(0, Math.min(col, columns - 1));

      colHeights[validCol] = Math.max(
        colHeights[validCol],
        (item.y || 0) + (item.h || 0),
      );
    });

    return Math.max(...colHeights);
  }, [grid, columns, width]);

  return (
    <div
      ref={containerRef}
      className="bg-gallery-list"
      style={{ height: `${containerHeight}px` }}
    >
      {grid.map((item) => {
        const isAdding = addingIds.has(item.id);
        const isAdded = addedIds.has(item.id);

        return (
          <div
            key={item.id}
            className="bg-gallery-item-wrapper"
            data-key={item.id}
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={() => handleMouseLeave(item)}
          >
            <div className="bg-gallery-item-img relative overflow-hidden rounded-lg">
              <NextImage
                fill
                alt={item.title}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                src={item.imageUrl}
                style={{ display: "block" }}
              />

              {/* Premium badge */}
              {item.isPremium && (
                <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full px-2 py-1 text-xs font-medium">
                  Premium
                </div>
              )}

              {/* Overlay with info - always visible on mobile, hover on desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <h3 className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-white/80 text-xs mb-2 line-clamp-2 hidden md:block">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="hidden md:flex gap-1 flex-wrap">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/20 text-white text-xs px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    className="min-w-0 ml-auto"
                    color={isAdded ? "success" : "primary"}
                    isDisabled={isAdded}
                    isLoading={isAdding}
                    size="sm"
                    startContent={
                      isAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )
                    }
                    variant="solid"
                    onPress={() => handleAddToLibrary(item.id)}
                  >
                    {isAdded ? "Added" : "Add to library"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
