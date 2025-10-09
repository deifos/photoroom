import { UploadProvider } from "@/contexts/UploadContext";
import { HeroClient } from "@/components/heroClient";
import { ImageUpload } from "@/components/imageUpload";
import { GallerySection } from "@/components/gallerySection";

export default function Home() {
  return (
    <UploadProvider>
      <div className="flex flex-col w-full">
        <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-6">
          <HeroClient />
          <div className="mt-4">
            <ImageUpload />
          </div>
        </section>
        <GallerySection />
      </div>
    </UploadProvider>
  );
}
