"use client";

import { useState, useContext, useMemo } from 'react';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { achievementsData } from '@/lib/data';
import { UserAccount } from '@/lib/types';

export default function UsersPage() {
    const game = useContext(GameContext) as GameContextType;
    const [searchQuery, setSearchQuery] = useState('');

    const { currentUser, accounts, addFriend } = game;

    // User Listing Logic:
    // Memoize the list of other users to prevent recalculation on every render.
    const otherUsers = useMemo(() => {
        if (!currentUser) return [];
        // Filter out the current user from the list of all accounts.
        return accounts.filter(acc => acc.player.username !== currentUser.player.username);
    }, [accounts, currentUser]);

    // Search Logic:
    // Memoize the filtered user list based on the search query.
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return otherUsers;
        // Perform a case-insensitive search on the username.
        return otherUsers.filter(acc =>
            acc.player.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [otherUsers, searchQuery]);
    
    // Helper function to find a user's active title from achievementsData.
    const getActiveTitle = (user: UserAccount) => {
        if (!user.player.activeTitleId) return null;
        return achievementsData.find(a => a.id === user.player.activeTitleId);
    };

    if (!currentUser) return null;

    return (
        <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold flex items-center gap-2"><Users /> User Directory</h1>
                    <p className="text-muted-foreground">Find and connect with other agents in the simulation.</p>
                </div>
                <Input
                    type="text"
                    placeholder="Search for a user..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map(user => {
                        const activeTitle = getActiveTitle(user);
                        const isFriend = currentUser.player.friendUsernames.includes(user.player.username);

                        return (
                            <Card key={user.player.username} className="text-center bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all">
                                <CardContent className="pt-6 flex flex-col items-center gap-4">
                                    <Avatar className="w-24 h-24 border-4 border-primary/50">
                                        <AvatarImage src={user.player.avatar} alt={user.player.username} />
                                        <AvatarFallback>{user.player.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-xl font-bold">{user.player.username}</h3>
                                        {activeTitle && <Badge variant="destructive" className="mt-1">{activeTitle.name}</Badge>}
                                    </div>
                                    <Button 
                                        onClick={() => addFriend(user.player.username)} 
                                        disabled={isFriend}
                                        className="w-full"
                                        variant={isFriend ? "secondary" : "default"}
                                    >
                                        {isFriend ? <><Check className="mr-2 h-4 w-4" /> Friend</> : <><UserPlus className="mr-2 h-4 w-4" /> Add Friend</>}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground bg-card/50 rounded-lg">
                    <p className="text-lg font-semibold">No Agents Found</p>
                    <p>No other users match your search, or you are the first agent online.</p>
                </div>
            )}
        </div>
    );
}
