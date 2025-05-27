'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { JackpotEntry } from '@/types';
import { formatSolAmount, shortenAddress } from '@/lib/solana';

interface ParticipantCardProps {
  entry: JackpotEntry;
  isWinner?: boolean;
  isSpinning?: boolean;
  delay?: number;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  entry, 
  isWinner = false, 
  isSpinning = false,
  delay = 0 
}) => {
  // Generate a consistent avatar based on wallet address
  const getAvatarUrl = (address: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  return (
    <motion.div
      className={`
        relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 
        backdrop-blur-sm rounded-xl p-4 border transition-all duration-300
        ${isWinner 
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20' 
          : 'border-gray-600/50 hover:border-gray-500/70'
        }
        ${isSpinning ? 'animate-pulse' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      {/* Winner indicator */}
      {isWinner && (
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          🏆 WINNER
        </motion.div>
      )}

      {/* Selection indicator during spinning */}
      {isSpinning && (
        <motion.div
          className="absolute inset-0 bg-blue-500/20 rounded-xl border-2 border-blue-400"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="flex flex-col items-center space-y-3">
        {/* Profile Picture */}
        <div className={`
          relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300
          ${isWinner ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-gray-500/50'}
        `}>
          <img
            src={getAvatarUrl(entry.userAddress)}
            alt={shortenAddress(entry.userAddress)}
            className="w-full h-full object-cover"
          />
          
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800" />
        </div>

        {/* Username */}
        <div className="text-center">
          <p className={`
            font-semibold text-sm transition-colors duration-300
            ${isWinner ? 'text-yellow-300' : 'text-gray-200'}
          `}>
            {shortenAddress(entry.userAddress)}
          </p>
        </div>

        {/* Bet Amount */}
        <div className={`
          flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-bold transition-all duration-300
          ${isWinner 
            ? 'bg-yellow-400/20 text-yellow-300' 
            : 'bg-blue-500/20 text-blue-300'
          }
        `}>
          <span className="text-xs">≈</span>
          <span>{formatSolAmount(entry.amount)}</span>
        </div>

        {/* Win percentage */}
        <div className="text-xs text-gray-400">
          {/* This would be calculated based on bet amount vs total pool */}
        </div>
      </div>

      {/* Winner effects */}
      {isWinner && (
        <>
          {/* Confetti particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, (Math.cos((i * 60 * Math.PI) / 180)) * 40],
                y: [0, (Math.sin((i * 60 * Math.PI) / 180)) * 40],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default ParticipantCard; 