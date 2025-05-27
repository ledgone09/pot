'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { JackpotEntry } from '@/types';
import { formatSolAmount, shortenAddress } from '@/lib/solana';

interface ParticipantCardProps {
  entry: JackpotEntry & { isPlaceholder?: boolean };
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

  // Check if this is a placeholder card
  const isPlaceholder = entry.isPlaceholder || entry.amount === 0;

  return (
    <motion.div
      className={`
        relative bg-gradient-to-br backdrop-blur-sm rounded-2xl p-3 border-2 transition-all duration-300 overflow-hidden h-56
        ${isPlaceholder 
          ? 'from-gray-900/40 to-gray-800/40 border-gray-700/30 opacity-50' 
          : isWinner 
            ? 'from-yellow-500/10 to-orange-500/10 border-yellow-400 shadow-2xl shadow-yellow-400/30' 
            : 'from-gray-800/80 to-gray-900/80 border-gray-600/50 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/20'
        }
        ${isSpinning ? 'animate-pulse border-blue-400 shadow-lg shadow-blue-400/50' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={!isPlaceholder ? { y: -2, scale: 1.02 } : {}}
      layout={false}
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

      {/* Decorative background effects */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20 animate-pulse"></div>
      )}
      
      {isSpinning && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 animate-pulse"></div>
      )}

      <div className="relative flex flex-col items-center justify-center space-y-2 h-full">
        {/* Profile Picture */}
        <div className={`
          relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg
          ${isPlaceholder 
            ? 'border-gray-700/50 bg-gray-800/50' 
            : isWinner 
              ? 'border-yellow-400 shadow-yellow-400/40 ring-2 ring-yellow-400/30' 
              : 'border-gray-500/50 hover:border-blue-400/70'
          }
        `}>
          {!isPlaceholder ? (
            <>
              <img
                src={getAvatarUrl(entry.userAddress)}
                alt={shortenAddress(entry.userAddress)}
                className="w-full h-full object-cover"
              />
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800 shadow-lg animate-pulse" />
              
              {/* Winner crown */}
              {isWinner && (
                <motion.div
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <div className="text-yellow-400 text-lg">👑</div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-700/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-600/50 animate-pulse" />
            </div>
          )}
        </div>

        {/* Username */}
        <div className="text-center">
          <p className={`
            font-bold text-sm transition-colors duration-300 tracking-wide
            ${isPlaceholder 
              ? 'text-gray-500' 
              : isWinner 
                ? 'text-yellow-300 drop-shadow-lg' 
                : 'text-gray-200'
            }
          `}>
            {isPlaceholder ? '...' : shortenAddress(entry.userAddress)}
          </p>
          
          {!isPlaceholder && (
            <div className="flex items-center justify-center mt-1 space-x-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400 font-medium">Online</span>
            </div>
          )}
        </div>

        {/* Bet Amount */}
        {!isPlaceholder && (
          <div className={`
            flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 min-w-[80px] justify-center shadow-lg
            ${isWinner 
              ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-200 border border-yellow-400/50' 
              : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border border-blue-500/50'
            }
          `}>
            <span className="text-xs opacity-75">≈</span>
            <span>{formatSolAmount(entry.amount)}</span>
            <span className="text-xs opacity-75">SOL</span>
          </div>
        )}

        {/* Win chance indicator */}
        {!isPlaceholder && entry.amount > 0 && (
          <div className="text-xs text-gray-400 text-center">
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${isWinner 
                ? 'bg-yellow-500/20 text-yellow-300' 
                : 'bg-gray-700/50 text-gray-400'
              }
            `}>
              {isWinner ? '🎉 WINNER!' : '🎯 In the draw'}
            </div>
          </div>
        )}
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