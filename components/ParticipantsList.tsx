'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JackpotEntry } from '@/types';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { useJackpotStore } from '@/store/jackpotStore';
import { Users, Star } from 'lucide-react';

interface ParticipantsListProps {
  entries: JackpotEntry[];
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ entries }) => {
  const { userAddress } = useJackpotStore();

  const sortedEntries = [...entries].sort((a, b) => b.amount - a.amount);
  const totalPool = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const getWinChance = (amount: number) => {
    if (totalPool === 0) return 0;
    return (amount / totalPool) * 100;
  };

  const isUserEntry = (entry: JackpotEntry) => {
    return userAddress && entry.userAddress === userAddress;
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-400" />
          Participants ({entries.length})
        </h3>
        {totalPool > 0 && (
          <div className="text-sm text-gray-400">
            Total: {formatSolAmount(totalPool)} SOL
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No participants yet</p>
              <p className="text-sm">Be the first to place a bet!</p>
            </div>
          ) : (
            sortedEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`bet-entry p-3 rounded-lg border ${
                  isUserEntry(entry)
                    ? 'bg-primary-900/30 border-primary-500/50'
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {index === 0 && (
                      <Star className="w-4 h-4 text-yellow-400" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {shortenAddress(entry.userAddress)}
                        </span>
                        {isUserEntry(entry) && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatSolAmount(entry.amount)} SOL
                    </div>
                    <div className="text-xs text-gray-400">
                      {getWinChance(entry.amount).toFixed(1)}% chance
                    </div>
                  </div>
                </div>
                
                {/* Win chance bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <motion.div
                      className={`h-1 rounded-full ${
                        isUserEntry(entry) ? 'bg-primary-500' : 'bg-blue-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${getWinChance(entry.amount)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {entries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Higher bets increase your winning chances</div>
            <div>• Winner is selected using provably fair algorithm</div>
            <div>• All entries are weighted by bet amount</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsList; 