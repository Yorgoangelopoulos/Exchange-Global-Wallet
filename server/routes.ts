import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertWalletSchema,
  insertWalletAddressSchema,
  insertCryptoCurrencySchema 
} from "@shared/schema";
import * as bip39 from 'bip39';
import { generateWalletAddress } from '@/lib/wallet-service';

// Helper function to handle async route handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - Authentication
  app.post('/api/register', asyncHandler(async (req: Request, res: Response) => {
    const userData = insertUserSchema.parse(req.body);
    const existingUser = await storage.getUserByUsername(userData.username);
    
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    
    const user = await storage.createUser(userData);
    res.status(201).json({ id: user.id, username: user.username });
  }));
  
  app.post('/api/login', asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    res.json({ id: user.id, username: user.username });
  }));

  // API route for cryptocurrency data
  app.get('/api/cryptocurrencies', asyncHandler(async (_req: Request, res: Response) => {
    // Use stored cryptocurrencies if available, otherwise use defaults
    try {
      const storedCurrencies = await storage.getAllCryptocurrencies();
      
      if (storedCurrencies && storedCurrencies.length > 0) {
        return res.json({ currencies: storedCurrencies });
      }
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
    }
    
    // Default currencies if the database is empty
    res.json({
      currencies: [
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
      ]
    });
  }));

  // API Routes - Wallet Management
  app.post('/api/wallet/create', asyncHandler(async (req: Request, res: Response) => {
    const { name, userId } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ error: "Wallet name and user ID are required" });
    }
    
    // Generate a secure mnemonic
    const mnemonic = bip39.generateMnemonic(256);
    
    // Create wallet record
    const wallet = await storage.createWallet({
      name,
      userId,
      type: 'hd', // HD wallet with seed phrase
      mnemonic: mnemonic, // In production, this should be encrypted
      isActive: true
    });
    
    // Generate addresses for supported cryptocurrencies
    const currencies = ['bitcoin', 'ethereum', 'solana', 'tron', 'cardano'];
    const addresses = [];
    
    for (const currency of currencies) {
      try {
        const walletAddress = generateWalletAddress(mnemonic, currency, 0);
        
        // Store address in database
        await storage.createWalletAddress({
          walletId: wallet.id,
          currencyId: currency,
          address: walletAddress.address,
          path: walletAddress.path,
          privateKey: walletAddress.privateKey // In production, this should be encrypted
        });
        
        addresses.push({
          currency,
          address: walletAddress.address
        });
      } catch (error) {
        console.error(`Error generating address for ${currency}:`, error);
      }
    }
    
    res.status(201).json({
      wallet: {
        id: wallet.id,
        name: wallet.name,
        addresses
      },
      mnemonic // In production, you might not want to return this directly
    });
  }));
  
  app.post('/api/wallet/import', asyncHandler(async (req: Request, res: Response) => {
    const { name, userId, mnemonic } = req.body;
    
    if (!name || !userId || !mnemonic) {
      return res.status(400).json({ error: "Name, user ID, and mnemonic are required" });
    }
    
    // Validate mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      return res.status(400).json({ error: "Invalid mnemonic phrase" });
    }
    
    // Create wallet record
    const wallet = await storage.createWallet({
      name,
      userId,
      type: 'imported_mnemonic',
      mnemonic: mnemonic, // In production, this should be encrypted
      isActive: true
    });
    
    // Generate addresses for supported cryptocurrencies
    const currencies = ['bitcoin', 'ethereum', 'solana', 'tron', 'cardano'];
    const addresses = [];
    
    for (const currency of currencies) {
      try {
        const walletAddress = generateWalletAddress(mnemonic, currency, 0);
        
        // Store address in database
        await storage.createWalletAddress({
          walletId: wallet.id,
          currencyId: currency,
          address: walletAddress.address,
          path: walletAddress.path,
          privateKey: walletAddress.privateKey // In production, this should be encrypted
        });
        
        addresses.push({
          currency,
          address: walletAddress.address
        });
      } catch (error) {
        console.error(`Error generating address for ${currency}:`, error);
      }
    }
    
    res.status(201).json({
      wallet: {
        id: wallet.id,
        name: wallet.name,
        addresses
      }
    });
  }));
  
  app.get('/api/wallets/:userId', asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const wallets = await storage.getWalletsByUserId(userId);
    res.json({ wallets });
  }));
  
  app.get('/api/wallet/:walletId/addresses', asyncHandler(async (req: Request, res: Response) => {
    const walletId = parseInt(req.params.walletId);
    
    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }
    
    const addresses = await storage.getWalletAddresses(walletId);
    res.json({ addresses });
  }));

  // API Routes - Balances & Transactions (Temporary mock data)
  app.get('/api/wallet/:walletId/balances', asyncHandler(async (req: Request, res: Response) => {
    const walletId = parseInt(req.params.walletId);
    
    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }
    
    try {
      // Try to get balances from database
      const storedBalances = await storage.getBalancesByWallet(walletId);
      
      if (storedBalances && storedBalances.length > 0) {
        return res.json({ balances: storedBalances });
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
    
    // For now, return mock data if no stored balances
    res.json({
      balances: [
        { walletId, currencyId: 'bitcoin', amount: "0.15" },
        { walletId, currencyId: 'ethereum', amount: "2.5" },
        { walletId, currencyId: 'solana', amount: "35.75" },
        { walletId, currencyId: 'tron', amount: "1500" },
        { walletId, currencyId: 'avalanche', amount: "12.35" },
        { walletId, currencyId: 'cardano', amount: "450" },
        { walletId, currencyId: 'tether', amount: "250.50" },
        { walletId, currencyId: 'bnb', amount: "1.75" },
        { walletId, currencyId: 'xrp', amount: "500" },
        { walletId, currencyId: 'polkadot', amount: "25" },
        { walletId, currencyId: 'dogecoin', amount: "1200" }
      ]
    });
  }));

  app.get('/api/wallet/:walletId/transactions', asyncHandler(async (req: Request, res: Response) => {
    const walletId = parseInt(req.params.walletId);
    
    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }
    
    try {
      // Try to get transactions from database
      const storedTransactions = await storage.getTransactionsByWallet(walletId);
      
      if (storedTransactions && storedTransactions.length > 0) {
        return res.json({ transactions: storedTransactions });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    
    // For now, return mock data if no stored transactions
    const now = Date.now();
    res.json({
      transactions: [
        { 
          id: 't1', 
          walletId,
          currencyId: 'bitcoin', 
          type: 'receive', 
          amount: "0.05", 
          timestamp: new Date(now - 3600000), 
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          hash: null,
          fee: null,
          confirmed: true
        },
        { 
          id: 't2', 
          walletId,
          currencyId: 'ethereum', 
          type: 'send', 
          amount: "0.75", 
          timestamp: new Date(now - 86400000), 
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          hash: null,
          fee: null,
          confirmed: true
        },
        { 
          id: 't3', 
          walletId,
          currencyId: 'solana', 
          type: 'receive', 
          amount: "10.5", 
          timestamp: new Date(now - 172800000), 
          address: 'EbmJMY9GhQbVfEuPpKJMc9U4BhNoP6kLZE9mfNkhHAeZ',
          hash: null,
          fee: null,
          confirmed: true
        },
        { 
          id: 't4', 
          walletId,
          currencyId: 'tron', 
          type: 'receive', 
          amount: "500", 
          timestamp: new Date(now - 259200000), 
          address: 'TJYeasTPa6cx4x6UZCaEXnGQiVCty59961',
          hash: null,
          fee: null,
          confirmed: true
        },
        { 
          id: 't5', 
          walletId,
          currencyId: 'tron', 
          type: 'receive', 
          amount: "1000", 
          timestamp: new Date(now - 345600000), 
          address: 'TJYeasTPa6cx4x6UZCaEXnGQiVCty59961',
          hash: null,
          fee: null,
          confirmed: true
        }
      ]
    });
  }));

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: err.errors 
      });
    }
    
    res.status(500).json({ error: "Internal server error" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
