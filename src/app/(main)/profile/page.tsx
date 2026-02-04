"use client";

import { useContext, useState, useMemo } from 'react';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { achievementsData, cocData } from '@/lib/data';
import { CreatorBadgeIcon } from '@/components/icons';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pencil, UserX, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserAccount } from '@/lib/types';
import Link from 'next/link';


export default function ProfilePage() {
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    if (!game.currentUser || !game.accounts) {
        return null;
    }

    const { currentUser, accounts, removeFriend, updateAvatar } = game;
    const { player, stats, achievements } = currentUser;
    
    const activeTitle = player.activeTitleId ? achievementsData.find(a => a.id === player.activeTitleId) : null;
    const unlockedBadges = achievements.filter(a => a.type === 'badge');

    // Friend list logic: Find full user accounts for each friend username.
    const friends = useMemo(() => {
        /**
         * Friend Relationship Storage:
         * The `friendUsernames` array on the `Player` object stores a list of usernames.
         * This logic maps those usernames to the full UserAccount objects from the global `accounts` list
         * to display their details (avatar, title, etc.).
         * It includes a defensive check for `player.friendUsernames` to prevent crashes during
         * data migration or brief inconsistencies.
         */
        if (!player.friendUsernames) {
            return [];
        }
        return player.friendUsernames
            .map(username => accounts.find(acc => acc.player.username === username))
            .filter((acc): acc is UserAccount => !!acc);
    }, [player.friendUsernames, accounts]);
    
    // Helper to get the active title object from an achievement ID.
    const getActiveTitle = (user: UserAccount) => {
        if (!user.player.activeTitleId) return null;
        return achievementsData.find(a => a.id === user.player.activeTitleId);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            toast({
                variant: "destructive",
                title: "Invalid File Type",
                description: "Please select a JPG or PNG image.",
            });
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleSaveAvatar = () => {
        if (previewUrl && updateAvatar) {
            updateAvatar(previewUrl);
            setIsUploadDialogOpen(false);
            setPreviewUrl(null);
            setSelectedFile(null);
            toast({
                title: "Avatar Updated!",
                description: "Your new profile picture has been saved.",
            });
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="font-headline text-4xl font-bold mb-8">Player Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <div className="relative group">
                                <Avatar className="w-32 h-32 mb-4 border-4 border-primary/50 shadow-lg shadow-primary/20">
                                    <AvatarImage src={player.avatar} alt={player.username} />
                                    <AvatarFallback className="text-4xl">{player.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button
                                    onClick={() => setIsUploadDialogOpen(true)}
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-4 -right-1 rounded-full h-10 w-10 bg-card/80 backdrop-blur-sm border-primary/50 hover:bg-primary/20"
                                    aria-label="Upload profile picture"
                                >
                                    <Pencil className="h-5 w-5" />
                                </Button>
                            </div>
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
                            <CardTitle className="flex items-center gap-2"><Users /> Friends</CardTitle>
                            <CardDescription>Your connected agents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {friends.length > 0 ? (
                                <div className="space-y-4">
                                    {friends.map(friend => {
                                        const friendTitle = getActiveTitle(friend);
                                        return (
                                            <div key={friend.player.username} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={friend.player.avatar} alt={friend.player.username} />
                                                        <AvatarFallback>{friend.player.username.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{friend.player.username}</p>
                                                        {friendTitle && <p className="text-xs text-muted-foreground">{friendTitle.name}</p>}
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeFriend(friend.player.username)} aria-label={`Remove ${friend.player.username} from friends`}>
                                                    <UserX className="h-5 w-5 text-destructive/80 hover:text-destructive" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    <p>You haven't added any friends yet.</p>
                                    <Link href="/users" passHref>
                                       <Button variant="link" className="mt-2">Find Friends</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            {cocData.map(coc => (
                                <div key={coc.id} className="p-4 bg-background/50 rounded-lg border border-white/10">
                                    <p className="text-sm text-muted-foreground">{coc.id.toUpperCase()} Attempts</p>
                                    <p className="text-3xl font-bold">{(stats as any)[coc.id].attempts}</p>
                                </div>
                            ))}
                            {cocData.map(coc => (
                                <div key={coc.id} className="p-4 bg-background/50 rounded-lg border border-white/10">
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

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Profile Picture</DialogTitle>
                        <DialogDescription>Select a JPG or PNG image. The image will be saved locally in your browser.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {previewUrl && (
                            <div className="flex justify-center">
                                <Avatar className="w-40 h-40 border-4 border-primary/50">
                                    <AvatarImage src={previewUrl} alt="New avatar preview" />
                                    <AvatarFallback>P</AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                        <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                            className="file:text-primary file:font-semibold"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAvatar} disabled={!selectedFile}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
