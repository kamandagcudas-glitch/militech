"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { cocData } from '@/lib/data';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpen, Cpu } from 'lucide-react';
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

  const coc = cocData.find(c => c.id === cocId);
  const step = coc?.steps.find(s => s.id === stepId);

  useEffect(() => {
    if (game.logActivity && coc && step) {
        game.logActivity('Lesson Viewed', `COC: ${coc.title}, Step: ${step.title}`);
    }
  }, [game.logActivity, coc, step]);


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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <BookOpen />
            {step.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="prose dark:prose-invert max-w-none">
              {step.lesson.text.map((paragraph, index) => (
                <p key={index} className="text-lg mb-4">{paragraph}</p>
              ))}
            </div>
            {image && (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={image.imageHint}
                />
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-center items-center gap-4">
            {isCoc1Step1 && (
               <Link href="/system-viewer">
                <Button size="lg" variant="secondary">
                  <Cpu className="mr-2" /> Explore System Unit
                </Button>
              </Link>
            )}
            <Link href={`/coc/${cocId}/step/${stepId}/quiz`}>
              <Button size="lg" className="text-lg">
                I'm Ready, Start Quiz! <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
