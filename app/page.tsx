'use client';

import { ImageUpload } from "@/components/ImageUpload";
import { Gallery } from "@/components/Gallery";
import { UploadProvider } from "@/contexts/UploadContext";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] || '';

  return (
    <UploadProvider>
      <div className="flex flex-col w-full">
        <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-6">
          <div className="text-center max-w-3xl">
            {session?.user ? (
              <h1 className="text-4xl md:text-6xl font-serif font-light tracking-wide text-foreground italic">
                Hello{' '}
                <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                  {firstName}
                </span>
                , what did you see today that got your attention?
              </h1>
            ) : (
              <h1 className="text-4xl md:text-6xl font-serif font-light tracking-wide text-foreground italic">
                Arena and Amelie explore the world, one beautiful moment at a time.
              </h1>
            )}
          </div>

          <div className="mt-4">
            <ImageUpload />
          </div>
        </section>

        <section className="w-full pb-12">
          <Gallery />
        </section>
      </div>
    </UploadProvider>
  );
}
