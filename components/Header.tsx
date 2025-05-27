'use client';

import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJackpotStore } from '@/store/jackpotStore';
import { formatSolAmount, shortenAddress } from '@/lib/solana';
import { Trophy, Zap, Users } from 'lucide-react';

const Header: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { userStats, recentWinners } = useJackpotStore();

  return (
    <header className="border-b border-gray-800 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Solana Jackpot
              </h1>
              <p className="text-sm text-gray-400">
                60-Second Rounds • Provably Fair
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center text-green-400 mb-1">
                <Zap className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">LIVE</span>
              </div>
              <div className="text-sm text-gray-300">
                {recentWinners.length} Winners Today
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center text-blue-400 mb-1">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">ACTIVE</span>
              </div>
              <div className="text-sm text-gray-300">
                Real-time Betting
              </div>
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
            
            <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !rounded-lg !font-semibold !transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 