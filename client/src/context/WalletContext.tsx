import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletInfo } from '@/hooks/use-wallets';

interface WalletContextType {
  activeWalletId: string | null;
  setActiveWalletId: (id: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  
  // Load active wallet ID from localStorage on initialization
  useEffect(() => {
    const storedActiveWalletId = localStorage.getItem('active_wallet_id');
    if (storedActiveWalletId) {
      setActiveWalletId(storedActiveWalletId);
    }
  }, []);
  
  // Store active wallet ID in localStorage whenever it changes
  useEffect(() => {
    if (activeWalletId) {
      localStorage.setItem('active_wallet_id', activeWalletId);
    }
  }, [activeWalletId]);
  
  return (
    <WalletContext.Provider value={{ activeWalletId, setActiveWalletId }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};