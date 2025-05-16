import { useState, useEffect, useCallback } from 'react';
import { CryptoCurrency, Balance, Transaction, Wallet } from '@shared/schema';
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
      
      // Sistem geneline değişikliği bildir
      localStorage.setItem('active_wallet_id', defaultWallet.id);
      window.dispatchEvent(new Event('wallet-changed'));
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
      
      // Local storage'a kaydet
      localStorage.setItem('active_wallet_id', walletId);
      
      // Diğer componentleri bilgilendir
      window.dispatchEvent(new Event('wallet-changed'));
      
      return true;
    } catch (error) {
      console.error('Error setting active wallet:', error);
      return false;
    }
  };
  
  // Rename a wallet
  const renameWallet = async (walletId: string, newName: string) => {
    try {
      console.log(`Renaming wallet ${walletId} to "${newName}" - starting API request`);
      
      // Update wallet name on the server
      const numericId = parseInt(walletId);
      if (isNaN(numericId)) {
        throw new Error('Invalid wallet ID');
      }
      
      const response = await apiRequest(`/api/wallet/${walletId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: newName
        })
      });
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (data && data.success) {
        // Update in local state
        setWallets(prevWallets => {
          const newWallets = prevWallets.map(wallet => 
            wallet.id === walletId 
              ? { ...wallet, name: newName }
              : wallet
          );
          console.log("Updated wallets in state:", newWallets);
          return newWallets;
        });
        
        // Diğer componentleri bilgilendir
        console.log("Dispatching wallet-changed event");
        window.dispatchEvent(new Event('wallet-changed'));
        
        // Güncelleme sonrası cüzdanları sunucudan tekrar yükle
        setTimeout(async () => {
          try {
            console.log("Reloading wallets from server after rename");
            const userId = 1; // Bu userId sabit değer, gerçek uygulamada otomatik alınacak
            const refreshResponse = await apiRequest(`/api/wallets/${userId}`);
            const refreshData = await refreshResponse.json();
            
            if (refreshData && refreshData.wallets) {
              console.log("Refreshed wallets:", refreshData.wallets);
              // Güncel cüzdan listesini ayarla
              setWallets(refreshData.wallets.map((wallet: any) => ({
                id: String(wallet.id),
                name: wallet.name,
                type: wallet.type.includes('imported') ? 'imported' : 'local',
                importMethod: wallet.type === 'imported_mnemonic' ? 'mnemonic' : 
                              wallet.type === 'imported_private_key' ? 'privateKey' : undefined,
                isActive: wallet.isActive,
                dateCreated: new Date(wallet.createdAt).toISOString()
              })));
            }
          } catch (refreshError) {
            console.error("Error refreshing wallets after rename:", refreshError);
          }
        }, 500);
        
        return true;
      } else {
        console.error("API returned error:", data);
        return false;
      }
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
            // Cüzdan silindikten sonra dashboard'u güncellemek için
            window.dispatchEvent(new Event('wallet-changed'));
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
    setWallets,
    createWallet,
    importWallet,
    setActiveWallet,
    renameWallet,
    deleteWallet
  };
};