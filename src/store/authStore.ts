import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db, storage } from "../services/storage/db";
import type { User, UserPreferences } from "../services/storage/db";

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (phoneNumber: string, pin: string) => Promise<boolean>;
  register: (
    userData: Omit<User, "id" | "createdAt" | "lastLogin">,
  ) => Promise<string>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

// Simple PIN hashing (for demo - use proper crypto in production)
const hashPin = (pin: string): string => {
  return btoa(pin); // Simple encoding - replace with actual hashing
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoading: false,
      error: null,

      login: async (phoneNumber: string, pin: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await storage.getUserByPhone(phoneNumber);

          if (!user) {
            set({ error: "User not found", isLoading: false });
            return false;
          }

          // Verify PIN (in production, use proper comparison)
          if (user.pinHash !== hashPin(pin)) {
            set({ error: "Invalid PIN", isLoading: false });
            return false;
          }

          // Update last login
          await storage.updateUserLastLogin(user.id!);

          set({
            currentUser: { ...user, lastLogin: new Date() },
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({ error: "Login failed", isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Check if user exists
          const existing = await storage.getUserByPhone(userData.phoneNumber);
          if (existing) {
            set({ error: "Phone number already registered", isLoading: false });
            throw new Error("User exists");
          }

          // Create user with hashed PIN
          const userId = await storage.createUser({
            ...userData,
            pinHash: hashPin(userData.pinHash || "1234"), // Default PIN for demo
          });

          // Fetch the created user
          const newUser = await storage.getUserById(userId);
          set({ currentUser: newUser || null, isLoading: false });

          return userId;
        } catch (error) {
          set({ error: "Registration failed", isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      updatePreferences: async (preferences) => {
        const { currentUser } = get();
        if (!currentUser?.id) return;

        set({ isLoading: true });
        try {
          const updatedUser = {
            ...currentUser,
            preferences: { ...currentUser.preferences, ...preferences },
          };

          await db.users.update(currentUser.id, updatedUser);
          set({ currentUser: updatedUser, isLoading: false });
        } catch (error) {
          set({ error: "Failed to update preferences", isLoading: false });
        }
      },
    }),
    {
      name: "pesalocal-auth",
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
);
