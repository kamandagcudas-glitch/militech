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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const router = useRouter();
    const game = useContext(GameContext) as GameContextType;
    const { toast } = useToast();

    const handleSendCode = async () => {
        setError(null);
        setIsLoading(true);
        const result = await game.sendPasswordResetCode(email);
        setIsLoading(false);

        if (result.success) {
            setEmailSent(true);
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
                    {emailSent ? (
                        <div className="space-y-4 text-center">
                             <CardDescription>
                                A password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
                            </CardDescription>
                            <Button onClick={() => router.push('/login')} className="w-full">
                                Back to Login
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <CardDescription className="text-center">
                                Enter your account's email address and we will send you a password reset link.
                            </CardDescription>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
                            <Button variant="cyber" onClick={handleSendCode} className="w-full h-12" disabled={isLoading || !email.trim()}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
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
