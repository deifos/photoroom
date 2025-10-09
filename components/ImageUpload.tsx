'use client';

import { useState, useCallback } from 'react';
import { Button } from '@heroui/button';
import { Upload } from 'lucide-react';

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(`Uploading ${files.length} image(s)...`);

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
      setTimeout(() => setProgress(''), 3000);

      // Gallery will auto-refresh via polling
    } catch (error) {
      console.error('Upload error:', error);
      setProgress('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
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
      <label htmlFor="file-upload">
        <Button
          as="span"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          radius="lg"
          size="lg"
          isLoading={uploading}
          startContent={!uploading && <Upload className="w-5 h-5" />}
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </Button>
      </label>

      {progress && (
        <div className="mt-2 px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm">
          {progress}
        </div>
      )}
    </div>
  );
}
