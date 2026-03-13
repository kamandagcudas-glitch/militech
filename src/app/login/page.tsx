
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameContext, GameContextType } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isClientLoading, setIsClientLoading] = useState(true);
  const router = useRouter();
  const game = useContext(GameContext) as GameContextType;
  const { toast } = useToast();

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
  
  const handleGoogleLogin = async () => {
    const result = await game.signInWithGoogle();
    if (!result.success) {
       if (result.message === 'Sign-in cancelled by user.') {
          return;
      }
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: result.message || "Could not sign in with Google.",
      });
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-6 lg:p-8 bg-background relative overflow-hidden">
      {/* Decorative background scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0" />
      
      <Link href="/" className="absolute top-4 left-4 md:top-8 md:left-8 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 z-10">&larr; Back to Home</Link>
      
      <Card className="w-full max-w-[95vw] sm:max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm border border-primary/20 z-10 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center flex flex-col items-center gap-4 pb-4">
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 shadow-inner">
            <Image 
              src="/militechs.png" 
              alt="MI-LITECH Logo" 
              width={64} 
              height={64} 
              className="rounded shadow-2xl"
            />
          </div>
          <div>
            <CardTitle className="font-headline text-3xl md:text-4xl font-bold text-primary uppercase tracking-tighter">
              Agent Login
            </CardTitle>
            <CardDescription className="text-xs md:text-sm uppercase tracking-widest font-mono mt-1 opacity-70">
              Access Neural Terminal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] md:text-xs uppercase tracking-widest font-mono text-muted-foreground">Email Identifier</Label>
              <Input
                id="email"
                type="email"
                placeholder="agent.id@militech.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-background/50 h-11 text-sm border-primary/10 focus:border-primary/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Access Key" className="text-[10px] md:text-xs uppercase tracking-widest font-mono text-muted-foreground">Access Key</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-background/50 h-11 text-sm border-primary/10 focus:border-primary/40"
              />
            </div>
            <Button
                variant="cyber"
                onClick={handleLogin}
                className="w-full h-12 md:h-14 uppercase font-cyber tracking-[0.2em] text-sm"
                disabled={!email.trim() || !password.trim()}
            >
                Initialize
            </Button>
          </div>
           <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                  <span className="bg-card px-2 text-muted-foreground">
                      Neural SSO
                  </span>
              </div>
          </div>
          <Button variant="outline" className="w-full h-11 text-xs md:text-sm uppercase tracking-widest font-mono border-primary/10 hover:bg-primary/5" onClick={handleGoogleLogin}>
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	l6.19,5.238C44.982,36.26,48,30.7,48,24C48,22.885,47.92,21.795,47.802,20.714C47.781,20.519,47.755,20.328,47.724,20.141	L47.701,20.083L43.611,20.083z"/></svg>
              Google Link
          </Button>
          <div className="text-center space-y-2 mt-4">
            <p>
              <Link href="/forgot-password" title="Recover Access" className="text-[10px] md:text-xs uppercase tracking-widest font-mono text-muted-foreground hover:text-primary transition-colors">
                Lost Credentials?
              </Link>
            </p>
            <p className="text-[10px] md:text-xs uppercase tracking-widest font-mono text-muted-foreground">
              New Recruit?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Join Simulation
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
