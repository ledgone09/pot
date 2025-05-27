'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotEntry } from '@/types';
import { 
  createBetTransaction, 
  validateBetAmount, 
  formatSolAmount, 
  sendAndConfirmTransaction,
  getUserBalance,
  estimateTransactionFee
} from '@/lib/solana';
import { useSocket } from '@/hooks/useSocket';
import { Wallet, Plus, Minus, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ModernBettingInterface: React.FC = () => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { userStats, config, phase, timeRemaining, isConnected, setUserStats } = useJackpotStore();
  const { emitBet } = useSocket();
  const [betAmount, setBetAmount] = useState(0);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0.000005);

  const quickAmounts = [0.1, 1, 10];

  // Update user balance periodically
  useEffect(() => {
    if (connected && publicKey) {
      const updateBalance = async () => {
        const balance = await getUserBalance(publicKey);
        setUserStats({
          ...userStats,
          balance,
        });
      };
      
      updateBalance();
      const interval = setInterval(updateBalance, 10000);
      
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  // Update transaction fee estimate  
  useEffect(() => {
    if (betAmount > 0) {
      // Use a default fee estimate since we need the transaction to estimate the real fee
      setEstimatedFee(0.000005);
    }
  }, [betAmount]);

  const handleBetAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setBetAmount(numValue);
  };

  const canPlaceBet = () => {
    if (!connected || !publicKey || !signTransaction) return false;
    if (phase !== 'active' || timeRemaining <= 5) return false;
    if (betAmount <= 0) return false;
    if (betAmount < config.minBet || betAmount > config.maxBet) return false;
    if (betAmount + estimatedFee > userStats.balance) return false;
    if (isPlacingBet) return false;
    return true;
  };

  const handlePlaceBet = async () => {
    if (!canPlaceBet() || !publicKey || !signTransaction) return;

    setIsPlacingBet(true);
    const loadingToast = toast.loading('Placing bet...');

    try {
      // Validate bet amount
      const validation = validateBetAmount(betAmount);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create and sign transaction
      const transaction = await createBetTransaction(
        publicKey,
        betAmount
      );

      const signedTx = await signTransaction(transaction);
      
      // Send transaction
      const signature = await sendAndConfirmTransaction(signedTx);
      
      // Emit bet to server
      const betEntry: JackpotEntry = {
        id: signature,
        user: publicKey,
        userAddress: publicKey.toString(),
        amount: betAmount,
        timestamp: Date.now(),
        weight: betAmount,
      };

      emitBet(betEntry);

      // Update local balance
      const newBalance = userStats.balance - betAmount - estimatedFee;
      setUserStats({
        ...userStats,
        balance: newBalance,
      });

      toast.dismiss(loadingToast);
      toast.success(`Bet placed: ${formatSolAmount(betAmount)} SOL`);
      setBetAmount(0);

    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Betting error:', error);
      toast.error(error.message || 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Connect your Phantom wallet to start betting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Place Your Bet</h3>
        <p className="text-gray-400 text-sm">
          Balance: {formatSolAmount(userStats.balance)} SOL
        </p>
      </div>

      {/* Bet Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Bet Amount ~$0
        </label>
        
        <div className="relative">
          <input
            type="number"
            value={betAmount || ''}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            step="0.01"
            min="0"
            max={config.maxBet}
            disabled={isPlacingBet || phase !== 'active' || timeRemaining <= 5}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <span className="text-blue-400 text-sm">≈</span>
            <span className="text-gray-400 text-sm">0</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => setBetAmount(0.1)}
            className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            disabled={isPlacingBet}
          >
            +0.1
          </button>
          <button
            onClick={() => setBetAmount(1)}
            className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            disabled={isPlacingBet}
          >
            +1
          </button>
        </div>
      </div>

      {/* Place Bet Button */}
      <motion.button
        onClick={handlePlaceBet}
        disabled={!canPlaceBet()}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
          ${canPlaceBet() 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg' 
            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          }
        `}
        whileHover={canPlaceBet() ? { scale: 1.02 } : {}}
        whileTap={canPlaceBet() ? { scale: 0.98 } : {}}
      >
        {isPlacingBet ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Placing Bet...</span>
          </div>
        ) : phase !== 'active' ? (
          'Betting Closed'
        ) : timeRemaining <= 5 ? (
          'Round Ending...'
        ) : betAmount <= 0 ? (
          'Enter Amount'
        ) : betAmount < config.minBet ? (
          `Min ${formatSolAmount(config.minBet)} SOL`
        ) : betAmount > config.maxBet ? (
          `Max ${formatSolAmount(config.maxBet)} SOL`
        ) : betAmount + estimatedFee > userStats.balance ? (
          'Insufficient Balance'
        ) : (
          'Place Bet'
        )}
      </motion.button>

      {/* Betting Info */}
      {betAmount > 0 && (
        <motion.div
          className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Bet Amount:</span>
            <span className="text-white">{formatSolAmount(betAmount)} SOL</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Network Fee:</span>
            <span className="text-gray-300">~{formatSolAmount(estimatedFee)} SOL</span>
          </div>
          <div className="flex justify-between text-sm mt-1 pt-1 border-t border-blue-500/20">
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-semibold">{formatSolAmount(betAmount + estimatedFee)} SOL</span>
          </div>
        </motion.div>
      )}

      {/* Phase Warning */}
      {phase === 'countdown' && (
        <motion.div
          className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">
              Betting closes in {timeRemaining}s!
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ModernBettingInterface; 