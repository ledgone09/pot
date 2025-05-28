'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useJackpotStore } from '@/store/jackpotStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { Trophy, Clock, Award } from 'lucide-react';

const RecentWinners: React.FC = () => {
  const { recentWinners } = useJackpotStore();
  const { getUserProfile } = useUserProfileStore();
  
  // Limit to 5 winners maximum
  const displayWinners = recentWinners.slice(0, 5);

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getDisplayName = (address: string) => {
    const profile = getUserProfile(address);
    return profile?.username || shortenAddress(address);
  };

  const getProfilePicture = (address: string) => {
    const profile = getUserProfile(address);
    return profile?.profilePicture || '/placeholder.svg';
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Award className="w-5 h-5 mr-2 text-green-400" />
          Recent Winners
        </h3>
        {displayWinners.length > 0 && (
          <div className="text-sm text-gray-400">
            Last {displayWinners.length}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {displayWinners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No winners yet</p>
            <p className="text-sm">Be the first to win!</p>
          </div>
        ) : (
          displayWinners.map((winner, index) => (
            <motion.div
              key={`${winner.round}-${winner.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all hover:scale-105 ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {index === 0 ? (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="bg-gray-600 p-2 rounded-full">
                      <Award className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  
                  <div>
                    <div className="font-medium text-white">
                      {getDisplayName(winner.address)}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeAgo(winner.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-semibold ${
                    index === 0 ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {formatSolAmount(winner.amount)} SOL
                  </div>
                  <div className="text-xs text-gray-400">
                    Round #{winner.round}
                  </div>
                </div>
              </div>
              
              {index === 0 && (
                <div className="mt-2 pt-2 border-t border-yellow-500/30">
                  <div className="text-xs text-yellow-400 font-medium">
                    🎉 Latest Winner!
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
      
      {displayWinners.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Winners are selected every 60 seconds</div>
            <div>• All selections are provably fair</div>
            <div>• Higher bets = better winning chances</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentWinners; 