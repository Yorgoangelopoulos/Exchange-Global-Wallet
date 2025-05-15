import { useState, useEffect } from 'react';
import { CryptoCurrency, Balance, Transaction } from '@shared/schema';

// Initial wallet data - in a real app, this would come from a database or local storage
const initialCurrencies: CryptoCurrency[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', description: null, iconUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg', color: '#F7931A', isActive: true, sortOrder: 1 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', description: null, iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', color: '#627EEA', isActive: true, sortOrder: 2 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', description: null, iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.svg', color: '#00FFA3', isActive: true, sortOrder: 3 },
  { id: 'tron', name: 'TRON', symbol: 'TRX', description: null, iconUrl: 'https://cryptologos.cc/logos/tron-trx-logo.svg', color: '#FF0013', isActive: true, sortOrder: 4 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', description: null, iconUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.svg', color: '#0033AD', isActive: true, sortOrder: 5 },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', description: null, iconUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg', color: '#E84142', isActive: true, sortOrder: 6 },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', description: null, iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg', color: '#F3BA2F', isActive: true, sortOrder: 7 },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', description: null, iconUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg', color: '#23292F', isActive: true, sortOrder: 8 },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', description: null, iconUrl: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg', color: '#E6007A', isActive: true, sortOrder: 9 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', description: null, iconUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg', color: '#C2A633', isActive: true, sortOrder: 10 },
  { id: 'tether', name: 'Tether', symbol: 'USDT', description: null, iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.svg', color: '#50AF95', isActive: true, sortOrder: 11 }
];

const initialBalances: Balance[] = [
  { id: 1, walletId: 1, currencyId: 'bitcoin', amount: "0.15" },
  { id: 2, walletId: 1, currencyId: 'ethereum', amount: "2.5" },
  { id: 3, walletId: 1, currencyId: 'solana', amount: "35.75" },
  { id: 4, walletId: 1, currencyId: 'tron', amount: "1500" },
  { id: 5, walletId: 1, currencyId: 'avalanche', amount: "12.35" },
  { id: 6, walletId: 1, currencyId: 'cardano', amount: "450" },
  { id: 7, walletId: 1, currencyId: 'tether', amount: "250.50" },
  { id: 8, walletId: 1, currencyId: 'bnb', amount: "1.75" },
  { id: 9, walletId: 1, currencyId: 'xrp', amount: "500" },
  { id: 10, walletId: 1, currencyId: 'polkadot', amount: "25" },
  { id: 11, walletId: 1, currencyId: 'dogecoin', amount: "1200" }
];

const initialTransactions: Transaction[] = [
  { 
    id: 't1', 
    walletId: 1,
    currencyId: 'bitcoin', 
    type: 'receive', 
    amount: "0.05", 
    timestamp: new Date(Date.now() - 3600000), 
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    hash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    fee: "0.0001",
    confirmed: true
  },
  { 
    id: 't2', 
    walletId: 1,
    currencyId: 'ethereum', 
    type: 'send', 
    amount: "0.75", 
    timestamp: new Date(Date.now() - 86400000), 
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    hash: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    fee: "0.005",
    confirmed: true
  },
  { 
    id: 't3', 
    walletId: 1,
    currencyId: 'solana', 
    type: 'receive', 
    amount: "10.5", 
    timestamp: new Date(Date.now() - 172800000), 
    address: 'EbmJMY9GhQbVfEuPpKJMc9U4BhNoP6kLZE9mfNkhHAeZ',
    hash: null,
    fee: null,
    confirmed: true
  },
  { 
    id: 't4', 
    walletId: 1,
    currencyId: 'tron', 
    type: 'receive', 
    amount: "500", 
    timestamp: new Date(Date.now() - 259200000), 
    address: 'TJYeasTPa6cx4x6UZCaEXnGQiVCty59961',
    hash: null,
    fee: null,
    confirmed: true
  },
  { 
    id: 't5', 
    walletId: 1,
    currencyId: 'tron', 
    type: 'receive', 
    amount: "1000", 
    timestamp: new Date(Date.now() - 345600000), 
    address: 'TJYeasTPa6cx4x6UZCaEXnGQiVCty59961',
    hash: null,
    fee: null,
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
