"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GamepadIcon } from '@/components/icons';

const GLITCH_CHARS = '█▓▒░>_#';

const GlitchTitle = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        let interval: NodeJS.Timeout;

        const animate = () => {
            interval = setInterval(() => {
                if (currentIndex >= text.length) {
                    clearInterval(interval);
                    setDisplayText(text);
                    setTimeout(onComplete, 200);
                    return;
                }

                let glitchedText = text.substring(0, currentIndex + 1);
                for (let i = currentIndex + 1; i < text.length; i++) {
                    glitchedText += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }
                setDisplayText(glitchedText);
                
                if (Math.random() > 0.8) {
                     currentIndex++;
                }
                currentIndex++;

            }, 80);
        };
        
        const timeout = setTimeout(animate, 500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        }
    }, [text, onComplete]);
    
    return (
        <h1 className="font-headline text-7xl font-bold text-primary tracking-widest uppercase relative" style={{ textShadow: '0 0 8px hsl(var(--primary) / 0.7)'}}>
            <span className="absolute -inset-1 animate-text-glitch text-cyan-400/50 mix-blend-screen" aria-hidden="true">{displayText}</span>
            {displayText}
            <span className="absolute -inset-1 animate-text-glitch text-red-500/50 mix-blend-screen -skew-x-12" aria-hidden="true">{displayText}</span>
        </h1>
    );
};


const TypewriterText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let currentIndex = -1;
        const interval = setInterval(() => {
            if (currentIndex >= text.length -1) {
                clearInterval(interval);
                setTimeout(onComplete, 200);
                return;
            }
            currentIndex++;
            setDisplayText(prev => prev + text[currentIndex]);
        }, 30);

        return () => clearInterval(interval);
    }, [text, onComplete]);

    return (
        <p className="max-w-2xl text-xl text-muted-foreground mb-8 font-code">
            {displayText}
            <span className="inline-block w-3 h-6 bg-accent animate-caret-blink" />
        </p>
    );
};


export const AnimatedIntro = ({ onFinished }: { onFinished: () => void }) => {
    const [step, setStep] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[400px]">
             <div className={cn("flex items-center gap-4 mb-4 transition-opacity duration-500", step >= 0 ? 'opacity-100' : 'opacity-0')}>
                <GamepadIcon className="size-16 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }} />
                {<GlitchTitle text="IT MAZING" onComplete={() => setStep(1)} />}
            </div>
            <div className="h-24">
                {step >= 1 && <TypewriterText text="An immersive, gamified learning experience designed to forge the next generation of IT professionals. Enter the simulation, complete missions, and prove your mastery." onComplete={() => onFinished()} />}
            </div>
        </div>
    );
};
