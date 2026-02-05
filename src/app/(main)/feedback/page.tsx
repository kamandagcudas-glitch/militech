"use client";

import { useContext, useState }from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FeedbackPage() {
    const game = useContext(GameContext) as GameContextType;
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const handleSubmit = () => {
        game.postFeedback(feedbackMessage);
        setFeedbackMessage('');
    };

    if (!game.currentUser) return null;

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold flex items-center gap-3">
                    <MessageSquare className="text-primary" />
                    Board of Feedback
                </h1>
                <p className="text-muted-foreground">This is a public channel to the developers. Leave your thoughts below.</p>
            </div>
            
            <Card className="mb-8 bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/10">
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
                <h2 className="font-headline text-2xl font-bold mb-4">Latest Transmissions</h2>
                <ScrollArea className="h-[60vh]">
                <div className="space-y-6 pr-4">
                    {game.feedbackPosts.length > 0 ? (
                        game.feedbackPosts.map((post, index) => (
                            <div 
                                key={post.id} 
                                className="p-4 border rounded-lg bg-card-foreground/5 flex flex-col gap-4 justify-between transition-all duration-300 border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${50 * index}ms`, animationFillMode: 'backwards' }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={post.avatar} />
                                            <AvatarFallback>{post.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-primary">{post.displayName}</p>
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
                        ))
                    ) : (
                         <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="text-lg font-semibold mb-2">The board is silent.</p>
                            <p>Be the first to leave a message.</p>
                        </div>
                    )}
                </div>
                </ScrollArea>
            </div>
        </div>
    );
}
