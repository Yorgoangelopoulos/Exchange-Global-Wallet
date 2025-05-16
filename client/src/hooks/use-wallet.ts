import { useState, useEffect } from 'react';
import { CryptoCurrency, Balance, Transaction } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { getWalletBalance } from '@/lib/wallet-service';

// Desteklenen kripto para birimleri - Gerçek uygulamada kullanılacak
const supportedCurrencies: CryptoCurrency[] = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', description: null, iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', color: '#627EEA', isActive: true, sortOrder: 1 },
  { id: 'bsc', name: 'BNB Smart Chain', symbol: 'BNB', description: null, iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg', color: '#F3BA2F', isActive: true, sortOrder: 2 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', description: null, iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.svg', color: '#00FFA3', isActive: true, sortOrder: 3 },
  { id: 'tron', name: 'TRON', symbol: 'TRX', description: null, iconUrl: 'https://cryptologos.cc/logos/tron-trx-logo.svg', color: '#FF0013', isActive: true, sortOrder: 4 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', description: null, iconUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.svg', color: '#0033AD', isActive: true, sortOrder: 5 }
];

// Varsayılan boş başlangıç durumları
const emptyBalances: Balance[] = [];
const emptyTransactions: Transaction[] = [];
const defaultFavorites: string[] = ['ethereum', 'bsc', 'tron'];

// Type for our wallet state
interface WalletState {
  currencies: CryptoCurrency[];
  balances: Balance[];
  transactions: Transaction[];
  favorites: string[];
}

// Hook for wallet operations
export const useWallet = () => {
  // Initial state
  const [wallet, setWallet] = useState<WalletState>({
    currencies: supportedCurrencies,
    balances: emptyBalances,
    transactions: emptyTransactions,
    favorites: defaultFavorites
  });
  
  // Cüzdanın mnemonic anahtarlarını saklamak için state
  const [walletMnemonics, setWalletMnemonics] = useState<{[walletId: string]: string}>({});
  
  // Load active wallet ID from localStorage and refresh cüzdan içeriği
  useEffect(() => {
    // Cüzdan verilerini güncelle
    const refreshWalletData = async () => {
      const storedActiveWalletId = localStorage.getItem('active_wallet_id');
      if (storedActiveWalletId) {
        console.log(`Loading real data for wallet ID: ${storedActiveWalletId}`);
        
        try {
          // Cüzdan bilgilerini API'den getir
          const walletResponse: any = await apiRequest(`/api/wallets/${storedActiveWalletId}`);
          
          if (!walletResponse || !walletResponse.wallets || walletResponse.wallets.length === 0) {
            console.error("Cüzdan bilgileri bulunamadı");
            return;
          }
          
          const walletInfo = walletResponse.wallets[0];
          
          // Cüzdan mnemonic bilgisini sakla
          if (walletInfo.mnemonic) {
            setWalletMnemonics(prev => ({
              ...prev,
              [storedActiveWalletId]: walletInfo.mnemonic
            }));
          }
          
          // Cüzdan adreslerini API'den getir
          const addressesResponse: any = await apiRequest(`/api/wallet/${storedActiveWalletId}/addresses`);
          const addresses: any[] = addressesResponse && addressesResponse.addresses ? addressesResponse.addresses : [];
          
          if (!addresses || addresses.length === 0) {
            console.log("Cüzdan için adres bulunamadı, boş bakiye ile devam ediliyor");
            setWallet(prev => ({
              ...prev,
              balances: emptyBalances,
              transactions: emptyTransactions
            }));
            return;
          }
          
          // Her bir desteklenen kripto para için bakiye hesapla
          const allBalances: Balance[] = [];
          
          for (const currency of supportedCurrencies) {
            const address = addresses.find((a) => a.currencyId === currency.id);
            
            if (address) {
              try {
                // Gerçek blockchain'den bakiye sorgula
                const balance = await getWalletBalance(address.address, currency.id);
                
                allBalances.push({
                  id: Math.floor(Date.now() + Math.random()), // Basit bir ID
                  walletId: parseInt(storedActiveWalletId),
                  currencyId: currency.id,
                  amount: balance.toString()
                });
              } catch (error) {
                console.error(`${currency.id} için bakiye sorgulama hatası:`, error);
                allBalances.push({
                  id: Math.floor(Date.now() + Math.random()),
                  walletId: parseInt(storedActiveWalletId),
                  currencyId: currency.id,
                  amount: "0"
                });
              }
            }
          }
          
          // İşlemleri API'den getir
          const transactionsResponse: any = await apiRequest(`/api/wallet/${storedActiveWalletId}/transactions`);
          const transactions: Transaction[] = transactionsResponse && transactionsResponse.transactions ? transactionsResponse.transactions : [];
          
          setWallet(prev => ({
            ...prev,
            balances: allBalances,
            transactions: transactions
          }));
        } catch (error) {
          console.error("Cüzdan verilerini getirirken hata:", error);
        }
      }
    };
    
    // Initial load
    refreshWalletData();
    
    // Storage event dinle (başka tablar için)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'active_wallet_id') {
        refreshWalletData();
      }
    };
    
    // Custom event dinle (aynı penceredeki değişiklikleri tespit etmek için)
    const handleWalletChange = () => {
      console.log("Wallet hook: wallet-changed event received");
      refreshWalletData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wallet-changed', handleWalletChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wallet-changed', handleWalletChange);
    };
  }, []);
  
  // Function to toggle a cryptocurrency as favorite
  const toggleFavorite = (currencyId: string) => {
    setWallet(prevWallet => {
      const favorites = prevWallet.favorites.includes(currencyId)
        ? prevWallet.favorites.filter(id => id !== currencyId)
        : [...prevWallet.favorites, currencyId];
      
      return {
        ...prevWallet,
        favorites
      };
    });
  };
  
  // Function to add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: `t${Date.now()}`, // Generate a simple ID
      walletId: transaction.walletId || 1, // Default wallet ID
      timestamp: new Date(),
      hash: transaction.hash || null,
      fee: transaction.fee || null,
      confirmed: false
    };
    
    setWallet(prevWallet => {
      // Update the balance
      const balances = [...prevWallet.balances];
      const balanceIndex = balances.findIndex(b => b.currencyId === transaction.currencyId);
      
      if (balanceIndex >= 0) {
        const currentAmount = parseFloat(balances[balanceIndex].amount);
        const transactionAmount = parseFloat(transaction.amount);
        const balanceChange = transaction.type === 'receive' 
          ? transactionAmount 
          : -transactionAmount;
        
        const newAmount = Math.max(0, currentAmount + balanceChange).toString();
        
        balances[balanceIndex] = {
          ...balances[balanceIndex],
          amount: newAmount
        };
      }
      
      return {
        ...prevWallet,
        balances,
        transactions: [newTransaction, ...prevWallet.transactions]
      };
    });
  };
  
  return {
    wallet,
    toggleFavorite,
    addTransaction
  };
};
