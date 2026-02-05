
"use client";

import { useState, useMemo, useContext, useEffect } from 'react';
import Image from 'next/image';
import { GameContext, GameContextType } from '@/context/GameContext';
import { miniGameData } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lightbulb, Check, X, RotateCw, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function MiniGamePage() {
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();
    const router = useRouter();
    const [rounds] = useState(() => miniGameData.sort(() => 0.5 - Math.random()));
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const currentRound = rounds[currentRoundIndex];

    useEffect(() => {
        if (game.currentUser?.player.isBanned) {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'Your account is suspended and cannot play minigames.',
            });
            router.push('/dashboard');
            return;
        }

        if (game.logActivity && !gameStarted) {
            game.logActivity('Minigame Started', '4 Pics 1 Word');
            setGameStarted(true);
        }
    }, [game.currentUser, game.logActivity, gameStarted, router, toast]);

    const images = useMemo(() => {
        return currentRound.imageIds.map(id => PlaceHolderImages.find(img => img.id === id));
    }, [currentRound]);

    const handleGuess = () => {
        if (feedback) return;

        if (guess.toUpperCase() === currentRound.answer.toUpperCase()) {
            setFeedback('correct');
            setCorrectAnswers(prev => prev + 1);
            toast({
                title: <Check className="mx-auto text-green-500" size={32} />,
                description: "Correct!",
                duration: 1500,
            });
        } else {
            setFeedback('incorrect');
            toast({
                title: <X className="mx-auto text-red-500" size={32} />,
                description: "Try again!",
                duration: 1500,
            });
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleNextRound = () => {
        if (currentRoundIndex < rounds.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
            setGuess('');
            setFeedback(null);
        } else {
            if (correctAnswers + 1 === rounds.length) {
                game.addAchievement('minigame-complete');
            }
            game.logActivity('Minigame Finished', `4 Pics 1 Word - Score: ${correctAnswers + 1}/${rounds.length}`);
            setShowSummary(true);
        }
    };

    const restartGame = () => {
        setCurrentRoundIndex(0);
        setGuess('');
        setFeedback(null);
        setShowSummary(false);
        setCorrectAnswers(0);
        setGameStarted(false); // Reset for logging
    };

    return (
        <>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">4 Pics 1 Word</CardTitle>
                    <CardDescription>Round {currentRoundIndex + 1} of {rounds.length}. Guess the word that connects the four images.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {images.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                                {image && <Image src={image.imageUrl} alt={`Hint image ${index + 1}`} fill style={{ objectFit: 'cover' }} data-ai-hint={image.imageHint} />}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <Input
                            type="text"
                            placeholder="Your guess"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (feedback === 'correct' ? handleNextRound() : handleGuess())}
                            className={cn(
                                "text-center text-xl font-bold tracking-widest h-14",
                                feedback === 'correct' && 'border-green-500 focus-visible:ring-green-500',
                                feedback === 'incorrect' && 'border-red-500 focus-visible:ring-red-500 animate-shake'
                            )}
                            disabled={feedback === 'correct'}
                        />
                         {feedback !== 'correct' && <Button onClick={handleGuess} className="h-14">Guess</Button>}
                         {feedback === 'correct' && <Button onClick={handleNextRound} className="h-14 bg-green-600 hover:bg-green-700">Next <ArrowRight className="ml-2"/></Button>}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                        {currentRound.hint && (
                            <Button variant="ghost" size="sm" onClick={() => toast({ description: `Hint: ${currentRound.hint}` })}>
                                <Lightbulb className="mr-2 h-4 w-4" /> Get a hint
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={restartGame}>
                            <RotateCw className="mr-2 h-4 w-4" /> Restart Game
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showSummary} onOpenChange={setShowSummary}>
                <DialogContent>
                    <DialogHeader className="text-center items-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <DialogTitle className="font-headline text-3xl">Game Over!</DialogTitle>
                        <DialogDescription className="text-lg">
                            You correctly guessed {correctAnswers} out of {rounds.length} words.
                        </DialogDescription>
                    </DialogHeader>
                    {correctAnswers === rounds.length && (
                        <div className="text-center p-4 bg-green-100 rounded-lg">
                            <p className="font-bold text-green-700">Congratulations! You've earned the "Word Wizard" badge!</p>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-center gap-2">
                        <Button onClick={restartGame} variant="secondary">Play Again</Button>
                        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
