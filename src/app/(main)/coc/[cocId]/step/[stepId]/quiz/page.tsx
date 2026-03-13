"use client";

import { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, AlertCircle } from 'lucide-react';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const { toast } = useToast();

  const cocId = params.cocId as string;
  const stepId = params.stepId as string;

  const coc = cocData.find(c => c.id === cocId);
  const step = coc?.steps.find(s => s.id === stepId);
  
  const isQuizUnlocked = useMemo(() => {
    if (!game.currentUser || !coc) return false;
    const cocs = ['coc1', 'coc2', 'coc3', 'coc4'];
    const currentCocIndex = cocs.indexOf(cocId);
    
    for (let i = 0; i < currentCocIndex; i++) {
      const prevId = cocs[i];
      const prevData = cocData.find(c => c.id === prevId);
      const completedCount = game.currentUser.progress[prevId]?.completedSteps.length || 0;
      if (completedCount !== (prevData?.steps.length || 0)) {
        return false;
      }
    }

    const stepIndex = coc.steps.findIndex(s => s.id === stepId);
    for (let i = 0; i < stepIndex; i++) {
      const prevStepId = coc.steps[i].id;
      if (!game.currentUser.progress[cocId]?.completedSteps.includes(prevStepId)) {
        return false;
      }
    }

    return true;
  }, [game.currentUser, cocId, stepId, coc]);

  useEffect(() => {
    if (!game.isUserLoading && game.currentUser && !isQuizUnlocked) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Complete the previous module quiz to unlock this quiz.",
      });
      router.replace(`/coc/${cocId}/step/${stepId}/lesson`);
    }
  }, [isQuizUnlocked, game.isUserLoading, game.currentUser, router, cocId, stepId, toast]);

  const quizContainerRef = useRef<HTMLDivElement>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [outcome, setOutcome] = useState<'pass' | 'retry' | 'reset' | null>(null);
  const [focusLost, setFocusLost] = useState(false);

  useEffect(() => {
    if (outcome && !focusLost) {
        const emojis = { pass: '🎉', retry: '💪', reset: '😢' };
        const titles = { pass: 'Step Passed!', retry: 'Try Again!', reset: 'Step Reset!'};
        const descriptions = { 
            pass: `Great job! You scored ${score}/20.`,
            retry: `You scored ${score}/20. You can do it!`,
            reset: `Score: ${score}/20. You've been sent back to the start.`,
        };
        toast({
            title: <div className="text-4xl md:text-5xl text-center w-full">{emojis[outcome]}</div>,
            description: <div className="text-center font-bold text-xs md:text-sm">{descriptions[outcome]}</div>,
            duration: 3000
        });
    }
  }, [outcome, score, toast, focusLost]);

  const failQuizForLosingFocus = useCallback(() => {
    if (showResult) return;

    setFocusLost(true);
    const finalScore = 0;
    setScore(finalScore);
    const result = game.completeQuiz(cocId, stepId, finalScore);
    setOutcome(result);
    setShowResult(true);
  }, [showResult, game, cocId, stepId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.hidden) {
            failQuizForLosingFocus();
        }
    };

    if (!showResult && isQuizUnlocked) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', failQuizForLosingFocus);
    }

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', failQuizForLosingFocus);
    };
  }, [showResult, failQuizForLosingFocus, isQuizUnlocked]);


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
    
    container.addEventListener('contextmenu', preventAction);
    container.addEventListener('copy', preventAction);
    container.addEventListener('dragstart', preventAction);

    return () => {
      container.removeEventListener('contextmenu', preventAction);
      container.removeEventListener('copy', preventAction);
      container.removeEventListener('dragstart', preventAction);
    };
  }, [toast]);

  if (!coc || !step || !isQuizUnlocked) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm uppercase font-mono tracking-widest">Verifying access credentials...</p>
        </div>
      </div>
    );
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

  const handleDownloadPDF = () => {
    if (!game.currentUser || !coc || !step) return;

    const doc = new jsPDF();
    const { player } = game.currentUser;
    const wrongAnswers = totalQuestions - score;
    const scorePercentage = (score / totalQuestions) * 100;

    doc.setFontSize(20);
    doc.text("IT MAZING - Quiz Results", 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`${coc.title} - ${step.title}`, 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Completed on: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text("Agent:", 14, 50);
    doc.text(`${player.displayName} (@${player.username})`, 50, 50);
    
    doc.text("Score:", 14, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score} / ${totalQuestions} (${scorePercentage.toFixed(1)}%)`, 50, 60);
    doc.setFont('helvetica', 'normal');

    doc.text("Correct Answers:", 14, 65);
    doc.text(`${score}`, 50, 65);
    
    doc.text("Incorrect Answers:", 14, 70);
    doc.text(`${wrongAnswers}`, 50, 70);

    const tableData = step.quiz.map((q, index) => {
        const userAnswer = answers[index] || "No Answer";
        const isCorrect = userAnswer === q.correctAnswer;
        return [
            q.question.replace(/\s+/g, ' ').trim(),
            userAnswer.replace(/\s+/g, ' ').trim(),
            q.correctAnswer.replace(/\s+/g, ' ').trim(),
            isCorrect ? '✅ Correct' : '❌ Incorrect'
        ];
    });

    autoTable(doc, {
        head: [['Question', 'Your Answer', 'Correct Answer', 'Result']],
        body: tableData,
        startY: 80,
        didParseCell: function (data) {
            if (data.column.index === 3 && data.cell.section === 'body') {
                if (data.cell.text[0].includes('✅')) {
                    data.cell.styles.textColor = [0, 128, 0];
                } else {
                    data.cell.styles.textColor = [255, 0, 0];
                }
            }
        },
        styles: {
            cellPadding: 2,
            fontSize: 8,
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(10);
    doc.text("Note: Review the incorrect answers to improve your knowledge for the next attempt.", 14, finalY + 10);
    
    doc.save(`IT_MAZING_Quiz_Results_${coc.id}_${step.id}.pdf`);
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
    <div className="max-w-4xl mx-auto px-2 py-4">
      <Card 
        ref={quizContainerRef}
        id="quiz-container"
        className={cn("w-full bg-card/80 backdrop-blur-md border-primary/20", "quiz-anti-cheat")}
      >
        <CardHeader className="pb-4">
          <Progress value={progressPercentage} className="mb-4 h-1.5 md:h-2" />
          <CardTitle className="font-headline text-lg md:text-2xl uppercase tracking-widest">{step.title} - Assessment</CardTitle>
          <CardDescription className="text-[10px] md:text-sm">
            Question {currentQuestionIndex + 1} of {totalQuestions}
            <br />
            <span className="font-bold text-destructive flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-3 w-3" /> Focus Alert: Do not switch tabs or windows.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-sm md:text-xl mb-6 md:mb-8 min-h-[3em] leading-relaxed">{question.question}</p>
          
          <RadioGroup 
            value={answers[currentQuestionIndex] || ''} 
            onValueChange={handleAnswerSelect}
            className="space-y-2 md:space-y-4"
          >
            {question.options.map((option, index) => (
              <Label key={index} htmlFor={`option-${index}`} className="flex items-center space-x-3 p-3 md:p-4 border rounded-lg hover:bg-accent/10 cursor-pointer has-[:checked]:bg-primary/20 has-[:checked]:text-primary has-[:checked]:border-primary transition-all">
                <RadioGroupItem value={option} id={`option-${index}`} className="shrink-0" />
                <span className="text-xs md:text-base font-medium leading-tight">{option}</span>
              </Label>
            ))}
          </RadioGroup>

          <div className="flex justify-end mt-6 md:mt-8">
            <Button variant="cyber" size="lg" onClick={handleNext} disabled={!answers[currentQuestionIndex]} className="w-full md:w-auto h-11 md:h-14 uppercase text-xs tracking-widest">
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Step' : 'Submit Final'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-[90vw] md:max-w-md">
          <DialogHeader>
             {focusLost ? (
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="text-6xl md:text-7xl animate-shake-head">😠</div>
                    <DialogTitle className="font-headline text-2xl md:text-4xl text-destructive animate-pulse uppercase tracking-widest">
                        Neural Snap!
                    </DialogTitle>
                    <DialogDescription className="text-base md:text-lg">
                        You navigated away from the assessment.
                    </DialogDescription>
                </div>
            ) : (
                <>
                    <DialogTitle className="text-center font-headline text-xl md:text-3xl uppercase tracking-widest">
                        {outcome === 'pass' && '🎉 Protocol Verified!'}
                        {outcome === 'retry' && '💪 Signal Weak!'}
                        {outcome === 'reset' && '😢 Link Severed!'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm md:text-lg font-mono">
                      SYNCHRONIZATION: {score} / {totalQuestions}
                    </DialogDescription>
                </>
            )}
          </DialogHeader>
          <div className="text-center my-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
              {focusLost ? (
                <p>Focus is a requirement for tactical certification. Your attempt has been terminated.</p>
              ) : (
                <>
                  {outcome === 'pass' && <p>Excellent technical proficiency. You are ready for the next uplink.</p>}
                  {outcome === 'retry' && <p>You were close to certification. Review the technical logs and re-engage.</p>}
                  {outcome === 'reset' && <p>Significant logic errors detected. Re-initializing training from root node.</p>}
                </>
              )}
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={focusLost}
              className="w-full sm:w-auto h-10 text-[10px] md:text-xs"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button variant="cyber" onClick={handleDialogClose} className="w-full sm:w-auto h-10 text-[10px] md:text-xs">Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
