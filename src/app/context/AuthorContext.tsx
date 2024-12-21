"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@/app/context/WalletContext';
interface User {
  _id: string;
  userid: string;
  userWalletAddress: string;
  profilePic: string;
  personalLink: string;
  username: string;
}

interface AuthorContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>; // Renamed for clarity
}

const AuthorContext = createContext<AuthorContextType | undefined>(undefined);


export const AuthorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();
  const walletAddress = wallet?.walletAddress;

  const refetchUser = async () => {
    if (!walletAddress) {
      console.warn('Wallet address is not available.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/page/api/users?userWalletAddress=${walletAddress}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch profile data. Status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user data:', err.message);
      setError(err.message || 'Error fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, [walletAddress]);

  return (
    <AuthorContext.Provider value={{ user, loading, error, refetchUser }}>
      {children}
    </AuthorContext.Provider>
  );
};

export const useAuthor = () => {
  const context = useContext(AuthorContext);
  if (!context) {
    throw new Error('useAuthor must be used within an AuthorProvider');
  }
  return context;
};