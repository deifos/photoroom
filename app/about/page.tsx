import { XIcon } from "@/components/icons/XIcon";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-12">
      <div className="max-w-3xl w-full">
        <div className="bg-default-50 dark:bg-default-100 rounded-2xl p-8 md:p-12 shadow-lg">
          <h1 className="text-3xl md:text-4xl font-serif font-light italic text-center mb-8 bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            A Letter to My Girls
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-default-700 dark:text-default-600">
            <p className="leading-relaxed">
              Arena and Amelie my wonderful girls, the world is filled with
              wonderful things and as time goes on many of those things are
              disappearing, the beautiful little details of things we humans use
              to build are being washed out by flat uninspired design, and as
              our lifestyles have changed so have the way we admire and value
              beauty.
            </p>

            <p className="leading-relaxed">
              Frames of Wonder is a project I&apos;ve created for you to have a space
              to collect and share how you see the world, to inspire you to go
              out and explore and capture the beauty that surrounds us, to feed
              your creative spirit and share with the world those frames which
              many of us now miss for going through the motions of life.
            </p>

            <p className="leading-relaxed">
              I hope you enjoy this project and fill up this space with
              thousands of pictures of the world we live in.
            </p>

            <div className="flex items-center gap-3 mt-8 pt-8 border-t border-default-200">
              <p className="leading-relaxed italic">With love,</p>
            </div>

            <div className="flex items-center gap-3">
              <Image
                alt="Your dad"
                className="rounded-full"
                height={48}
                src="/vlad-pfp.jpg"
                width={48}
              />
              <p className="font-medium text-lg">Your dad.</p>

              
            </div>
            <div>
              <p>
                This project was inspired by this video from the Cultural Tutor on &nbsp;  
                <Link
                  className="inline-flex items-center hover:text-foreground transition-colors"
                  href="https://x.com/culturaltutor"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <XIcon className="w-4 h-4" />
                </Link>

                
              </p>
            </div>
            <div className="mt-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                <iframe
                  title="Frames of Wonder Inspiration"
                  src="https://www.youtube.com/embed/tWYxrowovts"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
