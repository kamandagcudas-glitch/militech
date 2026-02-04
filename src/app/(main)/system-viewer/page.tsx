"use client";

import { useState } from 'react';
import Image from 'next/image';
import { systemPartsData } from '@/lib/system-parts-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
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

export default function SystemViewerPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Find the main image for the system viewer from placeholder images.
  const mainImage = PlaceHolderImages.find(img => img.id === 'system-unit-main');
  const selectedPart = systemPartsData[selectedIndex];

  // Navigate to the next component in the list, looping back to the start if at the end.
  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % systemPartsData.length);
  };

  // Navigate to the previous component, looping to the end if at the start.
  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + systemPartsData.length) % systemPartsData.length);
  };

  if (!mainImage) {
    return <div>Loading system components...</div>;
  }

  return (
    <div className="container mx-auto">
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>System Viewer</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      <h1 className="font-headline text-4xl font-bold mb-4 flex items-center gap-2"><Cpu /> System Unit Parts Viewer</h1>
      <p className="text-muted-foreground mb-8">Click on the highlighted parts of the image or use the navigation buttons to learn about each component.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/*
          * Image Viewer: This section displays the main image of the computer case.
          * Hotspots for each component are overlaid on top of this image.
        */}
        <div className="lg:col-span-2 relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20">
          <Image
            src={mainImage.imageUrl}
            alt={mainImage.description}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={mainImage.imageHint}
            priority
          />
          {/* 
            * Component Hotspots: These are interactive buttons positioned absolutely over the main image.
            * Clicking a hotspot selects a component and displays its information.
            * The currently selected part is highlighted with a pulsing animation.
          */}
          {systemPartsData.map((part, index) => (
            <button
              key={part.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "absolute transition-all duration-300 border-2 rounded-md hover:bg-cyan-400/50",
                selectedIndex === index 
                  ? 'bg-cyan-400/30 border-cyan-300 animate-pulse shadow-[0_0_15px_5px] shadow-cyan-400/50' 
                  : 'bg-transparent border-white/30 hover:border-cyan-300'
              )}
              style={{ ...part.position }}
              title={part.name}
            />
          ))}
        </div>

        {/* 
          * Information Panel: This card displays the details of the currently selected component.
          * It includes the part's name, function, and installation procedure.
        */}
        <div className="lg:col-span-1">
          <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-cyan-300">{selectedPart.name}</CardTitle>
              <CardDescription>Component {selectedIndex + 1} of {systemPartsData.length}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-bold mb-2 text-primary">Function:</h3>
                <p className="text-muted-foreground mb-4">{selectedPart.description}</p>
                <h3 className="font-bold mb-2 text-primary">Installation:</h3>
                <p className="text-muted-foreground">{selectedPart.installation}</p>
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button variant="outline" onClick={handlePrev}>
                  <ChevronLeft className="mr-2" /> Previous
                </Button>
                <Button onClick={handleNext}>
                  Next <ChevronRight className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
