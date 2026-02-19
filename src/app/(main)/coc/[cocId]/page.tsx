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
    return <div>COC not found.</div>;
  }
  if (!game.currentUser?.progress) return null;

  const completedSteps = game.currentUser.progress[cocId]?.completedSteps || [];
  const currentStepIndex = coc.steps.findIndex(step => !completedSteps.includes(step.id));
  const isCocCompleted = completedSteps.length === coc.steps.length;

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
                <BreadcrumbPage>{coc.title}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">{coc.title}</h1>
            <p className="text-muted-foreground">{coc.description}</p>
        </div>
        <Link href={`/coc/${cocId}/practice`}>
            <Button variant="cyber">
                <PlayCircle className="mr-2 h-4 w-4" /> Practice This COC
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coc.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStepIndex === index;
              const isLocked = !isCompleted && !isCurrent;

              return (
                <div key={step.id} className={cn("flex items-center justify-between p-4 rounded-lg border", {
                  'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700': isCompleted,
                  'bg-accent/50 border-accent/50': isCurrent,
                  'bg-muted/30': isLocked
                })}>
                  <div className="flex items-center gap-4">
                    {isCompleted ? <CheckCircle className="h-6 w-6 text-green-500" /> :
                     isCurrent ? <PlayCircle className="h-6 w-6 text-accent" /> :
                     <Lock className="h-6 w-6 text-muted-foreground" />}
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">Step {index + 1}</p>
                    </div>
                  </div>
                  <Link href={`/coc/${cocId}/step/${step.id}/lesson`} passHref>
                    <Button 
                        disabled={isLocked} 
                        variant={isCurrent ? 'cyber' : 'secondary'}
                        className={cn(isCurrent && "h-12 px-6")}
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          {isCocCompleted && (
              <div className="mt-6 text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Congratulations!</h3>
                  <p className="text-green-600 dark:text-green-400">You have completed all steps in {coc.title}.</p>
                  <Button variant="cyber" className="mt-4" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}