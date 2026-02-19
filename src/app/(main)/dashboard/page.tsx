"use client";

import { useContext, useState, useMemo } from 'react';
import Link from 'next/link';
import { GameContext, GameContextType } from '@/context/GameContext';
import { cocData } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Puzzle, User, Files, MessageSquare, SpellCheck, Search } from 'lucide-react';
import { CreatorBadgeIcon, AngelicPowerRuneIcon, BlackFlameIcon } from '@/components/icons';
import AnimatedGlitchText from '@/components/animated-glitch-text';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
    const game = useContext(GameContext) as GameContextType;
    const [searchQuery, setSearchQuery] = useState('');

    if (!game.currentUser) return null;

    const { player, progress } = game.currentUser;

    const lowercasedQuery = searchQuery.toLowerCase();

    const filteredCocData = useMemo(() => {
        if (!searchQuery) return cocData;
        return cocData.filter(coc => 
            coc.title.toLowerCase().includes(lowercasedQuery) ||
            coc.description.toLowerCase().includes(lowercasedQuery)
        );
    }, [lowercasedQuery]);

    const otherCards = useMemo(() => [
        {
            href: "/minigame",
            icon: <Puzzle/>,
            title: "4 Pics 1 Word",
            description: "Test your knowledge with a fun mini-game.",
            buttonText: "Play Now"
        },
        {
            href: "/word-completion",
            icon: <SpellCheck />,
            title: "Word Completion",
            description: "Guess the word by filling in the blanks.",
            buttonText: "Play Now"
        },
        {
            href: "/profile",
            icon: <User />,
            title: "Player Profile",
            description: "View your achievements, badges, and stats.",
            buttonText: "View Profile"
        },
        {
            href: "/files",
            icon: <Files />,
            title: "File Storage",
            description: "Manage and share your files.",
            buttonText: "Open Storage"
        },
        {
            href: "/feedback",
            icon: <MessageSquare />,
            title: "Board of Feedback",
            description: "Leave your thoughts and suggestions for the system.",
            buttonText: "Go to Board"
        }
    ], []);

    const filteredOtherCards = useMemo(() => {
        if (!searchQuery) return otherCards;
        return otherCards.filter(card =>
            card.title.toLowerCase().includes(lowercasedQuery) ||
            card.description.toLowerCase().includes(lowercasedQuery)
        )
    }, [lowercasedQuery, otherCards]);

    return (
        <div className="container mx-auto">
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-headline text-4xl font-bold flex items-center gap-2">
                    <AnimatedGlitchText text={`Welcome, ${player.displayName}!`} />
                    {player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-8 w-8 transition-transform duration-300 hover:scale-125 hover:rotate-12" title="Creator"/>}
                    {player.isCreator && <AngelicPowerRuneIcon className="text-cyan-300 h-8 w-8 transition-transform duration-300 hover:scale-125 hover:rotate-[-12deg]" title="Angelic Power Rune"/>}
                    {player.specialInsignia === 'black-flame' && <BlackFlameIcon className="text-primary h-8 w-8 transition-transform duration-300 hover:scale-125" title="Black Flame Wanderer"/>}
                </h1>
                <p className="text-muted-foreground">@{player.username}</p>
                <p className="text-muted-foreground mt-2">Ready to level up your IT skills? Find a module to begin.</p>
            </div>

            <div className="mb-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search for modules or features..."
                    className="pl-12 text-lg h-14"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCocData.map((coc, index) => {
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
                                    <Button variant="cyber" className="w-full mt-2">
                                        {progressPercentage === 100 ? 'Review' : 'Start'} Module <ArrowRight className="ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
                {filteredOtherCards.map((card, index) => (
                     <Card 
                        key={card.href}
                        className="transition-all duration-300 flex flex-col bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${150 * (filteredCocData.length + index)}ms`, animationFillMode: 'backwards' }}
                    >
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">{card.icon} {card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                            <Link href={card.href} passHref>
                                <Button variant="cyber" className="w-full mt-2">
                                    {card.buttonText} <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCocData.length === 0 && filteredOtherCards.length === 0 && (
                <div className="text-center py-16 text-muted-foreground bg-card/50 rounded-lg border-2 border-dashed">
                    <p className="text-lg font-semibold">No Results Found</p>
                    <p>No modules or features match your search query.</p>
                </div>
            )}
        </div>
    );
}