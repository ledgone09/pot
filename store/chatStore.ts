import { create } from 'zustand';
import { ChatMessage } from '@/types';

interface ChatStore {
  messages: ChatMessage[];
  onlineUsers: Set<string>;
  isConnected: boolean;
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  addSystemMessage: (text: string) => void;
  addWinnerMessage: (winnerAddress: string, username: string, amount: number) => void;
  userJoined: (userAddress: string) => void;
  userLeft: (userAddress: string) => void;
  setConnected: (connected: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  onlineUsers: new Set(),
  isConnected: false,

  addMessage: (message: ChatMessage) => {
    set((state) => {
      // Check if message already exists (prevent duplicates)
      const messageExists = state.messages.some(msg => 
        msg.id === message.id || 
        (msg.userAddress === message.userAddress && 
         msg.message === message.message && 
         Math.abs(msg.timestamp - message.timestamp) < 1000)
      );
      
      if (messageExists) {
        console.log('Duplicate message prevented in store');
        return state;
      }
      
      return {
        messages: [...state.messages.slice(-99), message], // Keep last 100 messages
      };
    });
  },

  addSystemMessage: (text: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      userAddress: 'system',
      username: 'System',
      message: text,
      timestamp: Date.now(),
      type: 'system',
    };
    get().addMessage(systemMessage);
  },

  addWinnerMessage: (winnerAddress: string, username: string, amount: number) => {
    const winnerMessage: ChatMessage = {
      id: `winner-${Date.now()}`,
      userAddress: winnerAddress,
      username,
      message: `🎉 Won ${amount.toFixed(4)} SOL!`,
      timestamp: Date.now(),
      type: 'winner',
    };
    get().addMessage(winnerMessage);
  },

  userJoined: (userAddress: string) => {
    set((state) => ({
      onlineUsers: new Set([...Array.from(state.onlineUsers), userAddress]),
    }));
  },

  userLeft: (userAddress: string) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userAddress);
      return { onlineUsers: newOnlineUsers };
    });
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  clearMessages: () => {
    set({ messages: [] });
  },
})); 