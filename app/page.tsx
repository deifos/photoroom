import { ImageUpload } from "@/components/ImageUpload";
import { Gallery } from "@/components/Gallery";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-6">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-wide text-foreground italic">
            Exploring the beauty of the world
          </h1>
        </div>

        <div className="mt-4">
          <ImageUpload />
        </div>
      </section>

      <section className="w-full pb-12">
        <Gallery />
      </section>
    </div>
  );
}
