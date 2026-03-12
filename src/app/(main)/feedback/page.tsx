
"use client";

import { useContext, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';
import { MessageSquare, Send, Reply } from 'lucide-react';
import { BlackFlameIcon } from '@/components/icons';
import { UserAccount, FeedbackPost, FeedbackReply } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const feedbackPageBackgroundUrl = "https://images.unsplash.com/photo-1514439827219-9137a0b99245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjeWJlcnB1bmslMjBjaXR5fGVufDB8fHx8MTc3MDIyMDE0N3ww&ixlib=rb-4.1.0&q=80&w=1080";

function FeedbackReplyItem({ reply }: { reply: FeedbackReply }) {
    const { accounts } = useContext(GameContext) as GameContextType;
    const userAccount = accounts.find(acc => acc.player.username === reply.username);

    const displayAccount: UserAccount = userAccount || {
        player: {
            uid: reply.userId,
            username: reply.username,
            displayName: reply.displayName,
            avatar: reply.avatar,
            emailVerified: true,
            activeTitleId: null,
            isBanned: false,
            isMuted: false,
            unlockedTitleIds: [],
            badgeIds: [],
            friendUsernames: [],
            friendRequests: [],
            isCreator: reply.username === 'Soul',
            profileBackgroundId: 'profile-bg-dark-tech'
        },
        stats: { coc1: {attempts:0, resets:0}, coc2: {attempts:0, resets:0}, coc3: {attempts:0, resets:0}, coc4: {attempts:0, resets:0}, totalResets: 0},
        progress: { coc1: {completedSteps:[], scores:{}}, coc2: {completedSteps:[], scores:{}}, coc3: {completedSteps:[], scores:{}}, coc4: {completedSteps:[], scores:{}}},
        achievements: [],
        files: []
    };

    return (
        <div className="flex gap-3 items-start p-3 bg-background/40 rounded border border-white/5 mt-2">
            <GamifiedAvatar account={displayAccount} imageClassName="w-8 h-8" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-primary flex items-center gap-1">
                        {reply.displayName}
                        {reply.specialInsignia === 'black-flame' && <BlackFlameIcon className="h-3 w-3 text-primary" />}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                    </p>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{reply.message}</p>
            </div>
        </div>
    );
}

function FeedbackPostItem({ post, index }: { post: FeedbackPost; index: number }) {
    const { accounts, replyToFeedback, currentUser } = useContext(GameContext) as GameContextType;
    const firestore = useFirestore();
    const [isReplying, setIsReplying] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');

    const repliesQuery = useMemoFirebase(
        () => query(collection(firestore, 'feedback', post.id, 'replies'), orderBy('timestamp', 'asc')),
        [firestore, post.id]
    );
    const { data: replies } = useCollection<FeedbackReply>(repliesQuery);

    const handleReplySubmit = () => {
        if (!replyMessage.trim()) return;
        replyToFeedback(post.id, replyMessage);
        setReplyMessage('');
        setIsReplying(false);
    };

    const userAccount = accounts.find(acc => acc.player.username === post.username);
    const displayAccount: UserAccount = userAccount || {
        player: {
            uid: post.userId,
            username: post.username,
            displayName: post.displayName,
            avatar: post.avatar,
            emailVerified: true,
            activeTitleId: null,
            isBanned: false,
            isMuted: false,
            unlockedTitleIds: [],
            badgeIds: [],
            friendUsernames: [],
            friendRequests: [],
            isCreator: post.username === 'Soul',
            profileBackgroundId: 'profile-bg-dark-tech'
        },
        stats: { coc1: {attempts:0, resets:0}, coc2: {attempts:0, resets:0}, coc3: {attempts:0, resets:0}, coc4: {attempts:0, resets:0}, totalResets: 0},
        progress: { coc1: {completedSteps:[], scores:{}}, coc2: {completedSteps:[], scores:{}}, coc3: {completedSteps:[], scores:{}}, coc4: {completedSteps:[], scores:{}}},
        achievements: [],
        files: []
    };

    return (
        <div 
            className="p-4 border rounded-lg bg-background/75 backdrop-blur-[6px] flex flex-col gap-4 justify-between transition-all duration-300 border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${50 * index}ms`, animationFillMode: 'backwards' }}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <GamifiedAvatar account={displayAccount} />
                    <div>
                        <p className="font-semibold text-primary flex items-center gap-1.5">
                            {post.displayName}
                            {post.specialInsignia === 'black-flame' && <BlackFlameIcon className="h-4 w-4 text-primary" />}
                        </p>
                        <p className="text-xs text-muted-foreground">@{post.username}</p>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                </p>
            </div>
            
            <div className="ml-2 pl-12 border-l border-primary/20">
                <p className="text-foreground/90 whitespace-pre-wrap mb-4">
                    {post.message}
                </p>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-8 gap-1.5 hover:bg-primary/10 hover:text-primary"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            <Reply className="h-3.5 w-3.5" />
                            {isReplying ? 'Cancel Reply' : 'Transmit Reply'}
                        </Button>
                    </div>

                    {isReplying && (
                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                            <Textarea 
                                placeholder="Enter sub-transmission..."
                                className="text-sm bg-background/50 h-20"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                            />
                            <Button 
                                size="sm" 
                                className="self-end gap-1.5 h-8"
                                disabled={!replyMessage.trim()}
                                onClick={handleReplySubmit}
                            >
                                <Send className="h-3 w-3" />
                                Send
                            </Button>
                        </div>
                    )}

                    {replies && replies.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-1">
                                Transmissions Log ({replies.length})
                            </p>
                            {replies.map(reply => (
                                <FeedbackReplyItem key={reply.id} reply={reply} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function FeedbackPage() {
    const game = useContext(GameContext) as GameContextType;
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const handleSubmit = () => {
        game.postFeedback(feedbackMessage);
        setFeedbackMessage('');
    };

    if (!game.currentUser) return null;

    return (
        <div className="relative -m-4 md:-m-6 h-full overflow-hidden">
            {/* Background Layers */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center feedback-bg-image z-[-20]"
                style={{ backgroundImage: `url(${feedbackPageBackgroundUrl})` }}
                data-ai-hint="cyberpunk city"
            />
            
            <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-[6px] z-[-5]" />
            <div className="absolute inset-0 w-full h-full feedback-bg-scanlines z-[-5]" />

            {/* Content Layer */}
            <div className="relative z-10 h-full overflow-y-auto p-4 md:p-6">
                <div className="container mx-auto">
                    <div className="mb-8">
                        <h1 className="font-headline text-4xl font-bold flex items-center gap-3 text-white" style={{ textShadow: '0 0 8px hsl(var(--primary))' }}>
                            <MessageSquare className="text-primary" />
                            Board of Feedback
                        </h1>
                        <p className="text-muted-foreground">This is a public channel to the developers. Leave your thoughts below.</p>
                    </div>
                    
                    <Card className="mb-8 bg-background/75 backdrop-blur-[6px] border-primary/20 shadow-lg shadow-primary/10">
                        <CardHeader>
                            <CardTitle>Submit New Feedback</CardTitle>
                            <CardDescription>Your message will be visible to all other agents.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Textarea
                                placeholder="Type your feedback here... Be constructive!"
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                rows={4}
                                className="bg-background/50"
                            />
                            <Button 
                                onClick={handleSubmit} 
                                disabled={!feedbackMessage.trim()}
                                className="self-end"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Submit Feedback
                            </Button>
                        </CardContent>
                    </Card>

                    <div>
                        <h2 className="font-headline text-2xl font-bold mb-4 text-white" style={{ textShadow: '0 0 5px hsl(var(--primary))' }}>Latest Transmissions</h2>
                        <div className="space-y-6">
                            {game.feedbackPosts.length > 0 ? (
                                game.feedbackPosts.map((post, index) => (
                                    <FeedbackPostItem key={post.id} post={post} index={index} />
                                ))
                            ) : (
                                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-background/75 backdrop-blur-[6px]">
                                    <p className="text-lg font-semibold mb-2">The board is silent.</p>
                                    <p>Be the first to leave a message.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
