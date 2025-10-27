"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { X, ChevronLeft, ChevronRight, RotateCw, Trash2 } from "lucide-react";
import {
  Modal as ConfirmModal,
  ModalContent as ConfirmModalContent,
  ModalHeader,
  ModalBody as ConfirmModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

export interface LightboxImage {
  id: number;
  url: string;
  filename: string;
  userId: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  currentUserId?: string;
  onDelete?: (imageId: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  currentUserId,
  onDelete,
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const startTouchRef = useRef({ x: 0, y: 0, distance: 0 });
  const { isOpen: isConfirmOpen, onOpen, onClose: onConfirmClose } = useDisclosure();

  const currentImage = images[currentIndex];
  const isOwner = currentUserId && currentImage?.userId === currentUserId;

  // Reset zoom and position when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate?.(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate?.(currentIndex + 1);
    }
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Touch/Mouse handlers for zoom and pan
  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();

      if ("touches" in e) {
        // Touch event
        if (e.touches.length === 1) {
          const touch = e.touches[0];

          setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
          });
          setIsDragging(true);
          startTouchRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            distance: 0,
          };
        } else if (e.touches.length === 2) {
          // Pinch start
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2),
          );

          startTouchRef.current = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
            distance,
          };
        }
      } else {
        // Mouse event
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        setIsDragging(true);
      }
    },
    [position],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();

      if ("touches" in e) {
        if (e.touches.length === 1 && isDragging && scale > 1) {
          // Single touch drag (only when zoomed)
          const touch = e.touches[0];

          setPosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
          });
        } else if (e.touches.length === 2) {
          // Pinch zoom
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2),
          );

          if (startTouchRef.current.distance > 0) {
            const scaleChange = distance / startTouchRef.current.distance;
            const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 4);

            setScale(newScale);

            // Update start distance for next calculation
            startTouchRef.current.distance = distance;
          }
        }
      } else if (isDragging && scale > 1) {
        // Mouse drag (only when zoomed)
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, scale, dragStart],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      setIsDragging(false);

      if ("touches" in e && e.touches.length === 0) {
        // Handle double tap to zoom
        const now = Date.now();
        const timeDiff = now - lastTap;

        if (timeDiff < 300 && timeDiff > 0) {
          // Double tap detected
          if (scale === 1) {
            setScale(2);
          } else {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }
        }
        setLastTap(now);

        // Handle swipe navigation
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startTouchRef.current.x;
        const deltaY = Math.abs(touch.clientY - startTouchRef.current.y);

        // Only trigger swipe if not zoomed and horizontal swipe is significant
        if (scale === 1 && Math.abs(deltaX) > 50 && deltaY < 100) {
          if (deltaX > 0) {
            goToPrevious();
          } else {
            goToNext();
          }
        }
      }
    },
    [lastTap, scale, goToPrevious, goToNext],
  );

  // Reset zoom
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Delete handler
  const handleDeleteClick = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const handleConfirmDelete = useCallback(async () => {
    if (!currentImage || !onDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/images/${currentImage.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      onConfirmClose();
      onClose();
      onDelete(currentImage.id);
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [currentImage, onDelete, onConfirmClose, onClose]);

  if (!currentImage) return null;

  return (
    <>
      <Modal
        hideCloseButton
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/90",
        }}
        isOpen={isOpen}
        size="full"
        onClose={onClose}
      >
      <ModalContent className="bg-transparent shadow-none">
        <ModalBody className="p-0 relative overflow-hidden">
          {/* Header with controls */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm opacity-75">
                {currentIndex + 1} of {images.length}
              </span>
              {currentImage.filename && (
                <span className="text-sm font-medium">
                  {currentImage.filename}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Button
                  isIconOnly
                  className="text-white hover:bg-red-500/30"
                  variant="light"
                  onPress={handleDeleteClick}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button
                isIconOnly
                className="text-white hover:bg-white/20"
                variant="light"
                onPress={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <Button
              isIconOnly
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
              variant="light"
              onPress={goToPrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {currentIndex < images.length - 1 && (
            <Button
              isIconOnly
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
              variant="light"
              onPress={goToNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}

          {/* Image container */}
          <div
            ref={imageRef}
            className="w-full h-screen flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleTouchStart}
            onMouseLeave={handleTouchEnd}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
              }}
            >
              <Image
                priority
                unoptimized
                alt={currentImage.filename}
                className="max-w-[90vw] max-h-[80vh] object-contain pointer-events-none select-none border-8 rounded-lg border-white/10 shadow-lg"
                height={800}
                src={currentImage.url}
                style={{
                  borderRadius: "1rem",
                }}
                width={1200}
              />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/50 to-transparent">
            {scale > 1 && (
              <Button
                isIconOnly
                className="text-white hover:bg-white/20"
                title="Reset zoom"
                variant="light"
                onPress={handleReset}
              >
                <RotateCw className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Instructions overlay */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 text-center text-white/75 text-xs">
            <p>Double tap to zoom • Pinch to zoom • Swipe to navigate</p>
          </div>
        </ModalBody>
      </ModalContent>
      </Modal>

      {/* Confirmation dialog */}
      <ConfirmModal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ConfirmModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Image</ModalHeader>
          <ConfirmModalBody>
            <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            {currentImage?.filename && (
              <p className="text-sm text-gray-500 mt-2">
                File: {currentImage.filename}
              </p>
            )}
          </ConfirmModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={onConfirmClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ConfirmModalContent>
      </ConfirmModal>
    </>
  );
}
