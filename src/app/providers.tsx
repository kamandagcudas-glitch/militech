
"use client";

import { GameProvider } from "@/context/GameContext";
import { ThemeProvider } from "@/context/ThemeContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <GameProvider>{children}</GameProvider>
    </ThemeProvider>
  );
}
