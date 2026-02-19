
"use client";

import { useContext, useState }from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GamifiedAvatar } from '@/components/ui/gamified-avatar';
import { MessageSquare, Send } from 'lucide-react';
import { BlackFlameIcon } from '@/components/icons';

const feedbackPageBackgroundUrl = "https://images.unsplash.com/photo-1514439827219-9137a0b99245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjeWJlcnB1bmslMjBjaXR5fGVufDB8fHx8MTc3MDIyMDE0N3ww&ixlib=rb-4.1.0&q=80&w=1080";

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
            {/* The global RunningPixelBackground is fixed at z-[-10]. 
                By setting the background image to z-[-20] and the overlay/scanlines to z-[-5], 
                the runners appear running ON the background city but BEHIND the scanlines/UI. */}
            
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
                                game.feedbackPosts.map((post, index) => {
                                    const userAccount = game.accounts.find(acc => acc.player.username === post.username);
                                    if (!userAccount) return null;

                                    return (
                                    <div 
                                        key={post.id} 
                                        className="p-4 border rounded-lg bg-background/75 backdrop-blur-[6px] flex flex-col gap-4 justify-between transition-all duration-300 border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${50 * index}ms`, animationFillMode: 'backwards' }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <GamifiedAvatar account={userAccount} />
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
                                        <p className="text-foreground/90 whitespace-pre-wrap ml-2 pl-12 border-l border-primary/20">
                                            {post.message}
                                        </p>
                                    </div>
                                )})
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
