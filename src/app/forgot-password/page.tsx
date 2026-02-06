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
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code and new password
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [usernameForReset, setUsernameForReset] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();
    const { theme } = useTheme();

    const handleSendCode = async () => {
        setError(null);
        setIsLoading(true);
        // This is a simulation. In a real app, the code would be emailed, not returned.
        const result = await game.sendPasswordResetCode(usernameOrEmail);
        setIsLoading(false);

        if (result.success) {
            // Find the actual username to pass to the reset function later
            const account = game.accounts.find(acc => 
                acc.player.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
                (acc.player.email && acc.player.email.toLowerCase() === usernameOrEmail.toLowerCase())
            );
            if (account) {
                setUsernameForReset(account.player.username);
                setStep(2);
            } else {
                 setError("An unexpected error occurred retrieving user information.");
            }
        } else {
            setError(result.message);
        }
    };

    const handleResetPassword = async () => {
        setError(null);
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        const result = await game.resetPassword(usernameForReset, code, newPassword);
        setIsLoading(false);
        
        if (result.success) {
            toast({
                title: 'Password Reset Successful!',
                description: 'Please log in with your new password.',
            });
            router.push('/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
             <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm border border-primary/20">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-4xl font-bold text-primary">Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <CardDescription className="text-center">
                                Enter your username or verified email to receive a recovery code.
                            </CardDescription>
                            <div className="space-y-2">
                                <Label htmlFor="usernameOrEmail">Username or Email</Label>
                                <Input
                                    id="usernameOrEmail"
                                    placeholder="your_username or your.email@gmail.com"
                                    value={usernameOrEmail}
                                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
                            {theme === 'cyberpunk' ? (
                                <button onClick={handleSendCode} className="btn-futuristic w-full" disabled={isLoading || !usernameOrEmail.trim()}>
                                    {isLoading ? 'Sending...' : 'Send Recovery Code'}
                                </button>
                            ) : (
                                <Button onClick={handleSendCode} className="w-full" disabled={isLoading || !usernameOrEmail.trim()}>
                                    {isLoading ? 'Sending...' : 'Send Recovery Code'}
                                </Button>
                            )}
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                             <CardDescription className="text-center">
                                A code has been sent to the verified email for user <strong>{usernameForReset}</strong>.
                            </CardDescription>
                             <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    placeholder="6-digit code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
                             {theme === 'cyberpunk' ? (
                                <button onClick={handleResetPassword} className="btn-futuristic w-full" disabled={isLoading || !code.trim() || !newPassword.trim()}>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            ) : (
                                <Button onClick={handleResetPassword} className="w-full" disabled={isLoading || !code.trim() || !newPassword.trim()}>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            )}
                        </div>
                    )}
                    <div className="mt-6 text-center">
                         <Button variant="link" asChild className="text-muted-foreground">
                            <Link href="/login">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                            </Link>
                        </Button>
                    </div>
                </CardContent>
             </Card>
        </main>
    )
}
