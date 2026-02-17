
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
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isClientLoading, setIsClientLoading] = useState(true);
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (game.currentUser && !game.isUserLoading) {
      router.replace("/dashboard");
    } else if (!game.isUserLoading) {
      setIsClientLoading(false);
    }
  }, [game.currentUser, game.isUserLoading, router]);

  const handleLogin = async () => {
    if (email.trim() && password.trim()) {
      const result = await game.login(email.trim(), password.trim());
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message || "Invalid email or password.",
        });
      }
    }
  };

  if (isClientLoading || game.isUserLoading || game.currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 text-sm text-muted-foreground hover:text-primary">&larr; Back to Home</Link>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            {theme === 'cyberpunk' ? (
                <button
                    onClick={handleLogin}
                    className="btn-futuristic w-full"
                    disabled={!email.trim() || !password.trim()}
                >
                    Access Terminal
                </button>
            ) : (
                <Button
                    onClick={handleLogin}
                    className="w-full h-12 text-lg font-bold"
                    disabled={!email.trim() || !password.trim()}
                >
                    Access Terminal
                </Button>
            )}
          </div>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              <Link href="/forgot-password" className="underline hover:text-primary">
                Forgot Password?
              </Link>
            </p>
            <p className="text-muted-foreground mt-2">
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
