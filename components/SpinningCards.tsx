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
  timeRemaining?: number;
}

const SpinningCards: React.FC<SpinningCardsProps> = ({ 
  isSpinning, 
  winner, 
  onSpinComplete,
  timeRemaining = 0
}) => {
  const { entries, clearRoundData, phase } = useJackpotStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFastSpinning, setIsFastSpinning] = useState(false);
  const [finalSelection, setFinalSelection] = useState(false);
  const [cardPosition, setCardPosition] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'normal' | 'fast' | 'centering' | 'complete'>('normal');
  const [selectedCard, setSelectedCard] = useState<JackpotEntry | null>(null);

  // Create a weighted card distribution based on player bets
  const createWeightedCards = (): JackpotEntry[] => {
    const totalSlots = 12; // Always show 12 cards
    
    if (entries.length === 0) {
      // All placeholder cards
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

    // Calculate total pool and each player's percentage
    const totalPool = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const cardDistribution: JackpotEntry[] = [];

    entries.forEach(entry => {
      const percentage = entry.amount / totalPool;
      const slotsForPlayer = Math.max(1, Math.round(percentage * totalSlots));
      
      // Add cards for this player based on their percentage
      for (let i = 0; i < slotsForPlayer; i++) {
                 cardDistribution.push({
           ...entry,
           id: `${entry.id}-${i}`,
         });
      }
    });

    // Fill remaining slots with the highest better's cards
    while (cardDistribution.length < totalSlots) {
      const highestBetter = entries.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
             cardDistribution.push({
         ...highestBetter,
         id: `${highestBetter.id}-extra-${cardDistribution.length}`,
       });
    }

    // Shuffle the cards for better visual distribution
    for (let i = cardDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardDistribution[i], cardDistribution[j]] = [cardDistribution[j], cardDistribution[i]];
    }

    return cardDistribution.slice(0, totalSlots);
  };

  const allCards = createWeightedCards();

  // Check if we should start fast spinning (last 10 seconds and betting is closed)
  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0 && entries.length > 0 && !isSpinning) {
      setIsFastSpinning(true);
    } else if (timeRemaining > 10 || isSpinning) {
      setIsFastSpinning(false);
    }
  }, [timeRemaining, entries.length, isSpinning]);

  // Reset winner information when a new round starts (phase changes to active and timeRemaining resets)
  useEffect(() => {
    if (phase === 'active' && timeRemaining > 50 && !isSpinning && animationPhase === 'complete') {
      console.log('New round starting, clearing winner animation...');
      setSelectedCard(null);
      setSelectedIndex(null);
      setAnimationPhase('normal');
      setIsAnimating(false);
      setFinalSelection(false);
      // Clear the round data from store when starting fresh
      clearRoundData();
    }
  }, [phase, timeRemaining, isSpinning, animationPhase, clearRoundData]);

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      console.log('Starting winner selection animation...');
      setIsAnimating(true);
      setAnimationPhase('fast');
      setFinalSelection(false); // Reset final selection
      setCardPosition(0); // Reset position
      
      // Find winner index in the card distribution - ensure we only select real players
      let winnerCardIndex = 0;
      const realPlayerCards = allCards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => card.amount > 0 && !(card as any).isPlaceholder);
      
      if (winner && entries.length > 0) {
        // Find all cards that belong to the winner
        const winnerCards = realPlayerCards
          .filter(({ card }) => card.userAddress === winner.userAddress);
        
        if (winnerCards.length > 0) {
          // Prefer cards that are more towards the middle for better centering
          // Sort by distance from middle and pick one of the more centered ones
          const middleIndex = Math.floor(allCards.length / 2);
          const sortedWinnerCards = winnerCards.sort((a, b) => {
            const distanceA = Math.abs(a.index - middleIndex);
            const distanceB = Math.abs(b.index - middleIndex);
            return distanceA - distanceB;
          });
          
          // Pick from the first half of sorted cards (more centered ones)
          const centerCards = sortedWinnerCards.slice(0, Math.max(1, Math.ceil(sortedWinnerCards.length / 2)));
          winnerCardIndex = centerCards[Math.floor(Math.random() * centerCards.length)].index;
        } else if (realPlayerCards.length > 0) {
          // Fallback to any real player card, preferring centered ones
          const middleIndex = Math.floor(allCards.length / 2);
          const sortedCards = realPlayerCards.sort((a, b) => {
            const distanceA = Math.abs(a.index - middleIndex);
            const distanceB = Math.abs(b.index - middleIndex);
            return distanceA - distanceB;
          });
          winnerCardIndex = sortedCards[0].index;
        }
      } else if (realPlayerCards.length > 0) {
        // Pick a card closer to the middle for better centering
        const middleIndex = Math.floor(allCards.length / 2);
        const sortedCards = realPlayerCards.sort((a, b) => {
          const distanceA = Math.abs(a.index - middleIndex);
          const distanceB = Math.abs(b.index - middleIndex);
          return distanceA - distanceB;
        });
        winnerCardIndex = sortedCards[0].index;
      }

      // Calculate final position to center the winner card under the arrow
      const cardWidth = 176; // w-44 = 176px (actual card width)
      const cardGap = 24; // space-x-6 = 24px gap between cards
      const cardTotalWidth = cardWidth + cardGap; // Total space each card occupies
      const paddingLeft = 20; // paddingLeft from style
      
      // The arrow is positioned at exactly 50% of the container width
      const containerCenter = 400; // Center of the visible container where arrow points
      
      // Calculate the exact position of the winner card's center
      const winnerCardLeftEdge = paddingLeft + (winnerCardIndex * cardTotalWidth);
      const winnerCardCenter = winnerCardLeftEdge + (cardWidth / 2);
      
      // Calculate how much to move the container to align winner card center with arrow
      let finalPosition = containerCenter - winnerCardCenter;
      
      // Add bounds to ensure the animation is visible and doesn't go too far off-screen
      const maxOffset = 300; // Maximum pixels we can move
      finalPosition = Math.max(-maxOffset, Math.min(maxOffset, finalPosition));
      
      console.log(`Winner card index: ${winnerCardIndex}, Winner card center: ${winnerCardCenter}, Container center: ${containerCenter}, Final position: ${finalPosition}`);

      // Phase 1: Fast spinning for 3 seconds
      setTimeout(() => {
        console.log('Phase 1: Setting centering phase, cardPosition:', finalPosition);
        setAnimationPhase('centering');
        setCardPosition(finalPosition);
        setFinalSelection(true);
      }, 3000);

      // Phase 2: Slow down and center on winner
      setTimeout(() => {
        setAnimationPhase('complete');
        setSelectedIndex(winnerCardIndex);
        const selectedCardData = allCards[winnerCardIndex];
        
        // Ensure we have the correct winner information
        const actualWinner = winner || selectedCardData;
        setSelectedCard(actualWinner);
        
        console.log('Winner selected:', {
          index: winnerCardIndex,
          card: selectedCardData,
          actualWinner: actualWinner,
          address: actualWinner?.userAddress
        });
      }, 5000);

      // Phase 3: Show final result
      setTimeout(() => {
        setIsAnimating(false);
        setFinalSelection(false);
        setAnimationPhase('complete'); // Keep as complete instead of normal
        // Don't clear selectedCard and selectedIndex to preserve winner info
        onSpinComplete?.();
      }, 7000);
    }
  }, [isSpinning, winner, entries, isAnimating, onSpinComplete, allCards]);

  // Always show cards (with placeholders if needed)
  const hasRealEntries = entries.length > 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          {animationPhase === 'fast' ? '🎯 Final Selection...' : 
           animationPhase === 'centering' ? '🎯 Final Selection...' : 
           animationPhase === 'complete' ? '🎉 Winner Selected!' : 
           '👥 Participants'}
        </h3>
        <p className="text-gray-300">
          {animationPhase === 'fast' ? 'Cards spinning fast!' : 
           animationPhase === 'centering' ? 'Cards spinning fast!' : 
           animationPhase === 'complete' ? 'Congratulations to the winner!' : 
           hasRealEntries ? `${entries.length} players in this round` : 'Waiting for players to join...'}
        </p>
      </div>

      {/* Constantly Moving Cards Container */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
        

        
        {/* Center Selection Marker - always visible, static triangle pointing down */}
        <motion.div
          className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
          initial={{ opacity: 0, y: -10, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: animationPhase === 'normal' ? [0, -3, 0] : 0, 
            scale: animationPhase === 'complete' ? [1, 1.2, 1] : 1
          }}
          transition={{ 
            duration: animationPhase === 'complete' ? 0.6 : animationPhase === 'normal' ? 2 : 0.3,
            ease: "easeOut",
            repeat: animationPhase === 'complete' ? 3 : animationPhase === 'normal' ? Infinity : 0
          }}
        >
          <div className="relative">
            {/* Outer glow - changes color based on state */}
            <div className={`absolute -inset-3 blur-md rounded-full transition-colors duration-300 ${
              animationPhase === 'complete' ? 'bg-green-400/50' : 
              (animationPhase === 'fast' || animationPhase === 'centering') ? 'bg-yellow-400/50' : 
              'bg-blue-400/40'
            }`}></div>
            {/* Secondary glow for more visibility */}
            <div className={`absolute -inset-1 blur-sm rounded-full transition-colors duration-300 ${
              animationPhase === 'complete' ? 'bg-green-400/60' : 
              (animationPhase === 'fast' || animationPhase === 'centering') ? 'bg-yellow-400/60' : 
              'bg-blue-400/50'
            }`}></div>
            {/* Main triangle pointing down */}
            <div className={`relative w-0 h-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent drop-shadow-lg transition-colors duration-300 ${
              animationPhase === 'complete' ? 'border-t-green-400' : 
              (animationPhase === 'fast' || animationPhase === 'centering') ? 'border-t-yellow-400' : 
              'border-t-blue-400'
            }`}>
              {/* Inner triangle */}
              <div className="absolute -top-4 -left-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>
        </motion.div>
        

        
        <motion.div
          className="flex space-x-6 absolute inset-0 items-center"
          animate={
            finalSelection ? {
              x: cardPosition,
            } : {
              x: [0, -400],
            }
          }
          transition={
            finalSelection ? {
              duration: 2,
              ease: "easeOut",
            } : {
              duration: animationPhase === 'fast' ? 0.4 : (isFastSpinning ? 3 : 12),
              repeat: finalSelection ? 0 : Infinity,
              ease: "linear",
            }
          }
          key={`animation-${isSpinning}-${finalSelection}`} // Force re-render when animation state changes
          style={{
            width: `${(allCards.length + 6) * 200}px`, // Extra cards for seamless loop
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          {/* Render cards multiple times for seamless scrolling */}
          {[...allCards, ...allCards].map((entry, index) => {
            const originalIndex = index % allCards.length;
            const isRealEntry = !(entry as any).isPlaceholder && entry.amount > 0;
            const cardKey = `card-${originalIndex}-${index}`;
            
            return (
                              <div
                key={cardKey}
                className={`flex-shrink-0 w-44 transition-all duration-500 relative ${
                  animationPhase === 'complete' && selectedIndex === originalIndex 
                    ? 'scale-110 z-20' 
                    : 'scale-100'
                }`}
                style={{
                  filter: animationPhase === 'complete' && selectedIndex === originalIndex 
                    ? 'drop-shadow(0 8px 16px rgba(34, 197, 94, 0.4))' 
                    : 'none'
                }}
              >
                {/* Winner highlight border */}
                {animationPhase === 'complete' && selectedIndex === originalIndex && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-400 rounded-xl opacity-75 animate-pulse"></div>
                )}
                <ParticipantCard
                  entry={entry}
                  isWinner={selectedIndex === originalIndex && isRealEntry && animationPhase === 'complete'}
                  isSpinning={false}
                  delay={0}
                />
              </div>
            );
          })}
        </motion.div>
        
        {/* Glow effect during spinning */}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>

      {/* Winner Announcement */}
      {selectedIndex !== null && animationPhase === 'complete' && (selectedCard || winner) && (
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
            const winnerData = selectedCard || winner;
            const winnerAddress = winnerData?.userAddress || 'Unknown';
            const winnerAmount = winnerData?.amount || 0;
            const totalPool = entries.reduce((sum, entry) => sum + entry.amount, 0);
            const actualWinAmount = totalPool * 0.9; // 90% of pool goes to winner
            
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