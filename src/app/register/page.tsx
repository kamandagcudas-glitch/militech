
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
import { useTheme } from '@/context/ThemeContext';

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
    const { theme } = useTheme();

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
        if (!email || !/^[^\s@]+@gmail\.com$/i.test(email)) {
            setError('Please enter a valid Gmail address.');
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
                            <Label htmlFor="email">Email (Gmail only)</Label>
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

                        {theme === 'cyberpunk' ? (
                            <button onClick={handleRegister} className="btn-futuristic w-full" disabled={isButtonDisabled}>
                                Register
                            </button>
                        ) : (
                            <Button onClick={handleRegister} className="w-full h-12 text-lg font-bold" disabled={isButtonDisabled}>
                                Register
                            </Button>
                        )}
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
