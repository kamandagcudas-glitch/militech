"use client";

import { createContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';
import { Player, PlayerStats, PlayerProgress, Achievement, UserAccount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { achievementsData } from '@/lib/data';

const CREATOR_USERNAME = "Saint Silver Andre O Cudas";

export interface GameContextType {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  register: (username: string, password: string) => Promise<{ success: boolean; message: string; }>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeQuiz: (cocId: string, stepId: string, score: number) => 'pass' | 'retry' | 'reset';
  addAchievement: (achievementId: string) => void;
  updateAvatar: (avatarDataUrl: string) => void;
  addFriend: (username: string) => void;
  removeFriend: (username: string) => void;
}

export const GameContext = createContext<GameContextType | null>(null);

/**
 * Hashes a password using the SHA-256 algorithm via the Web Crypto API.
 * This provides a secure way to store passwords without keeping them in plaintext.
 * @param password The plaintext password to hash.
 * @returns A promise that resolves to the hexadecimal string of the hash.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function GameProvider({ children }: { children: ReactNode }) {
  // Account Storage Logic:
  // All user accounts are stored in a single array in local storage under the key 'game_accounts'.
  // This allows for multiple users on the same browser, each with their own progress.
  const [accounts, setAccounts] = useLocalStorage<UserAccount[]>('game_accounts', []);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  // To keep the user logged in across page refreshes, we store the username of the logged-in user.
  const [loggedInUser, setLoggedInUser] = useLocalStorage<string | null>('game_loggedInUser', null);

  const router = useRouter();
  const { toast } = useToast();

  /**
   * Data Migration Effect:
   * This effect ensures that older user accounts loaded from local storage, which might be
   * missing the `friendUsernames` property, are updated. This prevents crashes when
   * accessing this property on legacy account structures.
   */
  useEffect(() => {
    // Check if any account in the loaded data is missing the `friendUsernames` array.
    const needsPatch = accounts.some(acc => !acc.player.friendUsernames);

    if (needsPatch) {
      const patchedAccounts = accounts.map(acc => {
        // If friendUsernames is missing (i.e., it's an older account structure), add it.
        if (!acc.player.friendUsernames) {
          return {
            ...acc,
            player: {
              ...acc.player,
              friendUsernames: [], // Initialize as an empty array.
            },
          };
        }
        return acc;
      });
      // Update the accounts in local storage. This will trigger a re-render,
      // but the `if (needsPatch)` condition will prevent an infinite loop.
      setAccounts(patchedAccounts);
    }
  }, [accounts, setAccounts]);


  // On initial load, check if there was a previously logged-in user.
  // If so, load their full account data into the context state.
  useEffect(() => {
    if (loggedInUser) {
      const user = accounts.find(acc => acc.player.username === loggedInUser);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [loggedInUser, accounts]);

  const register = async (username: string, password: string): Promise<{ success: boolean; message: string; }> => {
    // Registration & Validation Logic:
    // Checks if the username already exists in the stored accounts array.
    if (accounts.some(acc => acc.player.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    const isCreator = username === CREATOR_USERNAME;

    // Create the initial Player object, including the creator easter egg check.
    const newPlayer: Player = {
      username,
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${username}`,
      activeTitleId: isCreator ? 'creator' : null,
      unlockedTitleIds: isCreator ? ['creator'] : [],
      badgeIds: isCreator ? ['creator-badge'] : [],
      friendUsernames: [],
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
    const initialAchievements: Achievement[] = isCreator ? [{
        ...achievementsData.find(a => a.id === 'creator')!,
        timestamp: new Date().toISOString()
    }] : [];

    const newUserAccount: UserAccount = {
      player: newPlayer,
      stats: newStats,
      progress: newProgress,
      achievements: initialAchievements,
      hashedPassword: hashedPassword
    };

    setAccounts(prev => [...prev, newUserAccount]);
    
    if (isCreator) {
        toast({
            title: <div className="text-4xl text-center w-full">🎉</div>,
            description: <div className="text-center font-bold">Creator Identified! Welcome.</div>,
            duration: 3000,
        });
    }

    return { success: true, message: 'Registration successful!' };
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    // Login Validation Logic:
    // 1. Finds the user by username.
    // 2. Hashes the provided password.
    // 3. Compares the generated hash with the stored hash.
    const account = accounts.find(acc => acc.player.username.toLowerCase() === username.toLowerCase());
    if (account) {
      const hashedPassword = await hashPassword(password);
      if (account.hashedPassword === hashedPassword) {
        setCurrentUser(account);
        setLoggedInUser(account.player.username);
        router.push('/dashboard');
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setLoggedInUser(null);
    router.push('/login');
  };
  
  // This helper function updates the current user's data both in the `accounts` array
  // (which is persisted to local storage) and in the active `currentUser` state.
  const updateCurrentUser = (updatedData: Partial<UserAccount>) => {
    if (!currentUser) return;
    
    const updatedAccount = { ...currentUser, ...updatedData };
    
    // Update the state for the current session
    setCurrentUser(updatedAccount);
    
    // Update the account in the persisted array
    setAccounts(prevAccounts =>
      prevAccounts.map(acc =>
        acc.player.username === currentUser.player.username ? updatedAccount : acc
      )
    );
  };

  const updateAvatar = (avatarDataUrl: string) => {
    if (!currentUser) return;
    const newPlayerState = { ...currentUser.player, avatar: avatarDataUrl };
    updateCurrentUser({ player: newPlayerState });
  };
  
  const addAchievement = (achievementId: string) => {
    if (!currentUser || currentUser.achievements.some(a => a.id === achievementId)) return;

    const achievementToAdd = achievementsData.find(a => a.id === achievementId);
    if (achievementToAdd) {
        const newAchievement: Achievement = {
            ...achievementToAdd,
            timestamp: new Date().toISOString(),
        }
        const newAchievements = [...currentUser.achievements, newAchievement];
        updateCurrentUser({ achievements: newAchievements });
        
        toast({
            title: <div className="text-2xl text-center w-full">{achievementToAdd.type === 'badge' ? '🎖️' : '🏆'}</div>,
            description: <div className="text-center"><b>{achievementToAdd.type === 'badge' ? 'Badge' : 'Title'} Unlocked:</b> {achievementToAdd.name}</div>,
            duration: 4000
        })
    }
  };
  
  /**
   * Friend Management Logic:
   * The user's friend list is an array of usernames stored in `player.friendUsernames`.
   * These functions add or remove a username from that list and update the user's account.
   */
  const addFriend = (username: string) => {
    if (!currentUser || currentUser.player.friendUsernames.includes(username)) {
      return;
    }
    const newPlayerState = {
      ...currentUser.player,
      friendUsernames: [...currentUser.player.friendUsernames, username],
    };
    updateCurrentUser({ player: newPlayerState });
    toast({
      title: 'Friend Added!',
      description: `${username} is now on your friends list.`,
    });
  };

  const removeFriend = (username: string) => {
    if (!currentUser) return;
    const newPlayerState = {
      ...currentUser.player,
      friendUsernames: currentUser.player.friendUsernames.filter(
        (friend) => friend !== username
      ),
    };
    updateCurrentUser({ player: newPlayerState });
    toast({
      title: 'Friend Removed',
      description: `${username} has been removed from your friends list.`,
    });
  };

  const completeQuiz = (cocId: string, stepId: string, score: number): 'pass' | 'retry' | 'reset' => {
      if (!currentUser) return 'retry';
      
      let outcome: 'pass' | 'retry' | 'reset';
      const newStats = { ...currentUser.stats };
      (newStats as any)[cocId].attempts += 1;

      let newProgress = { ...currentUser.progress };

      if (score >= 18) {
          outcome = 'pass';
          if (!newProgress[cocId].completedSteps.includes(stepId)) {
              newProgress[cocId].completedSteps.push(stepId);
          }
          if(score === 20) {
            addAchievement('perfect-score');
          }
      } else if (score >= 16) {
          outcome = 'retry';
      } else {
          outcome = 'reset';
          newProgress[cocId].completedSteps = [];
          (newStats as any)[cocId].resets += 1;
          newStats.totalResets += 1;
      }
      
      updateCurrentUser({ stats: newStats, progress: newProgress });

      return outcome;
  };
  
  useEffect(() => {
    if (currentUser?.stats && currentUser.stats.totalResets >= 10) {
      addAchievement('greatest-reset');
    }
  }, [currentUser?.stats.totalResets]);

  return (
    <GameContext.Provider value={{ currentUser, accounts, register, login, logout, completeQuiz, addAchievement, updateAvatar, addFriend, removeFriend }}>
      {children}
    </GameContext.Provider>
  );
}
