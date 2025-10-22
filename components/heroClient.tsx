"use client";

import { HeroSection } from "./heroSection";

import { useSession } from "@/lib/auth-client";

export function HeroClient() {
  const { data: session } = useSession();

  return <HeroSection userName={session?.user?.name} />;
}
