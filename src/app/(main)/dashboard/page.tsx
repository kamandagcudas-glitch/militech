"use client";

import { useContext, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { GameContext, GameContextType } from '@/context/GameContext';
import { cocData } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Puzzle, User, Files, MessageSquare, SpellCheck, Search, Trophy, Presentation, Terminal } from 'lucide-react';
import { CreatorBadgeIcon, AngelicPowerRuneIcon, BlackFlameIcon } from '@/components/icons';
import AnimatedGlitchText from '@/components/animated-glitch-text';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import StickmanFighter from '@/components/stickman-fighter';
import ChessGame from '@/components/chess-game';

export default function DashboardPage() {
    const game = useContext(GameContext) as GameContextType;
    const [searchQuery, setSearchQuery] = useState('');
    const [showSecretGame, setShowSecretGame] = useState(false);
    const [showChessGame, setShowChessGame] = useState(false);
    const [showJoystickCodes, setShowJoystickCodes] = useState(false);

    const joystickCodes = ["444390", "498972", "496342", "458756", "Jafet", "361997", "466514", "510463", "546757", "364506"];

    useEffect(() => {
        const query = searchQuery.toUpperCase();
        if (query === 'BORED') {
            setShowSecretGame(true);
            setSearchQuery('');
        } else if (query === 'BRAGA') {
            setShowChessGame(true);
            setSearchQuery('');
        } else if (query === 'JOYSTICK') {
            setShowJoystickCodes(true);
            setSearchQuery('');
        } else if (query === 'METAMORPHOSIS') {
            if (game.addAchievement) {
                game.addAchievement('metamorphosis-title');
            }
            setSearchQuery('');
        }
    }, [searchQuery, game]);

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
            href: "/presentations",
            icon: <Presentation />,
            title: "Presentation Vault",
            description: "Store and manage your mission briefings and PowerPoints.",
            buttonText: "Open Vault"
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
        <div className="container mx-auto px-4 md:px-0">
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-headline text-3xl md:text-4xl font-bold flex flex-wrap items-center gap-2">
                    <AnimatedGlitchText text={`Welcome, ${player.displayName}!`} />
                    <div className="flex items-center gap-1">
                        {player.isCreator && <CreatorBadgeIcon className="text-yellow-400 h-6 w-6 md:h-8 md:w-8 transition-transform duration-300 hover:scale-125 hover:rotate-12" title="Creator"/>}
                        {player.isCreator && <AngelicPowerRuneIcon className="text-cyan-300 h-6 w-6 md:h-8 md:w-8 transition-transform duration-300 hover:scale-125 hover:rotate-[-12deg]" title="Angelic Power Rune"/>}
                        {player.specialInsignia === 'black-flame' && <BlackFlameIcon className="text-primary h-6 w-6 md:h-8 md:w-8 transition-transform duration-300 hover:scale-125" title="Black Flame Wanderer"/>}
                    </div>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">@{player.username}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 opacity-80">Ready to level up your IT skills? Find a module to begin.</p>
            </div>

            <div className="mb-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search for modules or features..."
                    className="pl-12 text-sm md:text-lg h-12 md:h-14 bg-background/50 border-primary/20 focus:border-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCocData.map((coc, index) => {
                    const completedSteps = progress![coc.id]?.completedSteps.length || 0;
                    const totalSteps = coc.steps.length;
                    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

                    return (
                        <Card 
                            key={coc.id} 
                            className="transition-all duration-300 flex flex-col bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${100 * index}ms`, animationFillMode: 'backwards' }}
                        >
                            <CardHeader className="p-4 md:p-6">
                                <CardTitle className="font-headline text-lg md:text-xl">{coc.title}</CardTitle>
                                <CardDescription className="text-xs md:text-sm line-clamp-2">{coc.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-between p-4 md:p-6 pt-0 md:pt-0">
                                <div>
                                    <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground mb-1 font-mono">
                                        <span>PROGRESS</span>
                                        <span>{completedSteps} / {totalSteps}</span>
                                    </div>
                                    <Progress value={progressPercentage} className="h-1.5 md:h-2 mb-4" />
                                </div>
                                <Link href={`/coc/${coc.id}`} passHref className="w-full">
                                    <Button variant="cyber" className="w-full mt-2 h-9 md:h-10 text-xs md:text-sm uppercase tracking-widest">
                                        {progressPercentage === 100 ? 'Review' : 'Initialize'} <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
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
                        style={{ animationDelay: `${100 * (filteredCocData.length + index)}ms`, animationFillMode: 'backwards' }}
                    >
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="font-headline text-lg md:text-xl flex items-center gap-2">{card.icon} {card.title}</CardTitle>
                            <CardDescription className="text-xs md:text-sm line-clamp-2">{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end p-4 md:p-6 pt-0 md:pt-0">
                            <Link href={card.href} passHref className="w-full">
                                <Button variant="cyber" className="w-full mt-2 h-9 md:h-10 text-xs md:text-sm uppercase tracking-widest">
                                    {card.buttonText} <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCocData.length === 0 && filteredOtherCards.length === 0 && (
                <div className="text-center py-16 text-muted-foreground bg-card/50 rounded-lg border-2 border-dashed border-primary/10">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-semibold uppercase font-cyber tracking-widest">No Results Found</p>
                    <p className="text-sm">Modify search parameters or check simulation status.</p>
                </div>
            )}

            <Dialog open={showSecretGame} onOpenChange={setShowSecretGame}>
                <DialogContent className="max-w-[95vw] md:max-w-[800px] p-0 bg-black border-primary overflow-hidden">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Stickman Fighter Easter Egg</DialogTitle>
                    </DialogHeader>
                    <div className="w-full overflow-auto">
                        <StickmanFighter 
                            onExit={() => setShowSecretGame(false)} 
                            onWin={() => {
                                if (game.addAchievement) {
                                    game.addAchievement('certified-bored');
                                }
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showChessGame} onOpenChange={setShowChessGame}>
                <DialogContent className="max-w-[95vw] md:max-w-fit p-0 bg-transparent border-none overflow-hidden flex items-center justify-center">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Braga Mode Chess</DialogTitle>
                    </DialogHeader>
                    <div className="w-full max-w-full overflow-auto p-4">
                        <ChessGame 
                            onExit={() => setShowChessGame(false)} 
                            onWin={() => {
                                if (game.addAchievement) {
                                    game.addAchievement('grandmaster-braga');
                                }
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showJoystickCodes} onOpenChange={setShowJoystickCodes}>
                <DialogContent className="max-w-[90vw] md:max-w-md bg-card/95 backdrop-blur-xl border-primary/50">
                    <DialogHeader>
                        <DialogTitle className="font-cyber text-2xl text-primary flex items-center gap-2">
                            <Terminal className="h-6 w-6" /> JOYSTICK OVERRIDE
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Classified access codes retrieved from simulation core.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 md:gap-4 py-6">
                        {joystickCodes.map((code, index) => (
                            <div key={index} className="bg-black/40 border border-primary/20 p-3 rounded text-center group hover:border-primary transition-colors">
                                <code className="font-mono text-sm md:text-lg text-accent group-hover:text-white transition-colors">{code}</code>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <Button variant="cyber" onClick={() => setShowJoystickCodes(false)} className="w-full md:w-auto h-10 uppercase text-xs">Close Terminal</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
