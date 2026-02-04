"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  User,
  LogOut,
  Swords,
  Puzzle,
  BookCopy,
  Loader2,
} from "lucide-react";
import { GameContext, GameContextType } from "@/context/GameContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatorBadgeIcon, GamepadIcon } from "@/components/icons";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const game = useContext(GameContext) as GameContextType;
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !game.currentUser) {
      router.replace("/login");
    }
  }, [game.currentUser, router, isClient]);

  if (!isClient || !game.currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const { player } = game.currentUser;

  const navItems = [
    { href: "/dashboard", icon: <LayoutGrid />, label: "Dashboard" },
    { href: "/coc/coc1", icon: <BookCopy />, label: "COC 1" },
    { href: "/coc/coc2", icon: <BookCopy />, label: "COC 2" },
    { href: "/coc/coc3", icon: <BookCopy />, label: "COC 3" },
    { href: "/coc/coc4", icon: <BookCopy />, label: "COC 4" },
    { href: "/minigame", icon: <Puzzle />, label: "Mini-Game" },
    { href: "/profile", icon: <User />, label: "Profile" },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <GamepadIcon className="size-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold">IT MAZING</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={game.logout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 text-sm font-medium">
              <span>{player.username}</span>
              {player.isCreator && <CreatorBadgeIcon className="text-yellow-400" title="Creator" />}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={player.avatar} alt={player.username} />
              <AvatarFallback>{player.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
