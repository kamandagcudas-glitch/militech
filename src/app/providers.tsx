
"use client";

import { GameProvider } from "@/context/GameContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { FirebaseClientProvider } from "@/firebase";
import type { ReactNode } from "react";
import GlobalAngelicBackground from "@/components/GlobalAngelicBackground";
import RunningPixelBackground from "@/components/running-pixel-background";

function AppWithTheme({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <>
      {theme === "angelic" && <GlobalAngelicBackground />}
      <RunningPixelBackground />
      {children}
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <ThemeProvider>
        <GameProvider>
          <AppWithTheme>{children}</AppWithTheme>
        </GameProvider>
      </ThemeProvider>
    </FirebaseClientProvider>
  );
}
