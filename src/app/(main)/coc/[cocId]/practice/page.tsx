"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cocData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, RotateCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { QuizQuestion } from '@/lib/types';


export default function PracticeModePage() {
  const params = useParams();
  const router = useRouter();
  const cocId = params.cocId as string;
  const coc = cocData.find(c => c.id === cocId);

  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (coc) {
      // Shuffle questions on the client side to avoid hydration mismatch
      setAllQuestions(coc.steps.flatMap(step => step.quiz).sort(() => 0.5 - Math.random()));
    }
  }, [coc]);


  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  if (!coc) {
    return <div>COC not found.</div>;
  }
  
  if (allQuestions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const question = allQuestions[currentQuestionIndex];

  const handleCheckAnswer = () => {
    if (selectedAnswer && question) {
      const isCorrect = selectedAnswer === question.correctAnswer;
      setFeedback({ correct: isCorrect, explanation: question.explanation });
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
        // End of practice
        setCurrentQuestionIndex(0); // Loop back or show summary
    }
  };

  const handlePrevious = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const restartPractice = () => {
      setAllQuestions(prev => [...prev].sort(() => 0.5 - Math.random())); // Re-shuffle
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setFeedback(null);
  }

  return (
    <div>
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href={`/coc/${cocId}`}>{coc.title}</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>Practice Mode</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Practice Mode: {coc.title}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {allQuestions.length}. Answer and get immediate feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-lg mb-6">{question.question}</p>
          
          <RadioGroup 
            value={selectedAnswer ?? ''} 
            onValueChange={setSelectedAnswer} 
            className="space-y-4"
            disabled={!!feedback}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          {feedback && (
            <Alert className={cn("mt-6", feedback.correct ? "border-green-500 text-green-700" : "border-red-500 text-red-700")}>
              {feedback.correct ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{feedback.correct ? 'Correct!' : 'Incorrect'}</AlertTitle>
              <AlertDescription className="text-foreground">
                {question.explanation}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <div className='flex gap-2'>
                <Button onClick={restartPractice} variant="ghost">
                    <RotateCw className="mr-2 h-4 w-4" /> Restart
                </Button>
                {!feedback ? (
                <Button onClick={handleCheckAnswer} disabled={!selectedAnswer}>Check Answer</Button>
                ) : (
                <Button onClick={handleNext}>
                    {currentQuestionIndex === allQuestions.length - 1 ? 'Finish & Restart' : 'Next Question'} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
