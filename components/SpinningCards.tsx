'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotEntry } from '@/types';
import ParticipantCard from './ParticipantCard';
import { Trophy } from 'lucide-react';

interface SpinningCardsProps {
  isSpinning: boolean;
  winner?: JackpotEntry;
  onSpinComplete?: () => void;
}

const SpinningCards: React.FC<SpinningCardsProps> = ({ 
  isSpinning, 
  winner, 
  onSpinComplete 
}) => {
  const { entries } = useJackpotStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState(0);

  useEffect(() => {
    if (isSpinning && !isAnimating && entries.length > 0) {
      setIsAnimating(true);
      
      // Find winner index
      const winnerIndex = winner 
        ? entries.findIndex(entry => entry.userAddress === winner.userAddress)
        : Math.floor(Math.random() * entries.length);

      // Spinning animation - cycle through cards multiple times before landing on winner
      const totalSpins = 15 + winnerIndex; // Multiple cycles + landing position
      let currentIndex = 0;
      
      const spinInterval = setInterval(() => {
        setCurrentHighlight(currentIndex % entries.length);
        currentIndex++;
        
        if (currentIndex >= totalSpins) {
          clearInterval(spinInterval);
          setSelectedIndex(winnerIndex);
          setCurrentHighlight(winnerIndex);
          
          setTimeout(() => {
            setIsAnimating(false);
            onSpinComplete?.();
          }, 1000);
        }
      }, isAnimating ? 100 : 200); // Speed up during animation

      return () => clearInterval(spinInterval);
    }
  }, [isSpinning, winner, entries, isAnimating, onSpinComplete]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-400">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Waiting for participants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          {isAnimating ? '🎲 Selecting Winner...' : selectedIndex !== null ? '🎉 Winner Selected!' : '👥 Participants'}
        </h3>
        <p className="text-gray-300">
          {isAnimating ? 'Cards are spinning!' : selectedIndex !== null ? 'Congratulations to the winner!' : `${entries.length} players in this round`}
        </p>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id || entry.userAddress}
              layout
              className={`transform transition-all duration-300 ${
                isAnimating && currentHighlight === index 
                  ? 'scale-110 z-10' 
                  : isAnimating 
                    ? 'scale-95 opacity-60' 
                    : 'scale-100'
              }`}
            >
              <ParticipantCard
                entry={entry}
                isWinner={selectedIndex === index}
                isSpinning={isAnimating && currentHighlight === index}
                delay={index * 0.1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Winner Announcement */}
      {selectedIndex !== null && !isAnimating && (
        <motion.div
          className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-400">Winner Takes All!</h3>
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          
          <p className="text-lg text-white mb-2">
            🎉 <strong>{entries[selectedIndex]?.userAddress.slice(0, 8)}...</strong> wins the jackpot!
          </p>
          
          <div className="text-2xl font-bold text-yellow-300">
            {winner?.amount?.toFixed(4) || '0.0000'} SOL
          </div>
          
          <p className="text-sm text-gray-300 mt-2">
            From a total pool of {entries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(4)} SOL
          </p>
        </motion.div>
      )}

      {/* Spinning effects */}
      {isAnimating && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};

export default SpinningCards; 