'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import { formatSolAmount } from '@/lib/solana';
import CircularTimer from './CircularTimer';
import ParticipantsList from './ParticipantsList';
import WinnerAnnouncement from './WinnerAnnouncement';
import WinnerSelection from './WinnerSelection';
import { Trophy, Users, Clock } from 'lucide-react';

const JackpotDisplay: React.FC = () => {
  const { totalPool, timeRemaining, phase, lastWinner, entries, currentRound } = useJackpotStore();
  const [showWinnerSelection, setShowWinnerSelection] = useState(false);
  const [selectionEntries, setSelectionEntries] = useState(entries);

  // Show winner selection when phase changes to resolution
  useEffect(() => {
    if (phase === 'resolution' && entries.length > 0) {
      setSelectionEntries([...entries]); // Snapshot entries at resolution time
      setShowWinnerSelection(true);
    } else {
      setShowWinnerSelection(false);
    }
  }, [phase, entries]);

  const getPhaseColor = () => {
    switch (phase) {
      case 'active': return 'text-green-400';
      case 'countdown': return 'text-yellow-400';
      case 'resolution': return 'text-red-400';
      case 'reset': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'active': return 'BETTING ACTIVE';
      case 'countdown': return 'FINAL COUNTDOWN';
      case 'resolution': return 'SELECTING WINNER';
      case 'reset': return 'ROUND COMPLETE';
      default: return 'LOADING';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-6">
      {/* Round Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-300 mb-2">
          Round #{currentRound}
        </h2>
        <div className={`text-sm font-semibold ${getPhaseColor()}`}>
          {getPhaseText()}
        </div>
      </motion.div>

      {/* Main Jackpot Display */}
      <motion.div
        className="relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-effect rounded-3xl p-8 jackpot-glow">
          <div className="text-center">
            {/* Prize Pool */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-accent-500 mr-2" />
                <span className="text-lg font-semibold text-gray-300">JACKPOT</span>
              </div>
              
              <motion.div
                key={totalPool}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl font-bold gradient-text"
              >
                {formatSolAmount(totalPool)}
              </motion.div>
              
              <div className="text-2xl font-semibold text-gray-400 mt-2">
                SOL
              </div>
            </div>

            {/* Timer */}
            <div className="flex justify-center mb-6">
              <CircularTimer timeRemaining={timeRemaining} phase={phase} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="glass-effect rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-sm text-gray-300">Participants</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {entries.length}
                </div>
              </div>
              
              <div className="glass-effect rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-sm text-gray-300">Time Left</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {timeRemaining}s
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Particles */}
        <AnimatePresence>
          {phase === 'active' && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  initial={{ 
                    opacity: 0,
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Participants List */}
      <ParticipantsList entries={entries} />

      {/* Winner Announcement */}
      <AnimatePresence>
        {phase === 'reset' && lastWinner && (
          <WinnerAnnouncement winner={lastWinner} />
        )}
      </AnimatePresence>

      {/* Winner Selection Animation */}
      <WinnerSelection
        entries={selectionEntries}
        isVisible={showWinnerSelection}
        onComplete={() => setShowWinnerSelection(false)}
      />
    </div>
  );
};

export default JackpotDisplay; 