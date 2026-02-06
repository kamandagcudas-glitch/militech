"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import AnimatedGlitchText from './animated-glitch-text';

/**
 * AnimatedIntro Component
 * Orchestrates the entire intro sequence, focusing on the glitchy text reveal.
 */
export const AnimatedIntro = ({ onFinished }: { onFinished: () => void }) => {
    const [textAnimationFinished, setTextAnimationFinished] = useState(false);
    const [showSubtitle, setShowSubtitle] = useState(false);

    // This effect controls the subtitle reveal and the final transition.
    useEffect(() => {
        if (textAnimationFinished) {
            // Show subtitle shortly after the text animation finishes
            const subtitleTimer = setTimeout(() => {
                setShowSubtitle(true);
            }, 300);

            // Wait for the subtitle to be visible, then call onFinished
            const finalTimer = setTimeout(onFinished, 2000);
            
            return () => {
                clearTimeout(subtitleTimer);
                clearTimeout(finalTimer);
            };
        }
    }, [textAnimationFinished, onFinished]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[400px]">
            <AnimatedGlitchText
                text="MI-LITECH"
                className="font-headline text-6xl md:text-8xl text-primary"
                onAnimationEnd={() => setTextAnimationFinished(true)}
            />
            
            <div className="h-24 mt-4">
                 <p className={cn(
                    "max-w-2xl text-xl text-accent mb-8 font-headline transition-opacity duration-1000",
                    showSubtitle ? "opacity-100" : "opacity-0"
                )}>
                    Do you have what it takes?
                </p>
            </div>
        </div>
    );
};
