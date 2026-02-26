// src/core/types.ts
/*export type AppMode =
  | "onboarding"
  | "personal"
  | "business"
  | "personal-business";

export interface QuoteItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface Customer {
  name: string;
  amount: number;
  daysOverdue?: number;
  dueTomorrow?: boolean;
}

export interface Product {
  emoji: string;
  name: string;
  price: number;
}

*/
export type AppMode =
  | "onboarding"
  | "personal"
  | "business"
  | "personal-business";

export interface QuoteItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface Customer {
  name: string;
  amount: number;
  daysOverdue?: number;
  dueTomorrow?: boolean;
}

export interface Product {
  emoji: string;
  name: string;
  price: number;
}

// Re-export all types to ensure they're available
export type { AppMode, QuoteItem, ReceiptItem, Customer, Product };
