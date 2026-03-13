"use client";

import { useContext } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { GameContext, GameContextType } from '@/context/GameContext';
import { cocData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lock, PlayCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function CocPage() {
  const params = useParams();
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const cocId = params.cocId as string;

  const coc = cocData.find(c => c.id === cocId);

  if (!coc) {
    return <div className="p-8 text-center">COC module identification error.</div>;
  }
  if (!game.currentUser?.progress) return null;

  const completedSteps = game.currentUser.progress[cocId]?.completedSteps || [];
  const currentStepIndex = coc.steps.findIndex(step => !completedSteps.includes(step.id));
  const isCocCompleted = completedSteps.length === coc.steps.length;

  return (
    <div className="space-y-6">
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/dashboard" className="text-xs">Dashboard</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage className="text-xs truncate max-w-[150px]">{coc.title.split(':')[0]}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
            <h1 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-tight">{coc.title}</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">{coc.description}</p>
        </div>
        <Link href={`/coc/${cocId}/practice`} className="w-full md:w-auto">
            <Button variant="cyber" className="w-full h-11 uppercase text-[10px] md:text-xs tracking-widest">
                <PlayCircle className="mr-2 h-4 w-4" /> Practice Mode
            </Button>
        </Link>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl uppercase tracking-widest font-cyber">Learning Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coc.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStepIndex === index;
              const isLocked = !isCompleted && !isCurrent;

              return (
                <div key={step.id} className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 rounded-lg border transition-colors", {
                  'bg-green-500/10 border-green-500/30': isCompleted,
                  'bg-primary/10 border-primary/40 ring-1 ring-primary/20': isCurrent,
                  'bg-muted/30 border-white/5 opacity-80': isLocked
                })}>
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 mb-3 sm:mb-0">
                    <div className="shrink-0">
                        {isCompleted ? <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" /> :
                         isCurrent ? <PlayCircle className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse" /> :
                         <Lock className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground opacity-50" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs md:text-base truncate">{step.title}</h3>
                      <p className="text-[10px] md:text-sm text-muted-foreground font-mono uppercase tracking-tighter">Step {index + 1}</p>
                    </div>
                  </div>
                  <Link href={`/coc/${cocId}/step/${step.id}/lesson`} passHref className="w-full sm:w-auto">
                    <Button 
                        variant={isCurrent ? 'cyber' : 'outline'}
                        size="sm"
                        className={cn("w-full sm:w-auto h-9 md:h-10 text-[10px] md:text-xs uppercase", isCurrent && "px-6")}
                    >
                      <BookOpen className="mr-2 h-3 w-3 md:h-4 md:w-4" /> {isCompleted ? 'Review' : 'Initialize'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          {isCocCompleted && (
              <div className="mt-6 text-center p-6 bg-green-500/10 border border-green-500/30 rounded-lg animate-in fade-in zoom-in-95 duration-500">
                  <h3 className="text-lg md:text-xl font-bold text-green-400 uppercase tracking-widest font-cyber">Module Synchronized!</h3>
                  <p className="text-green-200/70 text-xs md:text-sm mt-2">You have mastered all protocols in {coc.title.split(':')[0]}.</p>
                  <Button variant="cyber" className="mt-4 h-10 px-8 uppercase text-[10px] tracking-widest" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
