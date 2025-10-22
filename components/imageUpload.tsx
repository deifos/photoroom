"use client";

import { useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Upload } from "lucide-react";

import { AuthDialog } from "./authDialog";

import { useUpload } from "@/contexts/UploadContext";
import { useSession } from "@/lib/auth-client";

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { setUploadingCount } = useUpload();
  const { data: session } = useSession();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const filesArray = Array.from(files);
      const fileCount = filesArray.length;

      // Limit to 10 images at once
      if (fileCount > 10) {
        setProgress(
          "Maximum 10 images allowed per upload. Please select fewer files.",
        );
        setTimeout(() => setProgress(""), 5000);

        return;
      }

      setUploading(true);
      setUploadingCount(fileCount);
      setProgress(`Uploading ${fileCount} image(s)...`);

      try {
        // Upload in batches of 5 to prevent timeout
        const BATCH_SIZE = 5;
        const batches: File[][] = [];

        for (let i = 0; i < filesArray.length; i += BATCH_SIZE) {
          batches.push(filesArray.slice(i, i + BATCH_SIZE));
        }

        let totalUploaded = 0;

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];

          setProgress(
            `Uploading batch ${i + 1}/${batches.length} (${totalUploaded}/${fileCount} complete)...`,
          );

          const formData = new FormData();

          batch.forEach((file) => {
            formData.append("files", file);
          });

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(errorData.error || "Upload failed");
          }

          const data = await response.json();

          totalUploaded += data.images.length;

          setUploadingCount(fileCount - totalUploaded);
        }

        setProgress(`Successfully uploaded ${totalUploaded} image(s)!`);

        // Reset count immediately after successful upload
        setUploadingCount(0);

        setTimeout(() => {
          setProgress("");
        }, 3000);

        // Gallery will auto-refresh via polling
      } catch (error) {
        console.error("Upload error:", error);
        setProgress(
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.",
        );
        setUploadingCount(0);
        setTimeout(() => setProgress(""), 5000);
      } finally {
        setUploading(false);
      }
    },
    [setUploadingCount],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Check if user is authenticated
      if (!session?.user) {
        setAuthDialogOpen(true);
        e.target.value = ""; // Reset file input

        return;
      }
      handleFiles(e.target.files);
    },
    [handleFiles, session],
  );

  const handleButtonClick = () => {
    // Check if user is authenticated before allowing file selection
    if (!session?.user) {
      setAuthDialogOpen(true);

      return;
    }
    // If authenticated, trigger file input
    document.getElementById("file-upload")?.click();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <input
          multiple
          accept="image/*"
          className="hidden"
          disabled={uploading}
          id="file-upload"
          type="file"
          onChange={handleFileInput}
        />
        <Button
          className="bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          isLoading={uploading}
          radius="lg"
          size="lg"
          startContent={!uploading && <Upload className="w-5 h-5" />}
          onClick={handleButtonClick}
        >
          {uploading ? "Uploading..." : "Upload Photos"}
        </Button>

        {progress && (
          <div className="mt-2 px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm">
            {progress}
          </div>
        )}
      </div>

      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onSuccess={() => {
          setAuthDialogOpen(false);
          // User can now click upload again after auth
        }}
      />
    </>
  );
}
