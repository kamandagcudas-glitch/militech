"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GameContext, GameContextType } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { AnimatedIntro } from "@/components/animated-intro";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;

  useEffect(() => {
    if (game.currentUser) {
      router.replace("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [game.currentUser, router]);

  if (isLoading || game.currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <AnimatedIntro onFinished={() => setIntroFinished(true)} />
      
      <div className={cn("transition-opacity duration-1000 mt-8", introFinished ? "opacity-100" : "opacity-0")}>
        <Button asChild variant="cyber" size="lg" className="text-xl h-14 px-12">
            <Link href="/login">
                Enter Simulation <ArrowRight className="ml-2" />
            </Link>
        </Button>
      </div>
    </main>
  );
}
