"use client";

import { useContext } from 'react';
import Link from 'next/link';
import { GameContext, GameContextType } from '@/context/GameContext';
import { cocData } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Puzzle, User } from 'lucide-react';
import { CreatorBadgeIcon } from '@/components/icons';

export default function DashboardPage() {
    const game = useContext(GameContext) as GameContextType;
    if (!game.player || !game.progress) return null;

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold flex items-center gap-2">
                    Welcome, {game.player.username}! 
                    {game.player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-8 w-8" title="Creator"/>}
                </h1>
                <p className="text-muted-foreground">Ready to level up your IT skills? Choose a module to begin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cocData.map(coc => {
                    const completedSteps = game.progress![coc.id]?.completedSteps.length || 0;
                    const totalSteps = coc.steps.length;
                    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

                    return (
                        <Card key={coc.id} className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 flex flex-col bg-card/80 backdrop-blur-sm">
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
                 <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 flex flex-col bg-card/80 backdrop-blur-sm">
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
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 flex flex-col bg-card/80 backdrop-blur-sm">
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
            </div>
        </div>
    );
}
