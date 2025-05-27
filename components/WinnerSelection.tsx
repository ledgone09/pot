'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JackpotEntry } from '@/types';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { Target, Sparkles, Crown, Loader } from 'lucide-react';

interface WinnerSelectionProps {
  entries: JackpotEntry[];
  isVisible: boolean;
  onComplete?: () => void;
}

const WinnerSelection: React.FC<WinnerSelectionProps> = ({ entries, isVisible, onComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [spinPhase, setSpinPhase] = useState<'preparing' | 'spinning' | 'slowing' | 'stopped'>('preparing');

  useEffect(() => {
    if (!isVisible || entries.length === 0) {
      setIsSpinning(false);
      setShowResult(false);
      setSpinPhase('preparing');
      return;
    }

    // Start the animation sequence
    setSpinPhase('preparing');
    setIsSpinning(true);
    setShowResult(false);

    // Preparation phase
    setTimeout(() => {
      setSpinPhase('spinning');
      
      // Rapid selection phase (3 seconds)
      const spinInterval = setInterval(() => {
        setSelectedIndex(Math.floor(Math.random() * entries.length));
      }, 100);

      setTimeout(() => {
        clearInterval(spinInterval);
        setSpinPhase('slowing');
        
        // Slowing down phase (2 seconds)
        const slowInterval = setInterval(() => {
          setSelectedIndex(Math.floor(Math.random() * entries.length));
        }, 300);

        setTimeout(() => {
          clearInterval(slowInterval);
          setSpinPhase('stopped');
          
          // Final winner selection (weighted random)
          const totalWeight = entries.reduce((sum, entry) => sum + entry.amount * 100, 0);
          let random = Math.random() * totalWeight;
          let winnerIndex = 0;
          
          for (let i = 0; i < entries.length; i++) {
            random -= entries[i].amount * 100;
            if (random <= 0) {
              winnerIndex = i;
              break;
            }
          }
          
          setSelectedIndex(winnerIndex);
          setIsSpinning(false);
          setShowResult(true);
          
          // Auto-complete after showing result
          setTimeout(() => {
            onComplete?.();
          }, 3000);
        }, 2000);
      }, 3000);
    }, 1000);
  }, [isVisible, entries, onComplete]);

  if (!isVisible || entries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 max-w-2xl w-full mx-4"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: spinPhase === 'spinning' ? 360 : 0 }}
              transition={{ duration: 1, repeat: spinPhase === 'spinning' ? 999 : 0, ease: "linear" }}
            >
              <Target className="w-16 h-16 mx-auto text-primary-400 mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {spinPhase === 'preparing' && 'Preparing Selection...'}
              {spinPhase === 'spinning' && 'Selecting Winner...'}
              {spinPhase === 'slowing' && 'Almost There...'}
              {spinPhase === 'stopped' && showResult && 'Winner Selected!'}
            </h2>
            <p className="text-gray-400">
              {showResult ? 'Congratulations!' : 'Using provably fair algorithm'}
            </p>
          </div>

          {/* Spinning Wheel Visual */}
          <div className="relative mb-8">
            <div className="w-80 h-80 mx-auto relative">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: isSpinning ? 360 : 0 }}
                transition={{ 
                  duration: spinPhase === 'spinning' ? 0.5 : spinPhase === 'slowing' ? 1.5 : 0,
                  repeat: isSpinning ? 999 : 0,
                  ease: spinPhase === 'spinning' ? "linear" : "easeOut"
                }}
                className="absolute inset-0 rounded-full border-8 border-primary-500 bg-gradient-to-r from-primary-600 to-blue-600"
              >
                {/* Participant segments */}
                {entries.map((entry, index) => {
                  const angle = (360 / entries.length) * index;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <motion.div
                      key={entry.id}
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isSelected && showResult ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
                      }`}
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'center',
                      }}
                    >
                      <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        isSelected ? 'bg-yellow-400 text-black scale-110' : 'bg-gray-800/80 text-white'
                      }`}>
                        {shortenAddress(entry.userAddress)}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Center pointer */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: showResult ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                >
                  {showResult ? (
                    <Crown className="w-8 h-8 text-white" />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: 999, ease: "linear" }}
                    >
                      <Loader className="w-8 h-8 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Winner Details */}
          {showResult && entries[selectedIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30"
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
                <h3 className="text-xl font-bold text-white">
                  {shortenAddress(entries[selectedIndex].userAddress)}
                </h3>
                <Sparkles className="w-6 h-6 text-yellow-400 ml-2" />
              </div>
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                Wins {formatSolAmount(entries[selectedIndex].amount * 0.9)} SOL!
              </div>
              <div className="text-sm text-gray-400">
                From a bet of {formatSolAmount(entries[selectedIndex].amount)} SOL
              </div>
            </motion.div>
          )}

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {['preparing', 'spinning', 'slowing', 'stopped'].map((phase, index) => (
              <motion.div
                key={phase}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  ['preparing', 'spinning', 'slowing', 'stopped'].indexOf(spinPhase) >= index
                    ? 'bg-primary-500'
                    : 'bg-gray-600'
                }`}
                animate={{
                  scale: ['preparing', 'spinning', 'slowing', 'stopped'].indexOf(spinPhase) === index ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.6,
                  repeat: ['preparing', 'spinning', 'slowing', 'stopped'].indexOf(spinPhase) === index ? 999 : 0,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WinnerSelection; 