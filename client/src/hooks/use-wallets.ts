import { useState, useEffect } from 'react';
import { CryptoCurrency, Balance, Transaction, Wallet } from '@shared/schema';
import { useWallet } from './use-wallet';
import { apiRequest } from '@/lib/queryClient';

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
  const createWallet = async (name: string, mnemonic: string) => {
    try {
      // Create wallet on the server
      const response = await apiRequest('/api/wallet/create', {
        method: 'POST',
        body: JSON.stringify({
          name,
          mnemonic,
          type: 'local'
        })
      });
      
      // Once the server creates the wallet, add it to our local state
      const data = await response.json();
      const newWallet: WalletInfo = {
        id: String(data.id),
        name: name || 'New Wallet',
        type: 'local',
        isActive: false,
        dateCreated: new Date().toISOString()
      };
      
      setWallets(prevWallets => [...prevWallets, newWallet]);
      return newWallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  };
  
  // Import a wallet
  const importWallet = async (name: string, importMethod: 'mnemonic' | 'privateKey', credentials: string) => {
    try {
      // Import wallet on the server
      const response = await apiRequest('/api/wallet/import', {
        method: 'POST',
        body: JSON.stringify({
          name,
          importMethod,
          credentials // This is either the mnemonic or private key
        })
      });
      
      // Once the server imports the wallet, add it to our local state
      const data = await response.json();
      const newWallet: WalletInfo = {
        id: String(data.id),
        name: name || 'Imported Wallet',
        type: 'imported',
        importMethod,
        isActive: false,
        dateCreated: new Date().toISOString()
      };
      
      setWallets(prevWallets => [...prevWallets, newWallet]);
      return newWallet;
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  };
  
  // Set a wallet as active
  const setActiveWallet = async (walletId: string) => {
    try {
      setActiveWalletId(walletId);
      
      setWallets(prevWallets => 
        prevWallets.map(wallet => ({
          ...wallet,
          isActive: wallet.id === walletId
        }))
      );
      
      // Here we could also notify the server about the active wallet if needed
      return true;
    } catch (error) {
      console.error('Error setting active wallet:', error);
      return false;
    }
  };
  
  // Rename a wallet
  const renameWallet = async (walletId: string, newName: string) => {
    try {
      // Update wallet name on the server
      const numericId = parseInt(walletId);
      if (isNaN(numericId)) {
        throw new Error('Invalid wallet ID');
      }
      
      await apiRequest(`/api/wallet/${walletId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: newName
        })
      });
      
      // Update in local state
      setWallets(prevWallets => 
        prevWallets.map(wallet => 
          wallet.id === walletId 
            ? { ...wallet, name: newName }
            : wallet
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error renaming wallet:', error);
      return false;
    }
  };
  
  // Delete a wallet
  const deleteWallet = async (walletId: string) => {
    try {
      // Don't allow deleting the last wallet
      if (wallets.length <= 1) {
        return false;
      }
      
      // Delete wallet on the server
      const numericId = parseInt(walletId);
      if (isNaN(numericId)) {
        throw new Error('Invalid wallet ID');
      }
      
      await apiRequest(`/api/wallet/${walletId}`, {
        method: 'DELETE'
      });
      
      // Update local state
      setWallets(prevWallets => prevWallets.filter(wallet => wallet.id !== walletId));
      
      // If we're deleting the active wallet, set the first remaining wallet as active
      if (walletId === activeWalletId) {
        const remainingWallets = wallets.filter(wallet => wallet.id !== walletId);
        if (remainingWallets.length > 0) {
          await setActiveWallet(remainingWallets[0].id);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting wallet:', error);
      return false;
    }
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