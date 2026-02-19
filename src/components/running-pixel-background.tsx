
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';

// Standard runner SVG
const PIXEL_PERSON_BASE64 = "data:image/png;base64,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";

// Thematic Pixel Shapes (SVG Masks)
const PIXEL_SMILEY = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PScxNicgc2hhcGUtcmVuZGVyaW5nPSdjcmlzcEVkZ2VzJz48cGF0aCBmaWxsPSdibGFjaycgZD0nTTUgMWg2djFINTV6TTMgMmgydjFIM3pNMTEgMmgydjFIMTF6TTIgM2gxdjJIMnpNMTMgM2gxdjJoLTEzTTEgNWgxdjZIMXpNMTQgNWgxdjZoLTEzTTIgMTFoMXYySDJ6TTEzIDExaDF2MkgtMXpNMyAxM2gydjFIM3pNMTEgMTNoMnYxaC0yek01IDE0aDZ2MUg1ek01IDVoMnYySDV6TTkgNWgydjJIOXpNNCAxMGgxdjFoMXYxaDR2LTFoMXYtMWgxVjlINHInLz48L3N2Zz4=";
const PIXEL_ANGEL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNiIgaGVpZ2h0PScxNiIgc2hhcGUtcmVuZGVyaW5nPSdjcmlzcEVkZ2VzJz48cGF0aCBmaWxsPSdibGFjayIgZD0iTTcgMWgydjFIN3pNNiAyaDR2MUg2ek01IDNoNnYxSDV6TTQgNGg4djFINDN6TTMgNWgxMHYxSDN6TTIgNmgxMnYxSDJ6TTEgN2gxNHYxSDF6TTAgOGgxNnYxSDB6TTIgOWgxMnYxSDJ6TTQgMTBoOHYxSDR6TTYgMTFoNHYxSDZ6TTcgMTJoMnYxSDd6TTUgMTNoNnYxSDZ6TTQgMTRoOHYxSDR6TTMgMTVoMTB2MUgzeiIvPjwvc3ZnPg==";
const PIXEL_STELLAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNiIgaGVpZ2h0PScxNiIgc2hhcGUtcmVuZGVyaW5nPSdjcmlzcEVkZ2VzJz48cGF0aCBmaWxsPSdibGFjayIgZD0iTTE0IDBoMnYyaC0yek0xMyAxaDJ2MmgtMXpNMTIgMmgydjJoLTF6TTExIDNoMnYyaC0yek0xMCA0aDJ2MmgtMXpNOSA1aDJ2MmgtMXpNOCA2aDJ2MmgtMXpNNyA3aDJ2MmgtMXpNNiA4aDJ2MmgtMXpNOSA1aDJ2MmgtMXpNOCIxNGgydjJIMHoiLz48L3N2Zz4=";

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
  const pathname = usePathname();
  const [runners, setRunners] = useState<Runner[]>([]);
  const [mounted, setMounted] = useState(false);
  const runnerCount = 12;

  useEffect(() => {
    setMounted(true);
    const newRunners = Array.from({ length: runnerCount }).map((_, i) => ({
      id: i,
      top: `${10 + Math.random() * 80}%`,
      duration: theme === 'angelic' ? `${15 + Math.random() * 10}s` : `${10 + Math.random() * 8}s`,
      delay: `-${Math.random() * 30}s`,
      size: theme === 'angelic' ? '48px' : '55px',
      opacity: 0.15 + Math.random() * 0.2,
    }));
    setRunners(newRunners);
  }, [theme]);

  // Hide the runners on the landing page, login, register, and forgot password pages
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  
  // Hydration fix: Don't render until mounted on client to ensure server and client match
  if (!mounted || isAuthPage) return null;

  const getMaskImage = () => {
    switch (theme) {
      case 'cyberpunk': return `url("${PIXEL_SMILEY}")`;
      case 'angelic': return `url("${PIXEL_ANGEL}")`;
      case 'samurai': return `url("${PIXEL_STELLAR}")`;
      default: return `url("${PIXEL_PERSON_BASE64}")`;
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
            height: runner.size,
            animationDuration: runner.duration,
            animationDelay: runner.delay,
            opacity: runner.opacity,
          }}
        >
          <div 
            className="w-full h-full bg-primary"
            style={{ 
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
