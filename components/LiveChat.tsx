'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useChatStore } from '@/store/chatStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSocket } from '@/hooks/useSocket';
import { ChatMessage } from '@/types';
import { shortenAddress } from '@/lib/solana';
import { MessageCircle, Send, Users, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveChat: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { messages, onlineUsers, addMessage } = useChatStore();
  const { getUserProfile } = useUserProfileStore();
  const { socket } = useSocket();
  
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const sendMessage = () => {
    if (!connected || !publicKey || !message.trim() || !socket) {
      if (!connected) toast.error('Please connect your wallet to chat');
      return;
    }

    const userProfile = getUserProfile(publicKey.toString());
    const username = userProfile?.username || shortenAddress(publicKey.toString());

    const chatMessage: ChatMessage = {
      id: `${publicKey.toString()}-${Date.now()}`,
      userAddress: publicKey.toString(),
      username,
      profilePicture: userProfile?.profilePicture,
      message: message.trim(),
      timestamp: Date.now(),
      type: 'user',
    };

    // Emit to server (server will broadcast back to all clients including sender)
    socket.emit('send_message', chatMessage);
    
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDisplayName = (userAddress: string, username: string) => {
    return username;
  };

  const getProfilePicture = (userAddress: string, profilePicture?: string) => {
    return profilePicture || '/placeholder.svg';
  };

  const isOwnMessage = (userAddress: string) => {
    return connected && publicKey && userAddress === publicKey.toString();
  };

  if (!isExpanded) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
          {messages.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {messages.length > 99 ? '99+' : messages.length}
            </div>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 w-80 h-96 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl z-40 flex flex-col"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Live Chat</h3>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">{onlineUsers.size}</span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {messages.filter(msg => msg.type === 'user').map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-start space-x-2 ${
                isOwnMessage(msg.userAddress) ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={getProfilePicture(msg.userAddress, msg.profilePicture)}
                  alt={msg.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Message */}
              <div className={`flex-1 ${isOwnMessage(msg.userAddress) ? 'text-right' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-medium ${
                    isOwnMessage(msg.userAddress)
                      ? 'text-green-400'
                      : 'text-gray-300'
                  }`}>
                    {getDisplayName(msg.userAddress, msg.username)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getMessageTime(msg.timestamp)}
                  </span>
                </div>
                
                <div className={`inline-block px-3 py-2 rounded-lg text-sm max-w-xs break-words ${
                  isOwnMessage(msg.userAddress)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}>
                  {msg.message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        {connected ? (
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 text-sm"
              maxLength={200}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-2">
            Connect your wallet to chat
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveChat; 