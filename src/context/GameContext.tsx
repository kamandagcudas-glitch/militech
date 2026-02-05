
"use client";

import { createContext, ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';
import { Player, PlayerStats, PlayerProgress, Achievement, UserAccount, UserFile, FeedbackPost, LoginAttempt, ActivityLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { achievementsData, cocData } from '@/lib/data';
import { defaultBackground } from '@/lib/backgrounds-data';

const CREATOR_USERNAME = "Saint Silver Andre O Cudas";
// This is a humorous easter egg feature
const CABBAGE_THIEF_USERNAME = "TheGreatCabbageThief";

export interface GameContextType {
  currentUser: UserAccount | null;
  isAdmin: boolean;
  accounts: UserAccount[];
  loginHistory: LoginAttempt[];
  activityLogs: ActivityLog[];
  logActivity: (activity: string, details: string) => void;
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
  uploadFile: (file: File) => void;
  deleteFile: (fileId: string) => void;
  shareFile: (fileId: string, friendUsername: string) => void;
  feedbackPosts: FeedbackPost[];
  postFeedback: (message: string) => void;
  banUser: (username: string) => void;
  unbanUser: (username: string) => void;
  muteUser: (username: string) => void;
  unmuteUser: (username: string) => void;
  setCustomTitle: (username: string, title: string) => void;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackPosts, setFeedbackPosts] = useLocalStorage<FeedbackPost[]>('game_feedback', []);
  const [loginHistory, setLoginHistory] = useLocalStorage<LoginAttempt[]>('game_login_history', []);
  const [activityLogs, setActivityLogs] = useLocalStorage<ActivityLog[]>('game_activity_logs', []);
  
  // To keep the user logged in across page refreshes, we store the username of the logged-in user.
  const [loggedInUser, setLoggedInUser] = useLocalStorage<string | null>('game_loggedInUser', null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsAdmin(!!(currentUser && currentUser.player.isCreator));
  }, [currentUser]);

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
      !('displayName' in acc.player) ||
      !acc.files ||
      acc.player.isCreator === undefined ||
      acc.player.isBanned === undefined
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

        if (newAcc.player.isCreator === undefined) {
          newAcc.player.isCreator = newAcc.player.username === CREATOR_USERNAME;
        }

        if (newAcc.player.isBanned === undefined) {
          newAcc.player.isBanned = false;
        }
        if (newAcc.player.isMuted === undefined) {
          newAcc.player.isMuted = false;
        }
        if (newAcc.player.customTitle === undefined) {
          newAcc.player.customTitle = undefined;
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
        
        // Patch the files array for existing users.
        if (!newAcc.files) {
          newAcc.files = [];
        }

        // Retroactively grant the Angelic Power Rune badge to the creator.
        if (newAcc.player.username === CREATOR_USERNAME) {
            const hasAngelicRune = newAcc.achievements.some((a: Achievement) => a.id === 'angelic-power-rune');
            if (!hasAngelicRune) {
                const runeBadge = achievementsData.find(a => a.id === 'angelic-power-rune');
                if (runeBadge) {
                    newAcc.achievements.push({ ...runeBadge, timestamp: new Date().toISOString() });
                }
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
        badgeIds = ['creator-badge', 'angelic-power-rune']; // Preserving original logic and adding new badge.
        specialBackground = 'angelic';
        
        // Add creator title achievement.
        const achievement = achievementsData.find(a => a.id === 'creator');
        if(achievement) initialAchievements.push({ ...achievement, timestamp: new Date().toISOString() });

        // Add Angelic Power Rune badge achievement.
        const runeBadge = achievementsData.find(a => a.id === 'angelic-power-rune');
        if(runeBadge) initialAchievements.push({ ...runeBadge, timestamp: new Date().toISOString() });
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
      avatar: ``,
      email: trimmedEmail || undefined, // Store email if provided
      emailVerified: false, // Default to not verified
      activeTitleId,
      unlockedTitleIds,
      badgeIds,
      friendUsernames: [],
      friendRequests: [],
      isCreator,
      isBanned: false,
      isMuted: false,
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
      hashedPassword: hashedPassword,
      files: [],
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
    const account = accounts.find(acc => acc.player.username.toLowerCase() === username.toLowerCase());
    const newLog: Omit<LoginAttempt, 'id'> = {
        username: username,
        timestamp: new Date().toISOString(),
        status: 'Failed',
    };

    if (account) {
        if (account.player.isBanned) {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'This account has been suspended.',
            });
            setLoginHistory(prev => [{ ...newLog, id: crypto.randomUUID() }, ...prev]);
            return false;
        }

        const hashedPassword = await hashPassword(password);
        if (account.hashedPassword === hashedPassword) {
            newLog.status = 'Success';
            setLoginHistory(prev => [{...newLog, id: crypto.randomUUID()}, ...prev]);
            setCurrentUser(account);
            setLoggedInUser(account.player.username);
            router.push('/dashboard');
            return true;
        }
    }
    
    setLoginHistory(prev => [{...newLog, id: crypto.randomUUID()}, ...prev]);
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

  const logActivity = useCallback((activity: string, details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
        id: crypto.randomUUID(),
        username: currentUser.player.username,
        timestamp: new Date().toISOString(),
        activity,
        details,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, [currentUser, setActivityLogs]);

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
      // This is a custom background uploaded by the user
      newPlayerState = {
        ...currentUser.player,
        profileBackgroundId: 'custom',
        profileBackgroundUrl: idOrUrl,
      };
      toast({
        title: 'Custom Background Applied!',
        description: "Your background is saved in your browser's local storage.",
      });
    } else {
      // This is a predefined background ID
      newPlayerState = {
        ...currentUser.player,
        profileBackgroundId: idOrUrl,
        profileBackgroundUrl: undefined,
      };
      toast({
        title: 'Profile Background Updated!',
      });
    }

    updateCurrentUser({ player: newPlayerState });
  };

  const completeQuiz = (cocId: string, stepId: string, score: number): 'pass' | 'retry' | 'reset' => {
      if (!currentUser) return 'retry';
      
      if (currentUser.player.isBanned) {
        toast({
            variant: 'destructive',
            title: 'Action Restricted',
            description: 'Your account is suspended and cannot complete quizzes.',
        });
        return 'retry';
      }
      
      let outcome: 'pass' | 'retry' | 'reset';
      const newStats = { ...currentUser.stats };
      const step = cocData.find(c => c.id === cocId)?.steps.find(s => s.id === stepId);
      const totalQuestions = step?.quiz.length || 20;

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
      logActivity('Quiz Taken', `COC: ${cocId}, Step: ${stepId}, Score: ${score}/${totalQuestions}, Outcome: ${outcome}`);

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
  
    /**
   * File Management Logic
   */
  const uploadFile = (file: File) => {
    if (!currentUser) return;
    
    // Warning for localStorage limitations
    if (file.size > 5 * 1024 * 1024) { // 5MB limit 
      toast({
        variant: "destructive",
        title: "File is too large",
        description: "This offline version has limited storage. Please upload files smaller than 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newFile: UserFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: dataUrl,
        ownerUsername: currentUser.player.username,
        sharedWith: [],
        uploadDate: new Date().toISOString(),
      };

      const updatedFiles = [...currentUser.files, newFile];
      updateCurrentUser({ files: updatedFiles });
      logActivity('File Uploaded', `File: ${file.name}, Size: ${file.size} bytes`);
      toast({ title: "File Uploaded", description: `"${file.name}" has been saved.` });
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (fileId: string) => {
    if (!currentUser) return;
    
    const fileToDelete = currentUser.files.find(f => f.id === fileId);
    if (!fileToDelete) return;
    
    // Only the owner can delete a file. This also prevents deleting shared-in copies.
    if (fileToDelete.ownerUsername !== currentUser.player.username) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You can only delete files you own." });
      return;
    }

    const updatedFiles = currentUser.files.filter(f => f.id !== fileId);
    updateCurrentUser({ files: updatedFiles });
    toast({ title: "File Deleted", description: `"${fileToDelete.name}" has been removed.` });
  };
  
  const shareFile = (fileId: string, friendUsername: string) => {
    if (!currentUser) return;

    let originalFile: UserFile | undefined;
    let success = false;

    // Use setAccounts to ensure atomicity
    setAccounts(prevAccounts => {
      const currentUserAccount = prevAccounts.find(acc => acc.player.username === currentUser.player.username);
      const friendAccount = prevAccounts.find(acc => acc.player.username === friendUsername);

      if (!currentUserAccount || !friendAccount) return prevAccounts;

      originalFile = currentUserAccount.files.find(f => f.id === fileId);

      if (!originalFile || originalFile.ownerUsername !== currentUser.player.username) {
        toast({ variant: "destructive", title: "Sharing Failed", description: "You can only share files you own." });
        return prevAccounts;
      }
      
      // Check if already shared with this friend
      if (friendAccount.files.some(f => f.id === fileId)) {
        toast({ title: "Already Shared", description: `This file is already shared with ${friendAccount.player.displayName}.` });
        return prevAccounts;
      }
      
      // Create a copy of the file for the friend.
      // In a real app, this would be a pointer, but for local-only, we duplicate it.
      const sharedFile_copy: UserFile = { ...originalFile, sharedWith: [] }; // The friend's copy isn't shared by them.
      
      // Update the original file's sharedWith list
      originalFile.sharedWith.push(friendUsername);

      // Create new account objects with the changes
      const newFriendAccount = {
        ...friendAccount,
        files: [...friendAccount.files, sharedFile_copy],
      };
      
      const newCurrentUserAccount = {
          ...currentUserAccount,
          files: currentUserAccount.files.map(f => f.id === fileId ? originalFile! : f)
      }

      success = true;
      logActivity('File Shared', `File: ${originalFile.name}, To: ${friendUsername}`);

      // Return the newly updated list of all accounts
      return prevAccounts.map(acc => {
        if (acc.player.username === friendUsername) return newFriendAccount;
        if (acc.player.username === currentUser.player.username) return newCurrentUserAccount;
        return acc;
      });
    });

    if (success) {
      toast({ title: "File Shared!", description: `Shared "${originalFile?.name}" with ${friendUsername}.` });
      // Manually trigger a state update for the current user's file list to show the 'shared' status
      setCurrentUser(prev => {
          if (!prev) return null;
          return {
              ...prev,
              files: prev.files.map(f => f.id === fileId ? { ...f, sharedWith: [...f.sharedWith, friendUsername] } : f)
          }
      });
    }
  };
  
  const postFeedback = (message: string) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to post feedback.",
      });
      return;
    }

    if (currentUser.player.isBanned || currentUser.player.isMuted) {
        toast({
            variant: 'destructive',
            title: 'Action Restricted',
            description: 'You are currently unable to post feedback.',
        });
        return;
    }
    
    if (!message.trim()) {
        toast({
            variant: "destructive",
            title: "Empty Message",
            description: "Feedback cannot be empty.",
        });
        return;
    }

    const newFeedback: FeedbackPost = {
      id: crypto.randomUUID(),
      username: currentUser.player.username,
      displayName: currentUser.player.displayName,
      avatar: currentUser.player.avatar,
      message: message,
      timestamp: new Date().toISOString(),
    };

    setFeedbackPosts(prev => [newFeedback, ...prev]);
    logActivity('Feedback Posted', `Message: "${message.substring(0, 30)}..."`);

    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your contribution to the system.",
    });
  };

  /**
   * Admin Functions
   */

  const updateUserPropertyByUsername = (username: string, updates: Partial<Player>) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(acc =>
        acc.player.username === username ? { ...acc, player: { ...acc.player, ...updates } } : acc
      )
    );
  };
  
  const banUser = (username: string) => {
    if (!isAdmin) return;
    updateUserPropertyByUsername(username, { isBanned: true });
    logActivity('User Banned', `Banned user: ${username}`);
    toast({ title: 'User Banned', description: `${username} has been banned.` });
  };

  const unbanUser = (username: string) => {
    if (!isAdmin) return;
    updateUserPropertyByUsername(username, { isBanned: false });
    logActivity('User Unbanned', `Unbanned user: ${username}`);
    toast({ title: 'User Unbanned', description: `${username} has been unbanned.` });
  };

  const muteUser = (username: string) => {
    if (!isAdmin) return;
    updateUserPropertyByUsername(username, { isMuted: true });
    logActivity('User Muted', `Muted user: ${username}`);
    toast({ title: 'User Muted', description: `${username} has been muted.` });
  };

  const unmuteUser = (username: string) => {
    if (!isAdmin) return;
    updateUserPropertyByUsername(username, { isMuted: false });
    logActivity('User Unmuted', `Unmuted user: ${username}`);
    toast({ title: 'User Unmuted', description: `${username} has been unmuted.` });
  };

  const setCustomTitle = (username: string, title: string) => {
    if (!isAdmin) return;
    const cleanTitle = title.trim();
    updateUserPropertyByUsername(username, { customTitle: cleanTitle });
    logActivity('Custom Title Set', `Set title for ${username} to "${cleanTitle}"`);
    toast({ title: 'Title Updated', description: `${username}'s title has been changed.` });
  };


  useEffect(() => {
    if (currentUser?.stats && currentUser.stats.totalResets >= 10) {
      addAchievement('greatest-reset');
    }
  }, [currentUser?.stats.totalResets]);

  return (
    <GameContext.Provider value={{ currentUser, isAdmin, accounts, loginHistory, activityLogs, logActivity, register, login, logout, completeQuiz, addAchievement, updateAvatar, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, sendVerificationEmail, verifyEmail, updateProfileBackground, updateEmail, sendPasswordResetCode, resetPassword, updateDisplayName, uploadFile, deleteFile, shareFile, feedbackPosts, postFeedback, banUser, unbanUser, muteUser, unmuteUser, setCustomTitle }}>
      {children}
    </GameContext.Provider>
  );
}
