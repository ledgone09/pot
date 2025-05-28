import { PublicKey } from '@solana/web3.js';

export interface UserProfile {
  walletAddress: string;
  username: string;
  profilePicture?: string; // URL to profile picture, fallback to placeholder.png
  createdAt: number;
  updatedAt: number;
}

export interface JackpotEntry {
  id: string;
  user: PublicKey;
  amount: number;
  timestamp: number;
  userAddress: string;
  weight: number;
  userProfile?: UserProfile; // Optional user profile data
}

export interface JackpotState {
  currentRound: number;
  totalPool: number;
  entries: JackpotEntry[];
  roundStartTime: number;
  roundDuration: number; // 60 seconds
  timeRemaining: number;
  isActive: boolean;
  phase: 'active' | 'countdown' | 'resolution' | 'reset';
  lastWinner?: {
    address: string;
    amount: number;
    round: number;
    timestamp: number;
  };
}

export interface UserStats {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  winCount: number;
  currentRoundEntries: JackpotEntry[];
  balance: number;
}

export interface WinnerData {
  address: string;
  amount: number;
  round: number;
  timestamp: number;
  signature?: string;
}

export interface ChatMessage {
  id: string;
  userAddress: string;
  username: string;
  profilePicture?: string;
  message: string;
  timestamp: number;
  type: 'user' | 'system' | 'winner';
}

export interface SocketEvents {
  'pool_update': (pool: number) => void;
  'timer_update': (time: number) => void;
  'new_entry': (entry: JackpotEntry) => void;
  'round_end': (winner: WinnerData) => void;
  'round_start': (round: number) => void;
  'phase_change': (phase: JackpotState['phase']) => void;
  'chat_message': (message: ChatMessage) => void;
  'user_joined': (userAddress: string) => void;
  'user_left': (userAddress: string) => void;
}

export interface BetTransaction {
  amount: number;
  signature?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

export interface PlatformConfig {
  minBet: number; // 0.01 SOL
  maxBet: number; // 10 SOL
  maxEntriesPerUser: number; // 10
  roundDuration: number; // 60 seconds
  cutoffTime: number; // 55 seconds
  feePercentage: number; // 5%
  seedPercentage: number; // 5%
}

export interface AnimationConfig {
  confettiCount: number;
  particleCount: number;
  celebrationDuration: number;
  pulseIntensity: number;
} 