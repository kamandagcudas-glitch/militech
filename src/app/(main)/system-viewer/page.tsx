
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { systemPartsData } from '@/lib/system-parts-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Cpu, Play, Square, CheckCircle2, Circle, Info, Settings, BookOpen, Wrench, Activity } from 'lucide-react';
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
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const mainImage = PlaceHolderImages.find(img => img.id === 'system-unit-main');
  const selectedPart = systemPartsData[selectedIndex];

  // Logic to track viewed parts
  useEffect(() => {
    setViewedParts(prev => {
      const next = new Set(prev);
      next.add(selectedPart.id);
      return next;
    });
    
    // Smooth scroll to top of details when part changes
    if (detailPanelRef.current) {
        detailPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
          return prev + 1.5; // Speed of the scan
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
                <BreadcrumbPage>Interactive System Showcase</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-primary/20 pb-4">
        <div>
            <h1 className="font-headline text-4xl font-bold flex items-center gap-3">
                <Cpu className="text-primary animate-pulse" /> 
                Hardware Architecture Showcase
            </h1>
            <p className="text-muted-foreground mt-1">Interactive 2D Technical Diagnostic. Select nodes to learn purpose and installation.</p>
        </div>
        <div className="flex gap-2">
            <Button 
                variant={isAutoScanning ? "destructive" : "cyber"} 
                onClick={() => setIsAutoScanning(!isAutoScanning)}
                className="gap-2 min-w-[160px]"
            >
                {isAutoScanning ? <><Square className="h-4 w-4" /> Stop Showcase</> : <><Play className="h-4 w-4" /> Start Auto-Scan</>}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR: Checklist */}
        <div className="lg:col-span-3 order-2 lg:order-1">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full flex flex-col">
                <CardHeader className="pb-2 border-b border-white/5 mb-4">
                    <CardTitle className="text-sm font-cyber uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Component Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 flex-grow overflow-auto custom-scrollbar">
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
                            <span className="font-mono opacity-0 group-hover:opacity-100 transition-opacity">{(index + 1).toString().padStart(2, '0')}</span>
                        </button>
                    ))}
                </CardContent>
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-muted-foreground uppercase">
                        <span>Showcase Completion</span>
                        <span>{Math.round((viewedParts.size / systemPartsData.length) * 100)}%</span>
                    </div>
                    <Progress value={(viewedParts.size / systemPartsData.length) * 100} className="h-1" />
                </div>
            </Card>
        </div>

        {/* CENTER: Image Viewer */}
        <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.15)] group bg-black">
                <Image
                    src={mainImage.imageUrl}
                    alt={mainImage.description}
                    fill
                    className={cn(
                        "object-cover transition-all duration-700",
                        isAutoScanning ? "scale-105" : "scale-100"
                    )}
                    data-ai-hint={mainImage.imageHint}
                    priority
                />
                
                {/* Visual Overlays */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
                
                {/* Interactive Hotspots */}
                {systemPartsData.map((part, index) => (
                    <button
                    key={part.id}
                    onClick={() => { setSelectedIndex(index); setIsAutoScanning(false); }}
                    className={cn(
                        "absolute transition-all duration-500 border-2 rounded-full flex items-center justify-center z-20",
                        selectedIndex === index 
                        ? 'bg-primary border-white scale-125 shadow-[0_0_25px_hsl(var(--primary))] animate-pulse' 
                        : 'bg-black/40 border-primary/60 hover:border-primary hover:bg-primary/20 scale-100'
                    )}
                    style={{ 
                        top: part.position.top, 
                        left: part.position.left, 
                        width: '36px', 
                        height: '36px' 
                    }}
                    title={part.name}
                    >
                        <span className={cn(
                            "text-[11px] font-bold",
                            selectedIndex === index ? "text-white" : "text-primary"
                        )}>{index + 1}</span>
                    </button>
                ))}

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 font-mono text-[10px] text-primary/70 pointer-events-none">
                    <div className="flex gap-2"><span>SOURCE:</span> <span className="text-white">SIM_NODE_01</span></div>
                    <div className="flex gap-2"><span>ENCRYPTION:</span> <span className="text-white">MIL-SPEC</span></div>
                    <div className="flex gap-2"><span>MODE:</span> <span className="text-white">{isAutoScanning ? 'AUTO_SCAN' : 'MANUAL_OVERRIDE'}</span></div>
                </div>

                {isAutoScanning && (
                    <div className="absolute bottom-0 left-0 w-full z-30">
                        <div className="h-1.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all" style={{ width: `${scanProgress}%` }} />
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: High-Fidelity Detail Panel */}
        <div className="lg:col-span-3 order-3">
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20 h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            <CardHeader className="border-b border-white/5 bg-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">TECHNICAL NODE {(selectedIndex + 1).toString().padStart(2, '0')}</span>
                <Activity className="h-3 w-3 text-primary animate-pulse" />
              </div>
              <CardTitle className="font-headline text-2xl text-primary leading-tight uppercase tracking-tighter">{selectedPart.name}</CardTitle>
            </CardHeader>
            <CardContent ref={detailPanelRef} className="flex-grow flex flex-col p-4 overflow-auto custom-scrollbar space-y-6">
              
              {/* Definition Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Intelligence Definition</h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 bg-white/5 p-3 rounded-md border border-white/5">{selectedPart.definition}</p>
              </div>

              {/* Purpose & How It Works */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4 text-accent" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Core Purpose</h3>
                    </div>
                    <p className="text-xs italic text-muted-foreground">{selectedPart.purpose}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Settings className="h-4 w-4 text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Operational Logic</h3>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{selectedPart.howItWorks}</p>
                </div>
              </div>

              {/* Installation Protocol */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Wrench className="h-4 w-4 text-yellow-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Installation Protocol</h3>
                </div>
                <div className="space-y-2">
                    {selectedPart.installation.map((step, i) => (
                        <div key={i} className="flex gap-3 text-xs items-start group">
                            <span className="font-mono text-primary bg-primary/10 w-5 h-5 flex items-center justify-center rounded shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">{i + 1}</span>
                            <p className="pt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">{step}</p>
                        </div>
                    ))}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => { handlePrev(); setIsAutoScanning(false); }} className="h-10 w-10 p-0 border-primary/20">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex gap-1.5">
                    {systemPartsData.map((_, i) => (
                        <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === selectedIndex ? "bg-primary w-6" : "bg-white/10 w-2")} />
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => { handleNext(); setIsAutoScanning(false); }} className="h-10 w-10 p-0 border-primary/20">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
