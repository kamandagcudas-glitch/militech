"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameContext, GameContextType } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const { toast } = useToast();

  useEffect(() => {
    // If the user is already logged in, redirect to the dashboard.
    // The loading state handles the initial check.
    if (game.currentUser) {
      router.replace("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [game.currentUser, router]);

  const handleLogin = async () => {
    if (username.trim() && password.trim()) {
      const success = await game.login(username.trim(), password.trim());
      if (!success) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password.",
        });
      }
    }
  };

  // While checking for an existing session, show a loader.
  if (isLoading || game.currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 text-sm text-primary-foreground/50 hover:text-primary">&larr; Back to Home</Link>
      <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm border border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl font-bold text-primary">
            Agent Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to continue your mission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Callsign</Label>
              <Input
                id="username"
                placeholder="Enter your callsign"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-lg font-bold"
              disabled={!username.trim() || !password.trim()}
            >
              Access Terminal
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Register Here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
