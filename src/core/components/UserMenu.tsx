// src/core/components/UserMenu.tsx
import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { AppMode } from "../types";

interface UserMenuProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();
  const user = useCurrentUser();

  const handleLogout = () => {
    logout();
    onModeChange("onboarding");
    setIsOpen(false);
  };

  const handleModeSwitch = (mode: AppMode) => {
    onModeChange(mode);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card 
          hover:border-emerald/30 transition-all group"
      >
        <div
          className="w-8 h-8 bg-emerald/20 rounded-full flex items-center justify-center 
          text-emerald font-bold text-sm"
        >
          {user.businessName?.charAt(0) || user.ownerName?.charAt(0) || "U"}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-xs text-text-secondary">Welcome back,</p>
          <p className="text-sm font-medium truncate max-w-[120px]">
            {user.ownerName || user.businessName}
          </p>
        </div>
        <i
          className={`fas fa-chevron-down text-xs text-text-secondary 
          transition-transform ${isOpen ? "rotate-180" : ""}`}
        ></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 z-50">
            <div className="glass-card p-2 animate-slideIn">
              {/* User Info */}
              <div className="px-3 py-3 border-b border-white/10">
                <p className="font-medium">{user.ownerName}</p>
                <p className="text-xs text-text-secondary">
                  {user.businessName}
                </p>
                <p className="text-xs text-emerald mt-1">{user.phoneNumber}</p>
              </div>

              {/* Mode Switcher */}
              <div className="py-2 border-b border-white/10">
                <p className="text-xs text-text-secondary px-3 py-1">
                  Switch Mode
                </p>

                <button
                  onClick={() => handleModeSwitch("personal")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
                    transition-colors ${
                      currentMode === "personal"
                        ? "bg-emerald/20 text-emerald"
                        : "hover:bg-white/5"
                    }`}
                >
                  <span className="text-lg">👤</span>
                  <span className="flex-1 text-left">Personal</span>
                  {currentMode === "personal" && (
                    <i className="fas fa-check text-emerald"></i>
                  )}
                </button>

                <button
                  onClick={() => handleModeSwitch("business")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
                    transition-colors ${
                      currentMode === "business"
                        ? "bg-emerald/20 text-emerald"
                        : "hover:bg-white/5"
                    }`}
                >
                  <span className="text-lg">🏪</span>
                  <span className="flex-1 text-left">Business</span>
                  {currentMode === "business" && (
                    <i className="fas fa-check text-emerald"></i>
                  )}
                </button>

                <button
                  onClick={() => handleModeSwitch("personal-business")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
                    transition-colors ${
                      currentMode === "personal-business"
                        ? "bg-emerald/20 text-emerald"
                        : "hover:bg-white/5"
                    }`}
                >
                  <span className="text-lg">🔄</span>
                  <span className="flex-1 text-left">Personal & Business</span>
                  {currentMode === "personal-business" && (
                    <i className="fas fa-check text-emerald"></i>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="py-2">
                <button
                  onClick={() => {
                    // Navigate to settings/profile
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
                    hover:bg-white/5 transition-colors"
                >
                  <i className="fas fa-user-cog w-5 text-emerald"></i>
                  <span className="flex-1 text-left">Profile Settings</span>
                </button>

                <button
                  onClick={() => {
                    // Navigate to privacy audit
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
                    hover:bg-white/5 transition-colors"
                >
                  <i className="fas fa-shield-alt w-5 text-emerald"></i>
                  <span className="flex-1 text-left">Privacy Audit</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
                    hover:bg-rust/10 text-rust transition-colors mt-1"
                >
                  <i className="fas fa-sign-out-alt w-5"></i>
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
