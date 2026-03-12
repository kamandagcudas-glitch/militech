
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { systemPartsData } from '@/lib/system-parts-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Cpu, Play, Square, CheckCircle2, Circle, Info, Settings, BookOpen, Wrench, Activity, Loader2, AlertCircle, LayoutGrid } from 'lucide-react';
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [viewedParts, setViewedParts] = useState<Set<string>>(new Set());
  const [scanProgress, setScanProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const overviewImage = PlaceHolderImages.find(img => img.id === 'system-unit-main');
  const selectedPart = selectedIndex !== null ? systemPartsData[selectedIndex] : null;
  
  const currentDisplayImage = selectedPart?.imageId 
    ? PlaceHolderImages.find(img => img.id === selectedPart.imageId) || overviewImage
    : overviewImage;

  // Reset loading state when image changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentDisplayImage?.imageUrl]);

  // Track viewed parts
  useEffect(() => {
    if (selectedPart) {
      setViewedParts(prev => {
        const next = new Set(prev);
        next.add(selectedPart.id);
        return next;
      });
      
      if (detailPanelRef.current) {
          detailPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedPart?.id]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % systemPartsData.length;
    });
    setScanProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => {
        if (prev === null) return systemPartsData.length - 1;
        return (prev - 1 + systemPartsData.length) % systemPartsData.length;
    });
    setScanProgress(0);
  }, []);

  // Auto-Scan Sequence
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1.5; 
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isAutoScanning, handleNext]);

  if (!overviewImage) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-pulse text-primary font-cyber uppercase">Initializing Neural Link...</div>
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
                System Unit Technical Showcase
            </h1>
            <p className="text-muted-foreground mt-1">Full-Tower Diagnostic. Select hardware nodes to review operational logic and installation protocols.</p>
        </div>
        <div className="flex gap-2">
            <Button 
                variant="outline"
                onClick={() => { setSelectedIndex(null); setIsAutoScanning(false); }}
                className={cn("gap-2", selectedIndex === null && "bg-primary/10 border-primary")}
            >
                <LayoutGrid className="h-4 w-4" /> System Overview
            </Button>
            <Button 
                variant={isAutoScanning ? "destructive" : "cyber"} 
                onClick={() => setIsAutoScanning(!isAutoScanning)}
                className="gap-2 min-w-[160px]"
            >
                {isAutoScanning ? <><Square className="h-4 w-4" /> Stop Scan</> : <><Play className="h-4 w-4" /> Start Auto-Scan</>}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* SIDEBAR: Component Log */}
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

        {/* CENTER: Main Technical Viewer */}
        <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.15)] group bg-black flex items-center justify-center">
                {!imageLoaded && !imageError && (
                    <div className="flex flex-col items-center gap-4 text-primary font-cyber">
                        <Loader2 className="h-12 w-12 animate-spin" />
                        <span className="text-xs animate-pulse">Synchronizing Visual Core...</span>
                    </div>
                )}
                
                {imageError && (
                    <div className="flex flex-col items-center gap-4 text-destructive p-8 text-center">
                        <AlertCircle className="h-12 w-12" />
                        <p className="font-bold">System Unit image failed to load. Please try again.</p>
                        <Button variant="outline" size="sm" onClick={() => { setImageError(false); setImageLoaded(false); }}>
                            Retry Connection
                        </Button>
                    </div>
                )}

                {currentDisplayImage && !imageError && (
                    <Image
                        src={currentDisplayImage.imageUrl}
                        alt={currentDisplayImage.description}
                        fill
                        className={cn(
                            "object-cover transition-all duration-700",
                            isAutoScanning ? "scale-105" : "scale-100",
                            !imageLoaded ? "opacity-0" : "opacity-100",
                            selectedIndex !== null && "brightness-110"
                        )}
                        onLoadingComplete={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        data-ai-hint={currentDisplayImage.imageHint}
                        priority
                    />
                )}
                
                {/* Tactical HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
                
                {/* Interactive Hardware Nodes (Only in Overview) */}
                {imageLoaded && !imageError && selectedIndex === null && systemPartsData.map((part, index) => (
                    <button
                    key={part.id}
                    onClick={() => { setSelectedIndex(index); setIsAutoScanning(false); }}
                    className={cn(
                        "absolute transition-all duration-500 border-2 rounded-full flex items-center justify-center z-20 group/node",
                        'bg-black/40 border-primary/60 hover:border-primary hover:bg-primary/20 scale-100'
                    )}
                    style={{ 
                        top: part.position.top, 
                        left: part.position.left, 
                        width: '24px', 
                        height: '24px' 
                    }}
                    title={part.name}
                    >
                        <div className="absolute inset-0 rounded-full border border-white opacity-0 group-hover/node:animate-ping group-hover/node:opacity-40" />
                    </button>
                ))}

                {/* HUD Data Overlay */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 font-mono text-[10px] text-primary/70 pointer-events-none uppercase tracking-tighter">
                    <div className="flex gap-2"><span>ENTITY:</span> <span className="text-white">Full_Tower_Assembly</span></div>
                    <div className="flex gap-2"><span>MODE:</span> <span className="text-white">{selectedIndex === null ? 'Overview' : 'Component_Focus'}</span></div>
                    <div className="flex gap-2"><span>STATUS:</span> <span className="text-white">{isAutoScanning ? 'Auto_Scan_Active' : 'Idle'}</span></div>
                </div>

                {isAutoScanning && (
                    <div className="absolute bottom-0 left-0 w-full z-30">
                        <div className="h-1.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all" style={{ width: `${scanProgress}%` }} />
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: Educational Intelligence Panel */}
        <div className="lg:col-span-3 order-3">
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20 h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            {selectedPart ? (
                <>
                    <CardHeader className="border-b border-white/5 bg-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Technical Diagnostic</span>
                        <Activity className="h-3 w-3 text-primary animate-pulse" />
                    </div>
                    <CardTitle className="font-headline text-2xl text-primary leading-tight uppercase tracking-tighter">{selectedPart.name}</CardTitle>
                    </CardHeader>
                    <CardContent ref={detailPanelRef} className="flex-grow flex flex-col p-4 overflow-auto custom-scrollbar space-y-6">
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Info className="h-4 w-4 text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Definition</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90 bg-white/5 p-3 rounded-md border border-white/5">{selectedPart.definition}</p>
                    </div>

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
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
                    <LayoutGrid className="h-16 w-16 text-primary/20" />
                    <div>
                        <h3 className="font-headline text-xl uppercase tracking-widest text-primary">Overview Active</h3>
                        <p className="text-sm text-muted-foreground mt-2">Select a tactical node on the system unit to view specific hardware intelligence and installation protocols.</p>
                    </div>
                    <Button variant="cyber" className="w-full mt-4" onClick={() => setSelectedIndex(0)}>
                        Explore First Node
                    </Button>
                </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
