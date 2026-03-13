
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { cocData } from '@/lib/data';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpen, Cpu, Lock, ImageOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const cocId = params.cocId as string;
  const stepId = params.stepId as string;
  
  const [hasError, setHasError] = useState(false);

  const coc = cocData.find(c => c.id === cocId);
  const step = coc?.steps.find(s => s.id === stepId);

  useEffect(() => {
    if (game.logActivity && coc && step) {
        game.logActivity('Lesson Viewed', `COC: ${coc.title}, Step: ${step.title}`);
    }
  }, [game.logActivity, coc, step]);

  /**
   * progression check:
   * Quiz is unlocked if:
   * 1. All previous COCs are completed.
   * 2. All previous steps in the current COC are completed.
   */
  const isQuizUnlocked = useMemo(() => {
    if (!game.currentUser || !coc) return false;
    const cocs = ['coc1', 'coc2', 'coc3', 'coc4'];
    const currentCocIndex = cocs.indexOf(cocId);
    
    // 1. Check if all steps in previous COCs are finished
    for (let i = 0; i < currentCocIndex; i++) {
      const prevId = cocs[i];
      const prevData = cocData.find(c => c.id === prevId);
      const completedCount = game.currentUser.progress[prevId]?.completedSteps.length || 0;
      if (completedCount !== (prevData?.steps.length || 0)) {
        return false;
      }
    }

    // 2. Check if all steps before this one in the current COC are finished
    const stepIndex = coc.steps.findIndex(s => s.id === stepId);
    for (let i = 0; i < stepIndex; i++) {
      const prevStepId = coc.steps[i].id;
      if (!game.currentUser.progress[cocId]?.completedSteps.includes(prevStepId)) {
        return false;
      }
    }

    return true;
  }, [game.currentUser, cocId, stepId, coc]);


  if (!coc || !step) {
    return <div>Lesson not found.</div>;
  }
  
  const image = PlaceHolderImages.find(img => img.id === step.lesson.imageId);
  const isCoc1Step1 = cocId === 'coc1' && stepId === 'step1';

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
            <BreadcrumbPage>{step.title}</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-2">
            <BookOpen className="text-primary" />
            {step.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="prose dark:prose-invert max-w-none">
              {step.lesson.text.map((paragraph, index) => (
                <p key={index} className="text-sm md:text-lg mb-4 text-foreground/90 leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <div className="relative">
                {image && !hasError ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg border border-primary/20 bg-muted">
                    <Image 
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover transition-opacity duration-500"
                      onError={() => setHasError(true)}
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                ) : image && hasError ? (
                  <div className="aspect-video rounded-lg flex flex-col items-center justify-center bg-muted border-2 border-dashed border-primary/20 text-muted-foreground p-4 text-center">
                    <ImageOff className="h-12 w-12 mb-2 opacity-20 text-primary" />
                    <p className="text-sm font-semibold uppercase font-cyber tracking-widest text-primary">Image not available</p>
                    <p className="text-[10px]">Verification of visual asset failed.</p>
                  </div>
                ) : null}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            {!isQuizUnlocked && (
              <Alert variant="destructive" className="max-w-md bg-destructive/10 border-destructive/50">
                <Lock className="h-4 w-4" />
                <AlertTitle>Quiz Locked</AlertTitle>
                <AlertDescription>
                  Complete the previous module quiz to unlock this quiz.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center items-center gap-4">
              {isCoc1Step1 && (
                <Link href="/system-viewer">
                  <Button variant="secondary" size="lg">
                    <Cpu className="mr-2 h-5 w-5" /> Explore System Unit
                  </Button>
                </Link>
              )}
              
              {isQuizUnlocked ? (
                <Link href={`/coc/${cocId}/step/${stepId}/quiz`}>
                  <Button variant="cyber" size="lg" className="text-lg h-14 px-10">
                    I'm Ready, Start Quiz! <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="lg" className="text-lg h-14 opacity-50 cursor-not-allowed border border-dashed border-white/10" disabled>
                  <Lock className="mr-2 h-5 w-5" /> Quiz Locked
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
