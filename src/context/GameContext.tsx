"use client";

import { createContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';
import { Player, PlayerStats, PlayerProgress, Achievement, UserAccount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { achievementsData, cocData } from '@/lib/data';
import { defaultBackground } from '@/lib/backgrounds-data';

const CREATOR_USERNAME = "Saint Silver Andre O Cudas";
// This is a humorous easter egg feature
const CABBAGE_THIEF_USERNAME = "TheGreatCabbageThief";

export interface GameContextType {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  register: (username: string, password: string, email?: string) => Promise<{ success: boolean; message: string; }>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeQuiz: (cocId: string, stepId: string, score: number) => 'pass' | 'retry' | 'reset';
  addAchievement: (achievementId: string) => void;
  updateAvatar: (avatarDataUrl: string) => void;
  addFriend: (username: string) => void;
  removeFriend: (username: string) => void;
  sendVerificationEmail: () => void;
  verifyEmail: () => void;
  updateProfileBackground: (idOrUrl: string) => void;
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

  useEffect(() => {
    // Data Migration & User Loading Effect:
    // This effect handles migrating older account structures to prevent crashes after updates.
    const needsPatch = accounts.some(acc => 
      !acc.player.friendUsernames || 
      !acc.progress.coc1.scores ||
      acc.player.emailVerified === undefined ||
      !acc.player.profileBackgroundId ||
      !('specialBackground' in acc.player) ||
      (acc.player.username && acc.player.username.trim() !== acc.player.username)
    );

    if (needsPatch) {
      const patchedAccounts = accounts.map(account => {
        // Use a deep copy to safely modify nested objects without side effects.
        const newAcc = JSON.parse(JSON.stringify(account));
        
        // Trim username to fix any past data entry issues and ensure accurate matching.
        if (newAcc.player.username) {
            newAcc.player.username = newAcc.player.username.trim();
        }

        // Patch missing friendUsernames array from older data structures.
        if (!newAcc.player.friendUsernames) {
          newAcc.player.friendUsernames = [];
        }

        // Patch missing email verification fields.
        if (newAcc.player.emailVerified === undefined) {
            newAcc.player.emailVerified = false;
        }
        if (!('email' in newAcc.player)) {
            newAcc.player.email = undefined;
        }

        // Patch missing profile background fields.
        if (!newAcc.player.profileBackgroundId) {
            newAcc.player.profileBackgroundId = defaultBackground?.id || 'profile-bg-cyberpunk-red';
            newAcc.player.profileBackgroundUrl = undefined;
        }
        
        // Patch missing scores objects for each COC.
        cocData.forEach(coc => {
          if (!newAcc.progress[coc.id]) {
             newAcc.progress[coc.id] = { completedSteps: [], scores: {} };
          } else if (!newAcc.progress[coc.id].scores) {
            newAcc.progress[coc.id].scores = {};
          }
        });

        // Patch the specialBackground field for existing users.
        if (!('specialBackground' in newAcc.player)) {
          if (newAcc.player.username === CREATOR_USERNAME) {
            newAcc.player.specialBackground = 'angelic';
          } else if (newAcc.player.username === CABBAGE_THIEF_USERNAME) {
            newAcc.player.specialBackground = 'cabbage';
          } else {
            newAcc.player.specialBackground = undefined;
          }
        }

        return newAcc;
      });
      setAccounts(patchedAccounts);
    } else {
      // Once all accounts are confirmed to be up-to-date, load the current user.
      if (loggedInUser) {
        const user = accounts.find(acc => acc.player.username === loggedInUser);
        if (user) {
          setCurrentUser(user);
        } else {
          // If the logged-in user in storage doesn't exist in accounts, log them out.
          setLoggedInUser(null);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    }
  }, [loggedInUser, accounts, setAccounts, setLoggedInUser]);


  const register = async (username: string, password: string, email?: string): Promise<{ success: boolean; message: string; }> => {
    // Registration & Validation Logic:
    const trimmedUsername = username.trim();
    // Checks if the username already exists in the stored accounts array.
    if (accounts.some(acc => acc.player.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      return { success: false, message: 'Username already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    const isCreator = trimmedUsername === CREATOR_USERNAME;
    const isCabbageThief = trimmedUsername === CABBAGE_THIEF_USERNAME;

    let activeTitleId: string | null = null;
    let unlockedTitleIds: string[] = [];
    let badgeIds: string[] = [];
    let specialBackground: 'angelic' | 'cabbage' | undefined = undefined;
    let initialAchievements: Achievement[] = [];

    // Easter Egg Logic: Assign special titles and backgrounds for specific usernames.
    if (isCreator) {
        activeTitleId = 'creator';
        unlockedTitleIds = ['creator'];
        badgeIds = ['creator-badge']; // This badge doesn't exist, but we preserve the original logic.
        specialBackground = 'angelic';
        const achievement = achievementsData.find(a => a.id === 'creator');
        if(achievement) initialAchievements.push({ ...achievement, timestamp: new Date().toISOString() });
    } else if (isCabbageThief) {
        activeTitleId = 'bk-foot-lettuce';
        unlockedTitleIds = ['bk-foot-lettuce'];
        specialBackground = 'cabbage';
        const achievement = achievementsData.find(a => a.id === 'bk-foot-lettuce');
        if(achievement) initialAchievements.push({ ...achievement, timestamp: new Date().toISOString() });
    }

    // Create the initial Player object, including any easter egg properties.
    const newPlayer: Player = {
      username: trimmedUsername,
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${trimmedUsername}`,
      email: email || undefined, // Store email if provided
      emailVerified: false, // Default to not verified
      activeTitleId,
      unlockedTitleIds,
      badgeIds,
      friendUsernames: [],
      isCreator,
      profileBackgroundId: defaultBackground?.id || 'profile-bg-cyberpunk-red',
      profileBackgroundUrl: undefined,
      specialBackground,
    };
    const newStats: PlayerStats = {
      coc1: { attempts: 0, resets: 0 },
      coc2: { attempts: 0, resets: 0 },
      coc3: { attempts: 0, resets: 0 },
      coc4: { attempts: 0, resets: 0 },
      totalResets: 0,
    };
    const newProgress: PlayerProgress = {
      coc1: { completedSteps: [], scores: {} },
      coc2: { completedSteps: [], scores: {} },
      coc3: { completedSteps: [], scores: {} },
      coc4: { completedSteps: [], scores: {} },
    };

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
    
    // Merge the updates with the current user data.
    const updatedAccount = { 
      ...currentUser, 
      ...updatedData,
      player: { ...currentUser.player, ...updatedData.player },
      stats: { ...currentUser.stats, ...updatedData.stats },
      progress: { ...currentUser.progress, ...updatedData.progress },
    };
    
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
    if (!currentUser || (currentUser.player.friendUsernames && currentUser.player.friendUsernames.includes(username))) {
      return;
    }
    const newPlayerState = {
      ...currentUser.player,
      friendUsernames: [...(currentUser.player.friendUsernames || []), username],
    };
    updateCurrentUser({ player: newPlayerState });
    toast({
      title: 'Friend Added!',
      description: `${username} is now on your friends list.`,
    });
  };

  const removeFriend = (username: string) => {
    if (!currentUser || !currentUser.player.friendUsernames) return;
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

  // --- Simulated Email Verification ---
  // The following functions simulate an email verification flow.
  // In a real application, these would involve a backend service to send emails.

  /**
   * Simulates sending a verification email to the user.
   * In a real app, this would trigger a backend API call.
   */
  const sendVerificationEmail = () => {
    if (!currentUser?.player.email) return;
    toast({
      title: 'Verification Email Sent (Simulation)',
      description: `An email has been "sent" to ${currentUser.player.email}. Click "Verify" to simulate completion.`,
    });
  };

  /**
   * Simulates the user clicking a verification link.
   * This marks the user's email as verified in the local state.
   */
  const verifyEmail = () => {
    if (!currentUser || currentUser.player.emailVerified) return;
    const newPlayerState = { ...currentUser.player, emailVerified: true };
    updateCurrentUser({ player: newPlayerState });
    addAchievement('verified-account');
    toast({
      title: 'Email Verified!',
      description: 'Your account has been successfully verified.',
    });
  };

  /**
   * Background Selection Logic:
   * Updates the user's profile background. Can accept a predefined ID or a custom base64 data URL.
   * If it's a custom URL, the ID is set to 'custom'. Otherwise, the URL is cleared.
   */
  const updateProfileBackground = (idOrUrl: string) => {
    if (!currentUser) return;

    let newPlayerState: Player;
    
    if (idOrUrl.startsWith('data:image/')) {
      // It's a custom upload (base64 data URL)
      newPlayerState = {
        ...currentUser.player,
        profileBackgroundId: 'custom',
        profileBackgroundUrl: idOrUrl,
      };
    } else {
      // It's a predefined background ID
      newPlayerState = {
        ...currentUser.player,
        profileBackgroundId: idOrUrl,
        profileBackgroundUrl: undefined,
      };
    }

    updateCurrentUser({ player: newPlayerState });
    toast({
      title: "Profile Background Updated!",
    });
  };

  const completeQuiz = (cocId: string, stepId: string, score: number): 'pass' | 'retry' | 'reset' => {
      if (!currentUser) return 'retry';
      
      let outcome: 'pass' | 'retry' | 'reset';
      const newStats = { ...currentUser.stats };
      (newStats as any)[cocId].attempts += 1;

      let newProgress = JSON.parse(JSON.stringify(currentUser.progress));

      if (score >= 18) {
          outcome = 'pass';
          if (!newProgress[cocId].completedSteps.includes(stepId)) {
              newProgress[cocId].completedSteps.push(stepId);
          }
          if(score === 20) {
            addAchievement('perfect-score');
          }
          // Store the highest score achieved for this step
          const existingScore = newProgress[cocId].scores[stepId] || 0;
          if (score > existingScore) {
            newProgress[cocId].scores[stepId] = score;
          }
      } else if (score >= 16) {
          outcome = 'retry';
      } else {
          outcome = 'reset';
          newProgress[cocId].completedSteps = [];
          newProgress[cocId].scores = {}; // Reset scores for the COC on failure
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
    <GameContext.Provider value={{ currentUser, accounts, register, login, logout, completeQuiz, addAchievement, updateAvatar, addFriend, removeFriend, sendVerificationEmail, verifyEmail, updateProfileBackground }}>
      {children}
    </GameContext.Provider>
  );
}
