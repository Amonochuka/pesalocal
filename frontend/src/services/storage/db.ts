// src/services/storage/db.ts
import Dexie from "dexie";
import type { Table } from "dexie";

// Define types
export interface Transaction {
  id?: string;
  receiptNumber: string;
  completionTime: Date;
  amount: number;
  fee: number;
  totalImpact: number;
  balance: number;
  category: string;
  counterparty: string;
  description: string;
  type: "personal" | "business";
  isFlagged: boolean;
  notes?: string;
  syncedAt?: Date;
}

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  creditBalance: number;
  paymentHistory: Payment[];
  lastTransaction: Date;
  notes?: string;
  createdAt: Date;
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
  items: SaleItem[];
  total: number;
  paymentMethod: "cash" | "mpesa" | "credit";
  customerId?: string;
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
  customerName: string;
  amount: number;
  dueDate: Date;
  notes?: string;
  isPaid: boolean;
  paidAt?: Date;
  createdAt: Date;
}

export interface SyncQueue {
  id?: number;
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
  transactions!: Table<Transaction, string>;
  customers!: Table<Customer, string>;
  products!: Table<Product, string>;
  sales!: Table<Sale, string>;
  quotes!: Table<Quote, string>;
  ious!: Table<IOU, string>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super("PesaLocalDB");

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

    // Add indexes for better query performance
    this.version(1).stores({
      transactions: "++id, [type+completionTime], [category+completionTime]",
      customers: "++id, [name+creditBalance]",
      products: "++id, [category+stock]",
    });
  }
}

// Create and export a single instance
export const db = new PesaLocalDB();

// Helper functions for common operations
export const storage = {
  // Transactions
  async addTransaction(transaction: Omit<Transaction, "id">) {
    return await db.transactions.add({
      ...transaction,
      id: crypto.randomUUID(),
    });
  },

  async getTransactionsByType(type: "personal" | "business", limit = 50) {
    return await db.transactions
      .where("type")
      .equals(type)
      .reverse()
      .sortBy("completionTime")
      .then((results) => results.slice(0, limit));
  },

  async getRecentTransactions(limit = 10) {
    return await db.transactions
      .orderBy("completionTime")
      .reverse()
      .limit(limit)
      .toArray();
  },

  // Customers
  async addCustomer(customer: Omit<Customer, "id">) {
    return await db.customers.add({
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  },

  async getCustomersWithCredit() {
    return await db.customers.where("creditBalance").above(0).toArray();
  },

  async updateCustomerCredit(customerId: string, amount: number) {
    const customer = await db.customers.get(customerId);
    if (customer) {
      await db.customers.update(customerId, {
        creditBalance: (customer.creditBalance || 0) + amount,
        lastTransaction: new Date(),
      });
    }
  },

  // Products
  async addProduct(product: Omit<Product, "id">) {
    return await db.products.add({
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async getLowStockProducts() {
    return await db.products
      .filter((p) => p.stock <= p.lowStockAlert)
      .toArray();
  },

  async updateStock(productId: string, quantity: number) {
    const product = await db.products.get(productId);
    if (product) {
      await db.products.update(productId, {
        stock: product.stock - quantity,
        updatedAt: new Date(),
      });
    }
  },

  // Sales
  async addSale(sale: Omit<Sale, "id">) {
    const id = crypto.randomUUID();
    await db.sales.add({
      ...sale,
      id,
    });

    // Add to sync queue
    await db.syncQueue.add({
      action: "create",
      table: "sales",
      recordId: id,
      data: sale,
      status: "pending",
      retryCount: 0,
      createdAt: new Date(),
    });

    return id;
  },

  // Quotes
  async addQuote(quote: Omit<Quote, "id">) {
    return await db.quotes.add({
      ...quote,
      id: crypto.randomUUID(),
    });
  },

  async getQuotesByStatus(status: Quote["status"]) {
    return await db.quotes.where("status").equals(status).toArray();
  },

  // IOUs
  async addIOU(iou: Omit<IOU, "id">) {
    return await db.ious.add({
      ...iou,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  },

  async getOutstandingIOUs() {
    return await db.ious
      .where("isPaid")
      .equals(0)
      .and((iou) => new Date(iou.dueDate) > new Date())
      .toArray();
  },

  async getOverdueIOUs() {
    return await db.ious
      .where("isPaid")
      .equals(0)
      .and((iou) => new Date(iou.dueDate) < new Date())
      .toArray();
  },

  // Sync Queue
  async addToSyncQueue(
    item: Omit<SyncQueue, "id" | "createdAt" | "retryCount">,
  ) {
    return await db.syncQueue.add({
      ...item,
      retryCount: 0,
      createdAt: new Date(),
    });
  },

  async getPendingSyncItems() {
    return await db.syncQueue.where("status").equals("pending").toArray();
  },

  // Clear all data (Incinerator)
  async incinerate() {
    await db.transactions.clear();
    await db.customers.clear();
    await db.products.clear();
    await db.sales.clear();
    await db.quotes.clear();
    await db.ious.clear();
    await db.syncQueue.clear();
  },
};
