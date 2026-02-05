"use client";

import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameContext, GameContextType } from '@/context/GameContext';
import { cocData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const { toast } = useToast();

  const cocId = params.cocId as string;
  const stepId = params.stepId as string;

  const coc = cocData.find(c => c.id === cocId);
  const step = coc?.steps.find(s => s.id === stepId);
  
  // This ref is attached to the main quiz container.
  const quizContainerRef = useRef<HTMLDivElement>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [outcome, setOutcome] = useState<'pass' | 'retry' | 'reset' | null>(null);
  const [focusLost, setFocusLost] = useState(false);

  useEffect(() => {
    // Do not show the emoji toast if the quiz was failed due to focus loss.
    if (outcome && !focusLost) {
        const emojis = { pass: '🎉', retry: '💪', reset: '😢' };
        const titles = { pass: 'Step Passed!', retry: 'Try Again!', reset: 'Step Reset!'};
        const descriptions = { 
            pass: `Great job! You scored ${score}/20.`,
            retry: `You scored ${score}/20. You can do it!`,
            reset: `Score: ${score}/20. You've been sent back to the start.`,
        };
        toast({
            title: <div className="text-5xl text-center w-full">{emojis[outcome]}</div>,
            description: <div className="text-center font-bold">{descriptions[outcome]}</div>,
            duration: 3000
        });
    }
  }, [outcome, score, toast, focusLost]);

  // Quiz Focus Monitor Logic: This function fails the quiz if the user switches tabs or minimizes the window.
  const failQuizForLosingFocus = useCallback(() => {
    // Check if the quiz is already over to prevent multiple triggers.
    if (showResult) return;

    setFocusLost(true);
    const finalScore = 0;
    setScore(finalScore);
    const result = game.completeQuiz(cocId, stepId, finalScore);
    setOutcome(result); // This will always be 'reset'
    setShowResult(true);
  }, [showResult, game, cocId, stepId]);

  // This effect attaches the focus and visibility listeners.
  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.hidden) {
            failQuizForLosingFocus();
        }
    };

    // Only add listeners if the quiz is currently active.
    if (!showResult) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', failQuizForLosingFocus);
    }

    // Cleanup listeners when the component unmounts or the quiz is finished.
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', failQuizForLosingFocus);
    };
  }, [showResult, failQuizForLosingFocus]);


  // Anti-Cheat Logic: This effect adds event listeners to the quiz container
  // to disable right-clicking, copying, and dragging. It also shows a warning toast.
  useEffect(() => {
    const container = quizContainerRef.current;
    if (!container) return;

    const preventAction = (e: Event) => {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Action Disabled",
        description: "Copying and right-clicking are disabled during the quiz.",
        duration: 2000,
      });
    };
    
    // Attaching event listeners to prevent cheating.
    container.addEventListener('contextmenu', preventAction);
    container.addEventListener('copy', preventAction);
    container.addEventListener('dragstart', preventAction);

    // Cleanup function to remove event listeners when the component unmounts.
    return () => {
      container.removeEventListener('contextmenu', preventAction);
      container.removeEventListener('copy', preventAction);
      container.removeEventListener('dragstart', preventAction);
    };
  }, [toast]);

  if (!coc || !step) {
    return <div>Quiz not found.</div>;
  }

  const question = step.quiz[currentQuestionIndex];
  const totalQuestions = step.quiz.length;

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    for (let i = 0; i < totalQuestions; i++) {
      if (answers[i] === step.quiz[i].correctAnswer) {
        correctAnswers++;
      }
    }
    const finalScore = correctAnswers;
    setScore(finalScore);
    const result = game.completeQuiz(cocId, stepId, finalScore);
    setOutcome(result);
    setShowResult(true);
  };
  
  const handleDialogClose = () => {
    setShowResult(false);
    if (outcome === 'pass') {
        const currentStepIndex = coc.steps.findIndex(s => s.id === stepId);
        if(currentStepIndex < coc.steps.length - 1) {
            const nextStepId = coc.steps[currentStepIndex + 1].id;
            router.push(`/coc/${cocId}/step/${nextStepId}/lesson`);
        } else {
            game.addAchievement(`${cocId}-complete`);
            router.push(`/coc/${cocId}`);
        }
    } else if (outcome === 'retry') {
        router.push(`/coc/${cocId}/step/${stepId}/lesson`);
    } else if (outcome === 'reset') {
        router.push(`/coc/${cocId}`);
    }
  };

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  return (
    <>
      <Card 
        ref={quizContainerRef}
        id="quiz-container"
        className={cn("w-full max-w-4xl mx-auto", "quiz-anti-cheat")}
      >
        <CardHeader>
          <Progress value={progressPercentage} className="mb-4" />
          <CardTitle className="font-headline text-2xl">{step.title} - Quiz</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {totalQuestions}
            <br />
            <span className="font-bold text-destructive">Do not leave this tab or window, or your attempt will be failed.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-xl mb-8 min-h-[3em]">{question.question}</p>
          
          <RadioGroup 
            value={answers[currentQuestionIndex] || ''} 
            onValueChange={handleAnswerSelect}
            className="space-y-4"
          >
            {question.options.map((option, index) => (
              <Label key={index} htmlFor={`option-${index}`} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent has-[:checked]:text-accent-foreground has-[:checked]:border-accent">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <span className="text-base font-medium">{option}</span>
              </Label>
            ))}
          </RadioGroup>

          <div className="flex justify-end mt-8">
            <Button size="lg" onClick={handleNext} disabled={!answers[currentQuestionIndex]}>
              {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
             {focusLost ? (
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="text-7xl animate-shake-head">😠</div>
                    <DialogTitle className="font-headline text-4xl text-destructive animate-pulse">
                        Nuh uh!
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        You navigated away from the quiz window.
                    </DialogDescription>
                </div>
            ) : (
                <>
                    <DialogTitle className="text-center font-headline text-3xl">
                        {outcome === 'pass' && '🎉 Step Passed! 🎉'}
                        {outcome === 'retry' && '💪 Keep Going! 💪'}
                        {outcome === 'reset' && '😢 Oh no... 😢'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg">
                      You scored {score} / {totalQuestions}.
                    </DialogDescription>
                </>
            )}
          </DialogHeader>
          <div className="text-center my-4">
              {focusLost ? (
                <p>Your attempt has been marked as failed. Focus is key, agent.</p>
              ) : (
                <>
                  {outcome === 'pass' && <p>Excellent work! You're ready for the next step.</p>}
                  {outcome === 'retry' && <p>You're close! Review the lesson and try again.</p>}
                  {outcome === 'reset' && <p>Back to basics. Let's build a stronger foundation.</p>}
                </>
              )}
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose} className="w-full">Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
