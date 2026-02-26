// src/services/storage/db.ts
import Dexie from "dexie";
import type { Table } from "dexie";

// ===== ENHANCED TYPE DEFINITIONS =====

export type ProductCategory =
  | "vegetables"
  | "fruits"
  | "grains"
  | "tubers"
  | "leafy_greens"
  | "herbs"
  | "legumes"
  | "dairy"
  | "beverages"
  | "snacks"
  | "household"
  | "other";

export type VegetableType =
  | "tomatoes"
  | "onions"
  | "carrots"
  | "cabbage"
  | "kale"
  | "spinach"
  | "capsicum"
  | "cucumber"
  | "eggplant"
  | "green_beans"
  | "peas"
  | "other";

export type FruitType =
  | "bananas"
  | "oranges"
  | "apples"
  | "mangoes"
  | "avocados"
  | "pineapple"
  | "watermelon"
  | "passion"
  | "lemons"
  | "other";

export type GrainType =
  | "maize"
  | "rice"
  | "beans"
  | "wheat"
  | "millet"
  | "sorghum"
  | "green_grams"
  | "cowpeas"
  | "other";

export type PriceUnit = "piece" | "kg" | "bunch" | "packet" | "dozen" | "litre";

// ===== USER MANAGEMENT =====

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
  defaultPaymentMethod?: "cash" | "mpesa" | "credit";
  businessPhone?: string;
  businessEmail?: string;
  taxRate: number; // Default 16% VAT
}

// ===== ENHANCED PRODUCT MANAGEMENT =====

export interface Product {
  id?: string;
  userId: string; // Link to user
  name: string;
  emoji: string;
  category: ProductCategory;
  subCategory?: VegetableType | FruitType | GrainType | string;
  price: number;
  pricePerUnit: PriceUnit;
  stock: number;
  lowStockAlert: number;
  supplier?: string;
  barcode?: string;
  expiryDate?: Date;
  isPerishable: boolean;
  requiresCooling?: boolean;
  description?: string;
  imageUrl?: string;
  taxRate?: number; // Override default tax rate if needed
  createdAt: Date;
  updatedAt: Date;
}

// ===== ENHANCED SALE MANAGEMENT =====

export interface Sale {
  id?: string;
  userId: string; // Link to user
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "mpesa" | "credit" | "combined";
  mpesaDetails?: {
    transactionCode: string;
    phoneNumber: string;
    payerName?: string;
    paymentType: "paybill" | "till" | "pochi" | "send_money";
    businessNumber?: string;
    accountNumber?: string;
    transactionDate?: Date;
  };
  cashAmount?: number;
  mpesaAmount?: number;
  creditAmount?: number;
  customerId?: string;
  customerName?: string;
  date: Date;
  receiptNumber: string;
  syncedAt?: Date;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  tax?: number;
  discount?: number;
}

// ===== M-PESA TRANSACTION TRACKING =====

export interface MpesaTransaction {
  id?: string;
  userId: string;
  transactionCode: string;
  completionTime: Date;
  amount: number;
  phoneNumber: string;
  payerName?: string;
  paymentType: "paybill" | "till" | "pochi" | "send_money" | "receive";
  businessNumber?: string;
  accountNumber?: string;
  receiptNumber?: string;
  saleId?: string; // Link to sale if applicable
  isReconciled: boolean;
  notes?: string;
  rawData?: string; // Store raw M-PESA message for reference
}

// ===== EXISTING INTERFACES (Enhanced) =====

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
  creditLimit?: number;
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
  receiptNumber?: string;
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
  status: "draft" | "sent" | "accepted" | "expired" | "converted";
  createdAt: Date;
  notes?: string;
  convertedToSaleId?: string;
}

export interface QuoteItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  productId?: string;
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
  reminderSent?: boolean;
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

// ===== DATABASE CLASS =====

export class PesaLocalDB extends Dexie {
  users!: Table<User, string>;
  transactions!: Table<Transaction, string>;
  customers!: Table<Customer, string>;
  products!: Table<Product, string>;
  sales!: Table<Sale, string>;
  mpesaTransactions!: Table<MpesaTransaction, string>;
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
    this.version(2).stores({
      users: "++id, phoneNumber, businessName, ownerName, createdAt, lastLogin",
    });

    // Version 3: Add userId indexes to all tables
    this.version(3).stores({
      transactions:
        "++id, userId, [userId+type], [userId+completionTime], receiptNumber, category, isFlagged",
      customers:
        "++id, userId, [userId+name], [userId+creditBalance], lastTransaction",
      products:
        "++id, userId, [userId+name], [userId+category], [userId+stock]",
      sales:
        "++id, userId, [userId+date], [userId+customerId], receiptNumber, paymentMethod",
      quotes: "++id, userId, [userId+quoteNumber], [userId+status], validUntil",
      ious: "++id, userId, [userId+customerName], [userId+dueDate], [userId+isPaid]",
      syncQueue: "++id, userId, [userId+status], [userId+action]",
      users: "++id, phoneNumber, businessName, ownerName, createdAt, lastLogin",
    });

    // Version 4: Add enhanced product fields and M-PESA tracking
    this.version(4)
      .stores({
        products:
          "++id, userId, [userId+name], [userId+category], [userId+stock], [userId+isPerishable], [userId+supplier]",
        sales:
          "++id, userId, [userId+date], [userId+customerId], receiptNumber, paymentMethod, [userId+paymentMethod]",
        mpesaTransactions:
          "++id, userId, transactionCode, [userId+completionTime], [userId+paymentType], [userId+isReconciled], saleId",
      })
      .upgrade((tx) => {
        // Migration for existing data
        // This will be handled by the app logic
      });
  }
}

// ===== DATABASE INSTANCE =====

export const db = new PesaLocalDB();

// ===== HELPER FUNCTIONS =====

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
        taxRate: 16,
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

  async updateUserPreferences(
    id: string,
    preferences: Partial<UserPreferences>,
  ) {
    const user = await db.users.get(id);
    if (user) {
      await db.users.update(id, {
        preferences: { ...user.preferences, ...preferences },
      });
    }
  },

  // ===== ENHANCED PRODUCT MANAGEMENT =====
  async addProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    return await db.products.add({
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async getProductsByUser(userId: string, category?: ProductCategory) {
    let query = db.products.where("userId").equals(userId);
    if (category) {
      query = query.and((p) => p.category === category) as any;
    }
    return await query.toArray();
  },

  async getProductsByCategory(userId: string, category: ProductCategory) {
    return await db.products
      .where("userId")
      .equals(userId)
      .and((p) => p.category === category)
      .toArray();
  },

  async getLowStockProducts(userId: string) {
    return await db.products
      .where("userId")
      .equals(userId)
      .filter((p) => p.stock <= p.lowStockAlert)
      .toArray();
  },

  async getPerishableProducts(userId: string) {
    return await db.products
      .where("userId")
      .equals(userId)
      .and((p) => p.isPerishable === true)
      .toArray();
  },

  async updateProduct(productId: string, updates: Partial<Product>) {
    await db.products.update(productId, {
      ...updates,
      updatedAt: new Date(),
    });
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

  async deleteProduct(productId: string) {
    await db.products.delete(productId);
  },

  // ===== ENHANCED SALE MANAGEMENT =====
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

  async getSalesByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await db.sales
      .where("userId")
      .equals(userId)
      .filter((sale) => sale.date >= startDate && sale.date <= endDate)
      .toArray();
  },

  async getSalesByPaymentMethod(userId: string, method: string) {
    return await db.sales
      .where("userId")
      .equals(userId)
      .and((sale) => sale.paymentMethod === method)
      .toArray();
  },

  // ===== M-PESA TRANSACTION MANAGEMENT =====
  async addMpesaTransaction(tx: Omit<MpesaTransaction, "id">) {
    return await db.mpesaTransactions.add({
      ...tx,
      id: crypto.randomUUID(),
    });
  },

  async getMpesaTransactionsByUser(userId: string, limit = 50) {
    return await db.mpesaTransactions
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("completionTime")
      .then((results) => results.slice(0, limit));
  },

  async getMpesaTransactionsByDate(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return await db.mpesaTransactions
      .where("userId")
      .equals(userId)
      .filter((tx) => tx.completionTime >= start && tx.completionTime <= end)
      .toArray();
  },

  async getUnreconciledMpesaTransactions(userId: string) {
    return await db.mpesaTransactions
      .where("userId")
      .equals(userId)
      .and((tx) => tx.isReconciled === false)
      .toArray();
  },

  async reconcileMpesaTransaction(transactionId: string, saleId: string) {
    await db.mpesaTransactions.update(transactionId, {
      saleId,
      isReconciled: true,
    });
  },

  // ===== CUSTOMER MANAGEMENT =====
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

  async recordCustomerPayment(
    customerId: string,
    payment: Omit<Payment, "id">,
  ) {
    const customer = await db.customers.get(customerId);
    if (customer) {
      const paymentId = crypto.randomUUID();
      const newPayment = { ...payment, id: paymentId };

      await db.customers.update(customerId, {
        creditBalance: (customer.creditBalance || 0) - payment.amount,
        paymentHistory: [...(customer.paymentHistory || []), newPayment],
        updatedAt: new Date(),
      });
    }
  },

  // ===== QUOTE MANAGEMENT =====
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

  async convertQuoteToSale(quoteId: string, saleId: string) {
    await db.quotes.update(quoteId, {
      status: "converted",
      convertedToSaleId: saleId,
    });
  },

  // ===== IOU MANAGEMENT =====
  async addIOU(iou: Omit<IOU, "id" | "createdAt">) {
    return await db.ious.add({
      ...iou,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      reminderSent: false,
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

  async markReminderSent(iouId: string) {
    await db.ious.update(iouId, {
      reminderSent: true,
    });
  },

  // ===== TRANSACTION MANAGEMENT =====
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

  async updateSyncStatus(queueId: number, status: SyncQueue["status"]) {
    await db.syncQueue.update(queueId, { status });
  },

  async incrementRetryCount(queueId: number) {
    const item = await db.syncQueue.get(queueId);
    if (item) {
      await db.syncQueue.update(queueId, {
        retryCount: (item.retryCount || 0) + 1,
        lastAttempt: new Date(),
      });
    }
  },

  // ===== DATA MANAGEMENT =====
  async getUserData(userId: string) {
    const [
      user,
      transactions,
      customers,
      products,
      sales,
      mpesaTransactions,
      quotes,
      ious,
    ] = await Promise.all([
      db.users.get(userId),
      db.transactions.where("userId").equals(userId).toArray(),
      db.customers.where("userId").equals(userId).toArray(),
      db.products.where("userId").equals(userId).toArray(),
      db.sales.where("userId").equals(userId).toArray(),
      db.mpesaTransactions.where("userId").equals(userId).toArray(),
      db.quotes.where("userId").equals(userId).toArray(),
      db.ious.where("userId").equals(userId).toArray(),
    ]);

    return {
      user,
      transactions,
      customers,
      products,
      sales,
      mpesaTransactions,
      quotes,
      ious,
    };
  },

  async getDailySummary(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const sales = await db.sales
      .where("userId")
      .equals(userId)
      .filter((sale) => sale.date >= start && sale.date <= end)
      .toArray();

    const mpesaTx = await db.mpesaTransactions
      .where("userId")
      .equals(userId)
      .filter((tx) => tx.completionTime >= start && tx.completionTime <= end)
      .toArray();

    return {
      totalSales: sales.reduce((sum, s) => sum + s.total, 0),
      cashSales: sales
        .filter((s) => s.paymentMethod === "cash")
        .reduce((sum, s) => sum + s.total, 0),
      mpesaSales: sales
        .filter(
          (s) => s.paymentMethod === "mpesa" || s.paymentMethod === "combined",
        )
        .reduce((sum, s) => sum + (s.mpesaAmount || s.total), 0),
      creditSales: sales
        .filter((s) => s.paymentMethod === "credit")
        .reduce((sum, s) => sum + s.total, 0),
      transactionCount: sales.length,
      mpesaTransactions: mpesaTx.length,
      sales,
      mpesaTransactions: mpesaTx,
    };
  },

  // Clear all data for a specific user (Incinerator)
  async incinerateUserData(userId: string) {
    await db.transactions.where("userId").equals(userId).delete();
    await db.customers.where("userId").equals(userId).delete();
    await db.products.where("userId").equals(userId).delete();
    await db.sales.where("userId").equals(userId).delete();
    await db.mpesaTransactions.where("userId").equals(userId).delete();
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
    await db.mpesaTransactions.clear();
    await db.quotes.clear();
    await db.ious.clear();
    await db.syncQueue.clear();
  },
};

// ===== HELPER FUNCTIONS =====

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

export const formatMpesaMessage = (
  rawMessage: string,
): Partial<MpesaTransaction> | null => {
  // Parse M-PESA confirmation message
  const patterns = {
    transactionCode: /[A-Z0-9]{10,12}/,
    amount: /KSh\s*([\d,]+)/,
    phone: /(\+254|0)?7\d{8}/,
    name: /([A-Za-z\s]+)(?:\s+(?:paid|sent|received))?/i,
  };

  // This is a simplified parser - in production, use more robust regex
  return null;
};
