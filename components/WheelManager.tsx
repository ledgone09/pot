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

  return (
    <AnimatePresence>
      {showWheel && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border border-white/20 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSpinning ? '🎲 Selecting Winner...' : currentWinner ? '🎉 We Have a Winner!' : '⏱️ Round Ending...'}
              </h2>
              <p className="text-gray-300">
                {isSpinning ? 'Cards are spinning to select a winner!' : currentWinner ? 'Congratulations!' : 'Preparing to select winner...'}
              </p>
            </div>

            <SpinningCards
              isSpinning={isSpinning}
              winner={currentWinner}
              onSpinComplete={handleSpinComplete}
            />

            {currentWinner && !isSpinning && (
              <motion.div
                className="mt-6 text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                                 <h3 className="text-lg font-bold text-yellow-400 mb-2">
                   🏆 Winner Gets: {lastWinner?.amount.toFixed(4)} SOL
                 </h3>
                <p className="text-sm text-gray-300">
                  From a total pool of {entries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(4)} SOL
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WheelManager; 