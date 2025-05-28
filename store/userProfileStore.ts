import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types';

interface UserProfileStore {
  profiles: Record<string, UserProfile>; // walletAddress -> UserProfile
  currentUserProfile: UserProfile | null;
  
  // Actions
  setUserProfile: (walletAddress: string, username: string, profilePicture?: string) => void;
  getUserProfile: (walletAddress: string) => UserProfile | null;
  updateProfilePicture: (walletAddress: string, profilePicture: string) => void;
  setCurrentUser: (walletAddress: string) => void;
  clearCurrentUser: () => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      profiles: {},
      currentUserProfile: null,

      setUserProfile: (walletAddress: string, username: string, profilePicture?: string) => {
        const now = Date.now();
        const existingProfile = get().profiles[walletAddress];
        
        const profile: UserProfile = {
          walletAddress,
          username: username.trim(),
          profilePicture: profilePicture || undefined,
          createdAt: existingProfile?.createdAt || now,
          updatedAt: now,
        };

        set((state) => ({
          profiles: {
            ...state.profiles,
            [walletAddress]: profile,
          },
          currentUserProfile: state.currentUserProfile?.walletAddress === walletAddress 
            ? profile 
            : state.currentUserProfile,
        }));
      },

      getUserProfile: (walletAddress: string) => {
        return get().profiles[walletAddress] || null;
      },

      updateProfilePicture: (walletAddress: string, profilePicture: string) => {
        const profile = get().profiles[walletAddress];
        if (profile) {
          get().setUserProfile(walletAddress, profile.username, profilePicture);
        }
      },

      setCurrentUser: (walletAddress: string) => {
        const profile = get().profiles[walletAddress];
        set({ currentUserProfile: profile || null });
      },

      clearCurrentUser: () => {
        set({ currentUserProfile: null });
      },
    }),
    {
      name: 'user-profiles-storage',
      partialize: (state) => ({ profiles: state.profiles }),
    }
  )
); 