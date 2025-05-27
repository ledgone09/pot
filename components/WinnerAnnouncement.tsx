'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WinnerData } from '@/types';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { Trophy, Sparkles, Star } from 'lucide-react';

interface WinnerAnnouncementProps {
  winner: WinnerData;
}

const WinnerAnnouncement: React.FC<WinnerAnnouncementProps> = ({ winner }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    // Generate confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setConfettiPieces(pieces);

    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [winner]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confettiPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  initial={{
                    x: `${piece.x}vw`,
                    y: '-10vh',
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    y: '110vh',
                    rotate: 360,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 3,
                    delay: piece.delay,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Winner Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-8 max-w-md mx-4 text-center winner-celebration"
        >
          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="relative mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
              
              {/* Sparkles around trophy */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateY(-40px)`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Winner Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold gradient-text mb-2">
              🎉 WINNER! 🎉
            </h2>
            <p className="text-gray-300 mb-4">
              Congratulations to the lucky winner!
            </p>
          </motion.div>

          {/* Winner Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Winner</div>
              <div className="font-mono text-lg text-white">
                {shortenAddress(winner.address)}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-sm text-yellow-400 mb-1">Prize Amount</div>
              <div className="text-3xl font-bold text-white">
                {formatSolAmount(winner.amount)} SOL
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Round</div>
              <div className="text-lg text-white">
                #{winner.round}
              </div>
            </div>
          </motion.div>

          {/* Stars decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center space-x-2 mt-6"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </motion.div>
            ))}
          </motion.div>

          {/* Next Round Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 pt-4 border-t border-gray-700"
          >
            <p className="text-sm text-gray-400">
              New round starting soon...
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WinnerAnnouncement; 