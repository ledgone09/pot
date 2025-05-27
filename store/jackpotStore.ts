import { create } from 'zustand';
import { JackpotState, JackpotEntry, UserStats, WinnerData, PlatformConfig } from '@/types';

interface JackpotStore extends JackpotState {
  userStats: UserStats;
  recentWinners: WinnerData[];
  config: PlatformConfig;
  isConnected: boolean;
  userAddress: string | null;
  
  // Actions
  updatePool: (pool: number) => void;
  updateTimer: (time: number) => void;
  addEntry: (entry: JackpotEntry) => void;
  updateEntry: (entry: JackpotEntry) => void;
  setWinner: (winner: WinnerData) => void;
  startNewRound: (round: number) => void;
  clearEntries: () => void;
  setPhase: (phase: JackpotState['phase']) => void;
  setUserStats: (stats: UserStats) => void;
  setConnection: (connected: boolean, address?: string) => void;
  reset: () => void;
}

const defaultConfig: PlatformConfig = {
  minBet: 0.01,
  maxBet: 10,
  maxEntriesPerUser: 10,
  roundDuration: 60,
  cutoffTime: 55,
  feePercentage: 5,
  seedPercentage: 5,
};

const defaultUserStats: UserStats = {
  totalBets: 0,
  totalWagered: 0,
  totalWon: 0,
  winCount: 0,
  currentRoundEntries: [],
  balance: 0,
};

export const useJackpotStore = create<JackpotStore>((set, get) => ({
  // Initial state
  currentRound: 1,
  totalPool: 0,
  entries: [],
  roundStartTime: Date.now(),
  roundDuration: 60,
  timeRemaining: 60,
  isActive: true,
  phase: 'active',
  lastWinner: undefined,
  userStats: defaultUserStats,
  recentWinners: [],
  config: defaultConfig,
  isConnected: false,
  userAddress: null,

  // Actions
  updatePool: (pool: number) => {
    set({ totalPool: pool });
  },

  updateTimer: (time: number) => {
    const phase = time > 5 ? 'active' : time > 0 ? 'countdown' : 'resolution';
    set({ timeRemaining: time, phase });
  },

  addEntry: (entry: JackpotEntry) => {
    set((state) => {
      // Check if entry already exists for this user
      const existingIndex = state.entries.findIndex((e) => e.userAddress === entry.userAddress);
      
      let newEntries;
      if (existingIndex !== -1) {
        // Replace existing entry instead of adding duplicate
        newEntries = [...state.entries];
        newEntries[existingIndex] = entry;
      } else {
        // Add new entry
        newEntries = [...state.entries, entry];
      }
      
      const newPool = newEntries.reduce((sum, e) => sum + e.amount, 0);
      
      // Update user stats if this is the current user's entry
      let newUserStats = state.userStats;
      if (state.userAddress && entry.userAddress === state.userAddress) {
        const existingUserEntryIndex = state.userStats.currentRoundEntries.findIndex(
          (e) => e.userAddress === entry.userAddress
        );
        
        let updatedCurrentRoundEntries;
        if (existingUserEntryIndex !== -1) {
          updatedCurrentRoundEntries = [...state.userStats.currentRoundEntries];
          updatedCurrentRoundEntries[existingUserEntryIndex] = entry;
        } else {
          updatedCurrentRoundEntries = [...state.userStats.currentRoundEntries, entry];
        }
        
        newUserStats = {
          ...state.userStats,
          currentRoundEntries: updatedCurrentRoundEntries,
          totalBets: state.userStats.totalBets + (existingIndex === -1 ? 1 : 0), // Only increment if new entry
          totalWagered: state.userStats.totalWagered + entry.amount,
        };
      }
      
      return {
        entries: newEntries,
        totalPool: newPool,
        userStats: newUserStats,
      };
    });
  },

  updateEntry: (entry: JackpotEntry) => {
    set((state) => {
      // Find if entry already exists for this user
      const existingIndex = state.entries.findIndex((e) => e.userAddress === entry.userAddress);
      
      let newEntries;
      if (existingIndex !== -1) {
        // Replace existing entry
        newEntries = [...state.entries];
        newEntries[existingIndex] = entry;
      } else {
        // Add new entry if not found
        newEntries = [...state.entries, entry];
      }
      
      const newPool = newEntries.reduce((sum, e) => sum + e.amount, 0);
      
      // Update user stats if this is the current user's entry
      let newUserStats = state.userStats;
      if (state.userAddress && entry.userAddress === state.userAddress) {
        const existingUserEntryIndex = state.userStats.currentRoundEntries.findIndex(
          (e) => e.userAddress === entry.userAddress
        );
        
        let updatedCurrentRoundEntries;
        if (existingUserEntryIndex !== -1) {
          updatedCurrentRoundEntries = [...state.userStats.currentRoundEntries];
          updatedCurrentRoundEntries[existingUserEntryIndex] = entry;
        } else {
          updatedCurrentRoundEntries = [...state.userStats.currentRoundEntries, entry];
        }
        
        newUserStats = {
          ...state.userStats,
          currentRoundEntries: updatedCurrentRoundEntries,
        };
      }
      
      return {
        entries: newEntries,
        totalPool: newPool,
        userStats: newUserStats,
      };
    });
  },

  setWinner: (winner: WinnerData) => {
    set((state) => ({
      lastWinner: winner,
      recentWinners: [winner, ...state.recentWinners.slice(0, 9)], // Keep last 10 winners
      phase: 'reset',
    }));
  },

  startNewRound: (round: number) => {
    set((state) => ({
      currentRound: round,
      entries: [],
      totalPool: 0,
      roundStartTime: Date.now(),
      timeRemaining: state.config.roundDuration,
      isActive: true,
      phase: 'active',
      userStats: {
        ...state.userStats,
        currentRoundEntries: [],
      },
    }));
  },

  setPhase: (phase: JackpotState['phase']) => {
    set({ phase });
  },

  setUserStats: (stats: UserStats) => {
    set({ userStats: stats });
  },

  setConnection: (connected: boolean, address?: string) => {
    set((state) => ({ 
      isConnected: connected, 
      userAddress: address || null,
      userStats: connected ? state.userStats : { ...defaultUserStats },
    }));
  },

  reset: () => {
    set({
      currentRound: 1,
      totalPool: 0,
      entries: [],
      roundStartTime: Date.now(),
      timeRemaining: 60,
      isActive: true,
      phase: 'active',
      lastWinner: undefined,
      userStats: { ...defaultUserStats },
      recentWinners: [],
      isConnected: false,
      userAddress: null,
    });
  },

  clearEntries: () => {
    set((state) => ({
      entries: [],
      totalPool: 0,
      userStats: {
        ...state.userStats,
        currentRoundEntries: [],
      },
    }));
  },
})); 