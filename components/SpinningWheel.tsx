'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotEntry } from '@/types';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { Trophy, Star } from 'lucide-react';

interface SpinningWheelProps {
  isSpinning: boolean;
  winner?: JackpotEntry;
  onSpinComplete?: () => void;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ 
  isSpinning, 
  winner, 
  onSpinComplete 
}) => {
  const { entries } = useJackpotStore();
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Create weighted segments based on bet amounts
  const createSegments = () => {
    if (entries.length === 0) return [];

    const totalPool = entries.reduce((sum, entry) => sum + entry.amount, 0);
    let currentAngle = 0;

    return entries.map((entry, index) => {
      const percentage = (entry.amount / totalPool) * 100;
      const segmentAngle = (percentage / 100) * 360;
      
      const segment = {
        ...entry,
        startAngle: currentAngle,
        endAngle: currentAngle + segmentAngle,
        percentage,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Golden ratio for nice color distribution
      };

      currentAngle += segmentAngle;
      return segment;
    });
  };

  const segments = createSegments();

  // Calculate winner segment angle
  const getWinnerAngle = () => {
    if (!winner || segments.length === 0) return 0;
    
    const winnerSegment = segments.find(s => s.userAddress === winner.userAddress);
    if (!winnerSegment) return 0;
    
    // Calculate the center of the winner's segment
    const centerAngle = (winnerSegment.startAngle + winnerSegment.endAngle) / 2;
    
    // We want the pointer (at top, 270°) to point to the winner
    // So we need to rotate the wheel so the winner's center is at 270°
    return 270 - centerAngle;
  };

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      setIsAnimating(true);
      
      // Spin animation
      const spinDuration = 3000; // 3 seconds
      const baseRotations = 5; // Number of full rotations
      const winnerAngle = getWinnerAngle();
      
      // Add extra rotations and land on winner
      const finalRotation = (baseRotations * 360) + winnerAngle + Math.random() * 20 - 10; // Add small random offset
      
      setRotation(finalRotation);
      
      // Call onSpinComplete after animation
      setTimeout(() => {
        setIsAnimating(false);
        onSpinComplete?.();
      }, spinDuration);
    }
  }, [isSpinning, winner]);

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
    <div className="relative flex items-center justify-center h-80 w-80 mx-auto">
      {/* Wheel */}
      <motion.div
        ref={wheelRef}
        className="relative w-72 h-72 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden"
        animate={{ rotate: rotation }}
        transition={{
          duration: isAnimating ? 3 : 0,
          ease: isAnimating ? [0.25, 0.46, 0.45, 0.94] : "linear",
        }}
        style={{
          background: 'conic-gradient(from 0deg, transparent, transparent)',
        }}
      >
        {/* Segments */}
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from ${segment.startAngle}deg, ${segment.color} 0deg, ${segment.color} ${segment.endAngle - segment.startAngle}deg, transparent ${segment.endAngle - segment.startAngle}deg)`,
              clipPath: `polygon(50% 50%, 
                ${50 + 50 * Math.cos((segment.startAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((segment.startAngle * Math.PI) / 180)}%, 
                ${50 + 50 * Math.cos((segment.endAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((segment.endAngle * Math.PI) / 180)}%)`
            }}
          />
        ))}

        {/* Participant Labels */}
        {segments.map((segment, index) => {
          const labelAngle = (segment.startAngle + segment.endAngle) / 2;
          const labelRadius = 100; // Distance from center
          const x = 50 + (labelRadius / 2) * Math.cos((labelAngle * Math.PI) / 180);
          const y = 50 + (labelRadius / 2) * Math.sin((labelAngle * Math.PI) / 180);

          return (
            <div
              key={`label-${segment.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white text-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              <div className="whitespace-nowrap">
                {shortenAddress(segment.userAddress)}
              </div>
              <div className="text-yellow-300">
                {formatSolAmount(segment.amount)} SOL
              </div>
            </div>
          );
        })}

        {/* Center Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Pointer */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
      </div>

      {/* Spinning Effects */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Sparks */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.cos((i * 45 * Math.PI) / 180)) * 150],
                  y: [0, (Math.sin((i * 45 * Math.PI) / 180)) * 150],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Winner Announcement */}
      <AnimatePresence>
        {winner && !isAnimating && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center text-white p-4">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              </motion.div>
              <h3 className="text-lg font-bold mb-1">🎉 Winner! 🎉</h3>
              <p className="text-sm">{shortenAddress(winner.userAddress)}</p>
              <p className="text-yellow-400 font-bold">
                {formatSolAmount(winner.amount)} SOL
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinningWheel; 