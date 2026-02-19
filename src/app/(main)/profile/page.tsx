
"use client";

import Image from 'next/image';
import { useContext, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { GameContext, GameContextType } from '@/context/GameContext';
import { UserAccount } from '@/lib/types';
import { achievementsData, cocData } from '@/lib/data';
import { predefinedBackgrounds } from '@/lib/backgrounds-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CreatorBadgeIcon, AngelicPowerRuneIcon, BlackFlameIcon } from '@/components/icons';
import { SpecialBackground } from '@/components/special-background';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, UserX, Users, Mail, Send, CheckCircle, Image as ImageIcon, Sparkles, X, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ProfilePage() {
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();

    // State for the avatar upload dialog
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

    // State for the background customization dialog
    const [isBgDialogOpen, setIsBgDialogOpen] = useState(false);
    const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
    const [bgPreviewUrl, setBgPreviewUrl] = useState<string | null>(null);
    
    // State for the email dialog
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);

    // State for display name dialog
    const [isDisplayNameDialogOpen, setIsDisplayNameDialogOpen] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [displayNameError, setDisplayNameError] = useState<string | null>(null);


    if (!game.currentUser || !game.accounts) {
        return null;
    }

    const { currentUser, accounts, removeFriend, updateAvatar, sendVerificationEmail, verifyEmail, updateProfileBackground, acceptFriendRequest, rejectFriendRequest, updateEmail, updateDisplayName } = game;
    const { player, stats, achievements } = currentUser;
    const hasSpecialBg = !!player.specialBackground;

    const activeTitle = player.activeTitleId ? achievementsData.find(a => a.id === player.activeTitleId) : null;
    const displayTitle = player.customTitle || activeTitle?.name;
    const unlockedBadges = achievements.filter(a => a.type === 'badge');

    // Friend list logic: Find full user accounts for each friend username.
    const friends = useMemo(() => {
        if (!player.friendUsernames) {
            return [];
        }
        return player.friendUsernames
            .map(username => accounts.find(acc => acc.player.username === username))
            .filter((acc): acc is UserAccount => !!acc);
    }, [player.friendUsernames, accounts]);

    const friendRequests = useMemo(() => {
        if (!currentUser?.player.friendRequests) return [];
        return currentUser.player.friendRequests
            .map(username => accounts.find(acc => acc.player.username === username))
            .filter((acc): acc is UserAccount => !!acc);
    }, [currentUser?.player.friendRequests, accounts]);
    
    const getDisplayTitle = (user: UserAccount) => {
        const { player } = user;
        if (player.customTitle) return player.customTitle;
        if (!player.activeTitleId) return null;
        const achievement = achievementsData.find(a => a.id === player.activeTitleId);
        return achievement ? achievement.name : null;
    };


    const currentBackgroundUrl = useMemo(() => {
        if (!player) return '';
    
        if (player.profileBackgroundId === 'custom' && player.profileBackgroundUrl) {
            return player.profileBackgroundUrl;
        }
        
        const predefined = predefinedBackgrounds.find(bg => bg.id === player.profileBackgroundId);
        return predefined ? predefined.imageUrl : (predefinedBackgrounds[0]?.imageUrl || '');
    }, [player]);

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (1MB limit for Firestore document safety)
            if (file.size > 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "Image Too Large",
                    description: "Please select an image smaller than 1MB to ensure it can be saved.",
                });
                e.target.value = '';
                return;
            }

            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                setSelectedAvatarFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please select a JPG or PNG image.",
                });
                setSelectedAvatarFile(null);
                setAvatarPreviewUrl(null);
            }
        }
    };

    const handleSaveAvatar = () => {
        if (avatarPreviewUrl && updateAvatar) {
            updateAvatar(avatarPreviewUrl);
            setIsAvatarDialogOpen(false);
            setAvatarPreviewUrl(null);
            setSelectedAvatarFile(null);
            toast({
                title: "Avatar Updated!",
                description: "Your new profile picture has been saved.",
            });
        }
    };

    const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for document safety
                toast({
                    variant: "destructive",
                    title: "Image Too Large",
                    description: "Background images must be smaller than 1MB to be saved to your profile.",
                });
                e.target.value = '';
                return;
            }

            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                setSelectedBgFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setBgPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please select a JPG or PNG image.",
                });
                setSelectedBgFile(null);
                setBgPreviewUrl(null);
            }
        }
    };

    const handleSaveCustomBg = () => {
        if (bgPreviewUrl && updateProfileBackground) {
            updateProfileBackground(bgPreviewUrl);
            setSelectedBgFile(null);
            setBgPreviewUrl(null);
            setIsBgDialogOpen(false);
        }
    };
    
    const handleSaveEmail = async () => {
        if (!updateEmail) return;
        setEmailError(null);
        const result = await updateEmail(newEmail);
        if (result.success) {
            setIsEmailDialogOpen(false);
            setNewEmail('');
        } else {
            setEmailError(result.message);
        }
    };

    const handleSaveDisplayName = async () => {
        if (!updateDisplayName) return;
        setDisplayNameError(null);
        const result = await updateDisplayName(newDisplayName);
        if (result.success) {
            setIsDisplayNameDialogOpen(false);
            setNewDisplayName('');
        } else {
            setDisplayNameError(result.message);
        }
    };


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
            
            <div className="absolute inset-0 w-full h-full bg-background/60 backdrop-blur-sm z-[-5]" />

            <div className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8">
                <h1 className="font-headline text-4xl font-bold mb-8">Player Profile</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="bg-card/75 backdrop-blur-sm">
                            <CardHeader className="items-center text-center">
                                <div className="relative group">
                                    <GamifiedAvatar account={currentUser} imageClassName="w-32 h-32 mb-4 border-4 border-primary/50 shadow-lg shadow-primary/20" />
                                    <Button
                                        onClick={() => setIsAvatarDialogOpen(true)}
                                        variant="outline"
                                        size="icon"
                                        className="absolute bottom-4 -right-1 rounded-full h-10 w-10 bg-card/80 backdrop-blur-sm border-primary/50 hover:bg-primary/20"
                                        aria-label="Upload profile picture"
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </Button>
                                     {hasSpecialBg ? (
                                        <Badge variant="destructive" className="absolute bottom-4 right-10 flex items-center gap-1 h-10 px-3">
                                            <Sparkles className="h-4 w-4" />
                                            Special
                                        </Badge>
                                    ) : (
                                        <Button
                                            onClick={() => setIsBgDialogOpen(true)}
                                            variant="outline"
                                            size="icon"
                                            className="absolute bottom-4 right-10 rounded-full h-10 w-10 bg-card/80 backdrop-blur-sm border-primary/50 hover:bg-primary/20"
                                            aria-label="Customize profile background"
                                        >
                                            <ImageIcon className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                        {player.displayName}
                                        {player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-6 w-6" title="Creator" />}
                                        {player.isCreator && <AngelicPowerRuneIcon className="text-cyan-300 h-6 w-6" title="Angelic Power Rune" />}
                                        {player.specialInsignia === 'black-flame' && <BlackFlameIcon className="text-primary h-6 w-6" title="Black Flame Wanderer"/>}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setNewDisplayName(player.displayName); setIsDisplayNameDialogOpen(true); setDisplayNameError(null);}}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardDescription>@{player.username}</CardDescription>
                                {displayTitle && <Badge variant="destructive" className="text-lg mt-1">{displayTitle}</Badge>}
                                {hasSpecialBg && (
                                    <p className="text-xs text-muted-foreground pt-2">This is a unique background assigned to this agent ID.</p>
                                )}
                            </CardHeader>
                        </Card>

                        <Card className="bg-card/75 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Mail /> Verification Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {player.email ? (
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground truncate">Email: {player.email}</p>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => { setNewEmail(player.email || ''); setIsEmailDialogOpen(true); setEmailError(null); }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {player.emailVerified ? (
                                            <div className="mt-2 flex items-center gap-2 text-green-500 font-semibold">
                                                <CheckCircle className="h-5 w-5" />
                                                <span>Verified</span>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <p className="text-yellow-500 font-semibold mb-2">Not Verified</p>
                                                <div className="flex flex-col gap-2">
                                                    <Button onClick={() => verifyEmail()} size="sm">Verify Now (Sim)</Button>
                                                    <Button onClick={() => sendVerificationEmail()} variant="outline" size="sm">
                                                        <Send className="mr-2 h-4 w-4"/>
                                                        Resend Email
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    This is a simulation. No real emails are sent.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-4">
                                        <p>No email address has been provided.</p>
                                        <Button variant="link" onClick={() => { setNewEmail(''); setIsEmailDialogOpen(true); setEmailError(null); }}>Add an email to enable verification</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-card/75 backdrop-blur-sm">
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
                        {friendRequests.length > 0 && (
                            <Card className="bg-card/75 backdrop-blur-sm border-accent/50 shadow-lg shadow-accent/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-accent"><Mail /> Friend Requests</CardTitle>
                                    <CardDescription>You have {friendRequests.length} pending friend request(s).</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {friendRequests.map(requestingUser => (
                                            <div key={requestingUser.player.username} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                    <GamifiedAvatar account={requestingUser} />
                                                    <div>
                                                        <p className="font-semibold">{requestingUser.player.displayName}</p>
                                                        <p className="text-sm text-muted-foreground">@{requestingUser.player.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => acceptFriendRequest(requestingUser.player.username)}><Check className="h-4 w-4 mr-2" /> Accept</Button>
                                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => rejectFriendRequest(requestingUser.player.username)}><X className="h-4 w-4 mr-2" /> Reject</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        <Card className="bg-card/75 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users /> Friends</CardTitle>
                                <CardDescription>Your connected agents.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {friends.length > 0 ? (
                                    <div className="space-y-4">
                                        {friends.map(friend => {
                                            const friendTitle = getDisplayTitle(friend);
                                            return (
                                                <div key={friend.player.username} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-white/10">
                                                    <Link href={`/users/${friend.player.username}`} className="flex items-center gap-3 group">
                                                        <GamifiedAvatar account={friend} />
                                                        <div>
                                                            <p className="font-semibold group-hover:underline">{friend.player.displayName}</p>
                                                            {friendTitle && <p className="text-xs text-muted-foreground">{friendTitle}</p>}
                                                        </div>
                                                    </Link>
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

                        <Card className="bg-card/75 backdrop-blur-sm">
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

                        <Card className="bg-card/75 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Achievement Log</CardTitle>
                                <CardDescription>Your journey so far.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {achievements.length > 0 ? (
                                    <ul className="space-y-4">
                                        {[...achievements].sort((a,b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()).map(ach => (
                                            <li key={ach.id} className="flex items-start gap-4">
                                                <div className="mt-1 text-2xl">{ach.type === 'badge' ? '🎖️' : '🏆'}</div>
                                                <div>
                                                    <p className="font-semibold">{ach.type === 'badge' ? 'Badge earned:' : 'Title unlocked:'} {ach.name}</p>
                                                    <p className="text-sm text-muted-foreground">{ach.description}</p>
                                                    {ach.timestamp && <time className="text-xs text-muted-foreground">{format(new Date(ach.timestamp), "PPP p")}</time>}
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

            {/* AVATAR DIALOG */}
            <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Profile Picture</DialogTitle>
                        <DialogDescription>Select a JPG or PNG image (Max 1MB). The image will be saved to your MI-LITECH profile.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {avatarPreviewUrl && (
                            <div className="flex justify-center">
                                <Avatar className="w-40 h-40 border-4 border-primary/50">
                                    <AvatarImage src={avatarPreviewUrl} alt="New avatar preview" />
                                    <AvatarFallback>P</AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                        <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleAvatarFileChange}
                            className="file:text-primary file:font-semibold"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAvatar} disabled={!selectedAvatarFile}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* BACKGROUND CUSTOMIZATION DIALOG */}
            <Dialog open={isBgDialogOpen} onOpenChange={setIsBgDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Customize Profile Background</DialogTitle>
                        <DialogDescription>Select a predefined theme or upload your own image (Max 1MB).</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-center">Predefined Themes</h4>
                            <ScrollArea className="h-72 rounded-md border">
                                <div className="grid grid-cols-2 gap-2 p-4">
                                    {predefinedBackgrounds.map((bg) => (
                                        <div 
                                            key={bg.id} 
                                            className={cn(
                                                "relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all group",
                                                player.profileBackgroundId === bg.id && !player.profileBackgroundUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50'
                                            )}
                                            onClick={() => updateProfileBackground && updateProfileBackground(bg.id)}
                                        >
                                            <Image src={bg.imageUrl} alt={bg.name} fill style={{ objectFit: 'cover' }} />
                                            <div className="absolute inset-0 bg-black/30 flex items-end p-2 transition-opacity opacity-100 sm:opacity-0 group-hover:opacity-100">
                                                <p className="text-xs font-bold text-white">{bg.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-3">
                             <h4 className="font-semibold text-center">Custom Image</h4>
                             <div className='flex flex-col items-center justify-center space-y-4 p-4 border rounded-md h-72'>
                                {bgPreviewUrl ? (
                                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                                        <Image src={bgPreviewUrl} alt="New background preview" fill style={{ objectFit: 'cover' }}/>
                                    </div>
                                ) : player.profileBackgroundUrl && (
                                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                                        <Image src={player.profileBackgroundUrl} alt="Current custom background" fill style={{ objectFit: 'cover' }}/>
                                    </div>
                                )}
                                <Input
                                    id="background-upload"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleBgFileChange}
                                    className="file:text-primary file:font-semibold"
                                />
                                <Button onClick={handleSaveCustomBg} disabled={!selectedBgFile} className="w-full">
                                    Apply Custom Image
                                </Button>
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBgDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EMAIL DIALOG */}
            <Dialog open={isEmailDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) { setEmailError(null); } setIsEmailDialogOpen(isOpen); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Email Address</DialogTitle>
                        <DialogDescription>Enter a valid Gmail address to associate with your account. This will reset your verification status.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            id="email-update"
                            type="email"
                            placeholder="your.email@gmail.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                        {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEmailDialogOpen(false); setEmailError(null); }}>Cancel</Button>
                        <Button onClick={handleSaveEmail}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* DISPLAY NAME DIALOG */}
            <Dialog open={isDisplayNameDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) { setDisplayNameError(null); } setIsDisplayNameDialogOpen(isOpen); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Display Name</DialogTitle>
                        <DialogDescription>Choose a new public name. Max 20 characters. Letters, numbers, spaces, and underscores only.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            id="displayName-update"
                            type="text"
                            placeholder="Your new display name"
                            value={newDisplayName}
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            maxLength={20}
                        />
                        {displayNameError && <p className="text-sm text-destructive">{displayNameError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsDisplayNameDialogOpen(false); setDisplayNameError(null); }}>Cancel</Button>
                        <Button onClick={handleSaveDisplayName}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
