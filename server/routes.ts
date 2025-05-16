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
import { ethers } from 'ethers';

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
    const { name, mnemonic, type, addresses } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Wallet name is required" });
    }
    
    // Use provided mnemonic or generate a new one
    const seedPhrase = mnemonic || bip39.generateMnemonic(256);
    
    // Get user ID from authenticated session (simplified for now)
    const userId = 1; // In production, this would come from the session
    
    // Create wallet record
    const wallet = await storage.createWallet({
      name,
      userId,
      type: type || 'hd', // HD wallet with seed phrase
      mnemonic: seedPhrase, // In production, this should be encrypted
      isActive: true
    });
    
    const storedAddressList = [];
    
    // Use provided addresses or generate them
    if (addresses && Array.isArray(addresses)) {
      // Use the addresses provided from the frontend
      for (const addr of addresses) {
        try {
          await storage.createWalletAddress({
            walletId: wallet.id,
            currencyId: addr.currency,
            address: addr.address,
            path: addr.path,
            privateKey: "" // We don't store private keys directly, just the derivation path
          });
          
          storedAddressList.push({
            currency: addr.currency,
            address: addr.address
          });
        } catch (error) {
          console.error(`Error storing address for ${addr.currency}:`, error);
        }
      }
    } else {
      // Generate addresses for supported cryptocurrencies
      const currencies = ['bitcoin', 'ethereum', 'solana', 'tron', 'cardano'];
      
      for (const currency of currencies) {
        try {
          const walletAddress = generateWalletAddress(seedPhrase, currency.toLowerCase(), 0);
          
          // Store address in database
          await storage.createWalletAddress({
            walletId: wallet.id,
            currencyId: currency,
            address: walletAddress.address,
            path: walletAddress.path,
            privateKey: "" // Don't store actual private keys, use the seed phrase + path instead
          });
          
          storedAddressList.push({
            currency,
            address: walletAddress.address
          });
        } catch (error) {
          console.error(`Error generating address for ${currency}:`, error);
        }
      }
    }
    
    res.status(201).json({
      wallet: {
        id: wallet.id,
        name: wallet.name,
        addresses: storedAddressList
      },
      mnemonic // In production, you might not want to return this directly
    });
  }));
  
  app.post('/api/wallet/import', asyncHandler(async (req: Request, res: Response) => {
    const { name, importMethod, credentials, addresses } = req.body;
    
    if (!name || !importMethod || !credentials) {
      return res.status(400).json({ error: "Name, import method, and credentials are required" });
    }
    
    // Get user ID from authenticated session (simplified for now)
    const userId = 1; // In production, this would come from the session
    
    if (importMethod === 'mnemonic') {
      // Validate mnemonic
      if (!bip39.validateMnemonic(credentials)) {
        return res.status(400).json({ error: "Invalid mnemonic phrase" });
      }
    }
    
    // Create wallet record
    const wallet = await storage.createWallet({
      name,
      userId,
      type: importMethod === 'mnemonic' ? 'imported_mnemonic' : 'imported_privatekey',
      mnemonic: importMethod === 'mnemonic' ? credentials : '',
      privateKey: importMethod === 'privateKey' ? credentials : '',
      isActive: true
    });
    
    const storedAddresses = [];
    
    // If addresses are provided, use them
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        try {
          await storage.createWalletAddress({
            walletId: wallet.id,
            currencyId: addr.currency,
            address: addr.address,
            path: addr.path || '',
            privateKey: '' // We don't store private keys directly
          });
          
          storedAddresses.push({
            currency: addr.currency,
            address: addr.address
          });
        } catch (error) {
          console.error(`Error storing address for ${addr.currency}:`, error);
        }
      }
    } else if (importMethod === 'mnemonic') {
      // Generate addresses for supported cryptocurrencies from mnemonic
      // BSC eklenmiş güncel liste
      const currencies = ['ethereum', 'solana', 'tron', 'cardano', 'bsc'];
      
      for (const currency of currencies) {
        try {
          const walletAddress = generateWalletAddress(credentials, currency.toLowerCase(), 0);
          
          // Store address in database
          await storage.createWalletAddress({
            walletId: wallet.id,
            currencyId: currency,
            address: walletAddress.address,
            path: walletAddress.path,
            privateKey: '' // Don't store actual private keys
          });
          
          storedAddresses.push({
            currency,
            address: walletAddress.address
          });
        } catch (error) {
          console.error(`Error generating address for ${currency}:`, error);
        }
      }
    } else {
      // Handle private key import - derive address from private key
      try {
        // For Ethereum private keys
        let currency = 'ETH';
        let address = '';
        let privateKeyToUse = credentials;
        
        // If the private key doesn't start with 0x, add it
        if (!privateKeyToUse.startsWith('0x')) {
          privateKeyToUse = '0x' + privateKeyToUse;
        }
        
        try {
          // Try to create an Ethereum wallet from this key
          const ethWallet = new ethers.Wallet(privateKeyToUse);
          address = ethWallet.address;
          
          await storage.createWalletAddress({
            walletId: wallet.id,
            currencyId: 'ETH',
            address: address,
            path: '',
            privateKey: ''
          });
          
          storedAddresses.push({
            currency: 'ETH',
            address
          });
        } catch (error) {
          console.error('Error creating ETH wallet from private key:', error);
        }
      } catch (error) {
        console.error('Error storing private key address:', error);
      }
    }
    
    res.status(201).json({
      wallet: {
        id: wallet.id,
        name: wallet.name,
        addresses: storedAddresses
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
  
  // Yeni endpoint: Cüzdan için kripto para adresi oluştur
  app.post('/api/wallet/:walletId/create-address', asyncHandler(async (req: Request, res: Response) => {
    const walletId = parseInt(req.params.walletId);
    const { currencyId, mnemonic } = req.body;
    
    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }
    
    if (!currencyId) {
      return res.status(400).json({ error: "Currency ID is required" });
    }
    
    if (!mnemonic) {
      return res.status(400).json({ error: "Mnemonic phrase is required" });
    }
    
    try {
      // Kripto para adresi oluştur
      const walletAddress = generateWalletAddress(mnemonic, currencyId, 0);
      
      // Adresi veritabanına kaydet
      const address = await storage.createWalletAddress({
        walletId,
        currencyId,
        address: walletAddress.address,
        path: walletAddress.path,
        privateKey: '' // Özel anahtarları saklamıyoruz
      });
      
      res.status(201).json({ 
        address,
        message: `${currencyId} adresi başarıyla oluşturuldu`
      });
    } catch (error) {
      console.error(`Error creating address for ${currencyId}:`, error);
      res.status(500).json({ error: `Failed to create address for ${currencyId}` });
    }
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
  
  // API Route - Update a wallet
  app.patch('/api/wallet/:walletId', asyncHandler(async (req: Request, res: Response) => {
    const walletId = parseInt(req.params.walletId);
    
    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }
    
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Name is required and must be a non-empty string" });
    }
    
    try {
      // Update the wallet
      const updatedWallet = await storage.updateWallet(walletId, { name: name.trim() });
      
      if (updatedWallet) {
        res.json({ 
          success: true, 
          wallet: updatedWallet 
        });
      } else {
        res.status(404).json({ error: "Wallet not found" });
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({ error: "Failed to update wallet", message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }));

  // API Route - Delete a wallet
  app.delete('/api/wallet/:walletId', asyncHandler(async (req: Request, res: Response) => {
    const walletId = parseInt(req.params.walletId);
    
    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }
    
    // Check if the user has more than one wallet before deleting
    const userId = 1; // In production, this would come from the session
    const userWallets = await storage.getWalletsByUserId(userId);
    
    if (userWallets.length <= 1) {
      return res.status(400).json({ 
        error: "Cannot delete the only wallet", 
        message: "You must have at least one wallet" 
      });
    }
    
    // Attempt to delete the wallet
    const success = await storage.deleteWallet(walletId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Wallet not found or could not be deleted" });
    }
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
