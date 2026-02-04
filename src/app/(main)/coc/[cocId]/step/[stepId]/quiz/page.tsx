"use client";

import { useState, useContext, useEffect } from 'react';
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

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const { toast } = useToast();

  const cocId = params.cocId as string;
  const stepId = params.stepId as string;

  const coc = cocData.find(c => c.id === cocId);
  const step = coc?.steps.find(s => s.id === stepId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [outcome, setOutcome] = useState<'pass' | 'retry' | 'reset' | null>(null);

  useEffect(() => {
    if (outcome) {
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
  }, [outcome, score, toast]);

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
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Progress value={progressPercentage} className="mb-4" />
          <CardTitle className="font-headline text-2xl">{step.title} - Quiz</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {totalQuestions}</CardDescription>
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
            <DialogTitle className="text-center font-headline text-3xl">
                {outcome === 'pass' && '🎉 Step Passed! 🎉'}
                {outcome === 'retry' && '💪 Keep Going! 💪'}
                {outcome === 'reset' && '😢 Oh no... 😢'}
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              You scored {score} / {totalQuestions}.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center my-4">
              {outcome === 'pass' && <p>Excellent work! You're ready for the next step.</p>}
              {outcome === 'retry' && <p>You're close! Review the lesson and try again.</p>}
              {outcome === 'reset' && <p>Back to basics. Let's build a stronger foundation.</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose} className="w-full">Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
