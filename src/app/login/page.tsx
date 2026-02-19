
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
  
  const handleGoogleLogin = async () => {
    const result = await game.signInWithGoogle();
    if (!result.success) {
       if (result.message === 'Sign-in cancelled by user.') {
          // Don't show an error toast if the user cancelled
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 text-sm text-muted-foreground hover:text-primary">&larr; Back to Home</Link>
      <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm border border-primary/20">
        <CardHeader className="text-center flex flex-col items-center gap-4">
          <Image 
            src="/miltechs.png" 
            alt="MI-LITECH Logo" 
            width={80} 
            height={80} 
            className="rounded-lg shadow-2xl shadow-primary/20"
          />
          <div>
            <CardTitle className="font-headline text-4xl font-bold text-primary">
              Agent Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to continue your mission.
            </CardDescription>
          </div>
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
           <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                  </span>
              </div>
          </div>
          <Button variant="outline" className="w-full h-12 text-lg" onClick={handleGoogleLogin}>
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	l6.19,5.238C44.982,36.26,48,30.7,48,24C48,22.885,47.92,21.795,47.802,20.714C47.781,20.519,47.755,20.328,47.724,20.141	L47.701,20.083L43.611,20.083z"/></svg>
              Sign in with Google
          </Button>
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
