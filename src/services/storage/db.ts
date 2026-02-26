// src/services/storage/db.ts
import Dexie from "dexie";
import type { Table } from "dexie";

// Define types
export interface User {
  id?: string;
  phoneNumber: string;
  businessName: string;
  ownerName: string;
  businessType: "retail" | "food" | "boda" | "other";
  location?: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
  pinHash?: string; // For local auth
}

export interface UserPreferences {
  currency: "KES";
  language: "en" | "sw";
  lowStockThreshold: number;
  creditAlertDays: number;
  darkMode: boolean;
}

export interface Transaction {
  id?: string;
  userId: string; // Link to user
  receiptNumber: string;
  completionTime: Date;
  amount: number;
  fee: number;
  totalImpact: number;
  balance: number;
  category: string;
  counterparty: string;
  counterpartyPhone?: string;
  counterpartyAvatar?: string;
  description: string;
  type: "personal" | "business";
  isFlagged: boolean;
  notes?: string;
  syncedAt?: Date;
}

export interface Customer {
  id?: string;
  userId: string; // Link to user
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  avatarColor?: string;
  creditBalance: number;
  transactionCount: number;
  totalSpent: number;
  paymentHistory: Payment[];
  lastTransaction: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id?: string;
  customerId: string;
  amount: number;
  date: Date;
  method: "cash" | "mpesa";
  transactionId?: string;
}

export interface Product {
  id?: string;
  userId: string; // Link to user
  name: string;
  emoji: string;
  price: number;
  stock: number;
  lowStockAlert: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id?: string;
  userId: string; // Link to user
  items: SaleItem[];
  total: number;
  paymentMethod: "cash" | "mpesa" | "credit";
  customerId?: string;
  customerName?: string;
  date: Date;
  receiptNumber: string;
  syncedAt?: Date;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Quote {
  id?: string;
  userId: string; // Link to user
  quoteNumber: number;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: QuoteItem[];
  subtotal: number;
  vat: number;
  total: number;
  validUntil: Date;
  status: "draft" | "sent" | "accepted" | "expired";
  createdAt: Date;
  notes?: string;
}

export interface QuoteItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOU {
  id?: string;
  userId: string; // Link to user
  customerName: string;
  customerId?: string;
  amount: number;
  dueDate: Date;
  notes?: string;
  isPaid: boolean;
  paidAt?: Date;
  createdAt: Date;
}

export interface SyncQueue {
  id?: number;
  userId: string; // Link to user
  action: "create" | "update" | "delete";
  table: string;
  recordId: string;
  data: any;
  status: "pending" | "processing" | "completed" | "failed";
  retryCount: number;
  lastAttempt?: Date;
  createdAt: Date;
}

// Database class
export class PesaLocalDB extends Dexie {
  users!: Table<User, string>;
  transactions!: Table<Transaction, string>;
  customers!: Table<Customer, string>;
  products!: Table<Product, string>;
  sales!: Table<Sale, string>;
  quotes!: Table<Quote, string>;
  ious!: Table<IOU, string>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super("PesaLocalDB");

    // Version 1: Initial schema
    this.version(1).stores({
      transactions:
        "++id, receiptNumber, completionTime, amount, category, type, isFlagged, syncedAt",
      customers: "++id, name, phone, creditBalance, lastTransaction",
      products: "++id, name, category, price, stock",
      sales:
        "++id, date, total, paymentMethod, customerId, receiptNumber, syncedAt",
      quotes:
        "++id, quoteNumber, customerId, customerName, status, validUntil, createdAt",
      ious: "++id, customerName, dueDate, isPaid, createdAt",
      syncQueue: "++id, action, table, recordId, status, retryCount, createdAt",
    });

    // Version 2: Add user support
    this.version(2)
      .stores({
        users:
          "++id, phoneNumber, businessName, ownerName, createdAt, lastLogin",
      })
      .upgrade((tx) => {
        // Migration: Add userId to all existing records
        // This will be handled by the app logic
      });

    // Version 3: Add userId indexes to all tables
    this.version(3).stores({
      transactions:
        "++id, userId, [userId+type], [userId+completionTime], receiptNumber, category, isFlagged",
      customers:
        "++id, userId, [userId+name], [userId+creditBalance], lastTransaction",
      products:
        "++id, userId, [userId+name], [userId+category], [userId+stock]",
      sales: "++id, userId, [userId+date], [userId+customerId], receiptNumber",
      quotes: "++id, userId, [userId+quoteNumber], [userId+status], validUntil",
      ious: "++id, userId, [userId+customerName], [userId+dueDate], [userId+isPaid]",
      syncQueue: "++id, userId, [userId+status], [userId+action]",
      users: "++id, phoneNumber, businessName, ownerName, createdAt, lastLogin",
    });
  }
}

// Create and export a single instance
export const db = new PesaLocalDB();

// Helper functions for common operations
export const storage = {
  // ===== USER MANAGEMENT =====
  async createUser(user: Omit<User, "id" | "createdAt">) {
    const id = crypto.randomUUID();
    await db.users.add({
      ...user,
      id,
      createdAt: new Date(),
      preferences: user.preferences || {
        currency: "KES",
        language: "en",
        lowStockThreshold: 5,
        creditAlertDays: 3,
        darkMode: true,
      },
    });
    return id;
  },

  async getUserByPhone(phoneNumber: string) {
    return await db.users.where("phoneNumber").equals(phoneNumber).first();
  },

  async getUserById(id: string) {
    return await db.users.get(id);
  },

  async updateUserLastLogin(id: string) {
    await db.users.update(id, { lastLogin: new Date() });
  },

  // ===== TRANSACTIONS =====
  async addTransaction(transaction: Omit<Transaction, "id">) {
    return await db.transactions.add({
      ...transaction,
      id: crypto.randomUUID(),
    });
  },

  async getTransactionsByUser(
    userId: string,
    type?: "personal" | "business",
    limit = 50,
  ) {
    let query = db.transactions.where("userId").equals(userId);
    if (type) {
      query = query.and((tx) => tx.type === type) as any;
    }
    return await query
      .reverse()
      .sortBy("completionTime")
      .then((results) => results.slice(0, limit));
  },

  async getRecentTransactions(userId: string, limit = 10) {
    return await db.transactions
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("completionTime")
      .then((results) => results.slice(0, limit));
  },

  // ===== CUSTOMERS =====
  async addCustomer(
    customer: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ) {
    const id = crypto.randomUUID();
    await db.customers.add({
      ...customer,
      id,
      transactionCount: 0,
      totalSpent: 0,
      creditBalance: 0,
      paymentHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  },

  async getCustomersByUser(userId: string) {
    return await db.customers.where("userId").equals(userId).toArray();
  },

  async getCustomersWithCredit(userId: string) {
    return await db.customers
      .where("userId")
      .equals(userId)
      .and((c) => c.creditBalance > 0)
      .toArray();
  },

  async findOrCreateCustomer(userId: string, name: string, phone?: string) {
    // Try to find existing customer
    let customer = await db.customers
      .where("userId")
      .equals(userId)
      .and((c) => c.name.toLowerCase() === name.toLowerCase())
      .first();

    if (!customer) {
      // Create new customer
      const id = crypto.randomUUID();
      const avatarColors = [
        "bg-emerald",
        "bg-amber",
        "bg-rust",
        "bg-mint",
        "bg-blue-500",
      ];
      const colorIndex = name.length % avatarColors.length;

      await db.customers.add({
        id,
        userId,
        name,
        phone,
        avatar: name.charAt(0).toUpperCase(),
        avatarColor: avatarColors[colorIndex],
        creditBalance: 0,
        transactionCount: 0,
        totalSpent: 0,
        paymentHistory: [],
        lastTransaction: new Date(),
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      customer = await db.customers.get(id);
    }

    return customer;
  },

  async updateCustomerCredit(customerId: string, amount: number) {
    const customer = await db.customers.get(customerId);
    if (customer) {
      const newBalance = (customer.creditBalance || 0) + amount;
      await db.customers.update(customerId, {
        creditBalance: newBalance,
        lastTransaction: new Date(),
        updatedAt: new Date(),
        transactionCount: (customer.transactionCount || 0) + 1,
        totalSpent: (customer.totalSpent || 0) + Math.abs(amount),
      });
    }
  },

  // ===== PRODUCTS =====
  async addProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    return await db.products.add({
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async getProductsByUser(userId: string) {
    return await db.products.where("userId").equals(userId).toArray();
  },

  async getLowStockProducts(userId: string) {
    return await db.products
      .where("userId")
      .equals(userId)
      .filter((p) => p.stock <= p.lowStockAlert)
      .toArray();
  },

  async updateStock(productId: string, quantity: number) {
    const product = await db.products.get(productId);
    if (product) {
      await db.products.update(productId, {
        stock: Math.max(0, product.stock - quantity),
        updatedAt: new Date(),
      });
    }
  },

  // ===== SALES =====
  async addSale(sale: Omit<Sale, "id">) {
    const id = crypto.randomUUID();
    await db.sales.add({
      ...sale,
      id,
    });

    // Update stock for each item
    for (const item of sale.items) {
      await this.updateStock(item.productId, item.quantity);
    }

    // If credit sale, update customer credit
    if (sale.paymentMethod === "credit" && sale.customerId) {
      await this.updateCustomerCredit(sale.customerId, -sale.total);
    }

    // Add to sync queue
    await db.syncQueue.add({
      action: "create",
      table: "sales",
      recordId: id,
      data: sale,
      status: "pending",
      retryCount: 0,
      createdAt: new Date(),
      userId: sale.userId,
    });

    return id;
  },

  async getSalesByUser(userId: string, limit = 20) {
    return await db.sales
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("date")
      .then((results) => results.slice(0, limit));
  },

  // ===== QUOTES =====
  async addQuote(quote: Omit<Quote, "id">) {
    return await db.quotes.add({
      ...quote,
      id: crypto.randomUUID(),
    });
  },

  async getQuotesByUser(userId: string, status?: Quote["status"]) {
    let query = db.quotes.where("userId").equals(userId);
    if (status) {
      query = query.and((q) => q.status === status) as any;
    }
    return await query.reverse().sortBy("createdAt");
  },

  // ===== IOUS =====
  async addIOU(iou: Omit<IOU, "id" | "createdAt">) {
    return await db.ious.add({
      ...iou,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  },

  async getIOUsByUser(userId: string) {
    return await db.ious.where("userId").equals(userId).toArray();
  },

  async getOutstandingIOUs(userId: string) {
    return await db.ious
      .where("userId")
      .equals(userId)
      .and((iou) => !iou.isPaid && new Date(iou.dueDate) > new Date())
      .toArray();
  },

  async getOverdueIOUs(userId: string) {
    return await db.ious
      .where("userId")
      .equals(userId)
      .and((iou) => !iou.isPaid && new Date(iou.dueDate) < new Date())
      .toArray();
  },

  async markIOUAsPaid(iouId: string) {
    await db.ious.update(iouId, {
      isPaid: true,
      paidAt: new Date(),
    });
  },

  // ===== SYNC QUEUE =====
  async addToSyncQueue(
    item: Omit<SyncQueue, "id" | "createdAt" | "retryCount">,
  ) {
    return await db.syncQueue.add({
      ...item,
      retryCount: 0,
      createdAt: new Date(),
    });
  },

  async getPendingSyncItems(userId: string) {
    return await db.syncQueue
      .where("userId")
      .equals(userId)
      .and((item) => item.status === "pending")
      .toArray();
  },

  // ===== DATA MANAGEMENT =====
  async getUserData(userId: string) {
    const [user, transactions, customers, products, sales, quotes, ious] =
      await Promise.all([
        db.users.get(userId),
        db.transactions.where("userId").equals(userId).toArray(),
        db.customers.where("userId").equals(userId).toArray(),
        db.products.where("userId").equals(userId).toArray(),
        db.sales.where("userId").equals(userId).toArray(),
        db.quotes.where("userId").equals(userId).toArray(),
        db.ious.where("userId").equals(userId).toArray(),
      ]);

    return {
      user,
      transactions,
      customers,
      products,
      sales,
      quotes,
      ious,
    };
  },

  // Clear all data for a specific user (Incinerator)
  async incinerateUserData(userId: string) {
    await db.transactions.where("userId").equals(userId).delete();
    await db.customers.where("userId").equals(userId).delete();
    await db.products.where("userId").equals(userId).delete();
    await db.sales.where("userId").equals(userId).delete();
    await db.quotes.where("userId").equals(userId).delete();
    await db.ious.where("userId").equals(userId).delete();
    await db.syncQueue.where("userId").equals(userId).delete();
  },

  // Clear ALL data (Dangerous!)
  async incinerateAll() {
    await db.users.clear();
    await db.transactions.clear();
    await db.customers.clear();
    await db.products.clear();
    await db.sales.clear();
    await db.quotes.clear();
    await db.ious.clear();
    await db.syncQueue.clear();
  },
};

// Helper function to generate avatar color
export const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-emerald",
    "bg-amber",
    "bg-rust",
    "bg-mint",
    "bg-blue-500",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

// Helper function to extract customer name from transaction
export const extractCustomerName = (description: string): string | null => {
  const patterns = [
    /Sent to (.+?)(?:\s+on|\s+at|$)/i,
    /Received from (.+?)(?:\s+on|\s+at|$)/i,
    /Paid to (.+?)(?:\s+on|\s+at|$)/i,
    /From: (.+?)(?:\s+on|\s+at|$)/i,
    /To: (.+?)(?:\s+on|\s+at|$)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
};
