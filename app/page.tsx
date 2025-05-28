'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useJackpotStore } from '@/store/jackpotStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSocket } from '@/hooks/useSocket';
import { getUserBalance } from '@/lib/solana';
import ModernJackpotDisplay from '../components/ModernJackpotDisplay';
import ModernBettingInterface from '../components/ModernBettingInterface';
import RecentWinners from '../components/RecentWinners';
import Header from '../components/Header';
import WheelManager from '../components/WheelManager';
import UserProfileSetup from '../components/UserProfileSetup';
import LiveChat from '../components/LiveChat';
import { User, Settings } from 'lucide-react';

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { setConnection, setUserStats } = useJackpotStore();
  const { getUserProfile, setCurrentUser, clearCurrentUser } = useUserProfileStore();
  const { emitJoinRoom, emitLeaveRoom } = useSocket();
  
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Handle wallet connection
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      setConnection(true, walletAddress);
      setCurrentUser(walletAddress);
      emitJoinRoom(walletAddress);
      
      // Check if user has a profile, if not show setup
      const userProfile = getUserProfile(walletAddress);
      if (!userProfile) {
        setShowProfileSetup(true);
      }
      
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
      clearCurrentUser();
      if (publicKey) {
        emitLeaveRoom(publicKey.toString());
      }
    }
  }, [connected, publicKey]);

  const currentUserProfile = publicKey ? getUserProfile(publicKey.toString()) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Jackpot Display */}
          <div className="lg:col-span-2">
            <ModernJackpotDisplay />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            {!connected && (
              <div className="glass-effect rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Connect Your Wallet
                </h3>
                <WalletMultiButton className="!bg-green-600 hover:!bg-green-700" />
              </div>
            )}
            
            {/* User Profile Section */}
            {connected && currentUserProfile && (
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-400" />
                    Profile
                  </h3>
                  <button
                    onClick={() => setShowProfileEdit(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                    <img
                      src={currentUserProfile.profilePicture || '/placeholder.svg'}
                      alt={currentUserProfile.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{currentUserProfile.username}</p>
                    <p className="text-xs text-gray-400">
                      {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Setup Profile Prompt */}
            {connected && !currentUserProfile && (
              <div className="glass-effect rounded-xl p-6 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Setup Your Profile
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Choose a username and profile picture to personalize your experience
                </p>
                <button
                  onClick={() => setShowProfileSetup(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Setup Profile
                </button>
              </div>
            )}
            
            {/* Betting Interface */}
            <ModernBettingInterface />
            
            {/* Recent Winners */}
            <RecentWinners />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
                            <p className="mb-2">Funpot Platform</p>
            <p className="text-sm">
              Provably fair • 60-second rounds • Real SOL transactions
            </p>
          </div>
        </div>
      </footer>
      
      {/* Spinning Wheel Overlay */}
      <WheelManager />
      
      {/* Live Chat */}
      <LiveChat />
      
      {/* User Profile Setup */}
      {showProfileSetup && publicKey && (
        <UserProfileSetup
          walletAddress={publicKey.toString()}
          onComplete={() => setShowProfileSetup(false)}
          onCancel={() => setShowProfileSetup(false)}
        />
      )}
      
      {/* User Profile Edit */}
      {showProfileEdit && publicKey && (
        <UserProfileSetup
          walletAddress={publicKey.toString()}
          onComplete={() => setShowProfileEdit(false)}
          onCancel={() => setShowProfileEdit(false)}
        />
      )}
    </div>
  );
} 