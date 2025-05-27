'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import { formatSolAmount } from '@/lib/solana';
import { Trophy, Users, Clock, Target } from 'lucide-react';
import SpinningCards from './SpinningCards';

const ModernJackpotDisplay: React.FC = () => {
  const { totalPool, timeRemaining, entries, phase, userStats, lastWinner } = useJackpotStore();

  // Calculate user's winning chance
  const userTotalBet = userStats.currentRoundEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const winChance = totalPool > 0 ? ((userTotalBet / totalPool) * 100) : 0;

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
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">JACKPOT</h1>
              <p className="text-sm text-gray-400">Winner takes all...</p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-semibold">LIVE</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Jackpot Value */}
          <motion.div
            className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-lg font-bold text-purple-300">{formatSolAmount(totalPool)}</span>
            </div>
            <p className="text-sm text-gray-400">Jackpot Value</p>
          </motion.div>

          {/* Your Wager */}
          <motion.div
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-bold text-blue-300">{formatSolAmount(userTotalBet)}</span>
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
          <div className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
            <span className="text-blue-400 text-sm font-semibold">{entries.length} Players</span>
          </div>
        </div>

        <SpinningCards
          isSpinning={phase === 'resolution'}
          winner={lastWinner ? entries.find(e => e.userAddress === lastWinner.address) : undefined}
          onSpinComplete={() => {}}
          timeRemaining={timeRemaining}
        />

        {/* Winner Announcement */}
        {lastWinner && phase === 'reset' && (
          <motion.div
            className="mt-6 text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-yellow-400">Winner Takes All!</h3>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            
            <p className="text-lg text-white mb-2">
              🎉 <strong>{lastWinner.address.slice(0, 8)}...</strong> wins the jackpot!
            </p>
            
            <div className="text-2xl font-bold text-yellow-300 mb-2">
              {lastWinner.amount.toFixed(4)} SOL
            </div>
            
            <p className="text-sm text-gray-300">
              From a total pool of {entries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(4)} SOL
            </p>
          </motion.div>
        )}


        
        {phase === 'resolution' && (
          <motion.div
            className="mt-6 text-center bg-purple-500/20 border border-purple-500/30 rounded-lg p-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <p className="text-purple-400 font-semibold">
              🎲 Selecting Winner...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernJackpotDisplay; 