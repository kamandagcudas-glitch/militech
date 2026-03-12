
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { systemPartsData } from '@/lib/system-parts-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Cpu, Play, Square, CheckCircle2, Circle, Info, Settings } from 'lucide-react';
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
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [viewedParts, setViewedParts] = useState<Set<string>>(new Set(['motherboard']));
  const [scanProgress, setScanProgress] = useState(0);

  const mainImage = PlaceHolderImages.find(img => img.id === 'system-unit-main');
  const selectedPart = systemPartsData[selectedIndex];

  // Logic to track viewed parts
  useEffect(() => {
    setViewedParts(prev => {
      const next = new Set(prev);
      next.add(selectedPart.id);
      return next;
    });
  }, [selectedPart.id]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % systemPartsData.length);
    setScanProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + systemPartsData.length) % systemPartsData.length);
    setScanProgress(0);
  }, []);

  // Auto-Scan Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 2; // Speed of the scan
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isAutoScanning, handleNext]);

  if (!mainImage) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-pulse text-primary font-cyber">INITIALIZING NEURAL LINK...</div>
        </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>System Showcase</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-primary/20 pb-4">
        <div>
            <h1 className="font-headline text-4xl font-bold flex items-center gap-3">
                <Cpu className="text-primary animate-pulse" /> 
                System Architecture Showcase
            </h1>
            <p className="text-muted-foreground mt-1">Full-scale diagnostic of a modern computing unit. Select nodes to inspect hardware details.</p>
        </div>
        <div className="flex gap-2">
            <Button 
                variant={isAutoScanning ? "destructive" : "cyber"} 
                onClick={() => setIsAutoScanning(!isAutoScanning)}
                className="gap-2 min-w-[160px]"
            >
                {isAutoScanning ? <><Square className="h-4 w-4" /> Stop Scan</> : <><Play className="h-4 w-4" /> Start Auto-Scan</>}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR: Checklist */}
        <div className="lg:col-span-3 order-2 lg:order-1">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full">
                <CardHeader className="pb-2 border-b border-white/5 mb-4">
                    <CardTitle className="text-sm font-cyber uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Inspection Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    {systemPartsData.map((part, index) => (
                        <button
                            key={part.id}
                            onClick={() => { setSelectedIndex(index); setIsAutoScanning(false); }}
                            className={cn(
                                "w-full flex items-center justify-between p-2 rounded-md transition-all text-xs group",
                                selectedIndex === index ? "bg-primary/20 text-white border-l-4 border-primary" : "hover:bg-white/5 text-muted-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {viewedParts.has(part.id) ? 
                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                                    <Circle className="h-3 w-3 opacity-30" />
                                }
                                {part.name.split(' (')[0]}
                            </span>
                            <span className="font-mono opacity-0 group-hover:opacity-100 transition-opacity">0{index + 1}</span>
                        </button>
                    ))}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-[10px] font-mono mb-1 text-muted-foreground uppercase">
                            <span>Diagnostic Progress</span>
                            <span>{Math.round((viewedParts.size / systemPartsData.length) * 100)}%</span>
                        </div>
                        <Progress value={(viewedParts.size / systemPartsData.length) * 100} className="h-1" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* CENTER: Image Viewer */}
        <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.1)] group">
                <Image
                    src={mainImage.imageUrl}
                    alt={mainImage.description}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint={mainImage.imageHint}
                    priority
                />
                
                {/* Visual Overlays */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-30" />
                
                {/* Hotspots */}
                {systemPartsData.map((part, index) => (
                    <button
                    key={part.id}
                    onClick={() => { setSelectedIndex(index); setIsAutoScanning(false); }}
                    className={cn(
                        "absolute transition-all duration-500 border-2 rounded-full flex items-center justify-center z-20",
                        selectedIndex === index 
                        ? 'bg-primary/40 border-primary scale-125 shadow-[0_0_20px] shadow-primary animate-pulse' 
                        : 'bg-black/20 border-white/40 hover:border-primary hover:bg-primary/20 scale-100'
                    )}
                    style={{ 
                        top: part.position.top, 
                        left: part.position.left, 
                        width: '32px', 
                        height: '32px' 
                    }}
                    title={part.name}
                    >
                        <span className="text-[10px] font-bold text-white">{index + 1}</span>
                    </button>
                ))}

                {/* Tactical Reticle Overlay */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 font-mono text-[10px] text-primary/70">
                    <div className="flex gap-2"><span>MODE:</span> <span className="text-white">DIAGNOSTIC_V4</span></div>
                    <div className="flex gap-2"><span>SOURCE:</span> <span className="text-white">LOCAL_STORAGE</span></div>
                    <div className="flex gap-2"><span>ENCRYPTION:</span> <span className="text-white">AES-256</span></div>
                </div>

                {isAutoScanning && (
                    <div className="absolute bottom-0 left-0 w-full z-30">
                        <div className="h-1 bg-primary animate-pulse" style={{ width: `${scanProgress}%` }} />
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: Detail Panel */}
        <div className="lg:col-span-3 order-3">
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20 h-full flex flex-col">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-primary uppercase tracking-tighter">Part Index: 0{selectedIndex + 1}</span>
                <Settings className="h-3 w-3 text-muted-foreground animate-spin-slow" />
              </div>
              <CardTitle className="font-headline text-xl text-primary leading-tight">{selectedPart.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-4">
              <div className="space-y-4 flex-grow overflow-auto custom-scrollbar pr-2">
                <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Info className="h-3 w-3" /> Technical Intelligence
                    </h3>
                    <p className="text-xs leading-relaxed text-foreground/90">{selectedPart.description}</p>
                </div>
                
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <h3 className="text-[10px] font-bold text-primary uppercase mb-2">Field Installation Protocol</h3>
                    <p className="text-[11px] italic text-muted-foreground">{selectedPart.installation}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-black/20 rounded border border-white/5 text-center">
                        <span className="block text-[8px] text-muted-foreground uppercase">Stability</span>
                        <span className="text-[10px] text-green-400 font-mono">NOMINAL</span>
                    </div>
                    <div className="p-2 bg-black/20 rounded border border-white/5 text-center">
                        <span className="block text-[8px] text-muted-foreground uppercase">Efficiency</span>
                        <span className="text-[10px] text-primary font-mono">98.4%</span>
                    </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                <Button variant="outline" size="sm" onClick={() => { handlePrev(); setIsAutoScanning(false); }} className="h-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                    {systemPartsData.map((_, i) => (
                        <div key={i} className={cn("h-1 w-2 rounded-full transition-all", i === selectedIndex ? "bg-primary w-4" : "bg-white/10")} />
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => { handleNext(); setIsAutoScanning(false); }} className="h-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
