// src/core/Layout.tsx
import React, { useState } from "react";
import { UserMenu } from "./components/UserMenu";
import { AppMode } from "./types";

interface LayoutProps {
  children: React.ReactNode;
  alertCount?: number;
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  alertCount = 3,
  currentMode,
  onModeChange,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const getModeDisplay = () => {
    switch (currentMode) {
      case "personal":
        return { icon: "👤", text: "Personal Mode" };
      case "business":
        return { icon: "🏪", text: "Business Mode" };
      case "personal-business":
        return { icon: "🔄", text: "Combined Mode" };
      default:
        return { icon: "🚀", text: "Getting Started" };
    }
  };

  const modeDisplay = getModeDisplay();

  return (
    <div className="min-h-screen w-full bg-obsidian flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-emerald text-obsidian rounded-xl flex items-center 
                justify-center font-black text-xl italic shadow-emerald-glow shrink-0 
                transform -rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer"
              onClick={() => onModeChange("onboarding")}
              title="Go to Home"
            >
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black font-display tracking-tight text-gradient leading-none">
                PesaLocal
              </span>
              <span className="text-[10px] text-emerald font-bold uppercase tracking-widest mt-1 hidden sm:block">
                Secure Vault
              </span>
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Mode Indicator */}
            <div className="flex items-center gap-2 bg-emerald/5 px-3 py-1.5 rounded-full">
              <span className="text-sm">{modeDisplay.icon}</span>
              <span className="text-xs text-emerald font-medium">
                {modeDisplay.text}
              </span>
            </div>

            {/* Action Icons */}
            <div className="relative cursor-pointer group">
              <i className="fas fa-search text-xl text-text-secondary group-hover:text-emerald transition-colors"></i>
            </div>
            <div className="relative cursor-pointer group">
              <i className="fas fa-bell text-xl text-text-secondary group-hover:text-emerald transition-colors"></i>
              {alertCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-4 h-4 bg-rust text-[9px] 
                  flex items-center justify-center rounded-full border-2 border-obsidian 
                  text-white font-bold"
                >
                  {alertCount}
                </span>
              )}
            </div>

            {/* User Menu */}
            <UserMenu currentMode={currentMode} onModeChange={onModeChange} />
          </div>

          {/* Mobile Right Section */}
          <div className="flex md:hidden items-center gap-3">
            <div className="relative cursor-pointer group">
              <i className="fas fa-bell text-xl text-text-secondary group-hover:text-emerald transition-colors"></i>
              {alertCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-4 h-4 bg-rust text-[9px] 
                  flex items-center justify-center rounded-full border-2 border-obsidian 
                  text-white font-bold"
                >
                  {alertCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg glass-card hover:border-emerald/30 transition-all"
            >
              <i className="fas fa-bars text-xl text-text-secondary"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-vault/95 backdrop-blur-xl 
              border-l border-white/5 p-4 animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-display font-bold text-lg">Menu</span>
              <button onClick={() => setShowMobileMenu(false)} className="p-2">
                <i className="fas fa-times text-text-secondary"></i>
              </button>
            </div>

            {/* Mobile User Info - Simplified */}
            <div className="mb-6 p-3 glass-card">
              <UserMenu currentMode={currentMode} onModeChange={onModeChange} />
            </div>

            {/* Mobile Mode Quick Switcher */}
            <div className="space-y-2 mb-4">
              <p className="text-xs text-text-secondary px-2 uppercase tracking-wider">
                Quick Switch
              </p>
              <button
                onClick={() => {
                  onModeChange("personal");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                  ${currentMode === "personal" ? "bg-emerald/20 text-emerald" : "hover:bg-white/5"}`}
              >
                <span className="text-xl">👤</span>
                <span className="flex-1 text-left font-medium">Personal</span>
                {currentMode === "personal" && (
                  <i className="fas fa-check text-emerald"></i>
                )}
              </button>
              <button
                onClick={() => {
                  onModeChange("business");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                  ${currentMode === "business" ? "bg-emerald/20 text-emerald" : "hover:bg-white/5"}`}
              >
                <span className="text-xl">🏪</span>
                <span className="flex-1 text-left font-medium">Business</span>
                {currentMode === "business" && (
                  <i className="fas fa-check text-emerald"></i>
                )}
              </button>
              <button
                onClick={() => {
                  onModeChange("personal-business");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                  ${currentMode === "personal-business" ? "bg-emerald/20 text-emerald" : "hover:bg-white/5"}`}
              >
                <span className="text-xl">🔄</span>
                <span className="flex-1 text-left font-medium">Both</span>
                {currentMode === "personal-business" && (
                  <i className="fas fa-check text-emerald"></i>
                )}
              </button>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                <i className="fas fa-search w-5 text-emerald"></i>
                <span className="flex-1 text-left">Search</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                <i className="fas fa-chart-line w-5 text-emerald"></i>
                <span className="flex-1 text-left">Analytics</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                <i className="fas fa-history w-5 text-emerald"></i>
                <span className="flex-1 text-left">History</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                <i className="fas fa-shield-alt w-5 text-emerald"></i>
                <span className="flex-1 text-left">Privacy</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-[10px] text-text-secondary text-center">
              PesaLocal v1.0.0 · 100% Local
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Encryption Status */}
        <div className="mb-8 flex justify-center md:justify-start">
          <div
            className="inline-flex items-center gap-2 bg-emerald/5 border border-emerald/10 
            rounded-full px-4 py-2"
          >
            <i className="fas fa-shield-alt text-emerald text-sm"></i>
            <span className="text-xs md:text-sm text-emerald font-medium">
              End-to-End Encrypted Personal Vault
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="w-full">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-vault/90 backdrop-blur-lg 
        border-t border-white/5 px-6 py-2 flex justify-between items-center z-40"
      >
        <button
          onClick={() => onModeChange("personal")}
          className={`flex flex-col items-center group ${
            currentMode === "personal" ? "text-emerald" : "text-text-secondary"
          }`}
        >
          <i className="fas fa-home text-xl group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] mt-1">Home</span>
        </button>
        <button
          onClick={() => onModeChange("personal")}
          className={`flex flex-col items-center group ${
            currentMode === "personal" ? "text-emerald" : "text-text-secondary"
          }`}
        >
          <i className="fas fa-chart-pie text-xl group-hover:text-emerald group-hover:scale-110 transition-all"></i>
          <span className="text-[10px] mt-1">Personal</span>
        </button>
        <button
          onClick={() => onModeChange("business")}
          className={`flex flex-col items-center group relative -top-5 ${
            currentMode === "business" ? "text-emerald" : "text-text-secondary"
          }`}
        >
          <div className="bg-emerald p-3 rounded-full shadow-lg shadow-emerald/30">
            <i className="fas fa-store text-obsidian text-xl"></i>
          </div>
          <span className="text-[10px] mt-1 text-emerald font-bold">
            Business
          </span>
        </button>
        <button
          onClick={() => onModeChange("personal-business")}
          className={`flex flex-col items-center group ${
            currentMode === "personal-business"
              ? "text-emerald"
              : "text-text-secondary"
          }`}
        >
          <i className="fas fa-layer-group text-xl group-hover:text-emerald group-hover:scale-110 transition-all"></i>
          <span className="text-[10px] mt-1">Both</span>
        </button>
        <button className="flex flex-col items-center group text-text-secondary">
          <i className="fas fa-user text-xl group-hover:text-emerald group-hover:scale-110 transition-all"></i>
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </nav>

      {/* Spacer for mobile content */}
      <div className="md:hidden h-20"></div>
    </div>
  );
};
