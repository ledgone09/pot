const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const socketIo = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Import funpot logic from server directory
const express = require('express');
const cors = require('cors');

// Funpot state
let jackpotState = {
  currentRound: 1,
  totalPool: 0,
  entries: [],
  processedBetIds: new Set(),
  roundStartTime: Date.now(),
  roundDuration: 60000,
  timeRemaining: 60,
  isActive: true,
  phase: 'active',
  recentWinners: []
};

const connectedUsers = new Map();
const chatMessages = [];
const onlineUsers = new Set();

// Utility functions
const calculateWinner = (entries) => {
  if (entries.length === 0) return null;
  
  const weightedEntries = [];
  entries.forEach(entry => {
    const weight = Math.floor(entry.amount * 100);
    for (let i = 0; i < weight; i++) {
      weightedEntries.push(entry);
    }
  });
  
  if (weightedEntries.length === 0) return null;
  
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

const resetRound = (io) => {
  jackpotState.currentRound += 1;
  jackpotState.entries = [];
  jackpotState.processedBetIds.clear();
  jackpotState.totalPool = 0;
  jackpotState.roundStartTime = Date.now();
  jackpotState.timeRemaining = 60;
  jackpotState.isActive = true;
  jackpotState.phase = 'active';
  
  console.log(`Round ${jackpotState.currentRound} started`);
  
  io.emit('clear_entries');
  io.emit('round_start', jackpotState.currentRound);
  io.emit('pool_update', jackpotState.totalPool);
  io.emit('phase_change', jackpotState.phase);
};

const endRound = (io) => {
  jackpotState.phase = 'resolution';
  jackpotState.isActive = false;
  
  io.emit('phase_change', jackpotState.phase);
  
  const winnerEntry = calculateWinner(jackpotState.entries);
  
  if (winnerEntry) {
    const winnerAmount = jackpotState.totalPool * 0.9;
    const winner = {
      address: winnerEntry.userAddress,
      amount: winnerAmount,
      round: jackpotState.currentRound,
      timestamp: Date.now()
    };
    
    jackpotState.recentWinners.unshift(winner);
    if (jackpotState.recentWinners.length > 5) {
      jackpotState.recentWinners.pop();
    }
    
    console.log(`Winner selected: ${winner.address} won ${winner.amount} SOL`);
    io.emit('round_end', winner);
    
    // Set phase to 'reset' to indicate winner is being shown
    setTimeout(() => {
      jackpotState.phase = 'reset';
      io.emit('phase_change', jackpotState.phase);
      console.log('Showing winner animation...');
    }, 1000);
    
    // Wait for animation to complete before starting new round (12 seconds total)
    setTimeout(() => resetRound(io), 12000);
  } else {
    console.log('No entries, resetting round immediately');
    setTimeout(() => resetRound(io), 2000);
  }
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // API endpoints
    if (parsedUrl.pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        currentRound: jackpotState.currentRound,
        totalPool: jackpotState.totalPool,
        timeRemaining: jackpotState.timeRemaining,
        phase: jackpotState.phase,
        participants: jackpotState.entries.length,
        recentWinners: jackpotState.recentWinners.slice(0, 5)
      }));
      return;
    }
    
    if (parsedUrl.pathname === '/api/entries') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jackpotState.entries));
      return;
    }
    
    if (parsedUrl.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
      return;
    }
    
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Timer logic
  const updateTimer = () => {
    const elapsed = Date.now() - jackpotState.roundStartTime;
    const remaining = Math.max(0, Math.ceil((jackpotState.roundDuration - elapsed) / 1000));
    
    if (remaining !== jackpotState.timeRemaining) {
      jackpotState.timeRemaining = remaining;
      
      if (remaining > 5) {
        jackpotState.phase = 'active';
      } else if (remaining > 0) {
        jackpotState.phase = 'countdown';
      } else {
        endRound(io);
        return;
      }
      
      io.emit('timer_update', remaining);
      io.emit('phase_change', jackpotState.phase);
    }
  };

  setInterval(updateTimer, 1000);

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.emit('pool_update', jackpotState.totalPool);
    socket.emit('timer_update', jackpotState.timeRemaining);
    socket.emit('phase_change', jackpotState.phase);
    
    // Send existing entries with profile data
    jackpotState.entries.forEach(entry => {
      socket.emit('new_entry', entry);
    });
    
    // Send recent winners as initial data, not as new round_end events
    socket.emit('recent_winners', jackpotState.recentWinners.slice(0, 5));
    
    socket.on('join_room', (userAddress) => {
      const existingUser = connectedUsers.get(socket.id);
      if (existingUser === userAddress) {
        console.log(`User ${userAddress} already in room`);
        return;
      }
      
      connectedUsers.set(socket.id, userAddress);
      onlineUsers.add(userAddress);
      console.log(`User ${userAddress} joined room`);
      
      // Send recent chat messages to new user
      chatMessages.slice(-50).forEach(message => {
        socket.emit('chat_message', message);
      });
    });
    
    socket.on('leave_room', (userAddress) => {
      connectedUsers.delete(socket.id);
      onlineUsers.delete(userAddress);
      console.log(`User ${userAddress} left room`);
    });
    
    socket.on('place_bet', (entry) => {
      if (jackpotState.phase !== 'active' || jackpotState.timeRemaining <= 5) {
        socket.emit('error', 'Betting is closed');
        return;
      }
      
      if (entry.id && jackpotState.processedBetIds.has(entry.id)) {
        console.log(`Duplicate bet detected: ${entry.id}`);
        return;
      }
      
      if (!entry.userAddress || !entry.amount || entry.amount < 0.01 || entry.amount > 10) {
        socket.emit('error', 'Invalid bet amount');
        return;
      }
      
      const existingEntryIndex = jackpotState.entries.findIndex(e => e.userAddress === entry.userAddress);
      
      if (existingEntryIndex !== -1) {
        const existingEntry = jackpotState.entries[existingEntryIndex];
        const newTotalAmount = existingEntry.amount + entry.amount;
        
        if (newTotalAmount > 10) {
          socket.emit('error', 'Combined bet amount would exceed maximum of 10 SOL');
          return;
        }
        
        // Update existing entry with new amount and preserve/update profile data
        existingEntry.amount = newTotalAmount;
        existingEntry.weight = newTotalAmount * 100;
        existingEntry.timestamp = Date.now();
        if (entry.userProfile) {
          existingEntry.userProfile = entry.userProfile;
        }
        
        console.log(`Bet combined: ${entry.userAddress} total now ${newTotalAmount} SOL`);
        io.emit('update_entry', existingEntry);
      } else {
        const newEntry = {
          ...entry,
          id: entry.id || `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          weight: entry.amount * 100,
          userProfile: entry.userProfile || undefined
        };
        
        jackpotState.entries.push(newEntry);
        console.log(`New bet: ${entry.userAddress} bet ${entry.amount} SOL`);
        io.emit('new_entry', newEntry);
      }
      
      if (entry.id) {
        jackpotState.processedBetIds.add(entry.id);
      }
      
      jackpotState.totalPool += entry.amount;
      io.emit('pool_update', jackpotState.totalPool);
    });
    
    // Chat message handling
    socket.on('send_message', (message) => {
      // Validate message
      if (!message.userAddress || !message.message || !message.username) {
        socket.emit('error', 'Invalid message format');
        return;
      }
      
      // Check if user is connected
      if (!onlineUsers.has(message.userAddress)) {
        socket.emit('error', 'User not connected');
        return;
      }
      
      // Check for duplicate messages (prevent spam)
      const messageKey = `${message.userAddress}-${message.message.trim()}`;
      const now = Date.now();
      if (socket.lastMessageKey === messageKey && (now - socket.lastMessageTime) < 1000) {
        console.log('Duplicate message prevented');
        return;
      }
      socket.lastMessageKey = messageKey;
      socket.lastMessageTime = now;
      
      // Sanitize message
      const sanitizedMessage = {
        ...message,
        message: message.message.trim().substring(0, 200), // Limit message length
        timestamp: now,
        id: `${message.userAddress}-${now}-${Math.random()}`
      };
      
      // Store message (keep last 100 messages)
      chatMessages.push(sanitizedMessage);
      if (chatMessages.length > 100) {
        chatMessages.shift();
      }
      
      // Broadcast to all users
      io.emit('chat_message', sanitizedMessage);
      console.log(`Chat message from ${message.username}: ${sanitizedMessage.message}`);
    });
    
    socket.on('disconnect', () => {
      const userAddress = connectedUsers.get(socket.id);
      if (userAddress) {
        connectedUsers.delete(socket.id);
        onlineUsers.delete(userAddress);
        console.log(`User ${userAddress} disconnected`);
      }
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Funpot server integrated - Round ${jackpotState.currentRound} started`);
  });
}); 