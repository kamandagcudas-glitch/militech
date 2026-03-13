"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { systemPartsData } from '@/lib/system-parts-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Cpu, Play, Square, CheckCircle2, Info, Settings, BookOpen, Wrench, Activity, Loader2, AlertCircle, LayoutGrid, ImageOff } from 'lucide-react';
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
            <div className="animate-pulse text-primary font-cyber uppercase tracking-widest text-sm md:text-base">Initializing Neural Link...</div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
        <Breadcrumb className="mb-2">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/dashboard" className="text-xs md:text-sm">Dashboard</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage className="text-xs md:text-sm">System Diagnostic</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-primary/20 pb-4">
        <div>
            <h1 className="font-headline text-2xl md:text-4xl font-bold flex items-center gap-3">
                <Cpu className="text-primary animate-pulse shrink-0 h-6 w-6 md:h-8 md:w-8" /> 
                Hardware Diagnostic
            </h1>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm max-w-2xl">Full-Tower Diagnostic. Select hardware nodes or log entries to review operational logic and installation protocols.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <Button 
                variant="outline"
                onClick={() => { setSelectedIndex(null); setIsAutoScanning(false); }}
                className={cn("flex-1 lg:flex-none gap-2 h-9 text-[10px] md:text-xs", selectedIndex === null && "bg-primary/10 border-primary")}
            >
                <LayoutGrid className="h-4 w-4" /> Overview
            </Button>
            <Button 
                variant={isAutoScanning ? "destructive" : "cyber"} 
                onClick={() => setIsAutoScanning(!isAutoScanning)}
                className="flex-1 lg:flex-none gap-2 h-9 text-[10px] md:text-xs min-w-[120px] md:min-w-[140px]"
            >
                {isAutoScanning ? <><Square className="h-3 w-3" /> Stop Scan</> : <><Play className="h-3 w-3" /> Auto-Scan</>}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* SIDEBAR: Component Log */}
        <div className="lg:col-span-3 order-3 lg:order-1 h-[300px] lg:h-[600px]">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 h-full flex flex-col">
                <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-[10px] font-cyber uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> Component Manifest
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto custom-scrollbar p-2 space-y-1">
                    {systemPartsData.map((part, index) => {
                        const partImage = PlaceHolderImages.find(img => img.id === part.imageId);
                        return (
                            <button
                                key={part.id}
                                onClick={() => { setSelectedIndex(index); setIsAutoScanning(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded transition-all text-xs group",
                                    selectedIndex === index ? "bg-primary/20 text-white border-l-2 border-primary" : "hover:bg-white/5 text-muted-foreground"
                                )}
                            >
                                <div className="relative w-8 h-8 rounded border border-white/10 overflow-hidden bg-black shrink-0">
                                    {partImage ? (
                                        <Image src={partImage.imageUrl} alt="" fill className="object-cover opacity-80 group-hover:opacity-100" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full"><ImageOff className="h-3 w-3 opacity-20" /></div>
                                    )}
                                </div>
                                <div className="flex flex-col items-start overflow-hidden text-[10px] md:text-xs">
                                    <span className="font-bold truncate w-full text-left uppercase">{part.name.split(' (')[0]}</span>
                                    <span className="text-[8px] md:text-[9px] opacity-50 uppercase tracking-tighter">Status: {viewedParts.has(part.id) ? 'Logged' : 'Pending'}</span>
                                </div>
                                {viewedParts.has(part.id) && <CheckCircle2 className="h-2.5 w-2.5 text-green-500 ml-auto shrink-0" />}
                            </button>
                        );
                    })}
                </CardContent>
                <div className="p-3 border-t border-white/5 bg-black/20">
                    <div className="flex justify-between text-[8px] font-mono mb-1 text-muted-foreground uppercase tracking-widest">
                        <span>Sync Completion</span>
                        <span>{Math.round((viewedParts.size / systemPartsData.length) * 100)}%</span>
                    </div>
                    <Progress value={(viewedParts.size / systemPartsData.length) * 100} className="h-1" />
                </div>
            </Card>
        </div>

        {/* CENTER: Main Technical Viewer */}
        <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative w-full aspect-video md:aspect-[4/3] lg:aspect-video rounded-lg overflow-hidden border-2 border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.1)] group bg-black flex items-center justify-center">
                {!imageLoaded && !imageError && (
                    <div className="flex flex-col items-center gap-4 text-primary font-cyber">
                        <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest animate-pulse">Syncing Visual Core...</span>
                    </div>
                )}
                
                {imageError && (
                    <div className="flex flex-col items-center gap-4 text-destructive p-8 text-center">
                        <AlertCircle className="h-10 w-10" />
                        <p className="font-bold text-xs uppercase font-cyber">System Unit image failed to load. Please try again.</p>
                        <Button variant="outline" size="sm" onClick={() => { setImageError(false); setImageLoaded(false); }} className="h-8 text-[10px] uppercase">
                            Retry Link
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
                
                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-10 opacity-30" />
                
                {/* Hotspots */}
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
                        width: 'clamp(16px, 4vw, 24px)', 
                        height: 'clamp(16px, 4vw, 24px)' 
                    }}
                    title={part.name}
                    >
                        <div className="absolute inset-0 rounded-full border border-white opacity-0 group-hover/node:animate-ping group-hover/node:opacity-40" />
                    </button>
                ))}

                {/* Data HUD Layer */}
                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex flex-col gap-0.5 md:gap-1 font-mono text-[8px] md:text-[10px] text-primary/70 pointer-events-none uppercase tracking-tighter">
                    <div className="flex gap-2"><span>SUBJECT:</span> <span className="text-white">HARDWARE_ASSEMBLY</span></div>
                    <div className="flex gap-2"><span>INTERFACE:</span> <span className="text-white">{selectedIndex === null ? 'OVERVIEW' : 'CLOSE_UP'}</span></div>
                    <div className="flex gap-2"><span>LINK:</span> <span className={cn("font-bold", isAutoScanning ? "text-accent animate-pulse" : "text-white")}>{isAutoScanning ? 'AUTO_SCAN_ON' : 'MANUAL_IDLE'}</span></div>
                </div>

                {isAutoScanning && (
                    <div className="absolute bottom-0 left-0 w-full z-30">
                        <div className="h-1 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all" style={{ width: `${scanProgress}%` }} />
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: Intelligence Panel */}
        <div className="lg:col-span-3 order-2 lg:order-3">
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20 h-full flex flex-col overflow-hidden animate-in slide-in-from-right md:slide-in-from-bottom duration-500 max-h-[500px] lg:max-h-none">
            {selectedPart ? (
                <>
                    <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] md:text-[10px] font-mono text-primary uppercase tracking-widest">TECHNICAL_LOG</span>
                            <Activity className="h-3 w-3 text-primary animate-pulse" />
                        </div>
                        <CardTitle className="font-headline text-lg md:text-xl text-primary leading-tight uppercase tracking-tighter">{selectedPart.name}</CardTitle>
                    </CardHeader>
                    <CardContent ref={detailPanelRef} className="flex-grow p-4 overflow-auto custom-scrollbar space-y-5">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Info className="h-3 w-3 text-primary" />
                                <h3 className="text-[9px] font-bold uppercase tracking-widest">Description</h3>
                            </div>
                            <p className="text-[11px] md:text-xs leading-relaxed text-foreground/90 bg-white/5 p-2 rounded-md border border-white/5">{selectedPart.definition}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BookOpen className="h-3 w-3 text-accent" />
                                    <h3 className="text-[9px] font-bold uppercase tracking-widest">Core Function</h3>
                                </div>
                                <p className="text-[10px] italic text-muted-foreground">{selectedPart.purpose}</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Settings className="h-3 w-3 text-primary" />
                                    <h3 className="text-[9px] font-bold uppercase tracking-widest">Operational Logic</h3>
                                </div>
                                <p className="text-[10px] text-foreground/80 leading-relaxed">{selectedPart.howItWorks}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wrench className="h-3 w-3 text-yellow-500" />
                                <h3 className="text-[9px] font-bold uppercase tracking-widest">Installation Sequence</h3>
                            </div>
                            <div className="space-y-1.5">
                                {selectedPart.installation.map((step, i) => (
                                    <div key={i} className="flex gap-2 text-[10px] items-start group">
                                        <span className="font-mono text-primary bg-primary/10 w-4 h-4 flex items-center justify-center rounded shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">{i + 1}</span>
                                        <p className="pt-0.5 text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center bg-transparent">
                            <Button variant="outline" size="sm" onClick={() => { handlePrev(); setIsAutoScanning(false); }} className="h-8 w-8 p-0 border-primary/20">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-1 flex-wrap justify-center max-w-[100px]">
                                {systemPartsData.map((_, i) => (
                                    <div key={i} className={cn("h-1 rounded-full transition-all mb-1", i === selectedIndex ? "bg-primary w-4" : "bg-white/10 w-1")} />
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { handleNext(); setIsAutoScanning(false); }} className="h-8 w-8 p-0 border-primary/20">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4 min-h-[300px]">
                    <div className="bg-primary/5 p-6 rounded-full border border-primary/10 animate-pulse">
                        <LayoutGrid className="h-10 w-10 text-primary opacity-20" />
                    </div>
                    <div>
                        <h3 className="font-headline text-lg uppercase tracking-widest text-primary">Overview Active</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-2 leading-relaxed">Select hardware nodes on the visual interface or entries in the manifest to view technical logic and protocols.</p>
                    </div>
                    <Button variant="cyber" className="w-full mt-4 h-10 text-xs uppercase tracking-widest font-cyber" onClick={() => setSelectedIndex(0)}>
                        Initiate First Node
                    </Button>
                </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
