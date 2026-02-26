export interface User {
  id: string;
  phoneNumber: string;
  businessName: string;
  ownerName: string;
  businessType: "retail" | "food" | "boda" | "other";
  location?: string;
  avatar?: string; // Will use first letter of business name
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserPreferences {
  currency: "KES";
  language: "en" | "sw";
  lowStockThreshold: number;
  creditAlertDays: number;
  darkMode: boolean;
}

export interface BusinessProfile {
  userId: string;
  businessName: string;
  registrationNumber?: string;
  taxPin?: string;
  mpesaTill?: string;
  mpesaPaybill?: string;
  logo?: string; // Will use first letter as fallback
}
