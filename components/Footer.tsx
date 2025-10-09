import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full flex items-center justify-center py-6 border-t border-default-100">
      <p className="text-sm text-default-600 flex items-center gap-1">
        Built by Vlad for Arena and Amelie.
        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
        I love you girls
      </p>
    </footer>
  );
};
