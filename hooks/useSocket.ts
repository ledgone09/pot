import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useJackpotStore } from '@/store/jackpotStore';
import { useChatStore } from '@/store/chatStore';
import { JackpotEntry, WinnerData, ChatMessage } from '@/types';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const {
    updatePool,
    updateTimer,
    addEntry,
    updateEntry,
    setWinner,
    startNewRound,
    clearEntries,
    setPhase,
  } = useJackpotStore();

  const {
    addMessage,
    userJoined,
    userLeft,
    setConnected,
  } = useChatStore();

  useEffect(() => {
    // Initialize socket connection - use same URL as app when no separate socket URL provided
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to jackpot server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from jackpot server');
      setConnected(false);
    });

    socket.on('pool_update', (pool: number) => {
      updatePool(pool);
    });

    socket.on('timer_update', (time: number) => {
      updateTimer(time);
    });

    socket.on('new_entry', (entry: JackpotEntry) => {
      addEntry(entry);
    });

    socket.on('update_entry', (entry: JackpotEntry) => {
      updateEntry(entry);
    });

    socket.on('round_end', (winner: WinnerData) => {
      setWinner(winner);
    });

    socket.on('recent_winners', (winners: WinnerData[]) => {
      // Set initial recent winners without triggering winner animation
      useJackpotStore.setState((state) => ({
        ...state,
        recentWinners: winners.slice(0, 5)
      }));
    });

    socket.on('round_start', (round: number) => {
      startNewRound(round);
    });

    socket.on('clear_entries', () => {
      // Only clear entries if we're not in resolution or reset phase
      // This allows winner animation to complete
      const currentPhase = useJackpotStore.getState().phase;
      if (currentPhase !== 'resolution' && currentPhase !== 'reset') {
        clearEntries();
      }
    });

    socket.on('phase_change', (phase: 'active' | 'countdown' | 'resolution' | 'reset') => {
      setPhase(phase);
    });

    // Chat event listeners
    socket.on('chat_message', (message: ChatMessage) => {
      addMessage(message);
    });

    socket.on('user_joined', (userAddress: string) => {
      userJoined(userAddress);
    });

    socket.on('user_left', (userAddress: string) => {
      userLeft(userAddress);
    });

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array to prevent re-initialization

  // Stable function references using useCallback
  const emitBet = useCallback((entry: JackpotEntry) => {
    if (socketRef.current) {
      socketRef.current.emit('place_bet', entry);
    }
  }, []);

  const emitJoinRoom = useCallback((userAddress: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', userAddress);
    }
  }, []);

  const emitLeaveRoom = useCallback((userAddress: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', userAddress);
    }
  }, []);

  const emitChatMessage = useCallback((message: ChatMessage) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', message);
    }
  }, []);

  return {
    socket: socketRef.current,
    emitBet,
    emitJoinRoom,
    emitLeaveRoom,
    emitChatMessage,
    isConnected: socketRef.current?.connected || false,
  };
}; 