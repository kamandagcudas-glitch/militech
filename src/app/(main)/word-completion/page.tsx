
"use client";

import { useState, useContext, useEffect } from 'react';
import { wordCompletionGameData } from '@/lib/data';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lightbulb, Check, X, RotateCw, ArrowRight, SpellCheck, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

// Function to create the word with missing letters
const createMaskedWord = (word: string): string => {
    if (word.length <= 3) return word;
    const chars = word.split('');
    const indicesToMask = new Set<number>();
    // Mask around 40% of the letters, but not the first or last
    const maskCount = Math.floor(chars.length * 0.4);

    while (indicesToMask.size < maskCount) {
        const randomIndex = Math.floor(Math.random() * (chars.length - 2)) + 1; // Exclude first and last letters
        if (chars[randomIndex] !== ' ') {
            indicesToMask.add(randomIndex);
        }
    }

    return chars.map((char, index) => (indicesToMask.has(index) ? '_' : char)).join('');
};


export default function WordCompletionPage() {
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();
    const router = useRouter();
    const [rounds, setRounds] = useState(wordCompletionGameData);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [maskedWord, setMaskedWord] = useState('');

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
            game.logActivity('Minigame Started', 'Word Completion');
            setGameStarted(true);
        }
    }, [game.currentUser, game.logActivity, gameStarted, router, toast]);
    
    useEffect(() => {
        // Shuffle rounds on client mount
        setRounds(prev => [...prev].sort(() => 0.5 - Math.random()));
    }, []);

    const currentRound = rounds[currentRoundIndex];

    useEffect(() => {
        if (currentRound?.answer) {
            setMaskedWord(createMaskedWord(currentRound.answer));
        }
    }, [currentRound]);


    const handleGuess = () => {
        if (feedback || !currentRound) return;

        if (guess.trim().toUpperCase() === currentRound.answer.toUpperCase()) {
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
                description: "Incorrect. Try again!",
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
            game.logActivity('Minigame Finished', `Word Completion - Score: ${correctAnswers}/${rounds.length}`);
            setShowSummary(true);
        }
    };

    const restartGame = () => {
        setRounds(prev => [...prev].sort(() => 0.5 - Math.random()));
        setCurrentRoundIndex(0);
        setGuess('');
        setFeedback(null);
        setShowSummary(false);
        setCorrectAnswers(0);
        setGameStarted(false);
    };

    if (!currentRound || !maskedWord) {
        return (
             <Card className="w-full max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </Card>
        )
    }

    return (
        <>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2"><SpellCheck/> Word Completion</CardTitle>
                    <CardDescription>Round {currentRoundIndex + 1} of {rounds.length}. Fill in the blanks to complete the IT term.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center mb-6 bg-muted p-6 rounded-lg">
                        <p className="font-code text-4xl tracking-[0.2em] font-bold">
                            {maskedWord.split('').map((char, i) => <span key={i} className="mx-1">{char}</span>)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <Input
                            type="text"
                            placeholder="Type the complete word"
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
                        <Button variant="ghost" size="sm" onClick={() => toast({ description: `Hint: ${currentRound.hint}` })}>
                            <Lightbulb className="mr-2 h-4 w-4" /> Get a hint
                        </Button>
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
                    <DialogFooter className="sm:justify-center gap-2">
                        <Button onClick={restartGame} variant="secondary">Play Again</Button>
                        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
