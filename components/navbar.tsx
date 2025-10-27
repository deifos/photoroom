"use client";

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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from "@heroui/react";
import { User } from "@heroui/user";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { Camera, LogOut, Menu } from "lucide-react";

import { ThemeSwitch } from "@/components/theme-switch";
import { useSession, signOut } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  // Get user initials from name
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent className="gap-6" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-2"
              href="/"
            >
              <Camera className="w-6 h-6 text-rose-500" />
              <p className="font-serif text-xl font-light italic bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                {siteConfig.name}
              </p>
            </NextLink>
          </NavbarBrand>
          <ul className="hidden md:flex gap-6 items-center">
            {siteConfig.navItems.map((item) => (
              <li key={item.href}>
                <NextLink
                  className="text-sm font-medium text-default-600 hover:text-foreground transition-colors"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </NavbarContent>

        <NavbarContent className="gap-3 items-center" justify="end">
          {session?.user && (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <div className="cursor-pointer flex items-center">
                  <User
                    as="button"
                    avatarProps={{
                      src: session.user.image || undefined,
                      size: "sm",
                      name: session.user.image ? undefined : getUserInitials(session.user.name),
                      showFallback: true,
                    }}
                    classNames={{
                      name: "font-medium hidden md:block",
                    }}
                    name={session.user.name}
                  />
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu actions">
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={handleSignOut}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
          <ThemeSwitch />
          <Button
            isIconOnly
            aria-label="Open menu"
            className="md:hidden"
            variant="light"
            onPress={onOpen}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </NavbarContent>
      </HeroUINavbar>

      <Drawer isOpen={isOpen} placement="right" onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Camera className="w-6 h-6 text-rose-500" />
                  <p className="font-serif text-xl font-light italic bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                    {siteConfig.name}
                  </p>
                </div>
              </DrawerHeader>
              <DrawerBody>
                <nav className="flex flex-col gap-4">
                  {siteConfig.navItems.map((item) => (
                    <NextLink
                      key={item.href}
                      className="text-lg font-medium text-default-600 hover:text-foreground transition-colors py-2"
                      href={item.href}
                      onClick={onClose}
                    >
                      {item.label}
                    </NextLink>
                  ))}
                  {session?.user && (
                    <button
                      className="flex items-center gap-2 text-lg font-medium text-danger hover:text-danger-600 transition-colors py-2"
                      onClick={() => {
                        handleSignOut();
                        onClose();
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  )}
                </nav>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};
