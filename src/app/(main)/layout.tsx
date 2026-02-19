
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  User,
  LogOut,
  Users,
  Puzzle,
  BookCopy,
  Loader2,
  Cpu,
  Trophy,
  Wrench,
  Files,
  MessageSquare,
  SpellCheck,
  Shield,
  Cog,
  MessageCircle,
} from "lucide-react";
import { GameContext, GameContextType } from "@/context/GameContext";
import { GamifiedAvatar } from "@/components/ui/gamified-avatar";
import { CreatorBadgeIcon, GamepadIcon } from "@/components/icons";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isUserLoading, isAdmin, logout, addAchievement } = useContext(GameContext) as GameContextType;
  const router = useRouter();
  const pathname = usePathname();
  const [profileClickTimestamps, setProfileClickTimestamps] = useState<number[]>([]);

  const handleProfileClick = () => {
    if (!addAchievement) return;

    const now = Date.now();
    const fiveSecondsAgo = now - 5000;
    const recentClicks = [...profileClickTimestamps.filter(ts => ts > fiveSecondsAgo), now];
    
    if (recentClicks.length >= 10) {
      addAchievement('rapid-click');
      setProfileClickTimestamps([]);
    } else {
      setProfileClickTimestamps(recentClicks);
    }
  };

  useEffect(() => {
    if (!isUserLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isUserLoading, router]);

  if (isUserLoading || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const { player } = currentUser;
  const friendRequestCount = player.friendRequests?.length || 0;

  const navItems = [
    { href: "/dashboard", icon: <LayoutGrid />, label: "Dashboard" },
    { href: "/chat", icon: <MessageCircle />, label: "Chat" },
    { href: "/system-viewer", icon: <Cpu />, label: "System Viewer" },
    { href: "/pc-builder", icon: <Wrench />, label: "PC Builder" },
    { href: "/files", icon: <Files />, label: "File Storage" },
    { href: "/coc/coc1", icon: <BookCopy />, label: "COC 1" },
    { href: "/coc/coc2", icon: <BookCopy />, label: "COC 2" },
    { href: "/coc/coc3", icon: <BookCopy />, label: "COC 3" },
    { href: "/coc/coc4", icon: <BookCopy />, label: "COC 4" },
    { href: "/minigame", icon: <Puzzle />, label: "Mini-Game" },
    { href: "/word-completion", icon: <SpellCheck />, label: "Word Completion" },
    { href: "/leaderboard", icon: <Trophy />, label: "Leaderboard" },
    { href: "/users", icon: <Users />, label: "Users" },
    { href: "/profile", icon: <User />, label: "Profile", badgeCount: friendRequestCount },
    { href: "/feedback", icon: <MessageSquare />, label: "Feedback" },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <Image 
              src="/militechs.png" 
              alt="MI-LITECH Logo" 
              width={40} 
              height={40} 
              className="rounded-md shadow-lg shadow-primary/20"
            />
            <div className="flex flex-col">
              <h1 className="font-headline text-xl font-bold leading-none">MI-LITECH</h1>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">Operations</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const isProfile = item.href === '/profile';
              return (
                <SidebarMenuItem key={item.href}>
                  <Link 
                    href={item.href} 
                    className="w-full"
                    onClick={isProfile ? handleProfileClick : undefined}
                  >
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badgeCount && item.badgeCount > 0 && <SidebarMenuBadge>{item.badgeCount}</SidebarMenuBadge>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
            {isAdmin && (
              <SidebarMenuItem>
                <Link href="/admin" className="w-full">
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/admin')}
                    tooltip="Admin Dashboard"
                  >
                    <Shield />
                    <span>Admin Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/settings" className="w-full">
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/settings')}
                    tooltip="Settings"
                  >
                    <Cog />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
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
             <div className="flex flex-col items-end -space-y-1">
              <span className="font-medium">{player.displayName}</span>
              <span className="text-xs text-muted-foreground">@{player.username}</span>
            </div>
            <GamifiedAvatar account={currentUser} imageClassName="h-8 w-8" />
          </div>
        </header>
        <main className="relative flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
