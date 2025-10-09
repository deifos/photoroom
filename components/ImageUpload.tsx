'use client';

import { useState, useCallback } from 'react';
import { Button } from '@heroui/button';
import { Upload } from 'lucide-react';
import { useUpload } from '@/contexts/UploadContext';
import { useSession } from '@/lib/auth-client';
import { AuthDialog } from './AuthDialog';

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { setUploadingCount } = useUpload();
  const { data: session } = useSession();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileCount = files.length;
    setUploading(true);
    setUploadingCount(fileCount);
    setProgress(`Uploading ${fileCount} image(s)...`);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      setProgress(`Successfully uploaded ${data.images.length} image(s)!`);

      // Reset count immediately after successful upload
      setUploadingCount(0);

      setTimeout(() => {
        setProgress('');
      }, 3000);

      // Gallery will auto-refresh via polling
    } catch (error) {
      console.error('Upload error:', error);
      setProgress('Upload failed. Please try again.');
      setUploadingCount(0);
    } finally {
      setUploading(false);
    }
  }, [setUploadingCount]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Check if user is authenticated
      if (!session?.user) {
        setAuthDialogOpen(true);
        e.target.value = ''; // Reset file input
        return;
      }
      handleFiles(e.target.files);
    },
    [handleFiles, session]
  );

  const handleButtonClick = () => {
    // Check if user is authenticated before allowing file selection
    if (!session?.user) {
      setAuthDialogOpen(true);
      return;
    }
    // If authenticated, trigger file input
    document.getElementById('file-upload')?.click();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />
        <Button
          onClick={handleButtonClick}
          className="bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          radius="lg"
          size="lg"
          isLoading={uploading}
          startContent={!uploading && <Upload className="w-5 h-5" />}
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
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
