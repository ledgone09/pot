'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJackpotStore } from '@/store/jackpotStore';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { Trophy } from 'lucide-react';

const Header: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { userStats, recentWinners } = useJackpotStore();

  return (
    <header className="border-b border-gray-800 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold gradient-text">
                  Funpot
                </h1>
                <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">LIVE</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                60-Second Rounds • Provably Fair
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <motion.div 
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-yellow-500/30 cursor-pointer"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(234, 179, 8, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="text-yellow-400"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  🏆
                </motion.div>
                <motion.div 
                  className="text-sm font-semibold text-yellow-300"
                  key={recentWinners.length} // Re-animate when count changes
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {recentWinners.length} Winners Today!
                </motion.div>
                <motion.div 
                  className="text-yellow-400"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ✨
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {connected && publicKey && (
              <div className="hidden sm:block text-right">
                <div className="text-sm text-gray-400">
                  {shortenAddress(publicKey.toString())}
                </div>
                <div className="text-sm font-semibold text-white">
                  {formatSolAmount(userStats.balance)} SOL
                </div>
              </div>
            )}
            
            <WalletMultiButton className="!bg-green-600 hover:!bg-green-700 !rounded-lg !font-semibold !transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 