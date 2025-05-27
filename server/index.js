const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Jackpot state
let jackpotState = {
  currentRound: 1,
  totalPool: 0,
  entries: [],
  processedBetIds: new Set(), // Track processed bet IDs
  roundStartTime: Date.now(),
  roundDuration: 60000, // 60 seconds
  timeRemaining: 60,
  isActive: true,
  phase: 'active',
  recentWinners: []
};

// Connected users
const connectedUsers = new Map();

// Utility functions
const calculateWinner = (entries) => {
  if (entries.length === 0) return null;
  
  // Create weighted array based on bet amounts
  const weightedEntries = [];
  entries.forEach(entry => {
    const weight = Math.floor(entry.amount * 100);
    for (let i = 0; i < weight; i++) {
      weightedEntries.push(entry);
    }
  });
  
  if (weightedEntries.length === 0) return null;
  
  // Use current timestamp as seed for randomness
  const seed = Date.now().toString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % weightedEntries.length;
  return weightedEntries[index];
};

const resetRound = () => {
  jackpotState.currentRound += 1;
  jackpotState.entries = [];
  jackpotState.processedBetIds.clear(); // Clear processed bet IDs
  jackpotState.totalPool = 0;
  jackpotState.roundStartTime = Date.now();
  jackpotState.timeRemaining = 60;
  jackpotState.isActive = true;
  jackpotState.phase = 'active';
  
  console.log(`Round ${jackpotState.currentRound} started`);
  
  // Emit events to clear client state
  io.emit('clear_entries'); // New event to explicitly clear entries
  io.emit('round_start', jackpotState.currentRound);
  io.emit('pool_update', jackpotState.totalPool);
  io.emit('phase_change', jackpotState.phase);
};

const endRound = () => {
  jackpotState.phase = 'resolution';
  jackpotState.isActive = false;
  
  io.emit('phase_change', jackpotState.phase);
  
  // Select winner
  const winnerEntry = calculateWinner(jackpotState.entries);
  
  if (winnerEntry) {
    const winnerAmount = jackpotState.totalPool * 0.9; // 90% to winner
    const winner = {
      address: winnerEntry.userAddress,
      amount: winnerAmount,
      round: jackpotState.currentRound,
      timestamp: Date.now()
    };
    
    // Add to recent winners
    jackpotState.recentWinners.unshift(winner);
    if (jackpotState.recentWinners.length > 10) {
      jackpotState.recentWinners.pop();
    }
    
    console.log(`Winner selected: ${winner.address} won ${winner.amount} SOL`);
    io.emit('round_end', winner);
    
    // Reset round after 5 seconds
    setTimeout(resetRound, 5000);
  } else {
    console.log('No entries, resetting round immediately');
    setTimeout(resetRound, 2000);
  }
};

// Timer logic
const updateTimer = () => {
  const elapsed = Date.now() - jackpotState.roundStartTime;
  const remaining = Math.max(0, Math.ceil((jackpotState.roundDuration - elapsed) / 1000));
  
  if (remaining !== jackpotState.timeRemaining) {
    jackpotState.timeRemaining = remaining;
    
    // Update phase based on time remaining
    if (remaining > 5) {
      jackpotState.phase = 'active';
    } else if (remaining > 0) {
      jackpotState.phase = 'countdown';
    } else {
      endRound();
      return;
    }
    
    io.emit('timer_update', remaining);
    io.emit('phase_change', jackpotState.phase);
  }
};

// Start timer
setInterval(updateTimer, 1000);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current state to new user
  socket.emit('pool_update', jackpotState.totalPool);
  socket.emit('timer_update', jackpotState.timeRemaining);
  socket.emit('phase_change', jackpotState.phase);
  
  // Send current entries
  jackpotState.entries.forEach(entry => {
    socket.emit('new_entry', entry);
  });
  
  // Send recent winners
  jackpotState.recentWinners.forEach(winner => {
    socket.emit('round_end', winner);
  });
  
  // Handle user joining room
  socket.on('join_room', (userAddress) => {
    // Check if user is already connected from this socket
    const existingUser = connectedUsers.get(socket.id);
    if (existingUser === userAddress) {
      console.log(`User ${userAddress} already in room`);
      return;
    }
    
    connectedUsers.set(socket.id, userAddress);
    console.log(`User ${userAddress} joined room`);
  });
  
  // Handle user leaving room
  socket.on('leave_room', (userAddress) => {
    connectedUsers.delete(socket.id);
    console.log(`User ${userAddress} left room`);
  });
  
  // Handle bet placement
  socket.on('place_bet', (entry) => {
    if (jackpotState.phase !== 'active' || jackpotState.timeRemaining <= 5) {
      socket.emit('error', 'Betting is closed');
      return;
    }
    
    // Check for duplicate bet ID
    if (entry.id && jackpotState.processedBetIds.has(entry.id)) {
      console.log(`Duplicate bet detected: ${entry.id}`);
      return;
    }
    
    // Validate entry
    if (!entry.userAddress || !entry.amount || entry.amount < 0.01 || entry.amount > 10) {
      socket.emit('error', 'Invalid bet amount');
      return;
    }
    
    // Find existing entry for this user
    const existingEntryIndex = jackpotState.entries.findIndex(e => e.userAddress === entry.userAddress);
    
    if (existingEntryIndex !== -1) {
      // User already has an entry, combine the amounts
      const existingEntry = jackpotState.entries[existingEntryIndex];
      const newTotalAmount = existingEntry.amount + entry.amount;
      
      // Check if combined amount exceeds maximum
      if (newTotalAmount > 10) {
        socket.emit('error', 'Combined bet amount would exceed maximum of 10 SOL');
        return;
      }
      
      // Update existing entry
      existingEntry.amount = newTotalAmount;
      existingEntry.weight = newTotalAmount * 100;
      existingEntry.timestamp = Date.now(); // Update timestamp to latest bet
      
      console.log(`Bet combined: ${entry.userAddress} total now ${newTotalAmount} SOL`);
      
      // Broadcast updated entry
      io.emit('update_entry', existingEntry);
    } else {
      // New user entry
      const newEntry = {
        ...entry,
        id: entry.id || `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        weight: entry.amount * 100
      };
      
      jackpotState.entries.push(newEntry);
      console.log(`New bet: ${entry.userAddress} bet ${entry.amount} SOL`);
      
      // Broadcast new entry
      io.emit('new_entry', newEntry);
    }
    
    // Track this bet ID
    if (entry.id) {
      jackpotState.processedBetIds.add(entry.id);
    }
    
    // Update total pool
    jackpotState.totalPool += entry.amount;
    io.emit('pool_update', jackpotState.totalPool);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const userAddress = connectedUsers.get(socket.id);
    if (userAddress) {
      connectedUsers.delete(socket.id);
      console.log(`User ${userAddress} disconnected`);
    }
  });
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    currentRound: jackpotState.currentRound,
    totalPool: jackpotState.totalPool,
    timeRemaining: jackpotState.timeRemaining,
    phase: jackpotState.phase,
    participants: jackpotState.entries.length,
    recentWinners: jackpotState.recentWinners.slice(0, 5)
  });
});

app.get('/api/entries', (req, res) => {
  res.json(jackpotState.entries);
});

app.get('/api/winners', (req, res) => {
  res.json(jackpotState.recentWinners);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Jackpot server running on port ${PORT}`);
  console.log(`Round ${jackpotState.currentRound} started`);
}); 