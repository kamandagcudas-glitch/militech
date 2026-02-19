
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const PIXEL_PERSON_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAABX1BMVEXl3svoqF7////l38l5VjhJKRQ6RGfnZmt/SB+mJSlTboHnqGWkJSztrGDp49Gjc0OpiW7my8rlvrB7QRRIIwBPLxjJl4yhFCCgAAzHMjTlPj7nXGDnXWQrN2HobXOopaM9SmpheYe5t65HWnRKZ32lq6i9sp/aeC/iO0I+EwDlT1V4Tyr/ACzlpnFhPybppVfmzqsjMVs8IQvhs47ZcyPgjkb7NjjquIHZdzjX2d/cg0eZmJyYbULYnFU0GQd/WC14OwDsjVfWyLNFRV1uTC/iw6QvFADvfU/zaEzcjVbnsqjjZFukAACrJCGSLDbPmXKde228ppCcZyvczrirn48xAAA6DwA/GQCejny1g07MvaTBi1DabQsnCgDqoFznxp3QZybmpIbCOD6wOzDGQjjiS0HecVLCVS/ZelbBU2LDrrOOGye6XT/Tm3LEpIyOdG5/gYx1anE4OFZQV2hxKwDzF+k4AAADoUlEQVR4nO3d61cbRRiA8Y1tCEnIhkJTGi5FCxqgktolSNQQaCBUakEwxaZoobXSeulFrf//cd7dSbNrSvUL5Jx9n98nMvtl9jkzkxzYQxwHAAAAAAAAAAAAAAAAAAAAQGy479fv6Z0H9/785V4P1vKB71r9nuA5cO8/SPbyaJBM0qC7DvKtC4F+z/PstFqt9uVCr6SaBm77YP778sVTSYPDuDeQfUAD3Q0awVmguIH7ycF89CzYjLwx+FdqtVq8G8wno/vgHQ1klAbKGlz0wp+RFDbYNG6EdS7cUNNA9kEhF/ZQZYNyLtGls4FXiDbYVHUe2LNgLdLgh5qlokHZ3wdGIqxzLtz8TE+DxClooKZB3av7DXLhDdF5Ef8GyUIhWVs1zN2uFsrlcs1GyOXNi4c5FQ3Me2Le3vbqlud5a28bmBd5fQ3q8qvUboOkggYHdd+jmtoGTrNSrVaXg6NAb4NSqbQcehekAQ20NvixUqlEGjzyvHr388GWtxX7Bv5zB0uVUrdDz+fERDabTcS6gSENIvvhX3Q3yHUbOLFO8I4GR7eto26DeOttcOdT6+usBJAzsd+TPGP/0SBBAz0NKuobbG9vH9205JZvf27dkfNgZWUlG/cG/gcl2Q++bJgsgWM1z2i+p0G/53ZeTm+Q07EOWiMjjSePA9UVa3E7sPzkrhH3ZzTdK1fHxsaGjLm5uYUPrEv3zGBxfHx8YnJycmKk35M8Y+4VP8DQUDrS4Go6nfYbpFKpSRrQQE2DdLFY/GlhYWFCcYOirIFrqdQ17Q1SNKABDWhAAxrQwKGBoAENBA1oIGhAA0EDabDz9OnPJycnvQ1k9BsR+wZL1cCzSIN7Ozs7z+2VSrPfkzxj/6NBiQbVx3FvcGHpy8AvvxpfWL/9vru7+8Jeqca9gdNcDHw7NTAwcMuSn6f27JXFuP+tLdogjAYqG7z0139HpEHsn0NpNZvNV6/39l7PGF9Zf0iEP9vt9qvjZvM49uvAcKdvDUx9mMlkPur8h7Tr0mBmdnb24/g/gBFwp80tBw3sSNAgk6EBDWhAAxrQQNCABoIGNBA0oIGgAQ0EDWggaEADobHBXxsbG9Kg1Wg05Deo12XgTSbzZlpG+j2/8+Dur48G1o1h13EPwwN/HypYDO7+6OBbo0GD7sDgOg20NOgsfVn9kb3gj2ho4BwOh+ybO26EB4ZVHIpOz9fwqPteHgAAAAAAAAAAAAAAAAAAAAAAoMs/eQI+i/VZsPcAAAAASUVORK5CYII=";

interface Runner {
  id: number;
  top: string;
  duration: string;
  delay: string;
  size: string;
  opacity: number;
}

const RunningPixelBackground = () => {
  const [runners, setRunners] = useState<Runner[]>([]);
  const runnerCount = 12;

  useEffect(() => {
    // Generate runners on the client only to avoid hydration mismatch
    const newRunners = Array.from({ length: runnerCount }).map((_, i) => ({
      id: i,
      top: `${10 + Math.random() * 80}%`, // Random height between 10% and 90%
      duration: `${15 + Math.random() * 25}s`, // Speed variant
      delay: `-${Math.random() * 30}s`, // Random start position
      size: `${40 + Math.random() * 60}px`, // Size variant
      opacity: 0.1 + Math.random() * 0.2, // Subtle transparency
    }));
    setRunners(newRunners);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden -z-10 bg-transparent">
      {runners.map((runner) => (
        <div
          key={runner.id}
          className="absolute animate-runner-move"
          style={{
            top: runner.top,
            width: runner.size,
            height: 'auto',
            animationDuration: runner.duration,
            animationDelay: runner.delay,
            opacity: runner.opacity,
          }}
        >
          <img
            src={PIXEL_PERSON_BASE64}
            alt="Pixel Runner"
            className="w-full h-auto"
            style={{ 
              imageRendering: 'pixelated',
              filter: 'brightness(0) invert(1)' // Make them white/silhouette to blend with background
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default RunningPixelBackground;
