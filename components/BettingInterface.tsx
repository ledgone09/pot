'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useJackpotStore } from '@/store/jackpotStore';
import { 
  createBetTransaction, 
  validateBetAmount, 
  formatSolAmount, 
  sendAndConfirmTransaction,
  getUserBalance,
  estimateTransactionFee
} from '@/lib/solana';
import { useSocket } from '@/hooks/useSocket';
import { Wallet, Plus, Minus, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BettingInterface: React.FC = () => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { userStats, config, phase, timeRemaining, isConnected, setUserStats } = useJackpotStore();
  const { emitBet } = useSocket();
  const [betAmount, setBetAmount] = useState(0.01);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0.000005);

  const quickAmounts = [0.01, 0.05, 0.1, 0.5, 1.0, 5.0];

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
      const interval = setInterval(updateBalance, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  // Estimate transaction fee when bet amount changes
  useEffect(() => {
    if (connected && publicKey && signTransaction) {
      const estimateFee = async () => {
        try {
          const transaction = await createBetTransaction(publicKey, betAmount);
          const fee = await estimateTransactionFee(transaction);
          setEstimatedFee(fee);
        } catch (error) {
          console.error('Error estimating fee:', error);
        }
      };
      
      estimateFee();
    }
  }, [betAmount, connected, publicKey, signTransaction]);

  const canPlaceBet = () => {
    return (
      connected &&
      isConnected &&
      phase === 'active' &&
      timeRemaining > 5 &&
      userStats.currentRoundEntries.length < config.maxEntriesPerUser &&
      userStats.balance >= betAmount + estimatedFee
    );
  };

  const handleBetAmountChange = (amount: number) => {
    setBetAmount(Math.max(config.minBet, Math.min(config.maxBet, amount)));
  };

  const placeBet = async () => {
    if (!publicKey || !signTransaction || !canPlaceBet()) return;

    const validation = validateBetAmount(betAmount);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid bet amount');
      return;
    }

    // Check if user has enough balance including fees
    if (betAmount + estimatedFee > userStats.balance) {
      toast.error(`Insufficient balance. Need ${formatSolAmount(betAmount + estimatedFee)} SOL (including fees)`);
      return;
    }

    setIsPlacingBet(true);

    try {
      toast.loading('Creating transaction...', { id: 'bet-transaction' });
      
      // Create transaction
      const transaction = await createBetTransaction(publicKey, betAmount);
      
      toast.loading('Please sign the transaction in your wallet...', { id: 'bet-transaction' });
      
      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      toast.loading('Sending transaction to Solana network...', { id: 'bet-transaction' });
      
      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(signedTransaction);
      
      // Create entry object
      const entry = {
        id: signature,
        user: publicKey,
        amount: betAmount,
        timestamp: Date.now(),
        userAddress: publicKey.toString(),
        weight: betAmount * 100,
      };

      // Emit bet to server
      emitBet(entry);
      
      // Update local balance
      const newBalance = await getUserBalance(publicKey);
      setUserStats({
        ...userStats,
        balance: newBalance,
        totalBets: userStats.totalBets + 1,
        totalWagered: userStats.totalWagered + betAmount,
      });
      
      toast.success(
        <div>
          <div>Bet placed successfully!</div>
          <div className="text-xs opacity-75">
            {formatSolAmount(betAmount)} SOL • <a 
              href={`https://explorer.solana.com/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Explorer
            </a>
          </div>
        </div>,
        { id: 'bet-transaction', duration: 5000 }
      );
      
    } catch (error: any) {
      console.error('Error placing bet:', error);
      
      let errorMessage = 'Failed to place bet';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance';
      } else if (error.message?.includes('Transaction failed')) {
        errorMessage = 'Transaction failed on network';
      }
      
      toast.error(errorMessage, { id: 'bet-transaction' });
    } finally {
      setIsPlacingBet(false);
    }
  };

  if (!connected) {
    return (
      <div className="glass-effect rounded-xl p-6 text-center">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400 text-sm">
          Connect your Phantom wallet to start betting with real SOL
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Your Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">SOL Balance</div>
            <div className="text-white font-semibold">
              {formatSolAmount(userStats.balance)} SOL
            </div>
          </div>
          <div>
            <div className="text-gray-400">Total Bets</div>
            <div className="text-white font-semibold">
              {userStats.totalBets}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Total Wagered</div>
            <div className="text-white font-semibold">
              {formatSolAmount(userStats.totalWagered)} SOL
            </div>
          </div>
          <div>
            <div className="text-gray-400">Total Won</div>
            <div className="text-white font-semibold">
              {formatSolAmount(userStats.totalWon)} SOL
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-gray-400 text-sm">
            Round Entries: {userStats.currentRoundEntries.length}/{config.maxEntriesPerUser}
          </div>
        </div>
      </div>

      {/* Betting Panel */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Place Your Bet
        </h3>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                betAmount === amount
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {formatSolAmount(amount)} SOL
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Bet Amount (SOL)
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBetAmountChange(betAmount - 0.01)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              disabled={betAmount <= config.minBet}
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <input
              type="number"
              value={betAmount}
              onChange={(e) => handleBetAmountChange(parseFloat(e.target.value) || 0)}
              min={config.minBet}
              max={config.maxBet}
              step={0.01}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-primary-500"
            />
            
            <button
              onClick={() => handleBetAmountChange(betAmount + 0.01)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              disabled={betAmount >= config.maxBet}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-400 mt-1">
            Min: {formatSolAmount(config.minBet)} SOL • Max: {formatSolAmount(config.maxBet)} SOL
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Est. Fee: ~{formatSolAmount(estimatedFee)} SOL • Total: ~{formatSolAmount(betAmount + estimatedFee)} SOL
          </div>
        </div>

        {/* Insufficient Balance Warning */}
        {userStats.balance < betAmount + estimatedFee && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Insufficient Balance</span>
            </div>
            <p className="text-red-300 text-xs mt-1">
              You need {formatSolAmount(betAmount + estimatedFee - userStats.balance)} more SOL to place this bet.
            </p>
          </div>
        )}

        {/* Place Bet Button */}
        <motion.button
          onClick={placeBet}
          disabled={!canPlaceBet() || isPlacingBet}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            canPlaceBet() && !isPlacingBet
              ? 'bg-primary-600 hover:bg-primary-700 text-white pulse-border'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={canPlaceBet() ? { scale: 1.02 } : {}}
          whileTap={canPlaceBet() ? { scale: 0.98 } : {}}
        >
          {isPlacingBet ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Transaction...
            </div>
          ) : !canPlaceBet() ? (
            phase !== 'active' ? 'Betting Closed' : 
            timeRemaining <= 5 ? 'Too Late' :
            userStats.currentRoundEntries.length >= config.maxEntriesPerUser ? 'Max Entries Reached' :
            userStats.balance < betAmount + estimatedFee ? 'Insufficient Balance' :
            'Connect Wallet'
          ) : (
            `Place Bet - ${formatSolAmount(betAmount)} SOL`
          )}
        </motion.button>

        {/* Betting Info */}
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <div>• Higher bets = higher chance to win</div>
          <div>• Winner gets 90% of the total pool</div>
          <div>• Betting closes 5 seconds before round end</div>
          <div>• Real SOL transactions processed securely</div>
        </div>
      </div>
    </div>
  );
};

export default BettingInterface; 