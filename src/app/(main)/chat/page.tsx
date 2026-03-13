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
import { Send, MessageCircle, Loader2, Trash2, Image as ImageIcon, Paperclip, ChevronLeft } from 'lucide-react';
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
        <Card className="flex flex-col h-full bg-card/75 backdrop-blur-md border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
                <h2 className="text-base md:text-lg font-bold truncate">Neural Links</h2>
                <Button variant="ghost" size="icon" onClick={onOpenBgDialog} title="Customize Background" className="h-8 w-8 shrink-0">
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                        {friends.length > 0 ? friends.map(friend => (
                            <button
                                key={friend.player.uid}
                                onClick={() => onSelectFriend(friend)}
                                className="w-full text-left p-2 md:p-3 rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-3 group"
                            >
                                <GamifiedAvatar account={friend} imageClassName="w-8 h-8 md:w-10 md:h-10" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-xs md:text-sm truncate group-hover:text-primary transition-colors">{friend.player.displayName}</p>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">@{friend.player.username}</p>
                                </div>
                            </button>
                        )) : (
                            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                                <MessageCircle className="h-10 w-10 opacity-20" />
                                <p className="text-[10px] md:text-xs">No active links identified. Add friends from the User Directory.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function ChatWindow({ friend, onBack }: { friend: UserAccount; onBack?: () => void }) {
    const { currentUser, sendMessage, clearChatHistory } = useContext(GameContext) as GameContextType;
    const { toast } = useToast();
    const firestore = useFirestore();
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "Payload Too Large",
                    description: "Neural uplinks are limited to 1MB per image."
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                if (friend && sendMessage) {
                    sendMessage(friend.player.uid, "", dataUrl);
                }
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = '';
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!currentUser) return null;

    return (
        <Card className="flex flex-col h-full bg-card/75 backdrop-blur-md border-primary/20">
            <CardHeader className="flex-row items-center justify-between gap-4 p-3 md:p-4 border-b shrink-0">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden h-8 w-8 mr-1 shrink-0">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <GamifiedAvatar account={friend} imageClassName="w-8 h-8 md:w-10 md:h-10" />
                    <div className="min-w-0">
                        <h2 className="text-sm md:text-lg font-bold truncate">{friend.player.displayName}</h2>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">@{friend.player.username}</p>
                    </div>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 hover:bg-destructive/10 shrink-0">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[90vw] md:max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Purge Neural Link?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all messages in this simulation thread with {friend.player.displayName}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:gap-0">
                            <AlertDialogCancel>Abort</AlertDialogCancel>
                            <AlertDialogAction onClick={() => clearChatHistory(friend.player.uid)} className="bg-destructive text-destructive-foreground">
                                Confirm Purge
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-3 md:p-4">
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
                                        {!isSender && <GamifiedAvatar account={senderAccount} imageClassName="w-6 h-6"/>}
                                        <div className={cn(
                                            "max-w-[85%] md:max-w-[70%] p-2 md:p-3 rounded-lg flex flex-col gap-2 shadow-sm",
                                            isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"
                                        )}>
                                            {msg.imageUrl && (
                                                <div className="relative w-full max-h-[250px] md:max-h-[300px] rounded overflow-hidden border border-white/10">
                                                    <img src={msg.imageUrl} alt="Uplink transmission" className="w-full h-auto object-contain" />
                                                </div>
                                            )}
                                            {msg.message && <p className="text-[11px] md:text-sm leading-relaxed">{msg.message}</p>}
                                            {msg.timestamp && (
                                                <p className={cn("text-[8px] md:text-[9px] mt-1 self-end font-mono uppercase", isSender ? "text-primary-foreground/60" : "text-muted-foreground")}>
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
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 p-4 text-center">
                            <div className="bg-primary/5 p-4 rounded-full">
                                <MessageCircle className="h-8 w-8 md:h-12 md:w-12 opacity-20" />
                            </div>
                            <p className="text-xs md:text-sm">Neural link stable. Initiate communication.</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 md:p-4 border-t bg-background/30 shrink-0">
                <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="shrink-0 h-9 w-9"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Transmit..."
                        autoComplete="off"
                        className="bg-background/50 h-9 text-[11px] md:text-sm"
                    />
                    <Button type="submit" disabled={!message.trim()} size="icon" className="h-9 w-9 shrink-0">
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
        <div className="relative -m-4 md:-m-6 lg:-m-8 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col">
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

            <div className="relative z-10 flex-1 overflow-hidden">
                <div className="container mx-auto h-full p-2 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 h-full">
                        <div className={cn("h-full", activeFriend ? "hidden md:block" : "block")}>
                            <FriendList onSelectFriend={setActiveFriend} onOpenBgDialog={() => setIsBgDialogOpen(true)} />
                        </div>
                        <div className={cn("h-full md:col-span-2 lg:col-span-3", activeFriend ? "block" : "hidden md:block")}>
                            {activeFriend ? (
                                <ChatWindow friend={activeFriend} onBack={() => setActiveFriend(null)} />
                            ) : (
                                <Card className="flex flex-col h-full items-center justify-center text-center p-8 bg-card/75 backdrop-blur-md border-primary/20">
                                    <div className="bg-primary/5 p-8 rounded-full mb-6">
                                        <MessageCircle className="h-12 w-12 text-primary opacity-20" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold mb-2 uppercase tracking-widest">Neural Hub</h2>
                                    <p className="text-muted-foreground text-[10px] md:text-sm max-w-xs">Select an agent from your neural link directory to start a private transmission.</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isBgDialogOpen} onOpenChange={setIsBgDialogOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Customize Interface Skin</DialogTitle>
                        <DialogDescription>Apply a tactical backdrop to your neural links.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-center text-sm md:text-base uppercase tracking-widest text-[10px] md:text-sm">Predefined Themes</h4>
                            <ScrollArea className="h-48 md:h-72 rounded-md border border-primary/10">
                                <div className="grid grid-cols-2 gap-2 p-2">
                                    {predefinedBackgrounds.map((bg) => (
                                        <div 
                                            key={bg.id} 
                                            className={cn(
                                                "relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all group",
                                                player.chatBackgroundId === bg.id && !player.chatBackgroundUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50'
                                            )}
                                            onClick={() => updateChatBackground && updateChatBackground(bg.id)}
                                        >
                                            <Image src={bg.imageUrl} alt={bg.name} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-end p-2 opacity-100 sm:opacity-0 group-hover:opacity-100">
                                                <p className="text-[8px] font-bold text-white uppercase tracking-tighter">{bg.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-3">
                             <h4 className="font-semibold text-center text-sm md:text-base uppercase tracking-widest text-[10px] md:text-sm">Custom Uplink</h4>
                             <div className='flex flex-col items-center justify-center space-y-4 p-4 border border-primary/10 rounded-md md:h-72 bg-muted/20'>
                                {bgPreviewUrl ? (
                                    <div className="relative w-full h-32 rounded-md overflow-hidden border border-primary/30">
                                        <Image src={bgPreviewUrl} alt="Preview" fill className="object-cover"/>
                                    </div>
                                ) : player.chatBackgroundUrl && (
                                    <div className="relative w-full h-32 rounded-md overflow-hidden border border-primary/30">
                                        <Image src={player.chatBackgroundUrl} alt="Current" fill className="object-cover"/>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleBgFileChange}
                                    className="file:text-primary file:font-semibold text-[10px] h-auto p-1"
                                />
                                <Button onClick={handleSaveCustomBg} disabled={!selectedBgFile} className="w-full h-9 text-[10px] uppercase font-cyber tracking-widest">
                                    Apply Surface
                                </Button>
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBgDialogOpen(false)} className="w-full md:w-auto">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
