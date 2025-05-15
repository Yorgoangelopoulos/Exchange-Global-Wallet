import { useState, useEffect } from 'react';
import { CryptoCurrency, Balance, Transaction } from '@shared/schema';

// Initial wallet data - in a real app, this would come from a database or local storage
const initialCurrencies: CryptoCurrency[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX' },
  { id: 'monero', name: 'Monero', symbol: 'XMR' },
  { id: 'tether', name: 'Tether', symbol: 'USDT' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' }
];

const initialBalances: Balance[] = [
  { currencyId: 'bitcoin', amount: 0.15 },
  { currencyId: 'ethereum', amount: 2.5 },
  { currencyId: 'solana', amount: 35.75 },
  { currencyId: 'avalanche', amount: 12.35 },
  { currencyId: 'monero', amount: 0.8 },
  { currencyId: 'tether', amount: 250.50 },
  { currencyId: 'binancecoin', amount: 1.75 },
  { currencyId: 'ripple', amount: 500 }
];

const initialTransactions: Transaction[] = [
  { 
    id: 't1', 
    currencyId: 'bitcoin', 
    type: 'receive', 
    amount: 0.05, 
    timestamp: new Date(Date.now() - 3600000).toISOString(), 
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    confirmed: true
  },
  { 
    id: 't2', 
    currencyId: 'ethereum', 
    type: 'send', 
    amount: 0.75, 
    timestamp: new Date(Date.now() - 86400000).toISOString(), 
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    confirmed: true
  },
  { 
    id: 't3', 
    currencyId: 'solana', 
    type: 'receive', 
    amount: 10.5, 
    timestamp: new Date(Date.now() - 172800000).toISOString(), 
    address: 'EbmJMY9GhQbVfEuPpKJMc9U4BhNoP6kLZE9mfNkhHAeZ',
    confirmed: true
  },
  { 
    id: 't4', 
    currencyId: 'ethereum', 
    type: 'receive', 
    amount: 1.25, 
    timestamp: new Date(Date.now() - 259200000).toISOString(), 
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    confirmed: true
  },
  { 
    id: 't5', 
    currencyId: 'bitcoin', 
    type: 'send', 
    amount: 0.02, 
    timestamp: new Date(Date.now() - 345600000).toISOString(), 
    address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    confirmed: true
  }
];

const initialFavorites: string[] = ['bitcoin', 'ethereum'];

// Type for our wallet state
interface WalletState {
  currencies: CryptoCurrency[];
  balances: Balance[];
  transactions: Transaction[];
  favorites: string[];
}

// Hook for wallet operations
export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    currencies: initialCurrencies,
    balances: initialBalances,
    transactions: initialTransactions,
    favorites: initialFavorites
  });
  
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
      timestamp: new Date().toISOString(),
      confirmed: false
    };
    
    setWallet(prevWallet => {
      // Update the balance
      const balances = [...prevWallet.balances];
      const balanceIndex = balances.findIndex(b => b.currencyId === transaction.currencyId);
      
      if (balanceIndex >= 0) {
        const balanceChange = transaction.type === 'receive' 
          ? transaction.amount 
          : -transaction.amount;
        
        balances[balanceIndex] = {
          ...balances[balanceIndex],
          amount: Math.max(0, balances[balanceIndex].amount + balanceChange)
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
