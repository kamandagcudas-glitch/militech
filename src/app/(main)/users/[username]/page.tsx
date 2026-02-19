
"use client";

import Image from 'next/image';
import { useContext, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { GameContext, GameContextType } from '@/context/GameContext';
import { achievementsData } from '@/lib/data';
import { predefinedBackgrounds } from '@/lib/backgrounds-data';
import { cn } from '@/lib/utils';
import { SpecialBackground } from '@/components/special-background';
import { Loader2 } from 'lucide-react';

import { CreatorBadgeIcon, AngelicPowerRuneIcon, BlackFlameIcon } from '@/components/icons';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, UserX, Lock, Trophy, Send, Mail, ShieldX } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function PublicProfilePage() {
    const game = useContext(GameContext) as GameContextType;
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;

    const { accounts, currentUser, sendFriendRequest, removeFriend } = game;

    const userAccount = useMemo(() => {
        if (!username || !accounts) return null;
        const decodedUsername = decodeURIComponent(username);
        return accounts.find(acc => acc.player.username.toLowerCase() === decodedUsername.toLowerCase());
    }, [accounts, username]);
    
    const isCurrentUser = useMemo(() => {
        if (!currentUser || !userAccount) return false;
        return currentUser.player.username === userAccount.player.username;
    }, [currentUser, userAccount]);
    
    useEffect(() => {
        if (isCurrentUser) {
            router.replace('/profile');
        }
    }, [isCurrentUser, router]);

    const currentBackgroundUrl = useMemo(() => {
        if (!userAccount?.player) return predefinedBackgrounds[0]?.imageUrl || '';
        const { player } = userAccount;

        if (player.profileBackgroundId === 'custom' && player.profileBackgroundUrl) {
            return player.profileBackgroundUrl;
        }
        const predefined = predefinedBackgrounds.find(bg => bg.id === player.profileBackgroundId);
        return predefined ? predefined.imageUrl : (predefinedBackgrounds[0]?.imageUrl || '');
    }, [userAccount]);

    if (game.isUserLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
    }

    if (isCurrentUser) {
        return null;
    }

    if (!userAccount) {
        return (
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold mb-4">User Not Found</h1>
                <p className="text-muted-foreground">The agent with the callsign "{username}" could not be found.</p>
                <Link href="/users">
                    <Button variant="link" className="mt-4">Back to User Directory</Button>
                </Link>
            </div>
        );
    }
    
    const { player } = userAccount;
    const hasSpecialBg = !!player.specialBackground;
    const activeTitle = player.activeTitleId ? achievementsData.find(a => a.id === player.activeTitleId) : null;
    const displayTitle = player.customTitle || activeTitle?.name;
    
    const isFriend = currentUser?.player.friendUsernames.includes(player.username);
    const requestSent = player.friendRequests?.includes(currentUser?.player.username || '');
    const requestReceived = currentUser?.player.friendRequests.includes(player.username);

    return (
        <div className="relative -m-4 md:-m-6 h-full">
             {hasSpecialBg ? (
                <div className="absolute inset-0 z-[-20]">
                    <SpecialBackground type={player.specialBackground!} />
                </div>
            ) : (
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500 z-[-20]"
                    style={{ backgroundImage: `url(${currentBackgroundUrl})` }}
                />
            )}
            
            {/* The global RunningPixelBackground is fixed at z-[-10]. 
                By setting the background image to z-[-20] and the overlay to z-[-5], 
                the runners appear running ON the background but BEHIND the blur/UI. */}
            <div className="absolute inset-0 w-full h-full bg-background/60 backdrop-blur-sm z-[-5]" />

            <div className="relative z-10 p-4 md:p-6 lg:p-8">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                             <BreadcrumbLink asChild>
                                <Link href="/users">User Directory</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{player.displayName}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="bg-card/75 backdrop-blur-sm">
                            <CardHeader className="items-center text-center">
                                <GamifiedAvatar account={userAccount} imageClassName="w-32 h-32 mb-4" />
                                <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                    {player.displayName}
                                    {player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-6 w-6" title="Creator" />}
                                    {player.isCreator && <AngelicPowerRuneIcon className="text-cyan-300 h-6 w-6" title="Angelic Power Rune"/>}
                                    {player.specialInsignia === 'black-flame' && <BlackFlameIcon className="text-primary h-6 w-6" title="Black Flame Wanderer"/>}
                                </CardTitle>
                                <CardTitle className="text-sm font-medium opacity-70">@{player.username}</CardTitle>
                                {player.isBanned && <Badge variant="destructive" className="mt-2 text-base flex items-center gap-1"><ShieldX className="h-4 w-4"/>BANNED</Badge>}
                                {displayTitle && <Badge variant="destructive" className="text-lg mt-1">{displayTitle}</Badge>}
                                {!isCurrentUser && currentUser && (
                                    <div className="mt-4">
                                        {isFriend ? (
                                            <Button onClick={() => removeFriend(player.username)} variant="outline">
                                                <UserX className="mr-2" /> Remove Friend
                                            </Button>
                                        ) : requestSent ? (
                                            <Button disabled variant="secondary">
                                                <Send className="mr-2" /> Request Sent
                                            </Button>
                                        ) : requestReceived ? (
                                            <Button asChild>
                                                <Link href="/profile">
                                                    <Mail className="mr-2"/> Respond to Request
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button onClick={() => sendFriendRequest(player.username)} disabled={player.isBanned}>
                                                <UserPlus className="mr-2"/> Add Friend
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardHeader>
                        </Card>
                    </div>
                    
                    <div className="lg:col-span-2">
                         <Card className="bg-card/75 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Trophy /> Achievements</CardTitle>
                                <CardDescription>A log of this agent's accomplishments.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {achievementsData.map(ach => {
                                    const isUnlocked = userAccount.achievements.some(unlocked => unlocked.id === ach.id);
                                    return (
                                        <div key={ach.id} className={cn("flex items-start gap-4 p-4 rounded-lg border", isUnlocked ? "bg-primary/20 border-primary/30" : "bg-muted/20 border-muted/30 opacity-60")}>
                                            <div className="mt-1 text-3xl">{ach.type === 'badge' ? '🎖️' : '🏆'}</div>
                                            <div>
                                                <p className="font-semibold text-base">{ach.name}</p>
                                                <p className="text-sm text-muted-foreground">{ach.description}</p>
                                                {isUnlocked ? 
                                                    <p className="text-xs text-green-400 mt-1">Unlocked</p>
                                                    : <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1"><Lock className="size-3"/> Locked</p>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
