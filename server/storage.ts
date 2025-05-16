import { 
  users, type User, type InsertUser,
  wallets, type Wallet, type InsertWallet,
  walletAddresses, type WalletAddress, type InsertWalletAddress,
  cryptocurrencies, type CryptoCurrency, type InsertCryptoCurrency,
  balances, type Balance, type InsertBalance,
  transactions, type Transaction, type InsertTransaction,
  favorites, type Favorite, type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  updateWallet(id: number, data: Partial<InsertWallet>): Promise<Wallet | undefined>;
  deleteWallet(id: number): Promise<boolean>;
  
  // Wallet address operations
  createWalletAddress(address: InsertWalletAddress): Promise<WalletAddress>;
  getWalletAddresses(walletId: number): Promise<WalletAddress[]>;
  getWalletAddressByCurrency(walletId: number, currencyId: string): Promise<WalletAddress | undefined>;
  
  // Cryptocurrency operations
  getAllCryptocurrencies(): Promise<CryptoCurrency[]>;
  getCryptocurrency(id: string): Promise<CryptoCurrency | undefined>;
  createCryptocurrency(currency: InsertCryptoCurrency): Promise<CryptoCurrency>;
  
  // Balance operations
  getBalancesByWallet(walletId: number): Promise<Balance[]>;
  updateBalance(walletId: number, currencyId: string, amount: string): Promise<Balance>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByWallet(walletId: number): Promise<Transaction[]>;
  
  // Favorite operations
  toggleFavorite(userId: number, currencyId: string): Promise<boolean>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Wallet operations
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db
      .insert(wallets)
      .values(wallet)
      .returning();
    return newWallet;
  }
  
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }
  
  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.userId, userId));
  }
  
  async updateWallet(id: number, data: Partial<InsertWallet>): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set(data)
      .where(eq(wallets.id, id))
      .returning();
    return updated;
  }
  
  async deleteWallet(id: number): Promise<boolean> {
    try {
      // İlgili cüzdana ait tüm alt kayıtları silmemiz gerekiyor
      // 1. Önce bakiyeleri sil
      await db.delete(balances).where(eq(balances.walletId, id));
      
      // 2. Cüzdana ait işlemleri sil
      await db.delete(transactions).where(eq(transactions.walletId, id));
      
      // 3. Cüzdana ait adresleri sil
      await db.delete(walletAddresses).where(eq(walletAddresses.walletId, id));
      
      // 4. Son olarak cüzdanın kendisini sil
      const result = await db.delete(wallets).where(eq(wallets.id, id));
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleting wallet:", error);
      throw error;
    }
  }
  
  // Wallet address operations
  async createWalletAddress(address: InsertWalletAddress): Promise<WalletAddress> {
    const [newAddress] = await db
      .insert(walletAddresses)
      .values(address)
      .returning();
    return newAddress;
  }
  
  async getWalletAddresses(walletId: number): Promise<WalletAddress[]> {
    return db.select().from(walletAddresses).where(eq(walletAddresses.walletId, walletId));
  }
  
  async getWalletAddressByCurrency(walletId: number, currencyId: string): Promise<WalletAddress | undefined> {
    const [address] = await db.select().from(walletAddresses).where(
      and(
        eq(walletAddresses.walletId, walletId),
        eq(walletAddresses.currencyId, currencyId)
      )
    );
    return address;
  }
  
  // Cryptocurrency operations
  async getAllCryptocurrencies(): Promise<CryptoCurrency[]> {
    return db.select().from(cryptocurrencies);
  }
  
  async getCryptocurrency(id: string): Promise<CryptoCurrency | undefined> {
    const [currency] = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.id, id));
    return currency;
  }
  
  async createCryptocurrency(currency: InsertCryptoCurrency): Promise<CryptoCurrency> {
    const [newCurrency] = await db
      .insert(cryptocurrencies)
      .values(currency)
      .returning();
    return newCurrency;
  }
  
  // Balance operations
  async getBalancesByWallet(walletId: number): Promise<Balance[]> {
    return db.select().from(balances).where(eq(balances.walletId, walletId));
  }
  
  async updateBalance(walletId: number, currencyId: string, amount: string): Promise<Balance> {
    // Check if balance exists
    const [existingBalance] = await db.select().from(balances).where(
      and(
        eq(balances.walletId, walletId),
        eq(balances.currencyId, currencyId)
      )
    );
    
    if (existingBalance) {
      // Update existing balance
      const [updated] = await db
        .update(balances)
        .set({ amount })
        .where(
          and(
            eq(balances.walletId, walletId),
            eq(balances.currencyId, currencyId)
          )
        )
        .returning();
      return updated;
    } else {
      // Create new balance
      const [newBalance] = await db
        .insert(balances)
        .values({ walletId, currencyId, amount })
        .returning();
      return newBalance;
    }
  }
  
  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }
  
  async getTransactionsByWallet(walletId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.walletId, walletId));
  }
  
  // Favorite operations
  async toggleFavorite(userId: number, currencyId: string): Promise<boolean> {
    // Check if favorite exists
    const [existingFavorite] = await db.select().from(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.currencyId, currencyId)
      )
    );
    
    if (existingFavorite) {
      // Remove favorite
      const result = await db.delete(favorites).where(eq(favorites.id, existingFavorite.id));
      return false; // No longer a favorite
    } else {
      // Add favorite
      await db
        .insert(favorites)
        .values({ userId, currencyId });
      return true; // Now a favorite
    }
  }
  
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }
}

// Use the database version of storage
export const storage = new DatabaseStorage();
