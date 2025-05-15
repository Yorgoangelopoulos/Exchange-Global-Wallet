import { pgTable, text, serial, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cryptocurrency table
export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: text("id").primaryKey(), // e.g. 'bitcoin'
  name: text("name").notNull(), // e.g. 'Bitcoin'
  symbol: text("symbol").notNull(), // e.g. 'BTC'
  description: text("description")
});

// Balances table
export const balances = pgTable("balances", {
  id: serial("id").primaryKey(),
  currencyId: text("currency_id").references(() => cryptocurrencies.id).notNull(),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull().default("0")
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  currencyId: text("currency_id").references(() => cryptocurrencies.id).notNull(),
  type: text("type").notNull(), // 'send' or 'receive'
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  address: text("address").notNull(),
  confirmed: boolean("confirmed").notNull().default(false)
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  currencyId: text("currency_id").references(() => cryptocurrencies.id).notNull()
});

// Create insert schemas
export const insertCryptoCurrencySchema = createInsertSchema(cryptocurrencies);
export const insertBalanceSchema = createInsertSchema(balances).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true });

// Types
export type CryptoCurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptoCurrency = z.infer<typeof insertCryptoCurrencySchema>;

export type Balance = typeof balances.$inferSelect;
export type InsertBalance = z.infer<typeof insertBalanceSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
