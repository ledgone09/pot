'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import SpinningCards from './SpinningCards';
import { JackpotEntry } from '@/types';

const WheelManager: React.FC = () => {
  const { phase, entries, lastWinner } = useJackpotStore();
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<JackpotEntry | undefined>();

  useEffect(() => {
    // Show wheel when phase changes to resolution (betting ends)
    if (phase === 'resolution' && entries.length > 0) {
      setShowWheel(true);
      // Start spinning after a brief delay
      setTimeout(() => {
        setIsSpinning(true);
      }, 500);
    } else if (phase === 'active') {
      // Hide wheel when new round starts
      setShowWheel(false);
      setIsSpinning(false);
      setCurrentWinner(undefined);
    }
  }, [phase, entries]);

  useEffect(() => {
    // Set winner when winner data comes in
    if (lastWinner) {
      // Find the matching entry for the winner
      const winnerEntry = entries.find(entry => entry.userAddress === lastWinner.address);
      if (winnerEntry) {
        setCurrentWinner(winnerEntry);
      }
    }
  }, [lastWinner, entries]);

  const handleSpinComplete = () => {
    setIsSpinning(false);
    // Keep showing winner for a few seconds
    setTimeout(() => {
      setShowWheel(false);
      setCurrentWinner(undefined);
    }, 5000);
  };

  // This component is no longer needed as the animation happens in ModernJackpotDisplay
  return null;
};

export default WheelManager; 