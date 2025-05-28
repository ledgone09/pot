'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import { formatSolAmount } from '@/lib/solana';
import { Trophy, Users, Clock, Target } from 'lucide-react';
import SpinningCards from './SpinningCards';

const ModernJackpotDisplay: React.FC = () => {
  const { totalPool, timeRemaining, entries, phase, userStats, lastWinner, userAddress } = useJackpotStore();

  // Calculate user's winning chance - more stable calculation
  const getUserTotalBet = () => {
    if (!userAddress) return 0;
    return entries
      .filter(entry => entry.userAddress === userAddress)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const userTotalBet = getUserTotalBet();
  const winChance = totalPool > 0 && userTotalBet > 0 ? ((userTotalBet / totalPool) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Jackpot Header */}
      <div className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">FUNPOT</h1>
              <p className="text-sm text-gray-400">Winner takes all...</p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-semibold">LIVE</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Jackpot Value */}
          <motion.div
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-green-300">{formatSolAmount(totalPool)}</span>
            </div>
            <p className="text-sm text-gray-400">Funpot Value</p>
          </motion.div>

          {/* Your Wager */}
          <motion.div
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-green-300">{formatSolAmount(userTotalBet)}</span>
            </div>
            <p className="text-sm text-gray-400">Your Wager</p>
          </motion.div>

          {/* Your Chance */}
          <motion.div
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-green-300">{winChance.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-gray-400">Your Chance</p>
          </motion.div>

          {/* Time Remaining */}
          <motion.div
            className={`bg-gradient-to-br rounded-xl p-4 border transition-all duration-300 ${
              timeRemaining <= 10 
                ? 'from-red-500/10 to-orange-500/10 border-red-500/20' 
                : 'from-gray-500/10 to-gray-600/10 border-gray-500/20'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Clock className={`w-4 h-4 ${timeRemaining <= 10 ? 'text-red-400' : 'text-gray-400'}`} />
              <span className={`text-lg font-bold ${timeRemaining <= 10 ? 'text-red-300' : 'text-gray-300'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p className="text-sm text-gray-400">Time Remaining</p>
          </motion.div>
        </div>
      </div>

      {/* Participants Section */}
      <div className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Participants</h2>
          <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
            <span className="text-green-400 text-sm font-semibold">{entries.length} Players</span>
          </div>
        </div>

        <SpinningCards
          isSpinning={phase === 'resolution'}
          winner={lastWinner ? entries.find(e => e.userAddress === lastWinner.address) : undefined}
          onSpinComplete={() => {}}
          timeRemaining={timeRemaining}
        />




        
        {/* Resolution Phase - Selecting Winner */}
        {phase === 'resolution' && (
          <motion.div
            className="mt-6 text-center bg-green-500/20 border border-green-500/30 rounded-lg p-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <p className="text-green-400 font-semibold text-lg">
              🎯 Selecting Winner...
            </p>
            <p className="text-green-300 text-sm mt-1">
              Cards are spinning to determine the winner!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernJackpotDisplay; 