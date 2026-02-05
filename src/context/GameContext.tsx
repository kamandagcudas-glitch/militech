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
  register: (username: string, displayName: string, password: string, email?: string) => Promise<{ success: boolean; message: string; }>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeQuiz: (cocId: string, stepId: string, score: number) => 'pass' | 'retry' | 'reset';
  addAchievement: (achievementId: string) => void;
  updateAvatar: (avatarDataUrl: string) => void;
  sendFriendRequest: (username: string) => void;
  acceptFriendRequest: (senderUsername: string) => void;
  rejectFriendRequest: (senderUsername: string) => void;
  removeFriend: (username: string) => void;
  sendVerificationEmail: () => void;
  verifyEmail: () => void;
  updateProfileBackground: (idOrUrl: string) => void;
  updateEmail: (email: string) => Promise<{ success: boolean; message: string; }>;
  sendPasswordResetCode: (usernameOrEmail: string) => Promise<{ success: boolean; message: string; }>;
  resetPassword: (username: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
  updateDisplayName: (displayName: string) => Promise<{ success: boolean; message: string; }>;
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
      (acc.player.username && acc.player.username.trim() !== acc.player.username) ||
      !acc.player.friendRequests ||
      !('passwordResetCode' in acc.player) ||
      !('displayName' in acc.player)
    );

    if (needsPatch) {
      const patchedAccounts = accounts.map(account => {
        // Use a deep copy to safely modify nested objects without side effects.
        const newAcc = JSON.parse(JSON.stringify(account));
        
        // Trim username to fix any past data entry issues and ensure accurate matching.
        if (newAcc.player.username) {
            newAcc.player.username = newAcc.player.username.trim();
        }

        if (!('displayName' in newAcc.player) || !newAcc.player.displayName) {
          newAcc.player.displayName = newAcc.player.username;
        }

        // Patch missing friendUsernames array from older data structures.
        if (!newAcc.player.friendUsernames) {
          newAcc.player.friendUsernames = [];
        }

        // Patch missing friendRequests array.
        if (!newAcc.player.friendRequests) {
          newAcc.player.friendRequests = [];
        }

        // Patch missing email verification fields.
        if (newAcc.player.emailVerified === undefined) {
            newAcc.player.emailVerified = false;
        }
        if (!('email' in newAcc.player)) {
            newAcc.player.email = undefined;
        }

        // Patch missing password reset fields
        if (!('passwordResetCode' in newAcc.player)) {
            newAcc.player.passwordResetCode = undefined;
            newAcc.player.passwordResetExpires = undefined;
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


  const register = async (username: string, displayName: string, password: string, email?: string): Promise<{ success: boolean; message: string; }> => {
    // Registration & Validation Logic:
    const trimmedUsername = username.trim();
    if (accounts.some(acc => acc.player.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      return { success: false, message: 'Username already exists.' };
    }

    const trimmedEmail = email?.trim();
    if (trimmedEmail && accounts.some(acc => acc.player.email?.toLowerCase() === trimmedEmail.toLowerCase())) {
        return { success: false, message: 'Email is already in use.' };
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
      displayName: displayName.trim(),
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${trimmedUsername}`,
      email: trimmedEmail || undefined, // Store email if provided
      emailVerified: false, // Default to not verified
      activeTitleId,
      unlockedTitleIds,
      badgeIds,
      friendUsernames: [],
      friendRequests: [],
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
  
  const updateDisplayName = async (displayName: string): Promise<{ success: boolean; message: string; }> => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };
    
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName.length === 0) {
        return { success: false, message: 'Display name cannot be empty.' };
    }
    if (trimmedDisplayName.length > 20) {
        return { success: false, message: 'Display name cannot be more than 20 characters.' };
    }
    if (!/^[a-zA-Z0-9_ ]+$/.test(trimmedDisplayName)) {
        return { success: false, message: 'Display name can only contain letters, numbers, spaces, and underscores.' };
    }

    const newPlayerState = { ...currentUser.player, displayName: trimmedDisplayName };
    updateCurrentUser({ player: newPlayerState });

    toast({
        title: "Display Name Updated!",
        description: `Your new display name is ${trimmedDisplayName}.`
    });

    return { success: true, message: 'Display name updated.' };
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
   * Friend Request Logic
   */
  const sendFriendRequest = (receiverUsername: string) => {
    if (!currentUser) return;

    setAccounts(prevAccounts => {
      const receiverAccount = prevAccounts.find(acc => acc.player.username === receiverUsername);
      if (!receiverAccount || receiverAccount.player.friendRequests.includes(currentUser.player.username)) {
        return prevAccounts;
      }

      const newReceiverAccount = {
        ...receiverAccount,
        player: {
          ...receiverAccount.player,
          friendRequests: [...receiverAccount.player.friendRequests, currentUser.player.username],
        },
      };
      
      toast({
        title: 'Request Sent!',
        description: `Your friend request to ${receiverAccount.player.displayName} has been sent.`,
      });

      return prevAccounts.map(acc => acc.player.username === receiverUsername ? newReceiverAccount : acc);
    });
  };

  const acceptFriendRequest = (senderUsername: string) => {
    if (!currentUser) return;

    setAccounts(prevAccounts => {
      const senderAccount = prevAccounts.find(acc => acc.player.username === senderUsername);
      const receiverAccount = prevAccounts.find(acc => acc.player.username === currentUser.player.username);
      if (!senderAccount || !receiverAccount) return prevAccounts;

      // Update receiver (current user)
      const newReceiverAccount = {
        ...receiverAccount,
        player: {
          ...receiverAccount.player,
          friendUsernames: [...receiverAccount.player.friendUsernames, senderUsername],
          friendRequests: receiverAccount.player.friendRequests.filter(req => req !== senderUsername),
        },
      };
      
      // Update sender
      const newSenderAccount = {
        ...senderAccount,
        player: {
          ...senderAccount.player,
          friendUsernames: [...senderAccount.player.friendUsernames, currentUser.player.username],
        },
      };

      toast({
        title: 'Friend Added!',
        description: `${senderAccount.player.displayName} is now your friend.`,
      });

      // Atomically update both accounts in the main list
      return prevAccounts.map(acc => {
        if (acc.player.username === currentUser.player.username) return newReceiverAccount;
        if (acc.player.username === senderUsername) return newSenderAccount;
        return acc;
      });
    });
    // Manually trigger a state update for the currentUser to reflect the change immediately
    setCurrentUser(prev => prev ? {
        ...prev,
        player: {
            ...prev.player,
            friendUsernames: [...prev.player.friendUsernames, senderUsername],
            friendRequests: prev.player.friendRequests.filter(req => req !== senderUsername),
        }
    } : null);
  };
  
  const rejectFriendRequest = (senderUsername: string) => {
    if (!currentUser) return;

    const sender = accounts.find(acc => acc.player.username === senderUsername);

    const newPlayerState = {
      ...currentUser.player,
      friendRequests: currentUser.player.friendRequests.filter(req => req !== senderUsername),
    };
    updateCurrentUser({ player: newPlayerState });
    toast({
      title: 'Request Rejected',
      description: `You have rejected the friend request from ${sender?.player.displayName || senderUsername}.`,
    });
  };

  const removeFriend = (username: string) => {
    if (!currentUser) return;
    
    setAccounts(prevAccounts => {
        const friendAccount = prevAccounts.find(acc => acc.player.username === username);
        const selfAccount = prevAccounts.find(acc => acc.player.username === currentUser.player.username);

        if (!friendAccount || !selfAccount) return prevAccounts;

        const newSelfAccount = {
            ...selfAccount,
            player: {
                ...selfAccount.player,
                friendUsernames: selfAccount.player.friendUsernames.filter(friend => friend !== username),
            }
        };

        const newFriendAccount = {
            ...friendAccount,
            player: {
                ...friendAccount.player,
                friendUsernames: friendAccount.player.friendUsernames.filter(friend => friend !== currentUser.player.username),
            }
        };
        
        toast({
          title: 'Friend Removed',
          description: `${friendAccount.player.displayName} has been removed from your friends list.`,
        });

        return prevAccounts.map(acc => {
            if (acc.player.username === currentUser.player.username) return newSelfAccount;
            if (acc.player.username === username) return newFriendAccount;
            return acc;
        });
    });

    setCurrentUser(prev => prev ? {
        ...prev,
        player: {
            ...prev.player,
            friendUsernames: prev.player.friendUsernames.filter(friend => friend !== username),
        }
    } : null);
  };

  const updateEmail = async (email: string): Promise<{ success: boolean; message: string; }> => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };

    const trimmedEmail = email.trim();

    if (!/^[^\s@]+@gmail\.com$/i.test(trimmedEmail)) {
        return { success: false, message: 'Please enter a valid Gmail address.' };
    }

    if (accounts.some(acc => acc.player.email?.toLowerCase() === trimmedEmail.toLowerCase() && acc.player.username !== currentUser.player.username)) {
        return { success: false, message: 'Email is already in use.' };
    }
    
    const newPlayerState = { 
        ...currentUser.player, 
        email: trimmedEmail,
        emailVerified: false // Reset verification status on email change
    };
    updateCurrentUser({ player: newPlayerState });

    toast({
        title: "Email Updated",
        description: "Your email address has been updated. Please verify it.",
    });

    return { success: true, message: 'Email updated successfully.' };
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
  
    /**
   * Password Recovery Logic (Simulated)
   */
  const sendPasswordResetCode = async (usernameOrEmail: string): Promise<{ success: boolean; message: string; }> => {
    const account = accounts.find(acc => 
        acc.player.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
        (acc.player.email && acc.player.email.toLowerCase() === usernameOrEmail.toLowerCase())
    );

    if (!account) {
        return { success: false, message: 'User not found.' };
    }
    if (!account.player.email || !account.player.emailVerified) {
        return { success: false, message: 'This account does not have a verified email address for password recovery.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes expiry

    const updatedAccount = {
        ...account,
        player: {
            ...account.player,
            passwordResetCode: code,
            passwordResetExpires: expires.toISOString(),
        }
    };
    
    setAccounts(prevAccounts =>
      prevAccounts.map(acc =>
        acc.player.username === account.player.username ? updatedAccount : acc
      )
    );
    
    // This is a simulation, so we show the code in a toast instead of emailing it.
    toast({
        title: 'Verification Code Sent (Simulation)',
        description: `Your recovery code is ${code}. It expires in 10 minutes.`,
        duration: 15000,
    });
    
    return { success: true, message: `A recovery code has been "sent" to ${account.player.email}.` };
  };

  const resetPassword = async (username: string, code: string, newPassword: string): Promise<{ success: boolean; message: string; }> => {
    const account = accounts.find(acc => acc.player.username === username);

    if (!account) {
        return { success: false, message: 'User not found.' };
    }

    const now = new Date();
    const expires = account.player.passwordResetExpires ? new Date(account.player.passwordResetExpires) : null;

    if (!account.player.passwordResetCode || account.player.passwordResetCode !== code) {
        return { success: false, message: 'Invalid verification code.' };
    }

    if (!expires || now > expires) {
        // Clear the expired code
         const updatedAccount = {
            ...account,
            player: {
                ...account.player,
                passwordResetCode: undefined,
                passwordResetExpires: undefined,
            }
        };
        setAccounts(prevAccounts =>
            prevAccounts.map(acc =>
                acc.player.username === account.player.username ? updatedAccount : acc
            )
        );
        return { success: false, message: 'Verification code has expired. Please request a new one.' };
    }
    
    const hashedPassword = await hashPassword(newPassword);

    const updatedAccount = {
        ...account,
        hashedPassword,
        player: {
            ...account.player,
            passwordResetCode: undefined,
            passwordResetExpires: undefined,
        }
    };

    setAccounts(prevAccounts =>
      prevAccounts.map(acc =>
        acc.player.username === account.player.username ? updatedAccount : acc
      )
    );

    return { success: true, message: 'Password has been reset successfully.' };
  };

  useEffect(() => {
    if (currentUser?.stats && currentUser.stats.totalResets >= 10) {
      addAchievement('greatest-reset');
    }
  }, [currentUser?.stats.totalResets]);

  return (
    <GameContext.Provider value={{ currentUser, accounts, register, login, logout, completeQuiz, addAchievement, updateAvatar, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, sendVerificationEmail, verifyEmail, updateProfileBackground, updateEmail, sendPasswordResetCode, resetPassword, updateDisplayName }}>
      {children}
    </GameContext.Provider>
  );
}
