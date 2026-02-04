"use client";

import { createContext, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Player, PlayerStats, PlayerProgress, Achievement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { achievementsData } from '@/lib/data';

const CREATOR_USERNAME = "Saint Silver Andre O Cudas";

export interface GameContextType {
  player: Player | null;
  stats: PlayerStats | null;
  progress: PlayerProgress | null;
  achievements: Achievement[];
  login: (username: string) => void;
  logout: () => void;
  completeQuiz: (cocId: string, stepId: string, score: number) => 'pass' | 'retry' | 'reset';
  addAchievement: (achievementId: string) => void;
  updateAvatar: (avatarDataUrl: string) => void;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useLocalStorage<Player | null>('player', null);
  const [stats, setStats] = useLocalStorage<PlayerStats | null>('stats', null);
  const [progress, setProgress] = useLocalStorage<PlayerProgress | null>('progress', null);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('achievements', []);

  const { toast } = useToast();

  const login = (username: string) => {
    const isCreator = username === CREATOR_USERNAME;
    const newPlayer: Player = {
      username,
      // Default avatar is generated from an external service.
      // This can be overridden by the user with a local base64 image.
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${username}`,
      activeTitleId: isCreator ? 'creator' : null,
      unlockedTitleIds: isCreator ? ['creator'] : [],
      badgeIds: isCreator ? ['creator-badge'] : [],
      isCreator,
    };
    const newStats: PlayerStats = {
      coc1: { attempts: 0, resets: 0 },
      coc2: { attempts: 0, resets: 0 },
      coc3: { attempts: 0, resets: 0 },
      coc4: { attempts: 0, resets: 0 },
      totalResets: 0,
    };
    const newProgress: PlayerProgress = {
        coc1: { completedSteps: [] },
        coc2: { completedSteps: [] },
        coc3: { completedSteps: [] },
        coc4: { completedSteps: [] },
    };

    setPlayer(newPlayer);
    setStats(newStats);
    setProgress(newProgress);
    setAchievements([]);

    if (isCreator) {
      toast({
        title: <div className="text-4xl text-center w-full">🎉</div>,
        description: <div className="text-center font-bold">Creator Identified! Welcome back.</div>,
        duration: 3000,
      });
      addAchievement('creator');
    }
  };

  const logout = () => {
    setPlayer(null);
    setStats(null);
    setProgress(null);
    setAchievements([]);
  };

  /**
   * Updates the player's avatar.
   * The avatar is stored as a base64 data URL in local storage.
   * @param avatarDataUrl - The base64 data URL of the new avatar image.
   */
  const updateAvatar = (avatarDataUrl: string) => {
    setPlayer(prevPlayer => {
      if (!prevPlayer) return null;
      // The new avatar string (base64) replaces the old one (either default URL or previous base64)
      return { ...prevPlayer, avatar: avatarDataUrl };
    });
  };

  const addAchievement = (achievementId: string) => {
    if (achievements.some(a => a.id === achievementId)) return;

    const achievementToAdd = achievementsData.find(a => a.id === achievementId);
    if (achievementToAdd) {
        const newAchievement: Achievement = {
            ...achievementToAdd,
            timestamp: new Date().toISOString(),
        }
        setAchievements(prev => [...prev, newAchievement]);
        toast({
            title: <div className="text-2xl text-center w-full">{achievementToAdd.type === 'badge' ? '🎖️' : '🏆'}</div>,
            description: <div className="text-center"><b>{achievementToAdd.type === 'badge' ? 'Badge' : 'Title'} Unlocked:</b> {achievementToAdd.name}</div>,
            duration: 4000
        })
    }
  };

  const completeQuiz = (cocId: string, stepId: string, score: number): 'pass' | 'retry' | 'reset' => {
      let outcome: 'pass' | 'retry' | 'reset';
      
      setStats(prevStats => {
        if (!prevStats) return null;
        const newStats = { ...prevStats };
        (newStats as any)[cocId].attempts += 1;
        return newStats;
      });

      if (score >= 18) {
          outcome = 'pass';
          setProgress(prevProgress => {
              if (!prevProgress) return null;
              const newProgress = { ...prevProgress };
              if (!newProgress[cocId].completedSteps.includes(stepId)) {
                  newProgress[cocId].completedSteps.push(stepId);
              }
              return newProgress;
          });
          if(score === 20) {
            addAchievement('perfect-score');
          }
      } else if (score >= 16) {
          outcome = 'retry';
      } else {
          outcome = 'reset';
          setProgress(prevProgress => {
              if (!prevProgress) return null;
              const newProgress = { ...prevProgress };
              newProgress[cocId].completedSteps = [];
              return newProgress;
          });
          setStats(prevStats => {
            if (!prevStats) return null;
            const newStats = { ...prevStats };
            (newStats as any)[cocId].resets += 1;
            newStats.totalResets += 1;
            return newStats;
          });
      }

      return outcome;
  };
  
  useEffect(() => {
    if (stats && stats.totalResets >= 10) {
      addAchievement('greatest-reset');
    }
  }, [stats?.totalResets])


  return (
    <GameContext.Provider value={{ player, stats, progress, achievements, login, logout, completeQuiz, addAchievement, updateAvatar }}>
      {children}
    </GameContext.Provider>
  );
}
