'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotEntry } from '@/types';
import ParticipantCard from './ParticipantCard';
import { Trophy } from 'lucide-react';

interface SpinningCardsProps {
  isSpinning: boolean;
  winner?: JackpotEntry;
  onSpinComplete?: () => void;
  timeRemaining?: number;
}

const SpinningCards: React.FC<SpinningCardsProps> = ({ 
  isSpinning, 
  winner, 
  onSpinComplete,
  timeRemaining = 0
}) => {
  const { entries, phase } = useJackpotStore();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<JackpotEntry | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [finalPosition, setFinalPosition] = useState<number>(0);
  
  // Stable card array that only changes when absolutely necessary
  const stableCards = useRef<JackpotEntry[]>([]);
  const lastEntriesLength = useRef(0);

  // Fix hydration issue
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create stable cards only when entries actually change
  const createStableCards = (): JackpotEntry[] => {
    const totalSlots = 12;
    
    if (entries.length === 0) {
      return Array.from({ length: totalSlots }, (_, index) => ({
        id: `placeholder-${index}`,
        user: null as any,
        userAddress: `placeholder-${index}`,
        amount: 0,
        timestamp: Date.now(),
        weight: 0,
        isPlaceholder: true,
      }));
    }

    const totalPool = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const cardDistribution: JackpotEntry[] = [];

    entries.forEach(entry => {
      const percentage = entry.amount / totalPool;
      const slotsForPlayer = Math.max(1, Math.round(percentage * totalSlots));
      
      for (let i = 0; i < slotsForPlayer; i++) {
        cardDistribution.push({
          ...entry,
          id: `${entry.id}-${i}`,
        });
      }
    });

    while (cardDistribution.length < totalSlots) {
      const highestBetter = entries.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      cardDistribution.push({
        ...highestBetter,
        id: `${highestBetter.id}-extra-${cardDistribution.length}`,
      });
    }

    // Shuffle for better distribution
    for (let i = cardDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardDistribution[i], cardDistribution[j]] = [cardDistribution[j], cardDistribution[i]];
    }

    return cardDistribution.slice(0, totalSlots);
  };

  // Only update stable cards when entries length changes
  useEffect(() => {
    if (entries.length !== lastEntriesLength.current) {
      stableCards.current = createStableCards();
      lastEntriesLength.current = entries.length;
    }
  }, [entries.length]);

  // Initialize stable cards on mount
  useEffect(() => {
    if (isMounted && stableCards.current.length === 0) {
      stableCards.current = createStableCards();
      lastEntriesLength.current = entries.length;
    }
  }, [isMounted]);

  // Winner selection when entering stopping phase (last 10 seconds)
  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0 && !winnerIndex && entries.length > 0) {
      // Find winner in stable cards
      const realPlayerCards = stableCards.current
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => card.amount > 0 && !(card as any).isPlaceholder);
      
      let selectedIndex = 0;
      
      if (winner && realPlayerCards.length > 0) {
        const winnerCards = realPlayerCards.filter(({ card }) => 
          card.userAddress === winner.userAddress
        );
        
        if (winnerCards.length > 0) {
          selectedIndex = winnerCards[Math.floor(Math.random() * winnerCards.length)].index;
        } else {
          selectedIndex = realPlayerCards[0].index;
        }
      } else if (realPlayerCards.length > 0) {
        selectedIndex = realPlayerCards[0].index;
      }

      // Calculate smooth stopping position with randomization
      const cardWidth = 176;
      const cardGap = 24;
      const cardTotalWidth = cardWidth + cardGap;
      const paddingLeft = 200;
      
      // Container center where triangle points
      const containerCenter = 400;
      
      // Position of winner card
      const winnerCardLeftEdge = paddingLeft + (selectedIndex * cardTotalWidth);
      const winnerCardCenter = winnerCardLeftEdge + (cardWidth / 2);
      
      // Add randomization to make winner land in different spots
      const randomOffset = (Math.random() - 0.5) * 100; // Random offset ±50px
      const extraLoops = Math.floor(Math.random() * 3) + 3; // Random 3-5 loops
      const loopDistance = 2400;
      const finalStopPosition = containerCenter - winnerCardCenter - (extraLoops * loopDistance) + randomOffset;
      
      setWinnerIndex(selectedIndex);
      setFinalPosition(finalStopPosition);
      
      // Show winner ONLY after animation completely stops
      setTimeout(() => {
        setSelectedWinner(winner || stableCards.current[selectedIndex]);
        onSpinComplete?.();
      }, 12000); // 12 seconds for even smoother animation
    }
  }, [timeRemaining, winner, onSpinComplete, winnerIndex, entries.length]);

  // Reset ONLY when new round starts
  useEffect(() => {
    if (phase === 'active' && timeRemaining > 55 && !isSpinning) {
      if (selectedWinner || winnerIndex !== null) {
        setSelectedWinner(null);
        setWinnerIndex(null);
        setFinalPosition(0);
      }
    }
  }, [phase, timeRemaining, isSpinning]);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white mb-2">👥 Participants</h3>
          <p className="text-gray-300">Loading...</p>
        </div>
        <div className="relative h-96 overflow-hidden bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 shadow-2xl">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
        </div>
      </div>
    );
  }

  const hasRealEntries = entries.length > 0;
  const displayCards = stableCards.current.length > 0 ? stableCards.current : createStableCards();

  // Determine animation phase
  const getAnimationPhase = () => {
    if (selectedWinner) return 'winner';
    if (winnerIndex !== null && timeRemaining <= 10 && timeRemaining > 0) return 'stopping';
    if (timeRemaining <= 50 && timeRemaining > 10 && hasRealEntries) return 'fast';
    return 'normal';
  };

  const animationPhase = getAnimationPhase();
  


  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          {selectedWinner ? '🎉 Winner Selected!' : '🎰 Lottery Round'}
        </h3>
        <p className="text-gray-300">
          {selectedWinner ? 'Congratulations to the winner!' : 
           animationPhase === 'stopping' ? 'Selecting winner...' :
           animationPhase === 'fast' ? 'Betting closed - cards spinning fast!' :
           hasRealEntries ? `${entries.length} players in this round` : 'Waiting for players to join...'}
        </p>
      </div>

      {/* Animation Container */}
      <div 
        className="relative h-96 overflow-hidden bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 shadow-2xl"
        style={{
          willChange: 'contents', // Optimize for content changes
          contain: 'layout style paint', // Optimize rendering
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
        
        {/* Static Triangle Indicator */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="relative">
            {/* Glow effect */}
            <div className={`absolute -inset-3 blur-md rounded-full transition-colors duration-500 ${
              selectedWinner ? 'bg-green-400/60' : 
              animationPhase === 'stopping' ? 'bg-yellow-400/60' : 
              animationPhase === 'fast' ? 'bg-red-400/60' :
              'bg-blue-400/50'
            }`}></div>
            
            {/* Triangle */}
            <div className={`relative w-0 h-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent drop-shadow-lg transition-colors duration-500 ${
              selectedWinner ? 'border-t-green-400' : 
              animationPhase === 'stopping' ? 'border-t-yellow-400' : 
              animationPhase === 'fast' ? 'border-t-red-400' :
              'border-t-blue-400'
            }`}>
              <div className="absolute -top-4 -left-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>
        </div>
        
        {/* Ultra-Smooth One-Direction Lottery Wheel */}
        <motion.div
          className="flex space-x-6 absolute inset-0 items-center"
          style={{
            width: `${(displayCards.length * 6) * 200}px`, // 6x cards to ensure complete coverage
            paddingLeft: '200px', // Extra padding to ensure coverage
            paddingRight: '200px',
            willChange: 'transform', // Optimize for animations
            transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
          }}
          animate={{ 
            x: animationPhase === 'stopping' || animationPhase === 'winner'
              ? finalPosition // Smooth deceleration to exact winner position
              : [0, -2400] // Continuous one-direction movement - perfectly divisible
          }}
          transition={{
            duration: animationPhase === 'stopping' ? 12 : // 12 seconds ultra-smooth deceleration
                     animationPhase === 'winner' ? 0 : // Instant stop
                     animationPhase === 'fast' ? 0.5 : // Ultra-smooth fast spinning (perfectly divisible)
                     12, // Ultra-smooth normal spinning (perfectly divisible)
            ease: animationPhase === 'stopping' ? [0.19, 1, 0.22, 1] : "linear", // Perfect easeOutExpo
            repeat: animationPhase === 'stopping' || animationPhase === 'winner' ? 0 : Infinity,
            repeatType: "loop", // Ensures smooth looping without direction change
            type: "tween", // Force tween animation for smoothness
          }}
        >
          {/* 6x cards for complete seamless coverage */}
          {[...displayCards, ...displayCards, ...displayCards, ...displayCards, ...displayCards, ...displayCards].map((entry, index) => {
            const originalIndex = index % displayCards.length;
            // Only highlight winner when animation has completely stopped
            const isWinnerCard = winnerIndex === originalIndex && !!selectedWinner && animationPhase === 'winner';
            const cardKey = `card-${originalIndex}-${Math.floor(index / displayCards.length)}`;
            
            return (
              <div
                key={cardKey}
                className={`flex-shrink-0 w-44 relative transition-all duration-500 ${
                  isWinnerCard ? 'scale-110 z-20' : 'scale-100'
                }`}
                style={{
                  filter: isWinnerCard ? 'drop-shadow(0 8px 16px rgba(34, 197, 94, 0.6))' : 'none',
                  willChange: 'transform, filter', // Optimize for smooth transitions
                  transform: 'translate3d(0, 0, 0)', // Hardware acceleration
                  backfaceVisibility: 'hidden', // Prevent flickering
                }}
              >
                {/* Winner highlight - only when completely stopped */}
                {isWinnerCard && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-400 rounded-xl opacity-75 animate-pulse"></div>
                )}
                
                <ParticipantCard
                  entry={entry}
                  isWinner={isWinnerCard}
                  isSpinning={false}
                  delay={0}
                />
              </div>
            );
          })}
        </motion.div>
        
        {/* Selection glow effect during stopping phase */}
        {animationPhase === 'stopping' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Winner Announcement */}
      {selectedWinner && winnerIndex !== null && (
        <motion.div
          className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-400">🎯 Winner Selected!</h3>
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          
          {(() => {
            const winnerAddress = selectedWinner.userAddress || 'Unknown';
            const winnerAmount = selectedWinner.amount || 0;
            const totalPool = entries.reduce((sum, entry) => sum + entry.amount, 0);
            const actualWinAmount = totalPool * 0.9;
            
            return (
              <>
                <p className="text-lg text-white mb-2">
                  🎉 <strong>{winnerAddress.slice(0, 8)}...{winnerAddress.slice(-4)}</strong> wins!
                </p>
                
                <div className="text-3xl font-bold text-yellow-300 mb-2">
                  {actualWinAmount.toFixed(4)} SOL
                </div>
                
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Winner's bet: {winnerAmount.toFixed(4)} SOL</p>
                  <p>Total pool: {totalPool.toFixed(4)} SOL</p>
                  <p>Win chance: {totalPool > 0 ? ((winnerAmount / totalPool) * 100).toFixed(1) : 0}%</p>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
};

export default SpinningCards; 