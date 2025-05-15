import { useState, useEffect } from 'react';
import { CryptoCurrency, Balance, Transaction } from '@shared/schema';

// Initial wallet data - in a real app, this would come from a database or local storage
const initialCurrencies: CryptoCurrency[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', description: null },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', description: null },
  { id: 'solana', name: 'Solana', symbol: 'SOL', description: null },
  { id: 'tron', name: 'TRON', symbol: 'TRX', description: null },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', description: null },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', description: null },
  { id: 'tether', name: 'Tether', symbol: 'USDT', description: null },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', description: null },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', description: null },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', description: null },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', description: null }
];

const initialBalances: Balance[] = [
  { currencyId: 'bitcoin', amount: "0.15" },
  { currencyId: 'ethereum', amount: "2.5" },
  { currencyId: 'solana', amount: "35.75" },
  { currencyId: 'tron', amount: "1500" },
  { currencyId: 'avalanche', amount: "12.35" },
  { currencyId: 'cardano', amount: "450" },
  { currencyId: 'tether', amount: "250.50" },
  { currencyId: 'bnb', amount: "1.75" },
  { currencyId: 'xrp', amount: "500" },
  { currencyId: 'polkadot', amount: "25" },
  { currencyId: 'dogecoin', amount: "1200" }
];

const initialTransactions: Transaction[] = [
  { 
    id: 't1', 
    currencyId: 'bitcoin', 
    type: 'receive', 
    amount: "0.05", 
    timestamp: new Date(Date.now() - 3600000), 
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    confirmed: true
  },
  { 
    id: 't2', 
    currencyId: 'ethereum', 
    type: 'send', 
    amount: "0.75", 
    timestamp: new Date(Date.now() - 86400000), 
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    confirmed: true
  },
  { 
    id: 't3', 
    currencyId: 'solana', 
    type: 'receive', 
    amount: "10.5", 
    timestamp: new Date(Date.now() - 172800000), 
    address: 'EbmJMY9GhQbVfEuPpKJMc9U4BhNoP6kLZE9mfNkhHAeZ',
    confirmed: true
  },
  { 
    id: 't4', 
    currencyId: 'tron', 
    type: 'receive', 
    amount: "500", 
    timestamp: new Date(Date.now() - 259200000), 
    address: 'TJYeasTPa6cx4x6UZCaEXnGQiVCty59961',
    confirmed: true
  },
  { 
    id: 't5', 
    currencyId: 'tron', 
    type: 'receive', 
    amount: "1000", 
    timestamp: new Date(Date.now() - 345600000), 
    address: 'TJYeasTPa6cx4x6UZCaEXnGQiVCty59961',
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
