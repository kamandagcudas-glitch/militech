"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Define the characters used for the glitch effect - purely technical symbols, no emojis.
const GLITCH_CHARS = '█▓▒░>_#';

/**
 * AnimatedGlitchText Component
 * Animates a text with a glitch effect, revealing it character by character.
 */
const AnimatedGlitchText = ({ text, className, onAnimationEnd }: { text: string; className?: string; onAnimationEnd?: () => void; }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex >= text.length) {
                clearInterval(intervalId);
                setDisplayText(text);
                onAnimationEnd?.(); // Signal that the animation has finished.
                return;
            }

            // Build the string with the revealed part and a glitched trail
            let glitchedText = text.substring(0, currentIndex + 1);
            for (let i = currentIndex + 1; i < text.length; i++) {
                glitchedText += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            }
            setDisplayText(glitchedText);
            
            currentIndex++;
        }, 50); // Controls the speed of the animation

        return () => clearInterval(intervalId);
    }, [text, onAnimationEnd]);
    
    // The container is relative to position the glitch effect layers absolutely within it.
    return (
        <span className={cn("relative inline-block", className)} style={{ textShadow: '0 0 5px hsl(var(--primary) / 0.5)'}}>
            {/* The actual text content */}
            {displayText}
            {/* The glitch effect layers. These are only visible during the animation. */}
            {displayText !== text && (
                <>
                    <span className="absolute left-0 top-0 w-full h-full animate-text-glitch text-accent/50 mix-blend-screen" aria-hidden="true">{displayText}</span>
                    <span className="absolute left-0 top-0 w-full h-full animate-text-glitch text-destructive/50 mix-blend-screen -skew-x-12" aria-hidden="true">{displayText}</span>
                </>
            )}
        </span>
    );
};

export default AnimatedGlitchText;