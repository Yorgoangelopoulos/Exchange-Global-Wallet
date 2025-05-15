import { useState, useEffect } from 'react';
import { CryptoCurrency, Balance, Transaction } from '@shared/schema';
import { useWallet } from './use-wallet';

export interface WalletInfo {
  id: string;
  name: string;
  type: 'local' | 'imported';
  importMethod?: 'mnemonic' | 'privateKey';
  isActive: boolean;
  dateCreated: string;
}

// Hook for managing multiple wallets
export const useWallets = () => {
  const [wallets, setWallets] = useState<WalletInfo[]>(() => {
    const savedWallets = localStorage.getItem('crypto_wallets');
    
    if (savedWallets) {
      return JSON.parse(savedWallets);
    }
    
    // Default wallet
    return [{
      id: 'default-wallet',
      name: 'My Wallet',
      type: 'local',
      isActive: true,
      dateCreated: new Date().toISOString()
    }];
  });
  
  const [activeWalletId, setActiveWalletId] = useState<string>(() => {
    const activeId = localStorage.getItem('active_wallet_id');
    return activeId || wallets[0]?.id || 'default-wallet';
  });
  
  // Save wallets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('crypto_wallets', JSON.stringify(wallets));
  }, [wallets]);
  
  // Save active wallet ID whenever it changes
  useEffect(() => {
    localStorage.setItem('active_wallet_id', activeWalletId);
  }, [activeWalletId]);
  
  // Get the active wallet
  const activeWallet = wallets.find(wallet => wallet.id === activeWalletId) || wallets[0];
  
  // Create a new wallet
  const createWallet = (name: string) => {
    const newWallet: WalletInfo = {
      id: `wallet-${Date.now()}`,
      name: name || 'New Wallet',
      type: 'local',
      isActive: false,
      dateCreated: new Date().toISOString()
    };
    
    setWallets(prevWallets => [...prevWallets, newWallet]);
    return newWallet;
  };
  
  // Import a wallet
  const importWallet = (name: string, importMethod: 'mnemonic' | 'privateKey') => {
    const newWallet: WalletInfo = {
      id: `wallet-${Date.now()}`,
      name: name || 'Imported Wallet',
      type: 'imported',
      importMethod,
      isActive: false,
      dateCreated: new Date().toISOString()
    };
    
    setWallets(prevWallets => [...prevWallets, newWallet]);
    return newWallet;
  };
  
  // Set a wallet as active
  const setActiveWallet = (walletId: string) => {
    setActiveWalletId(walletId);
    
    setWallets(prevWallets => 
      prevWallets.map(wallet => ({
        ...wallet,
        isActive: wallet.id === walletId
      }))
    );
  };
  
  // Rename a wallet
  const renameWallet = (walletId: string, newName: string) => {
    setWallets(prevWallets => 
      prevWallets.map(wallet => 
        wallet.id === walletId 
          ? { ...wallet, name: newName }
          : wallet
      )
    );
  };
  
  // Delete a wallet
  const deleteWallet = (walletId: string) => {
    // Don't allow deleting the last wallet
    if (wallets.length <= 1) {
      return false;
    }
    
    setWallets(prevWallets => prevWallets.filter(wallet => wallet.id !== walletId));
    
    // If we're deleting the active wallet, set the first remaining wallet as active
    if (walletId === activeWalletId) {
      const remainingWallets = wallets.filter(wallet => wallet.id !== walletId);
      if (remainingWallets.length > 0) {
        setActiveWallet(remainingWallets[0].id);
      }
    }
    
    return true;
  };
  
  return {
    wallets,
    activeWallet,
    createWallet,
    importWallet,
    setActiveWallet,
    renameWallet,
    deleteWallet
  };
};