
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Define the characters used for the glitch effect
const GLITCH_CHARS = '█▓▒░>_#';

/**
 * GlitchTitle Component
 * Animates a title with a glitch effect, revealing it character by character.
 * It uses multiple text layers with different colors and blend modes to create a CRT/hologram look.
 */
const GlitchTitle = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        let interval: NodeJS.Timeout;

        // Animation logic to reveal the text with a glitchy, stuttering effect
        const animate = () => {
            interval = setInterval(() => {
                if (currentIndex >= text.length) {
                    clearInterval(interval);
                    setDisplayText(text);
                    setTimeout(onComplete, 200); // Signal completion after a short delay
                    return;
                }

                // Build the string with the revealed part and a glitched trail
                let glitchedText = text.substring(0, currentIndex + 1);
                for (let i = currentIndex + 1; i < text.length; i++) {
                    glitchedText += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }
                setDisplayText(glitchedText);
                
                // Randomly stutter the character reveal for a more organic feel
                if (Math.random() > 0.8) {
                     currentIndex++;
                }
                currentIndex++;

            }, 80);
        };
        
        // Start animation after a brief delay
        const timeout = setTimeout(animate, 500);

        // Cleanup function to clear intervals and timeouts on unmount
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        }
    }, [text, onComplete]);
    
    return (
        // The title uses a relative container with multiple absolute-positioned spans for the glitch effect
        <h1 className="font-headline text-7xl font-bold text-primary tracking-widest uppercase relative" style={{ textShadow: '0 0 8px hsl(var(--primary) / 0.7)'}}>
            {/* Accent glitch layer */}
            <span className="absolute -inset-1 animate-text-glitch text-accent/50 mix-blend-screen" aria-hidden="true">{displayText}</span>
            {/* Main text layer */}
            {displayText}
            {/* Destructive glitch layer, slightly skewed */}
            <span className="absolute -inset-1 animate-text-glitch text-destructive/50 mix-blend-screen -skew-x-12" aria-hidden="true">{displayText}</span>
        </h1>
    );
};

/**
 * Subtitle Component
 * A simple component to display the subtitle text with a fade-in animation.
 */
const Subtitle = ({ text, visible }: { text: string; visible: boolean }) => {
    return (
        <p className={cn(
            "max-w-2xl text-xl text-accent mb-8 font-code transition-opacity duration-1000",
            visible ? "opacity-100" : "opacity-0" // Control visibility via opacity
        )}>
            {text}
        </p>
    );
}

/**
 * AnimatedIntro Component
 * Orchestrates the entire intro sequence, from the title animation to the subtitle reveal,
 * and finally triggers the transition to the next screen.
 */
export const AnimatedIntro = ({ onFinished }: { onFinished: () => void }) => {
    const [step, setStep] = useState(0);

    // This effect controls the final transition after the animation sequence completes.
    useEffect(() => {
        // When the title animation is complete, step becomes 1.
        if (step === 1) {
            // Wait for the subtitle to fade in and remain visible for a moment before transitioning.
            const timer = setTimeout(onFinished, 2500);
            return () => clearTimeout(timer);
        }
    }, [step, onFinished]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[400px]">
            {/* Step 0: Render the main title. onComplete will advance the sequence to step 1. */}
            <GlitchTitle text="MI-LITECH" onComplete={() => setStep(1)} />
            
            <div className="h-24 mt-4">
                {/* Step 1: Once the title is done, render the subtitle, which will start its fade-in animation. */}
                <Subtitle text="Do you have what it takes?" visible={step >= 1} />
            </div>
        </div>
    );
};
