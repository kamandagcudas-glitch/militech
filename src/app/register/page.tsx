"use client";

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GameContext, GameContextType } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();

    const handleRegister = async () => {
        setError(null);

        if (!username.trim()) {
            setError('Callsign cannot be empty.');
            return;
        }
        if (!displayName.trim()) {
            setError('Display Name cannot be empty.');
            return;
        }
        if (displayName.trim().length > 20) {
            setError('Display Name cannot be more than 20 characters.');
            return;
        }
        if (!/^[a-zA-Z0-9_ ]+$/.test(displayName.trim())) {
            setError('Display Name can only contain letters, numbers, spaces, and underscores.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        const result = await game.register(username, displayName, email, password);

        if (result.success) {
            toast({
                title: 'Registration Successful!',
                description: 'Please log in with your new credentials.',
            });
            router.push('/login');
        } else {
            setError(result.message);
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

    const isButtonDisabled = !username.trim() || !displayName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm border border-primary/20">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-4xl font-bold text-primary">Create Account</CardTitle>
                    <CardDescription>Register your Agent ID to begin training.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button variant="cyber" className="w-full h-12 text-lg" onClick={handleGoogleLogin}>
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	l6.19,5.238C44.982,36.26,48,30.7,48,24C48,22.885,47.92,21.795,47.802,20.714C47.781,20.519,47.755,20.328,47.724,20.141	L47.701,20.083L43.611,20.083z"/></svg>
                            Sign up with Google
                        </Button>
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or with email
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Callsign (Unique)</Label>
                                <Input
                                    id="username"
                                    placeholder="e.g. Agent007"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    placeholder="Your public name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Used for login and recovery"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}

                        <Button 
                            variant="cyber"
                            onClick={handleRegister} 
                            className="w-full h-14" 
                            disabled={isButtonDisabled}
                        >
                            Register
                        </Button>
                    </div>
                     <div className="mt-4 text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Login Here
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
