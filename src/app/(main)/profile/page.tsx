"use client";

import { useContext } from 'react';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { achievementsData, cocData } from '@/lib/data';
import { CreatorBadgeIcon } from '@/components/icons';
import { format } from 'date-fns';

export default function ProfilePage() {
    const game = useContext(GameContext) as GameContextType;

    if (!game.player || !game.stats) {
        return null;
    }

    const { player, stats, achievements } = game;
    
    const activeTitle = player.activeTitleId ? achievementsData.find(a => a.id === player.activeTitleId) : null;
    const unlockedBadges = achievements.filter(a => a.type === 'badge');

    return (
        <div className="container mx-auto">
            <h1 className="font-headline text-4xl font-bold mb-8">Player Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-32 h-32 mb-4 border-4 border-primary">
                                <AvatarImage src={player.avatar} alt={player.username} />
                                <AvatarFallback className="text-4xl">{player.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                {player.username}
                                {player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-6 w-6" title="Creator" />}
                            </CardTitle>
                            {activeTitle && <Badge variant="destructive" className="text-lg">{activeTitle.name}</Badge>}
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Badges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {unlockedBadges.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {unlockedBadges.map(badge => (
                                        <Badge key={badge.id} variant="secondary" className="text-sm py-1 px-3">{badge.name}</Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No badges earned yet. Keep learning!</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            {cocData.map(coc => (
                                <div key={coc.id} className="p-4 bg-background rounded-lg border">
                                    <p className="text-sm text-muted-foreground">{coc.id.toUpperCase()} Attempts</p>
                                    <p className="text-3xl font-bold">{(stats as any)[coc.id].attempts}</p>
                                </div>
                            ))}
                            {cocData.map(coc => (
                                <div key={coc.id} className="p-4 bg-background rounded-lg border">
                                    <p className="text-sm text-muted-foreground">{coc.id.toUpperCase()} Resets</p>
                                    <p className="text-3xl font-bold text-destructive">{(stats as any)[coc.id].resets}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Achievement Log</CardTitle>
                            <CardDescription>Your journey so far.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {achievements.length > 0 ? (
                                <ul className="space-y-4">
                                    {[...achievements].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(ach => (
                                        <li key={ach.id} className="flex items-start gap-4">
                                            <div className="mt-1 text-2xl">{ach.type === 'badge' ? '🎖️' : '🏆'}</div>
                                            <div>
                                                <p className="font-semibold">{ach.type === 'badge' ? 'Badge earned:' : 'Title unlocked:'} {ach.name}</p>
                                                <p className="text-sm text-muted-foreground">{ach.description}</p>
                                                <time className="text-xs text-muted-foreground">{format(new Date(ach.timestamp), "PPP p")}</time>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">Your adventure is just beginning. Achievements will appear here!</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
