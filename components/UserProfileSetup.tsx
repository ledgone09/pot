'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUserProfileStore } from '@/store/userProfileStore';
import { User, Camera, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfileSetupProps {
  walletAddress: string;
  onComplete: () => void;
  onCancel?: () => void;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ 
  walletAddress, 
  onComplete, 
  onCancel 
}) => {
  const { setUserProfile, getUserProfile } = useUserProfileStore();
  const existingProfile = getUserProfile(walletAddress);
  
  const [username, setUsername] = useState(existingProfile?.username || '');
  const [profilePicture, setProfilePicture] = useState(existingProfile?.profilePicture || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    // Convert to base64 for local storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfilePicture(result);
      setIsUploading(false);
      toast.success('Profile picture uploaded!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (username.trim().length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }

    setUserProfile(walletAddress, username.trim(), profilePicture || undefined);
    toast.success('Profile saved successfully!');
    onComplete();
  };

  const getDisplayImage = () => {
    if (profilePicture) return profilePicture;
    return '/placeholder.png'; // Default placeholder image
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl p-6 border border-gray-700/50 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-400" />
            {existingProfile ? 'Edit Profile' : 'Setup Profile'}
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profile Picture */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-600 bg-gray-800">
              <img
                src={getDisplayImage()}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }}
              />
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <p className="text-sm text-gray-400 mt-2">
            Click camera to upload profile picture
          </p>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            maxLength={20}
          />
          <p className="text-xs text-gray-400 mt-1">
            3-20 characters, will be displayed instead of wallet address
          </p>
        </div>

        {/* Wallet Address Display */}
        <div className="mb-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Wallet Address:</p>
          <p className="text-sm text-gray-300 font-mono break-all">
            {walletAddress}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={!username.trim() || username.trim().length < 3}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfileSetup; 