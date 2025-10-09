import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { XIcon } from "./icons/XIcon";

export const Footer = () => {
  return (
    <footer className="w-full flex items-center justify-center py-6 px-4 border-t border-default-100">
      <div className="text-sm text-default-600 flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
        <div className="flex items-center gap-2">
          <span>Built by</span>
          <Image
            src="/vlad-pfp.jpg"
            alt="Vlad"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="font-medium">Vlad</span>
        </div>
        <div className="flex items-center gap-2">
          <span>for Arena and Amelie.</span>
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
        </div>
        <div className="flex items-center gap-2">
          <span>I love you girls. You can find me on</span>
          <Link
            href="https://x.com/deifosv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:text-foreground transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
};
