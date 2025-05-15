import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for cryptocurrency data
  app.get('/api/cryptocurrencies', (_req, res) => {
    res.json({
      currencies: [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
        { id: 'solana', name: 'Solana', symbol: 'SOL' },
        { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX' },
        { id: 'monero', name: 'Monero', symbol: 'XMR' },
        { id: 'tether', name: 'Tether', symbol: 'USDT' },
        { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
        { id: 'ripple', name: 'XRP', symbol: 'XRP' }
      ]
    });
  });

  // API route for mock price data
  app.get('/api/prices', (_req, res) => {
    res.json({
      prices: [
        { id: 'bitcoin', price: 36289.42, change24h: 1.2 },
        { id: 'ethereum', price: 1925.37, change24h: -0.8 },
        { id: 'solana', price: 42.18, change24h: 3.5 },
        { id: 'avalanche', price: 21.75, change24h: 2.1 },
        { id: 'monero', price: 157.92, change24h: -1.3 },
        { id: 'tether', price: 1.00, change24h: 0.01 },
        { id: 'binancecoin', price: 215.64, change24h: 0.9 },
        { id: 'ripple', price: 0.62, change24h: -2.1 }
      ]
    });
  });

  // API route for wallet data
  app.get('/api/wallet', (_req, res) => {
    res.json({
      balances: [
        { currencyId: 'bitcoin', amount: 0.15 },
        { currencyId: 'ethereum', amount: 2.5 },
        { currencyId: 'solana', amount: 35.75 },
        { currencyId: 'avalanche', amount: 12.35 },
        { currencyId: 'monero', amount: 0.8 },
        { currencyId: 'tether', amount: 250.50 },
        { currencyId: 'binancecoin', amount: 1.75 },
        { currencyId: 'ripple', amount: 500 }
      ],
      favorites: ['bitcoin', 'ethereum']
    });
  });

  // API route for transaction history
  app.get('/api/transactions', (_req, res) => {
    const now = Date.now();
    res.json({
      transactions: [
        { 
          id: 't1', 
          currencyId: 'bitcoin', 
          type: 'receive', 
          amount: 0.05, 
          timestamp: new Date(now - 3600000).toISOString(), 
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          confirmed: true
        },
        { 
          id: 't2', 
          currencyId: 'ethereum', 
          type: 'send', 
          amount: 0.75, 
          timestamp: new Date(now - 86400000).toISOString(), 
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          confirmed: true
        },
        { 
          id: 't3', 
          currencyId: 'solana', 
          type: 'receive', 
          amount: 10.5, 
          timestamp: new Date(now - 172800000).toISOString(), 
          address: 'EbmJMY9GhQbVfEuPpKJMc9U4BhNoP6kLZE9mfNkhHAeZ',
          confirmed: true
        },
        { 
          id: 't4', 
          currencyId: 'ethereum', 
          type: 'receive', 
          amount: 1.25, 
          timestamp: new Date(now - 259200000).toISOString(), 
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          confirmed: true
        },
        { 
          id: 't5', 
          currencyId: 'bitcoin', 
          type: 'send', 
          amount: 0.02, 
          timestamp: new Date(now - 345600000).toISOString(), 
          address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
          confirmed: true
        }
      ]
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
