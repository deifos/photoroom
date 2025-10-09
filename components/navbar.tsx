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

import { ThemeSwitch } from "@/components/theme-switch";
import { Camera, LogOut, Menu } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <>
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent justify="start" className="gap-6">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink className="flex justify-start items-center gap-2" href="/">
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
                  href={item.href}
                  className="text-sm font-medium text-default-600 hover:text-foreground transition-colors"
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>
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
                      name: "font-medium hidden md:block",
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
          <Button
            isIconOnly
            variant="light"
            className="md:hidden"
            onPress={onOpen}
            aria-label="Open menu"
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
                      href={item.href}
                      onClick={onClose}
                      className="text-lg font-medium text-default-600 hover:text-foreground transition-colors py-2"
                    >
                      {item.label}
                    </NextLink>
                  ))}
                  {session?.user && (
                    <button
                      onClick={() => {
                        handleSignOut();
                        onClose();
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-danger hover:text-danger-600 transition-colors py-2"
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
