
"use client";

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { pcBuildsData } from '@/lib/pc-builds-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { PcPartCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, WifiOff, Cpu, MemoryStick, HardDrive, Tv, Power, Case, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import useLocalStorage from '@/hooks/use-local-storage';

const categoryIcons: Record<PcPartCategory, React.ReactNode> = {
    CPU: <Cpu className="h-5 w-5" />,
    GPU: <Tv className="h-5 w-5" />,
    RAM: <MemoryStick className="h-5 w-5" />,
    Storage: <HardDrive className="h-5 w-5" />,
    Motherboard: <Cpu className="h-5 w-5" />,
    'Power Supply': <Power className="h-5 w-5" />,
    Case: <Case className="h-5 w-5" />,
};

export default function PcBuilderPage() {
  const [activeBuildId, setActiveBuildId] = useLocalStorage('pc_builder_active_build', 'gaming');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined') {
        setIsOffline(!navigator.onLine);
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeBuild = useMemo(() => pcBuildsData.find(b => b.id === activeBuildId), [activeBuildId]);
  const totalCost = useMemo(() => {
    if (!activeBuild) return 0;
    return Object.values(activeBuild.parts).reduce((sum, part) => sum + part.price, 0);
  }, [activeBuild]);

  if (!activeBuild) {
    return <div>Build not found.</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-headline text-4xl font-bold mb-4 flex items-center gap-3"><Wrench /> PC Builder Suggestions</h1>
      <p className="text-muted-foreground mb-8">Choose a purpose to see our recommended PC builds. All parts are selected for compatibility and performance.</p>

      {isOffline && (
        <Alert variant="destructive" className="mb-6">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You are offline!</AlertTitle>
            <AlertDescription>
                Component images may not load correctly while you are offline.
            </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeBuildId} onValueChange={setActiveBuildId} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {pcBuildsData.map(build => (
            <TabsTrigger key={build.id} value={build.id}>{build.name}</TabsTrigger>
          ))}
        </TabsList>
        
        {pcBuildsData.map(build => (
          <TabsContent key={build.id} value={build.id}>
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{build.name} Build</CardTitle>
                    <CardDescription>{build.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Object.entries(build.parts).map(([category, part]) => {
                            const image = PlaceHolderImages.find(img => img.id === part.imageId);
                            return (
                                <Card key={part.name} className="flex flex-col transition-all duration-300 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl font-semibold">{part.name}</CardTitle>
                                            <Badge variant="secondary" className="flex items-center gap-2">
                                                {categoryIcons[category as PcPartCategory]}
                                                {category}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col gap-4">
                                        {image && (
                                            <div className="relative aspect-video rounded-md overflow-hidden border">
                                                <Image 
                                                    src={image.imageUrl} 
                                                    alt={part.name} 
                                                    fill 
                                                    style={{ objectFit: 'cover' }} 
                                                    data-ai-hint={image.imageHint}
                                                />
                                            </div>
                                        )}
                                        <p className="text-muted-foreground text-sm flex-grow">{part.description}</p>
                                        <p className="text-lg font-bold text-primary text-right">${part.price.toFixed(2)}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex justify-end items-center gap-4">
                             <h3 className="font-headline text-2xl font-bold flex items-center gap-2">
                                <DollarSign/> Total Estimated Price:
                            </h3>
                            <p className="text-3xl font-bold font-mono text-primary">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
