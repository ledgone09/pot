import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Solana network configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://magical-boldest-patina.solana-mainnet.quiknode.pro/a94255dcbb27e52b1d4cca35d10e899b82b6bdba/';

// Platform configuration - REPLACE WITH YOUR ACTUAL WALLET ADDRESS
export const PLATFORM_CONFIG = {
  JACKPOT_PROGRAM_ID: new PublicKey('11111111111111111111111111111111'), // Placeholder
  // IMPORTANT: Replace this with your actual wallet address to receive the SOL
  PLATFORM_WALLET: new PublicKey('5tuxzsQH5jtW2pNw1nkmU8t4G4p4i6cxodeUf2iN1HTT'), // Replace with your wallet
  MIN_BET_LAMPORTS: 0.01 * LAMPORTS_PER_SOL,
  MAX_BET_LAMPORTS: 10 * LAMPORTS_PER_SOL,
  PLATFORM_FEE_PERCENTAGE: 5,
};

// Create Solana connection
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Utility functions
export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

export const formatSolAmount = (amount: number): string => {
  return amount.toFixed(4);
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Get user SOL balance
export const getUserBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return lamportsToSol(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

// Create bet transaction
export const createBetTransaction = async (
  userPublicKey: PublicKey,
  betAmount: number
): Promise<Transaction> => {
  const transaction = new Transaction();
  
  // Convert SOL to lamports
  const lamports = solToLamports(betAmount);
  
  // Create transfer instruction to platform wallet
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: userPublicKey,
    toPubkey: PLATFORM_CONFIG.PLATFORM_WALLET,
    lamports,
  });
  
  transaction.add(transferInstruction);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = userPublicKey;
  
  return transaction;
};

// Validate bet amount
export const validateBetAmount = (amount: number): { isValid: boolean; error?: string } => {
  if (amount < lamportsToSol(PLATFORM_CONFIG.MIN_BET_LAMPORTS)) {
    return {
      isValid: false,
      error: `Minimum bet is ${lamportsToSol(PLATFORM_CONFIG.MIN_BET_LAMPORTS)} SOL`,
    };
  }
  
  if (amount > lamportsToSol(PLATFORM_CONFIG.MAX_BET_LAMPORTS)) {
    return {
      isValid: false,
      error: `Maximum bet is ${lamportsToSol(PLATFORM_CONFIG.MAX_BET_LAMPORTS)} SOL`,
    };
  }
  
  return { isValid: true };
};

// Calculate winner using provably fair algorithm
export const calculateWinner = (entries: Array<{ userAddress: string; amount: number }>, seed: string): string => {
  if (entries.length === 0) return '';
  
  // Create weighted array based on bet amounts
  const weightedEntries: string[] = [];
  entries.forEach(entry => {
    const weight = Math.floor(entry.amount * 100); // Convert to integer weight
    for (let i = 0; i < weight; i++) {
      weightedEntries.push(entry.userAddress);
    }
  });
  
  // Use seed to generate deterministic random index
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % weightedEntries.length;
  return weightedEntries[index];
};

// Get transaction confirmation
export const confirmTransaction = async (signature: string): Promise<boolean> => {
  try {
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    return !confirmation.value.err;
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return false;
  }
};

// Estimate transaction fee
export const estimateTransactionFee = async (transaction: Transaction): Promise<number> => {
  try {
    const feeResponse = await connection.getFeeForMessage(transaction.compileMessage());
    return feeResponse?.value ? lamportsToSol(feeResponse.value) : 0.000005; // Default fee estimate
  } catch (error) {
    console.error('Error estimating fee:', error);
    return 0.000005; // Default fee estimate
  }
};

// Send and confirm transaction
export const sendAndConfirmTransaction = async (
  signedTransaction: Transaction
): Promise<string> => {
  try {
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }
    
    return signature;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}; 