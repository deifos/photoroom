interface HeroSectionProps {
  userName?: string;
}

export function HeroSection({ userName }: HeroSectionProps) {
  const firstName = userName?.split(' ')[0] || '';

  return (
    <div className="text-center max-w-3xl">
      {userName ? (
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
  );
}
