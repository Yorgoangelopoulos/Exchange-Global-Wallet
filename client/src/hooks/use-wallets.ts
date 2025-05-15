import { useState, useEffect, useCallback } from 'react';
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
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [walletsLoaded, setWalletsLoaded] = useState(false);
  
  const [activeWalletId, setActiveWalletId] = useState<string>('');
  
  // Fetch wallets from API
  const fetchWallets = useCallback(async () => {
    try {
      const userId = 1; // This would come from authentication
      const response = await apiRequest(`/api/wallets/${userId}`);
      const data = await response.json();
      
      if (data?.wallets) {
        const fetchedWallets: WalletInfo[] = data.wallets.map((w: any) => ({
          id: w.id.toString(),
          name: w.name,
          type: w.type || 'local',
          importMethod: w.mnemonic ? 'mnemonic' : w.privateKey ? 'privateKey' : undefined,
          isActive: false, // We'll set the active one below
          dateCreated: w.createdAt || new Date().toISOString()
        }));
        
        // Make sure at least one wallet is active
        if (fetchedWallets.length > 0) {
          fetchedWallets[0].isActive = true;
          setActiveWalletId(fetchedWallets[0].id);
        }
        
        setWallets(fetchedWallets);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      // Fallback to default wallet if API fails
      const defaultWallet = {
        id: 'default-wallet',
        name: 'My Wallet',
        type: 'local' as const,
        isActive: true,
        dateCreated: new Date().toISOString()
      };
      setWallets([defaultWallet]);
      setActiveWalletId(defaultWallet.id);
    } finally {
      setWalletsLoaded(true);
    }
  }, []);
  
  // Initial load of wallets from API
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);
  
  // Save wallets to localStorage whenever they change
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem('crypto_wallets', JSON.stringify(wallets));
    }
  }, [wallets]);
  
  // Save active wallet ID whenever it changes
  useEffect(() => {
    if (activeWalletId) {
      localStorage.setItem('active_wallet_id', activeWalletId);
    }
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
      
      const response = await apiRequest(`/api/wallet/${numericId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to delete wallet');
      }
      
      // Update local state and handle active wallet change if needed
      setWallets(prevWallets => {
        const updatedWallets = prevWallets.filter(wallet => wallet.id !== walletId);
        
        // If we're deleting the active wallet, set the first remaining wallet as active
        if (walletId === activeWalletId && updatedWallets.length > 0) {
          // Call this outside of the setState function to avoid race conditions
          setTimeout(() => {
            setActiveWallet(updatedWallets[0].id);
          }, 0);
        }
        
        return updatedWallets;
      });
      
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