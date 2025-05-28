'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { JackpotEntry } from '@/types';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { useUserProfileStore } from '@/store/userProfileStore';

interface ParticipantCardProps {
  entry: JackpotEntry & { isPlaceholder?: boolean };
  isWinner?: boolean;
  isSpinning?: boolean;
  delay?: number;
  totalPool?: number;
  allEntries?: JackpotEntry[];
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  entry, 
  isWinner = false, 
  isSpinning = false,
  delay = 0,
  totalPool = 0,
  allEntries = []
}) => {
  const { getUserProfile } = useUserProfileStore();

  // Get user profile for this entry - prefer embedded profile data, fallback to local lookup
  const userProfile = entry.userProfile || (entry.userAddress ? getUserProfile(entry.userAddress) : null);

  // Check if this is a placeholder card
  const isPlaceholder = (entry as any).isPlaceholder === true || (!entry.userAddress || entry.userAddress.startsWith('placeholder'));

  // Calculate odds percentage
  const calculateOdds = () => {
    if (isPlaceholder || !entry.amount || totalPool === 0) return 0;
    return ((entry.amount / totalPool) * 100);
  };

  const oddsPercentage = calculateOdds();
  
  // Debug log to check if totalPool is updating
  React.useEffect(() => {
    if (!isPlaceholder && entry.userAddress) {
      console.log(`Card ${entry.userAddress.slice(0, 8)}: amount=${entry.amount}, totalPool=${totalPool}, odds=${oddsPercentage.toFixed(1)}%`);
    }
  }, [totalPool, entry.amount, oddsPercentage, isPlaceholder, entry.userAddress]);

  // Get display name (username or shortened address)
  const getDisplayName = () => {
    if (isPlaceholder) return '...';
    if (userProfile?.username) return userProfile.username;
    return shortenAddress(entry.userAddress);
  };

  // Get profile picture (custom or placeholder)
  const getProfilePicture = () => {
    if (isPlaceholder) return '/placeholder.svg';
    if (userProfile?.profilePicture) return userProfile.profilePicture;
    return '/placeholder.svg';
  };

  return (
    <motion.div
      className={`
        relative bg-gradient-to-br backdrop-blur-sm rounded-2xl p-3 border-2 transition-all duration-500 overflow-visible h-56
        ${isPlaceholder 
          ? 'from-gray-900/40 to-gray-800/40 border-gray-700/30 opacity-50' 
          : isWinner 
            ? 'from-yellow-500/10 to-orange-500/10 border-yellow-400' 
            : 'from-gray-800/80 to-gray-900/80 border-gray-600/50 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/20'
        }
        ${isSpinning ? 'animate-pulse border-blue-400 shadow-lg shadow-blue-400/50' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isWinner ? 1.05 : 1 // Gentle scaling for winner
      }}
      transition={{ 
        delay, 
        duration: 0.3,
        scale: { duration: 0.6, ease: "easeOut" } // Smooth scaling transition
      }}
      whileHover={!isPlaceholder ? { y: -2, scale: isWinner ? 1.07 : 1.02 } : {}}
      layout={false}
    >
      {/* Winner indicator - Better positioning */}
      {isWinner && (
        <motion.div
          className="absolute -top-1 -right-1 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          style={{
            fontSize: '10px',
            padding: '2px 6px',
          }}
        >
          🏆 WIN
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
          relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-500 shadow-lg
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
                src={getProfilePicture()}
                alt={getDisplayName()}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {/* Online indicator - positioned outside the circle */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800 shadow-lg animate-pulse z-10" />
            </>
          ) : (
            <div className="w-full h-full bg-gray-700/30 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gray-600/50 animate-pulse" />
            </div>
          )}
        </div>

        {/* Winner crown - positioned above profile picture */}
        {isWinner && (
          <motion.div
            className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="text-yellow-400 text-2xl drop-shadow-lg">👑</div>
          </motion.div>
        )}

        {/* Username - Always visible */}
        <div className="text-center min-h-[32px] flex flex-col justify-center">
          <p className={`
            font-bold text-sm transition-colors duration-300 tracking-wide
            ${isPlaceholder 
              ? 'text-gray-500' 
              : isWinner 
                ? 'text-yellow-300 drop-shadow-lg' 
                : 'text-gray-200'
            }
          `}>
            {getDisplayName()}
          </p>
          
          <div className="flex items-center justify-center mt-1 space-x-1 min-h-[16px]">
            {!isPlaceholder && (
              <>
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400 font-medium">Online</span>
              </>
            )}
          </div>
        </div>

        {/* Bet Amount - Always visible with fallback */}
        <div className={`
          flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 min-w-[80px] justify-center shadow-lg min-h-[32px]
          ${isPlaceholder 
            ? 'bg-gradient-to-r from-gray-700/30 to-gray-600/30 text-gray-500 border border-gray-600/50' 
            : isWinner 
              ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-200 border border-yellow-400/50' 
              : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border border-blue-500/50'
          }
        `}>
          {!isPlaceholder ? (
            <>
              <span className="text-xs opacity-75">≈</span>
              <span>{formatSolAmount(entry.amount || 0)}</span>
              <span className="text-xs opacity-75">SOL</span>
            </>
          ) : (
            <span className="text-xs">---</span>
          )}
        </div>

        {/* Win chance indicator - Always visible with actual odds */}
        <div className="text-xs text-gray-400 text-center min-h-[24px] flex items-center justify-center">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium transition-all duration-300
            ${isPlaceholder 
              ? 'bg-gray-700/30 text-gray-500' 
              : isWinner 
                ? 'bg-yellow-500/20 text-yellow-300' 
                : 'bg-gray-700/50 text-gray-400'
            }
          `}>
            {isPlaceholder 
              ? '⏳ Waiting' 
              : isWinner 
                ? '🎉 WINNER!' 
                : `🎯 ${oddsPercentage.toFixed(1)}% odds`
            }
          </div>
        </div>
      </div>

      {/* Winner effects - Contained within card */}
      {isWinner && (
        <>
          {/* Subtle confetti particles - contained */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, (Math.cos((i * 90 * Math.PI) / 180)) * 20],
                y: [0, (Math.sin((i * 90 * Math.PI) / 180)) * 20],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default ParticipantCard; 