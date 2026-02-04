"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GameContext, GameContextType } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { GamepadIcon } from "@/components/icons";
import { Loader2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
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
      <div className="flex items-center gap-4 mb-4">
        <GamepadIcon className="size-16 text-primary" />
        <h1 className="font-headline text-7xl font-bold text-primary">IT MAZING</h1>
      </div>
      <p className="max-w-2xl text-xl text-muted-foreground mb-8">
        An immersive, gamified learning experience designed to forge the next generation of IT professionals. Enter the simulation, complete missions, and prove your mastery.
      </p>
      <Link href="/login">
        <Button size="lg" className="text-xl h-14 px-10">
          Enter Simulation <ArrowRight className="ml-2" />
        </Button>
      </Link>
    </main>
  );
}
