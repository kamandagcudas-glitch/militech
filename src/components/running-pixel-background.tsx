"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

// Standard runner SVG
const PIXEL_PERSON_BASE64 = "data:image/png;base64,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";

// Theme specific pixel masks
const PIXEL_SMILEY = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PScxNicgc2hhcGUtcmVuZGVyaW5nPSdjcmlzcEVkZ2VzJz48cGF0aCBmaWxsPSdibGFjaycgZD0nTTUgMWg2djFINTV6TTMgMmgydjFIM3pNMTEgMmgydjFIMTF6TTIgM2gxdjJIMnpNMTMgM2gxdjJoLTEzTTEgNWgxdjZIMXpNMTQgNWgxdjZoLTEzTTIgMTFoMXYySDJ6TTEzIDExaDF2MkgtMXpNMyAxM2gydjFIM3pNMTEgMTNoMnYxaC0yek01IDE0aDZ2MUg1ek01IDVoMnYySDV6TTkgNWgydjJIOXpNNCAxMGgxdjFoMXYxaDR2LTFoMXYtMWgxVjlINHInLz48L3N2Zz4=";
const PIXEL_FEATHER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNiIgaGVpZ2h0PScxNiIgc2hhcGUtcmVuZGVyaW5nPSdjcmlzcEVkZ2VzJz48cGF0aCBmaWxsPSdibGFjaycgZD0nTTEwIDFoMnYxaC0yek0xMiAyaDF2MWgtMXpNMTMgM2gxdjNoLTEzTTE0IDZoMXY0aC0xek0xMyAxMGgxdjJoLTEzTTEyIDEyaDF2MWgtMXpNMTEgMTNoMXYxaC0yek0xMCAxNGgxdjFoLTJ6TTkgMTVoMXYxSDl6TTggMTRoMXYxSDh6TTcgMTNoMXYxSDd6TTYgMTJoMXYxSDZ6TTUgMTFoMXYxSDV6TTQgMTBoMXYxSDR6TTMgOWgxdjFIM3pNMiA4aDF2MUgyek0xIDdoMXYxSDF6TTIgNmgxdjFIMnpNMyA1aDF2MUgzek00IDRoMXYxSDR6TTUgM2gxdjFINTV6TTYgMmgxdjFINTZ6TTcgMWgzdjFIN3onLz48L3N2Zz4=";
const PIXEL_BLADE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNiIgaGVpZ2h0PScxNiIgc2hhcGUtcmVuZGVyaW5nPSdjcmlzcEVkZ2VzJz48cGF0aCBmaWxsPSdibGFjaycgZD0nTTE0IDFoMXYxaC0xek0xMyAyaDF2MWgtMXpNMTIgM2gxdjFoLTF6TTExIDRoMXYxaC0xek0xMCA1aDF2MWgtMXpNOSA2aDF2MUg5ek04IDdoMXYxSDh6TTcgOGgxdjFIN3pNNiA5aDF2MUg2ek01IDEwaDF2MUg1ek00IDExaDF2MUg0ek0zIDEyaDF2MUgzek0yIDEzaDF2MUgyek0xIDE0aDF2MUgxek0wIDE1aDF2MUgwZScvPjwvc3ZnPg==";

interface Runner {
  id: number;
  top: string;
  duration: string;
  delay: string;
  size: string;
  opacity: number;
}

const RunningPixelBackground = () => {
  const { theme } = useTheme();
  const [runners, setRunners] = useState<Runner[]>([]);
  const runnerCount = 12;

  useEffect(() => {
    const newRunners = Array.from({ length: runnerCount }).map((_, i) => ({
      id: i,
      top: `${5 + Math.random() * 85}%`,
      duration: theme === 'angelic' ? `${15 + Math.random() * 15}s` : `${10 + Math.random() * 15}s`,
      delay: `-${Math.random() * 30}s`,
      size: `${theme === 'angelic' ? 35 : 45 + Math.random() * 60}px`,
      opacity: 0.15 + Math.random() * 0.3,
    }));
    setRunners(newRunners);
  }, [theme]);

  const getMaskImage = () => {
    switch (theme) {
      case 'cyberpunk': return `url(${PIXEL_SMILEY})`;
      case 'angelic': return `url(${PIXEL_FEATHER})`;
      case 'samurai': return `url(${PIXEL_BLADE})`;
      default: return `url(${PIXEL_PERSON_BASE64})`;
    }
  };

  const getAnimationClass = () => {
    switch (theme) {
      case 'cyberpunk': return "animate-cyber-neural-glitch";
      case 'angelic': return "animate-angelic-weightless-drift";
      case 'samurai': return "animate-samurai-steel-shimmer";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden -z-10 bg-transparent">
      {runners.map((runner) => (
        <div
          key={runner.id}
          className={cn(
            "absolute animate-runner-move",
            getAnimationClass()
          )}
          style={{
            top: runner.top,
            width: runner.size,
            animationDuration: runner.duration,
            animationDelay: runner.delay,
            opacity: runner.opacity,
          }}
        >
          <div 
            className="w-full bg-primary"
            style={{ 
              aspectRatio: '1/1',
              maskImage: getMaskImage(),
              WebkitMaskImage: getMaskImage(),
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              imageRendering: 'pixelated'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default RunningPixelBackground;