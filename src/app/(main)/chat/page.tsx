
"use client";

import { useState, useMemo, useContext, useRef, useEffect } from 'react';
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
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function FriendList({ onSelectFriend }: { onSelectFriend: (friend: UserAccount) => void; }) {
    const { currentUser, accounts } = useContext(GameContext) as GameContextType;
    
    const friends = useMemo(() => {
        if (!currentUser?.player.friendUsernames || !accounts) return [];
        return currentUser.player.friendUsernames
            .map(username => accounts.find(acc => acc.player.username === username))
            .filter((acc): acc is UserAccount => !!acc);
    }, [currentUser?.player.friendUsernames, accounts]);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <h2 className="text-xl font-bold">Friends</h2>
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
    const { currentUser, sendMessage } = useContext(GameContext) as GameContextType;
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
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-row items-center gap-4 border-b">
                <GamifiedAvatar account={friend} />
                <div>
                    <h2 className="text-xl font-bold">{friend.player.displayName}</h2>
                    <p className="text-sm text-muted-foreground">@{friend.player.username}</p>
                </div>
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
                                            isSender ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            <p className="text-sm">{msg.message}</p>
                                            {msg.timestamp && (
                                                <p className={cn("text-xs mt-1", isSender ? "text-primary-foreground/70" : "text-muted-foreground")}>
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
    const [activeFriend, setActiveFriend] = useState<UserAccount | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
            <div className="md:col-span-1 lg:col-span-1 h-full">
                <FriendList onSelectFriend={setActiveFriend} />
            </div>
            <div className="md:col-span-2 lg:col-span-3 h-full">
                {activeFriend ? (
                    <ChatWindow friend={activeFriend} />
                ) : (
                    <Card className="flex flex-col h-full items-center justify-center text-center text-muted-foreground">
                        <MessageCircle className="h-16 w-16 mb-4" />
                        <h2 className="text-2xl font-bold">Select a friend</h2>
                        <p>Choose a friend from the list to start chatting.</p>
                    </Card>
                )}
            </div>
        </div>
    )
}

