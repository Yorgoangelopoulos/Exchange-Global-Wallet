import { pgTable, text, serial, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auth table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Cryptocurrency table
export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: text("id").primaryKey(), // e.g. 'bitcoin'
  name: text("name").notNull(), // e.g. 'Bitcoin'
  symbol: text("symbol").notNull(), // e.g. 'BTC'
  description: text("description")
});

// Wallets table to store created/imported wallets
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'hd', 'imported_mnemonic', 'imported_privatekey'
  mnemonic: text("mnemonic"), // Encrypted mnemonic phrase (if type is 'hd' or 'imported_mnemonic')
  privateKey: text("private_key"), // Encrypted private key (if type is 'imported_privatekey')
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true)
});

// Wallet addresses table to store generated addresses for each currency
export const walletAddresses = pgTable("wallet_addresses", {
  id: serial("id").primaryKey(),
  walletId: serial("wallet_id").references(() => wallets.id).notNull(),
  currencyId: text("currency_id").references(() => cryptocurrencies.id).notNull(),
  address: text("address").notNull(),
  path: text("path").notNull(), // Derivation path
  privateKey: text("private_key"), // Encrypted private key (optional)
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Balances table
export const balances = pgTable("balances", {
  id: serial("id").primaryKey(),
  walletId: serial("wallet_id").references(() => wallets.id).notNull(),
  currencyId: text("currency_id").references(() => cryptocurrencies.id).notNull(),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull().default("0")
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  walletId: serial("wallet_id").references(() => wallets.id).notNull(),
  currencyId: text("currency_id").references(() => cryptocurrencies.id).notNull(),
  type: text("type").notNull(), // 'send' or 'receive'
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  address: text("address").notNull(),
  hash: text("hash"), // Transaction hash on blockchain
  fee: numeric("fee", { precision: 18, scale: 8 }), // Transaction fee
  confirmed: boolean("confirmed").notNull().default(false)
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  currencyId: text("currency_id").references(() => cryptocurrencies.id).notNull()
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCryptoCurrencySchema = createInsertSchema(cryptocurrencies);
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true });
export const insertWalletAddressSchema = createInsertSchema(walletAddresses).omit({ id: true, createdAt: true });
export const insertBalanceSchema = createInsertSchema(balances).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CryptoCurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptoCurrency = z.infer<typeof insertCryptoCurrencySchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type WalletAddress = typeof walletAddresses.$inferSelect;
export type InsertWalletAddress = z.infer<typeof insertWalletAddressSchema>;

export type Balance = typeof balances.$inferSelect;
export type InsertBalance = z.infer<typeof insertBalanceSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
