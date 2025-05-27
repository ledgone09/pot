import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotEntry, WinnerData } from '@/types';

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
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from jackpot server');
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

  return {
    socket: socketRef.current,
    emitBet,
    emitJoinRoom,
    emitLeaveRoom,
    isConnected: socketRef.current?.connected || false,
  };
}; 