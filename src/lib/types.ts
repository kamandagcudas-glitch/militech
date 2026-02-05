export interface Player {
  username: string;
  displayName: string;
  avatar: string;
  email?: string;
  emailVerified: boolean;
  activeTitleId: string | null;
  unlockedTitleIds: string[];
  badgeIds: string[];
  friendUsernames: string[];
  friendRequests: string[];
  // This is the creator easter egg flag
  isCreator: boolean;
  profileBackgroundId?: string;
  profileBackgroundUrl?: string;
  specialBackground?: 'angelic' | 'cabbage';
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
  username: string;
  displayName: string;
  avatar: string;
  message: string;
  timestamp: string;
}

// This is the main data structure for a user account, stored in local storage.
// It combines all user-related data into a single object.
export interface UserAccount {
  player: Player;
  stats: PlayerStats;
  progress: PlayerProgress;
  achievements: Achievement[];
  hashedPassword: string;
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
