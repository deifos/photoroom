import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { XIcon } from "./icons/XIcon";

export const Footer = () => {
  return (
    <footer className="w-full flex items-center justify-center py-6 border-t border-default-100">
      <p className="text-sm text-default-600 flex items-center gap-2">
        Built by
        <Image
          src="/vlad-pfp.jpg"
          alt="Vlad"
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium">Vlad</span>
        for Arena and Amelie.
        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
        I love you girls. You can find me on
        <Link
          href="https://x.com/deifosv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:text-foreground transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </Link>
      </p>
    </footer>
  );
};
