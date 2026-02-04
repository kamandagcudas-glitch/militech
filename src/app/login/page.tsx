"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameContext, GameContextType } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;

  useEffect(() => {
    if (game.player) {
      router.replace("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [game.player, router]);

  const handleLogin = () => {
    if (username.trim()) {
      game.login(username.trim());
    }
  };

  if (isLoading || game.player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
       <Link href="/" className="absolute top-8 left-8 text-sm hover:text-primary">&larr; Back to Home</Link>
      <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl font-bold text-primary">
            Agent ID
          </CardTitle>
          <CardDescription>
            Enter your callsign to begin your training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              id="username"
              placeholder="Enter your callsign"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-12 text-center text-lg"
            />
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-lg font-bold"
              disabled={!username.trim()}
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
