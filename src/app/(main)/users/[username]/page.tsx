
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

import { CreatorBadgeIcon } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, UserX, Lock, Trophy } from 'lucide-react';
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

    const { accounts, currentUser, addFriend, removeFriend } = game;

    const userAccount = useMemo(() => {
        if (!username) return null;
        const decodedUsername = decodeURIComponent(username);
        return accounts.find(acc => acc.player.username.toLowerCase() === decodedUsername.toLowerCase());
    }, [accounts, username]);

    useEffect(() => {
        if (userAccount?.player.specialBackground) {
            console.log(`Public Profile Background: User ${userAccount.player.username} has special background '${userAccount.player.specialBackground}' applied.`);
        }
    }, [userAccount]);

    /**
     * Public Profile Background Logic:
     * Reads the selected background from the viewed user's data.
     * This allows each user's profile to have its own customized look.
     * Falls back to a default if no specific background is set.
     */
    const currentBackgroundUrl = useMemo(() => {
        if (!userAccount?.player) return predefinedBackgrounds[0]?.imageUrl || '';
        const { player } = userAccount;
        
        console.log(`Loading background for ${player.username}: id=${player.profileBackgroundId}`);

        if (player.profileBackgroundId === 'custom' && player.profileBackgroundUrl) {
            return player.profileBackgroundUrl;
        }
        const predefined = predefinedBackgrounds.find(bg => bg.id === player.profileBackgroundId);
        return predefined ? predefined.imageUrl : (predefinedBackgrounds[0]?.imageUrl || '');
    }, [userAccount]);

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
    
    const { player, achievements } = userAccount;
    const hasSpecialBg = !!player.specialBackground;
    const activeTitle = player.activeTitleId ? achievementsData.find(a => a.id === player.activeTitleId) : null;
    
    const isFriend = currentUser?.player.friendUsernames.includes(player.username);
    const isCurrentUser = currentUser?.player.username === player.username;

    // If the user is viewing their own public profile, redirect them to their editable profile page.
    if (isCurrentUser) {
        router.replace('/profile');
        return null;
    }
    
    /**
     * Achievement Rendering Logic:
     * This component displays a list of all possible achievements from `achievementsData`.
     * For each possible achievement, it checks if the `id` exists in the currently viewed
     * user's `achievements` array.
     * - If it exists, the achievement is marked as "Unlocked".
     * - If it does not exist, it is marked as "Locked" and visually greyed out.
     * This provides a clear, read-only view of another user's accomplishments.
     */
    return (
        <div className="relative -m-4 md:-m-6 h-full">
             {hasSpecialBg ? (
                <SpecialBackground type={player.specialBackground!} />
            ) : (
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url(${currentBackgroundUrl})` }}
                />
            )}
            <div className="absolute inset-0 w-full h-full bg-background/80 backdrop-blur-sm" />

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
                            <BreadcrumbPage>{player.username}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="bg-card/70 backdrop-blur-sm">
                            <CardHeader className="items-center text-center">
                                <Avatar className="w-32 h-32 mb-4 border-4 border-primary/50 shadow-lg shadow-primary/20">
                                    <AvatarImage src={player.avatar} alt={player.username} />
                                    <AvatarFallback className="text-4xl">{player.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                    {player.username}
                                    {player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-6 w-6" title="Creator" />}
                                </CardTitle>
                                {activeTitle && <Badge variant="destructive" className="text-lg">{activeTitle.name}</Badge>}
                                {!isCurrentUser && currentUser && (
                                     <Button 
                                        onClick={() => isFriend ? removeFriend(player.username) : addFriend(player.username)} 
                                        className="mt-4"
                                        variant={isFriend ? "outline" : "default"}
                                    >
                                        {isFriend ? <><UserX className="mr-2" /> Remove Friend</> : <><UserPlus className="mr-2"/> Add Friend</>}
                                    </Button>
                                )}
                            </CardHeader>
                        </Card>
                    </div>
                    
                    <div className="lg:col-span-2">
                         <Card className="bg-card/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Trophy /> Achievements</CardTitle>
                                <CardDescription>A log of this agent's accomplishments.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {achievementsData.map(ach => {
                                    const isUnlocked = achievements.some(unlocked => unlocked.id === ach.id);
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
