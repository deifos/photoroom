'use client';

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { User } from "@heroui/user";
import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { Camera, LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent justify="start" className="gap-6">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <Camera className="w-6 h-6 text-rose-500" />
            <p className="font-serif text-xl font-light italic bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              FramesOfWonder
            </p>
          </NextLink>
        </NavbarBrand>
        <NextLink
          href="/about"
          className="text-sm font-medium text-default-600 hover:text-foreground transition-colors"
        >
          About
        </NextLink>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-3 items-center">
        {session?.user && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="cursor-pointer flex items-center">
                <User
                  as="button"
                  name={session.user.name}
                  avatarProps={{
                    src: session.user.image || "/vlad-pfp.jpg",
                    size: "sm",
                  }}
                  classNames={{
                    name: "font-medium",
                  }}
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu actions">
              <DropdownItem
                key="logout"
                color="danger"
                className="text-danger"
                startContent={<LogOut className="w-4 h-4" />}
                onPress={handleSignOut}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
        <ThemeSwitch />
      </NavbarContent>
    </HeroUINavbar>
  );
};
