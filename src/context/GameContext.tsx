
"use client";

import { createContext, ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { achievementsData, cocData } from '@/lib/data';
import { defaultBackground } from '@/lib/backgrounds-data';

import {
  Player,
  PlayerStats,
  PlayerProgress,
  Achievement,
  UserAccount,
  UserFile,
  FeedbackPost,
  LoginAttempt,
  ActivityLog,
} from '@/lib/types';

import {
  useUser,
  useFirestore,
  useAuth,
  useCollection,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  Timestamp,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateEmail as updateAuthEmail
} from 'firebase/auth';


const CREATOR_USERNAME = "Saint Silver Andre O Cudas";
const CABBAGE_THIEF_USERNAME = "TheGreatCabbageThief";
const RAYTHEON_USERNAME = "Raytheon";

export interface GameContextType {
  currentUser: UserAccount | null;
  isUserLoading: boolean;
  isAdmin: boolean;
  accounts: UserAccount[];
  loginHistory: LoginAttempt[];
  activityLogs: ActivityLog[];
  logActivity: (activity: string, details: string) => void;
  register: (username: string, displayName: string, email: string, password: string) => Promise<{ success: boolean; message: string; }>;
  login: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
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
  sendPasswordResetCode: (email: string) => Promise<{ success: boolean; message: string; }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
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

export function GameProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const { user: authUser, isUserLoading: isAuthLoading } = useUser();

  const userDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<UserAccount>(userDocRef);
  
  const accountsQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'users')) : null, [firestore, authUser]);
  const { data: accounts, isLoading: areAccountsLoading } = useCollection<UserAccount>(accountsQuery);

  const feedbackQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'feedback'), orderBy('timestamp', 'desc'), limit(50)) : null, [firestore, authUser]);
  const { data: feedbackPosts } = useCollection<FeedbackPost>(feedbackQuery);

  const isAdmin = useMemo(() => !!(currentUser && currentUser.player.isCreator), [currentUser]);

  const loginHistoryQuery = useMemoFirebase(() => isAdmin ? query(collection(firestore, 'loginHistory'), orderBy('timestamp', 'desc'), limit(100)) : null, [firestore, isAdmin]);
  const { data: loginHistory } = useCollection<LoginAttempt>(loginHistoryQuery);

  const activityLogsQuery = useMemoFirebase(() => isAdmin ? query(collection(firestore, 'activityLogs'), orderBy('timestamp', 'desc'), limit(100)): null, [firestore, isAdmin]);
  const { data: activityLogs } = useCollection<ActivityLog>(activityLogsQuery);
  
  const register = async (username: string, displayName: string, email: string, password: string): Promise<{ success: boolean; message: string; }> => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    // Check if username or email already exists in Firestore
    const usernameQuery = query(collection(firestore, 'users'), where('player.username', '==', trimmedUsername));
    const emailQuery = query(collection(firestore, 'users'), where('player.email', '==', trimmedEmail));
    const usernameSnapshot = await getDocs(usernameQuery);
    const emailSnapshot = await getDocs(emailQuery);

    if (!usernameSnapshot.empty) {
      return { success: false, message: 'Username already exists.' };
    }
    if (!emailSnapshot.empty) {
      return { success: false, message: 'Email is already in use.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      const isCreator = trimmedUsername === CREATOR_USERNAME;
      const isCabbageThief = trimmedUsername === CABBAGE_THIEF_USERNAME;
      const isVergil = trimmedUsername.toLowerCase() === 'vergil';
      const isRaytheon = trimmedUsername === RAYTHEON_USERNAME;

      let activeTitleId: string | null = null;
      let unlockedTitleIds: string[] = [];
      let badgeIds: string[] = [];
      let specialBackground: 'angelic' | 'cabbage' | undefined = undefined;
      let specialInsignia: 'black-flame' | undefined = undefined;
      let initialAchievements: Achievement[] = [];
      let customTitle: string | undefined = undefined;

      if (isCreator) {
        activeTitleId = 'creator';
        unlockedTitleIds = ['creator'];
        badgeIds = ['creator-badge', 'angelic-power-rune'];
        specialBackground = 'angelic';
        const achievement = achievementsData.find(a => a.id === 'creator');
        if(achievement) initialAchievements.push({ ...achievement, timestamp: new Date().toISOString() });
        const runeBadge = achievementsData.find(a => a.id === 'angelic-power-rune');
        if(runeBadge) initialAchievements.push({ ...runeBadge, timestamp: new Date().toISOString() });
      } else if (isCabbageThief) {
        activeTitleId = 'bk-foot-lettuce';
        unlockedTitleIds = ['bk-foot-lettuce'];
        specialBackground = 'cabbage';
        const achievement = achievementsData.find(a => a.id === 'bk-foot-lettuce');
        if(achievement) initialAchievements.push({ ...achievement, timestamp: new Date().toISOString() });
      } else if (isVergil) {
          customTitle = "motivated gooner";
      } else if (isRaytheon) {
          specialInsignia = 'black-flame';
          const achievement = achievementsData.find(a => a.id === 'black-flame-wanderer');
          if (achievement) {
              initialAchievements.push({ ...achievement, timestamp: new Date().toISOString() });
              unlockedTitleIds.push(achievement.id);
              activeTitleId = achievement.id;
          }
      }

      const newPlayer: Player = {
        uid: user.uid,
        username: trimmedUsername,
        displayName: displayName.trim(),
        avatar: ``,
        email: trimmedEmail,
        emailVerified: user.emailVerified,
        activeTitleId,
        unlockedTitleIds,
        badgeIds,
        friendUsernames: [],
        friendRequests: [],
        isCreator,
        isBanned: false,
        isMuted: false,
        profileBackgroundId: defaultBackground?.id || 'profile-bg-cyberpunk-red',
        ...(customTitle && { customTitle }),
        ...(specialBackground && { specialBackground }),
        ...(specialInsignia && { specialInsignia }),
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
        files: [],
      };

      await setDoc(doc(firestore, 'users', user.uid), newUserAccount);
      
      if (isCreator) {
          toast({
              title: <div className="text-4xl text-center w-full">🎉</div>,
              description: <div className="text-center font-bold">Creator Identified! Welcome.</div>,
              duration: 3000,
          });
      }

      return { success: true, message: 'Registration successful!' };
    } catch (error: any) {
      console.error("Registration Error: ", error);
      return { success: false, message: error.message || 'Failed to register.' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean, message: string }> => {
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return { success: false, message: 'Invalid email format. Please use your email to log in.' };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      // Log the login attempt
      await addDoc(collection(firestore, 'loginHistory'), {
          userId: userCredential.user.uid,
          username: userCredential.user.email, // Or fetch profile to get username
          timestamp: new Date().toISOString(),
          status: 'Success'
      });
      router.push('/dashboard');
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            return { success: false, message: 'Invalid email or password.' };
      }
      return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout Error: ", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out. Please try again." });
    }
  };

  const updateUserDoc = useCallback(async (updates: Partial<UserAccount> | {[key:string]: any}) => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error("Update User Doc Error: ", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Your changes could not be saved." });
    }
  }, [userDocRef, toast]);
  
  const logActivity = useCallback(async (activity: string, details: string) => {
    if (!currentUser) return;
    const newLog: Omit<ActivityLog, 'id'> = {
        userId: currentUser.player.uid,
        username: currentUser.player.username,
        timestamp: new Date().toISOString(),
        activity,
        details,
    };
    try {
      await addDoc(collection(firestore, 'activityLogs'), newLog);
    } catch (error) {
      console.error("Error logging activity: ", error);
    }
  }, [currentUser, firestore]);
  
  const addAchievement = useCallback((achievementId: string) => {
    if (!currentUser || currentUser.achievements.some(a => a.id === achievementId)) {
        return;
    }

    const achievementToAdd = achievementsData.find(a => a.id === achievementId);
    if (!achievementToAdd) {
        return;
    }

    const newAchievement: Achievement = {
        ...achievementToAdd,
        timestamp: new Date().toISOString(),
    }
    const newAchievements = [...currentUser.achievements, newAchievement];
    
    updateUserDoc({ achievements: newAchievements });

    toast({
        title: <div className="text-2xl text-center w-full">{achievementToAdd.type === 'badge' ? '🎖️' : '🏆'}</div>,
        description: <div className="text-center"><b>{achievementToAdd.type === 'badge' ? 'Badge' : 'Title'} Unlocked:</b> {achievementToAdd.name}</div>,
        duration: 4000
    });
  }, [currentUser, updateUserDoc, toast]);

  useEffect(() => {
    if (currentUser?.stats && currentUser.stats.totalResets >= 10) {
      addAchievement('greatest-reset');
    }
  }, [currentUser, addAchievement]);

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
          const existingScore = newProgress[cocId].scores[stepId] || 0;
          if (score > existingScore) {
            newProgress[cocId].scores[stepId] = score;
          }
      } else if (score >= 16) {
          outcome = 'retry';
      } else {
          outcome = 'reset';
          newProgress[cocId].completedSteps = [];
          newProgress[cocId].scores = {};
          (newStats as any)[cocId].resets += 1;
          newStats.totalResets += 1;
      }
      
      updateUserDoc({ stats: newStats, progress: newProgress });
      logActivity('Quiz Taken', `COC: ${cocId}, Step: ${stepId}, Score: ${score}/${totalQuestions}, Outcome: ${outcome}`);

      return outcome;
  };

  const updateAvatar = (avatarDataUrl: string) => {
    if (!currentUser) return;
    updateUserDoc({ 'player.avatar': avatarDataUrl });
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

      await updateUserDoc({ 'player.displayName': trimmedDisplayName });

      toast({
          title: "Display Name Updated!",
          description: `Your new display name is ${trimmedDisplayName}.`
      });

      return { success: true, message: 'Display name updated.' };
  };

  const sendFriendRequest = async (receiverUsername: string) => {
    if (!currentUser) return;

    const q = query(collection(firestore, 'users'), where('player.username', '==', receiverUsername));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      toast({ variant: 'destructive', title: 'User not found' });
      return;
    }
    const receiverDoc = snapshot.docs[0];
    const receiverData = receiverDoc.data() as UserAccount;

    if (receiverData.player.friendRequests.includes(currentUser.player.username)) {
      toast({ title: 'Request already sent' });
      return;
    }
    
    const newFriendRequests = [...receiverData.player.friendRequests, currentUser.player.username];
    await updateDoc(receiverDoc.ref, { 'player.friendRequests': newFriendRequests });

    toast({
      title: 'Request Sent!',
      description: `Your friend request to ${receiverData.player.displayName} has been sent.`,
    });
  };

  const acceptFriendRequest = async (senderUsername: string) => {
    if (!currentUser || !userDocRef) return;
    
    const q = query(collection(firestore, 'users'), where('player.username', '==', senderUsername));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const senderDoc = snapshot.docs[0];

    const batch = writeBatch(firestore);

    const newCurrentUserFriends = [...currentUser.player.friendUsernames, senderUsername];
    const newCurrentUserRequests = currentUser.player.friendRequests.filter(req => req !== senderUsername);
    batch.update(userDocRef, { 
      'player.friendUsernames': newCurrentUserFriends,
      'player.friendRequests': newCurrentUserRequests
    });

    const senderData = senderDoc.data() as UserAccount;
    const newSenderFriends = [...senderData.player.friendUsernames, currentUser.player.username];
    batch.update(senderDoc.ref, { 'player.friendUsernames': newSenderFriends });

    await batch.commit();

    toast({
      title: 'Friend Added!',
      description: `${senderData.player.displayName} is now your friend.`,
    });
  };

  const rejectFriendRequest = async (senderUsername: string) => {
    if (!currentUser || !userDocRef) return;
    const newRequests = currentUser.player.friendRequests.filter(req => req !== senderUsername);
    await updateUserDoc({ 'player.friendRequests': newRequests });

    const sender = accounts?.find(acc => acc.player.username === senderUsername);
    toast({
      title: 'Request Rejected',
      description: `You have rejected the friend request from ${sender?.player.displayName || senderUsername}.`,
    });
  };

  const removeFriend = async (friendUsername: string) => {
    if (!currentUser || !userDocRef) return;
    const batch = writeBatch(firestore);

    // Remove from current user
    const newCurrentUserFriends = currentUser.player.friendUsernames.filter(f => f !== friendUsername);
    batch.update(userDocRef, { 'player.friendUsernames': newCurrentUserFriends });

    // Remove from friend
    const friendQuery = query(collection(firestore, 'users'), where('player.username', '==', friendUsername));
    const friendSnapshot = await getDocs(friendQuery);
    if (!friendSnapshot.empty) {
      const friendDoc = friendSnapshot.docs[0];
      const friendData = friendDoc.data() as UserAccount;
      const newFriendFriends = friendData.player.friendUsernames.filter(f => f !== currentUser.player.username);
      batch.update(friendDoc.ref, { 'player.friendUsernames': newFriendFriends });
    }

    await batch.commit();

    toast({
      title: 'Friend Removed',
      description: `${friendUsername} has been removed from your friends list.`,
    });
  };

  const sendVerificationEmail = async () => {
    if (!authUser) return;
    try {
      await sendEmailVerification(authUser);
      toast({
        title: 'Verification Email Sent',
        description: `An email has been sent to ${authUser.email}. Please check your inbox.`,
      });
    } catch (error) {
      console.error("Send Verification Email Error: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send verification email.' });
    }
  };

  const verifyEmail = () => {
    toast({ title: 'This is a simulation', description: 'In a real app, you would verify by clicking a link in your email.' });
  };
  
  const updateProfileBackground = (idOrUrl: string) => {
    if (!currentUser) return;
    if (idOrUrl.startsWith('data:image/')) {
      updateUserDoc({ 'player.profileBackgroundId': 'custom', 'player.profileBackgroundUrl': idOrUrl });
      toast({ title: 'Custom Background Applied!' });
    } else {
      updateUserDoc({ 'player.profileBackgroundId': idOrUrl, 'player.profileBackgroundUrl': '' });
      toast({ title: 'Profile Background Updated!' });
    }
  };

  const updateEmail = async (newEmail: string): Promise<{ success: boolean; message: string }> => {
    if (!authUser || !userDocRef) return { success: false, message: "Not logged in." };
    
    const trimmedEmail = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmedEmail)) {
        return { success: false, message: 'Please enter a valid Gmail address.' };
    }
    const emailQuery = query(collection(firestore, "users"), where("player.email", "==", trimmedEmail));
    const snapshot = await getDocs(emailQuery);
    if (!snapshot.empty) {
        return { success: false, message: "Email is already in use." };
    }
    
    try {
        await updateAuthEmail(authUser, trimmedEmail);
        await updateDoc(userDocRef, { 'player.email': trimmedEmail, 'player.emailVerified': false });
        toast({ title: "Email Updated", description: "Your email has been updated. Please re-verify." });
        return { success: true, message: "Success" };
    } catch (error: any) {
        console.error("Update Email Error:", error);
        return { success: false, message: "Failed to update email. You may need to log out and log back in." };
    }
  };
  
  const sendPasswordResetCode = async (email: string): Promise<{ success: boolean; message: string; }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email with instructions to reset your password has been sent to ${email}.`,
      });
      return { success: true, message: 'Email sent.' };
    } catch(error: any) {
      console.error("Password Reset Error: ", error);
      return { success: false, message: error.message || "Failed to send password reset email." };
    }
  };
  
  const resetPassword = async (email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string; }> => {
    return { success: false, message: "This function is deprecated. Please use the link sent to your email." };
  }

  const uploadFile = async (file: File) => {
    if (!currentUser || !userDocRef) return;
    if (file.size > 5 * 1024 * 1024) { 
      toast({ variant: "destructive", title: "File is too large", description: "Files must be smaller than 5MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const newFile: UserFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        ownerUsername: currentUser.player.username,
        sharedWith: [],
        uploadDate: new Date().toISOString(),
      };
      await updateUserDoc({ files: [...currentUser.files, newFile] });
      logActivity('File Uploaded', `File: ${file.name}`);
      toast({ title: "File Uploaded", description: `"${file.name}" has been saved.` });
    };
    reader.readAsDataURL(file);
  };
  
  const deleteFile = async (fileId: string) => {
    if (!currentUser) return;
    const updatedFiles = currentUser.files.filter(f => f.id !== fileId);
    await updateUserDoc({ files: updatedFiles });
    toast({ title: "File Deleted" });
  };
  
  const shareFile = async (fileId: string, friendUsername: string) => {
    if (!currentUser) return;
    const fileToShare = currentUser.files.find(f => f.id === fileId);
    if (!fileToShare) return;

    const friendQuery = query(collection(firestore, "users"), where("player.username", "==", friendUsername));
    const friendSnapshot = await getDocs(friendQuery);
    if (friendSnapshot.empty) {
        toast({ variant: "destructive", title: "Friend not found." });
        return;
    }
    const friendDoc = friendSnapshot.docs[0];
    const friendData = friendDoc.data() as UserAccount;
    const newSharedWith = [...fileToShare.sharedWith, friendUsername];
    const updatedMyFiles = currentUser.files.map(f => f.id === fileId ? { ...f, sharedWith: newSharedWith } : f);

    const batch = writeBatch(firestore);
    batch.update(userDocRef!, { files: updatedMyFiles });
    batch.update(friendDoc.ref, { files: [...friendData.files, fileToShare] });
    await batch.commit();

    toast({ title: "File Shared!", description: `Shared "${fileToShare.name}" with ${friendUsername}.` });
  };
  
  const postFeedback = async (message: string) => {
    if (!currentUser) return;
    if (currentUser.player.isBanned || currentUser.player.isMuted) {
      toast({ variant: 'destructive', title: 'Action Restricted' });
      return;
    }
    const newFeedback: Omit<FeedbackPost, 'id'> = {
      userId: currentUser.player.uid,
      username: currentUser.player.username,
      displayName: currentUser.player.displayName,
      avatar: currentUser.player.avatar,
      message,
      timestamp: new Date().toISOString(),
      specialInsignia: currentUser.player.specialInsignia,
    };
    await addDoc(collection(firestore, 'feedback'), newFeedback);
    logActivity('Feedback Posted', `Message: "${message.substring(0, 30)}..."`);
    toast({ title: "Feedback Submitted!" });
  };

  const updateUserPropertyByUsername = async (username: string, updates: Partial<Player>) => {
    const q = query(collection(firestore, 'users'), where('player.username', '==', username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const userDoc = snapshot.docs[0];
    const playerUpdate: any = {};
    for (const key in updates) {
        playerUpdate[`player.${key}`] = (updates as any)[key];
    }
    await updateDoc(userDoc.ref, playerUpdate);
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

  return (
    <GameContext.Provider value={{
      currentUser,
      isUserLoading: isAuthLoading || isProfileLoading,
      isAdmin,
      accounts: accounts || [],
      loginHistory: loginHistory || [],
      activityLogs: activityLogs || [],
      feedbackPosts: feedbackPosts || [],
      logActivity, register, login, logout, completeQuiz, addAchievement, updateAvatar, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, sendVerificationEmail, verifyEmail, updateProfileBackground, updateEmail, sendPasswordResetCode, resetPassword, updateDisplayName, uploadFile, deleteFile, shareFile, postFeedback, banUser, unbanUser, muteUser, unmuteUser, setCustomTitle
    }}>
      {children}
    </GameContext.Provider>
  );
}
