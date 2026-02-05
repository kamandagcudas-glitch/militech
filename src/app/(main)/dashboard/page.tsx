"use client";

import { useContext } from 'react';
import Link from 'next/link';
import { GameContext, GameContextType } from '@/context/GameContext';
import { cocData } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Puzzle, User, Files, MessageSquare } from 'lucide-react';
import { CreatorBadgeIcon, AngelicPowerRuneIcon } from '@/components/icons';
import AnimatedGlitchText from '@/components/animated-glitch-text';

export default function DashboardPage() {
    const game = useContext(GameContext) as GameContextType;
    if (!game.currentUser) return null;

    const { player, progress } = game.currentUser;

    return (
        <div className="container mx-auto">
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-headline text-4xl font-bold flex items-center gap-2">
                    <AnimatedGlitchText text={`Welcome, ${player.displayName}!`} />
                    {player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-8 w-8 transition-transform duration-300 hover:scale-125 hover:rotate-12" title="Creator"/>}
                    {player.isCreator && <AngelicPowerRuneIcon className="text-cyan-300 h-8 w-8 transition-transform duration-300 hover:scale-125 hover:rotate-[-12deg]" title="Angelic Power Rune"/>}
                </h1>
                <p className="text-muted-foreground">@{player.username}</p>
                <p className="text-muted-foreground mt-2">Ready to level up your IT skills? Choose a module to begin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cocData.map((coc, index) => {
                    const completedSteps = progress![coc.id]?.completedSteps.length || 0;
                    const totalSteps = coc.steps.length;
                    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

                    return (
                        <Card 
                            key={coc.id} 
                            className="transition-all duration-300 flex flex-col bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${150 * index}ms`, animationFillMode: 'backwards' }}
                        >
                            <CardHeader>
                                <CardTitle className="font-headline">{coc.title}</CardTitle>
                                <CardDescription>{coc.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{completedSteps} / {totalSteps} steps completed</p>
                                    <Progress value={progressPercentage} className="mb-4" />
                                </div>
                                <Link href={`/coc/${coc.id}`} passHref>
                                    <Button className="w-full mt-2">
                                        {progressPercentage === 100 ? 'Review' : 'Start'} Module <ArrowRight className="ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
                 <Card 
                    className="transition-all duration-300 flex flex-col bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${150 * cocData.length}ms`, animationFillMode: 'backwards' }}
                >
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Puzzle/> 4 Pics 1 Word</CardTitle>
                        <CardDescription>Test your knowledge with a fun mini-game.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/minigame" passHref>
                            <Button className="w-full mt-2" variant="secondary">
                                Play Now <ArrowRight className="ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card 
                    className="transition-all duration-300 flex flex-col bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${150 * (cocData.length + 1)}ms`, animationFillMode: 'backwards' }}
                >
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><User /> Player Profile</CardTitle>
                        <CardDescription>View your achievements, badges, and stats.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/profile" passHref>
                            <Button className="w-full mt-2" variant="secondary">
                                View Profile <ArrowRight className="ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                 <Card 
                    className="transition-all duration-300 flex flex-col bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${150 * (cocData.length + 2)}ms`, animationFillMode: 'backwards' }}
                >
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Files /> File Storage</CardTitle>
                        <CardDescription>Manage and share your files.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/files" passHref>
                            <Button className="w-full mt-2" variant="secondary">
                                Open Storage <ArrowRight className="ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card 
                    className="transition-all duration-300 flex flex-col bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${150 * (cocData.length + 3)}ms`, animationFillMode: 'backwards' }}
                >
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><MessageSquare /> Board of Feedback</CardTitle>
                        <CardDescription>Leave your thoughts and suggestions for the system.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/feedback" passHref>
                            <Button className="w-full mt-2" variant="secondary">
                                Go to Board <ArrowRight className="ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
