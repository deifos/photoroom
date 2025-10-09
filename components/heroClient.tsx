'use client';

import { useSession } from '@/lib/auth-client';
import { HeroSection } from './heroSection';

export function HeroClient() {
  const { data: session } = useSession();

  return <HeroSection userName={session?.user?.name} />;
}
