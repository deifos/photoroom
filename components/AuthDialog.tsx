'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Button } from '@heroui/button';
import { signIn } from '@/lib/auth-client';
import { GoogleIcon } from './icons/GoogleIcon';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error?.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2 pt-6">
          <h2 className="text-2xl font-medium tracking-tight">Sign in to upload</h2>
          <p className="text-sm text-default-500 font-normal font-sans">
            Please sign in with Google to share your photos
          </p>
        </ModalHeader>
        <ModalBody className="py-6 pb-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-50 dark:bg-danger-100/10 border border-danger-200 dark:border-danger-500/20">
              <p className="text-sm text-danger-600 dark:text-danger-500">{error}</p>
            </div>
          )}
          <Button
            onClick={handleGoogleSignIn}
            isLoading={isLoading}
            isDisabled={isLoading}
            className="bg-white dark:bg-default-100 text-default-900 border-2 border-default-200 hover:bg-default-50 shadow-sm hover:shadow-md transition-all duration-200"
            size="lg"
            fullWidth
            startContent={!isLoading && <GoogleIcon className="w-5 h-5" />}
          >
            <span className="font-medium">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
