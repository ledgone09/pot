'use client';

import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useJackpotStore } from '@/store/jackpotStore';
import { useSocket } from '@/hooks/useSocket';
import { getUserBalance } from '@/lib/solana';
import JackpotDisplay from '../components/JackpotDisplay';
import BettingInterface from '../components/BettingInterface';
import RecentWinners from '../components/RecentWinners';
import Header from '../components/Header';

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { setConnection, setUserStats } = useJackpotStore();
  const { emitJoinRoom, emitLeaveRoom } = useSocket();

  // Handle wallet connection
  useEffect(() => {
    if (connected && publicKey) {
      setConnection(true, publicKey.toString());
      emitJoinRoom(publicKey.toString());
      
      // Fetch real SOL balance
      getUserBalance(publicKey).then(balance => {
        setUserStats({
          totalBets: 0,
          totalWagered: 0,
          totalWon: 0,
          winCount: 0,
          currentRoundEntries: [],
          balance,
        });
      });
    } else {
      setConnection(false);
      if (publicKey) {
        emitLeaveRoom(publicKey.toString());
      }
    }
  }, [connected, publicKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Jackpot Display */}
          <div className="lg:col-span-2">
            <JackpotDisplay />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            {!connected && (
              <div className="glass-effect rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Connect Your Wallet
                </h3>
                <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
              </div>
            )}
            
            {/* Betting Interface */}
            <BettingInterface />
            
            {/* Recent Winners */}
            <RecentWinners />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">Solana Jackpot Platform</p>
            <p className="text-sm">
              Provably fair • 60-second rounds • Real SOL transactions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 