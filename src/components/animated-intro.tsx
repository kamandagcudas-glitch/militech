
"use client";

import { useState, useEffect, SVGProps } from 'react';
import { cn } from '@/lib/utils';

const AnimatedDragonLogo = ({ className, onAnimationEnd, ...props }: SVGProps<SVGSVGElement> & { onAnimationEnd?: () => void }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a short delay to ensure styles are loaded
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const dragonPath = "M49.36,19.34C44,15.4,37.33,12,30.2,12c-5.49,0-10.43,1.69-14.4,4.52c-0.65,0.47-1.12,1.38-1.12,2.15v2.83c0,0.73,0.38,1.4,0.96,1.83c3.55,2.6,7.83,4.17,12.56,4.17c3.9,0,7.43-0.93,10.4-2.52c0.23-0.12,0.47-0.24,0.7-0.37c2.31-1.28,3.7-3.76,3.7-6.52V21.4C50.48,20.61,49.98,19.78,49.36,19.34z M30.2,28c-3.72,0-6.9-1.33-9.08-3.15c1.47-1.39,3.58-2.85,6.58-2.85c2,0,3.64,0.59,4.8,1.48C31.58,24.08,30.9,28,30.2,28z M69.8,12c-7.13,0-13.8,3.4-19.16,7.34c-0.62,0.45-1.12,1.28-1.12,2.06v1.94c0,2.76,1.39,5.24,3.7,6.52c0.23,0.13,0.47,0.25,0.7,0.37c2.97,1.59,6.5,2.52,10.4,2.52c4.73,0,9.01-1.57,12.56-4.17c0.58-0.43,0.96-1.1,0.96-1.83v-2.83c0-0.77-0.47-1.68-1.12-2.15C80.23,13.69,75.29,12,69.8,12z M69.8,28c-0.7,0-1.38-3.92-2.3-4.52c1.16-0.89,2.8-1.48,4.8-1.48c3,0,5.11,1.46,6.58,2.85C76.7,26.67,73.52,28,69.8,28z M85.28,38.83c-2.31-1.66-5.06-2.9-8.13-3.66c0.12-0.34,0.19-0.7,0.19-1.06c0-2-1.34-3.68-3.21-4.38c-0.41,1.06-1.01,2.05-1.78,2.91c0.4,0.22,0.76,0.5,1.08,0.83c0.75,0.75,1.22,1.76,1.22,2.91c0,2.21-1.79,4-4,4s-4-1.79-4-4c0-1.15,0.47-2.16,1.22-2.91c0.32-0.33,0.68-0.61,1.08-0.83c-0.77-0.86-1.37-1.85-1.78-2.91c-1.87,0.7-3.21,2.38-3.21,4.38c0,0.36,0.07,0.72,0.19,1.06c-3.07,0.76-5.82,2-8.13,3.66c-1.02,0.73-1.63,1.89-1.63,3.15c0,2.15,1.7,3.9,3.81,4.08c-0.1,0.48-0.15,0.97-0.15,1.48c0,4.86,2.95,9.08,7.1,10.74c0.55,0.22,1.13,0.34,1.75,0.34h10c0.62,0,1.2-0.12,1.75-0.34c4.15-1.66,7.1-5.88,7.1-10.74c0-0.51-0.05-1-0.15-1.48c2.11-0.18,3.81-1.92,3.81-4.08C86.91,40.72,86.3,39.56,85.28,38.83z M59.8,54.54c-1.2,0.34-2.5,0.51-3.87,0.51h-0.03c-2.58,0-5.01-0.57-7.14-1.57c-0.5-0.23-1.12-0.1-1.49,0.32c-0.37,0.42-0.46,1.02-0.24,1.52c2.6,5.92,8.42,10.19,15.2,10.19s12.6-4.27,15.2-10.19c0.22-0.5,0.13-1.1-0.24-1.52c-0.37-0.42-0.99-0.55-1.49-0.32c-2.13,1-4.56,1.57-7.14,1.57h-0.03C62.3,55.05,61,54.88,59.8,54.54z";

  return (
    <div className={cn("relative w-64 h-64", className)} {...props}>
      <style>
        {`
          .dragon-logo-animated-path {
            stroke: hsl(var(--primary));
            stroke-width: 0.5;
            fill: transparent;
            stroke-dasharray: 1600;
            stroke-dashoffset: 1600;
            animation: draw-dragon 3s ease-out forwards;
          }
          .dragon-logo-animated-fill {
              fill: hsl(var(--primary));
              opacity: 0;
              animation: fill-dragon 1.5s ease-in forwards 2.5s;
          }

          @keyframes draw-dragon {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes fill-dragon {
            to {
              opacity: 0.15;
            }
          }
        `}
      </style>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        <path
          className={isAnimating ? "dragon-logo-animated-fill" : ""}
          d={dragonPath}
        />
        <path
          className={isAnimating ? "dragon-logo-animated-path" : ""}
          d={dragonPath}
          onAnimationEnd={onAnimationEnd}
        />
      </svg>
    </div>
  );
};


/**
 * AnimatedIntro Component
 * Orchestrates the entire intro sequence, from the logo animation to the subtitle reveal,
 * and finally triggers the transition to the next screen.
 */
export const AnimatedIntro = ({ onFinished }: { onFinished: () => void }) => {
    const [logoAnimationFinished, setLogoAnimationFinished] = useState(false);
    const [showSubtitle, setShowSubtitle] = useState(false);

    // This effect controls the subtitle reveal and the final transition.
    useEffect(() => {
        if (logoAnimationFinished) {
            // Show subtitle shortly after logo finishes drawing
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
    }, [logoAnimationFinished, onFinished]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[400px]">
            <AnimatedDragonLogo onAnimationEnd={() => setLogoAnimationFinished(true)} />
            
            <div className="h-24 mt-4">
                 <p className={cn(
                    "max-w-2xl text-xl text-accent mb-8 font-code transition-opacity duration-1000",
                    showSubtitle ? "opacity-100" : "opacity-0"
                )}>
                    Do you have what it takes?
                </p>
            </div>
        </div>
    );
};
