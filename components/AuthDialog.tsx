'use client';

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
  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Sign in error:', error);
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
          <Button
            onClick={handleGoogleSignIn}
            className="bg-white dark:bg-default-100 text-default-900 border-2 border-default-200 hover:bg-default-50 shadow-sm hover:shadow-md transition-all duration-200"
            size="lg"
            fullWidth
            startContent={<GoogleIcon className="w-5 h-5" />}
          >
            <span className="font-medium">Continue with Google</span>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
