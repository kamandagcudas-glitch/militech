
export interface Player {
  uid: string; // Firebase Auth User ID
  username: string;
  displayName: string;
  avatar: string;
  email?: string;
  emailVerified: boolean;
  activeTitleId: string | null;
  customTitle?: string;
  isBanned: boolean;
  isMuted: boolean;
  unlockedTitleIds: string[];
  badgeIds: string[];
  friendUsernames: string[];
  friendRequests: string[];
  isCreator: boolean;
  profileBackgroundId?: string;
  profileBackgroundUrl?: string;
  specialBackground?: 'angelic' | 'cabbage';
  specialInsignia?: 'black-flame';
  passwordResetCode?: string;
  passwordResetExpires?: string;
}

export interface PlayerStats {
  coc1: { attempts: number; resets: number };
  coc2: { attempts: number; resets: number };
  coc3: { attempts: number; resets: number };
  coc4: { attempts: number; resets: number };
  totalResets: number;
}

export interface PlayerProgress {
  [cocId: string]: {
    completedSteps: string[];
    scores: { [stepId: string]: number };
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'title' | 'badge';
  timestamp?: string;
}

export interface UserFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  ownerUsername: string;
  sharedWith: string[];
  uploadDate: string;
}

export interface FeedbackPost {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  message: string;
  timestamp: string;
  specialInsignia?: 'black-flame';
}

export interface LoginAttempt {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  status: 'Success' | 'Failed';
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  activity: string;
  details: string;
}

// This is the main data structure for a user account, stored in a Firestore document.
// It combines all user-related data into a single object.
export interface UserAccount {
  player: Player;
  stats: PlayerStats;
  progress: PlayerProgress;
  achievements: Achievement[];
  files: UserFile[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Lesson {
  text: string[];
  imageId: string;
}

export interface Step {
  id: string;
  title: string;
  lesson: Lesson;
  quiz: QuizQuestion[];
}

export interface COC {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

export interface MiniGameRound {
  id: string;
  imageIds: string[];
  answer: string;
  hint?: string;
}

export interface WordCompletionGameRound {
  id: string;
  answer: string;
  hint: string;
}

export interface SystemPart {
  id: string;
  name: string;
  description: string;
  installation: string;
  // Position on the main image, in percentages
  position: { top: string; left: string; width: string; height: string; };
}

export interface PcPart {
  name: string;
  description: string;
  imageId: string;
  price: number;
}

export type PcPartCategory = 'CPU' | 'GPU' | 'RAM' | 'Storage' | 'Motherboard' | 'Power Supply' | 'Case';

export interface PcBuild {
  id: 'gaming' | 'working' | 'coding';
  name: string;
  description: string;
  parts: Record<PcPartCategory, PcPart>;
}
