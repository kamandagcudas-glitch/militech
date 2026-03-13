
"use client";

import { useState, useMemo, useContext, useRef, useEffect } from 'react';
import Image from 'next/image';
import { GameContext, GameContextType } from '@/context/GameContext';
import { UserAccount, ChatMessage } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Send, MessageCircle, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { predefinedBackgrounds } from '@/lib/backgrounds-data';
import { SpecialBackground } from '@/components/special-background';
import { useToast } from '@/hooks/use-toast';

function FriendList({ onSelectFriend, onOpenBgDialog }: { onSelectFriend: (friend: UserAccount) => void; onOpenBgDialog: () => void; }) {
    const { currentUser, accounts } = useContext(GameContext) as GameContextType;
    
    const friends = useMemo(() => {
        if (!currentUser?.player.friendUsernames || !accounts) return [];
        return currentUser.player.friendUsernames
            .map(username => accounts.find(acc => acc.player.username === username))
            .filter((acc): acc is UserAccount => !!acc);
    }, [currentUser?.player.friendUsernames, accounts]);

    return (
        <Card className="flex flex-col h-full bg-card/75 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-bold">Friends</h2>
                <Button variant="ghost" size="icon" onClick={onOpenBgDialog} title="Customize Chat Background">
                    <ImageIcon className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <ScrollArea className="h-full">
                    <div className="space-y-1 p-2">
                        {friends.length > 0 ? friends.map(friend => (
                            <button
                                key={friend.player.uid}
                                onClick={() => onSelectFriend(friend)}
                                className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-3"
                            >
                                <GamifiedAvatar account={friend} />
                                <div>
                                    <p className="font-semibold">{friend.player.displayName}</p>
                                    <p className="text-xs text-muted-foreground">@{friend.player.username}</p>
                                </div>
                            </button>
                        )) : (
                            <p className="p-4 text-center text-muted-foreground">No friends yet. Add some from the Users page!</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function ChatWindow({ friend }: { friend: UserAccount; }) {
    const { currentUser, sendMessage, clearChatHistory } = useContext(GameContext) as GameContextType;
    const firestore = useFirestore();
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatId = useMemo(() => {
        if (!currentUser) return null;
        return [currentUser.player.uid, friend.player.uid].sort().join('_');
    }, [currentUser, friend]);

    const messagesQuery = useMemoFirebase(
        () => chatId ? query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp')) : null,
        [firestore, chatId]
    );

    const { data: messages, isLoading } = useCollection<ChatMessage>(messagesQuery);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && friend && sendMessage) {
            sendMessage(friend.player.uid, message.trim());
            setMessage('');
        }
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!currentUser) return null;

    return (
        <Card className="flex flex-col h-full bg-card/75 backdrop-blur-md">
            <CardHeader className="flex-row items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-4">
                    <GamifiedAvatar account={friend} />
                    <div>
                        <h2 className="text-xl font-bold">{friend.player.displayName}</h2>
                        <p className="text-sm text-muted-foreground">@{friend.player.username}</p>
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Purge Neural Link?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all messages in this simulation thread with {friend.player.displayName}. This action cannot be reversed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Abort</AlertDialogCancel>
                            <AlertDialogAction onClick={() => clearChatHistory(friend.player.uid)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Confirm Purge
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                     {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {!isLoading && messages && messages.length > 0 && (
                        <div className="space-y-4">
                            {messages.map(msg => {
                                const isSender = msg.senderId === currentUser.player.uid;
                                const senderAccount = isSender ? currentUser : friend;
                                
                                return (
                                    <div key={msg.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                                        {!isSender && <GamifiedAvatar account={senderAccount} className="w-8 h-8"/>}
                                        <div className={cn(
                                            "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg",
                                            isSender ? "bg-primary text-primary-foreground" : "bg-muted shadow-sm"
                                        )}>
                                            <p className="text-sm">{msg.message}</p>
                                            {msg.timestamp && (
                                                <p className={cn("text-[10px] mt-1", isSender ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                                    {formatDistanceToNow( (msg.timestamp as Timestamp).toDate(), { addSuffix: true })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                     {!isLoading && (!messages || messages.length === 0) && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No messages yet. Say hello!</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        autoComplete="off"
                        className="bg-background/50"
                    />
                    <Button type="submit" disabled={!message.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}


export default function ChatPage() {
    const { currentUser, updateChatBackground } = useContext(GameContext) as GameContextType;
    const [activeFriend, setActiveFriend] = useState<UserAccount | null>(null);
    const [isBgDialogOpen, setIsBgDialogOpen] = useState(false);
    const [bgPreviewUrl, setBgPreviewUrl] = useState<string | null>(null);
    const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
    const { toast } = useToast();

    if (!currentUser) return null;

    const { player } = currentUser;
    const hasSpecialBg = !!player.chatSpecialBackground;

    const currentBackgroundUrl = useMemo(() => {
        if (!player) return '';
        if (player.chatBackgroundId === 'custom' && player.chatBackgroundUrl) {
            return player.chatBackgroundUrl;
        }
        const predefined = predefinedBackgrounds.find(bg => bg.id === player.chatBackgroundId);
        return predefined ? predefined.imageUrl : (predefinedBackgrounds[0]?.imageUrl || '');
    }, [player]);

    const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ variant: "destructive", title: "Image Too Large", description: "Background images must be smaller than 5MB." });
                return;
            }
            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                setSelectedBgFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setBgPreviewUrl(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                toast({ variant: "destructive", title: "Invalid File Type", description: "Please select a JPG or PNG image." });
            }
        }
    };

    const handleSaveCustomBg = () => {
        if (bgPreviewUrl && updateChatBackground) {
            updateChatBackground(bgPreviewUrl);
            setSelectedBgFile(null);
            setBgPreviewUrl(null);
            setIsBgDialogOpen(false);
        }
    };

    return (
        <div className="relative -m-4 md:-m-6 h-[calc(100vh-3.5rem)] overflow-hidden">
            {hasSpecialBg ? (
                <div className="absolute inset-0 z-[-20]">
                    <SpecialBackground type={player.chatSpecialBackground!} />
                </div>
            ) : (
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500 z-[-20]"
                    style={{ backgroundImage: `url(${currentBackgroundUrl})` }}
                />
            )}
            
            <div className="absolute inset-0 w-full h-full bg-background/40 backdrop-blur-[2px] z-[-5]" />

            <div className="relative z-10 p-4 md:p-6 h-full">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
                    <div className="md:col-span-1 lg:col-span-1 h-full">
                        <FriendList onSelectFriend={setActiveFriend} onOpenBgDialog={() => setIsBgDialogOpen(true)} />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 h-full">
                        {activeFriend ? (
                            <ChatWindow friend={activeFriend} />
                        ) : (
                            <Card className="flex flex-col h-full items-center justify-center text-center text-muted-foreground bg-card/75 backdrop-blur-md">
                                <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                                <h2 className="text-2xl font-bold">Select a friend</h2>
                                <p>Choose a friend from the list to start chatting.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* BACKGROUND CUSTOMIZATION DIALOG */}
            <Dialog open={isBgDialogOpen} onOpenChange={setIsBgDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Customize Chat Background</DialogTitle>
                        <DialogDescription>Select a predefined theme or upload your own neural interface skin.</DialogDescription>
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
                                                player.chatBackgroundId === bg.id && !player.chatBackgroundUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50'
                                            )}
                                            onClick={() => updateChatBackground && updateChatBackground(bg.id)}
                                        >
                                            <Image src={bg.imageUrl} alt={bg.name} fill style={{ objectFit: 'cover' }} />
                                            <div className="absolute inset-0 bg-black/30 flex items-end p-2 opacity-100 sm:opacity-0 group-hover:opacity-100">
                                                <p className="text-xs font-bold text-white">{bg.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-3">
                             <h4 className="font-semibold text-center">Custom Upload</h4>
                             <div className='flex flex-col items-center justify-center space-y-4 p-4 border rounded-md h-72 bg-muted/20'>
                                {bgPreviewUrl ? (
                                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                                        <Image src={bgPreviewUrl} alt="Preview" fill style={{ objectFit: 'cover' }}/>
                                    </div>
                                ) : player.chatBackgroundUrl && (
                                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                                        <Image src={player.chatBackgroundUrl} alt="Current" fill style={{ objectFit: 'cover' }}/>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleBgFileChange}
                                    className="file:text-primary"
                                />
                                <Button onClick={handleSaveCustomBg} disabled={!selectedBgFile} className="w-full">
                                    Apply Custom Surface
                                </Button>
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBgDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
