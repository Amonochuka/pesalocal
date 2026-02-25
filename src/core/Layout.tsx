// src/core/Layout.tsx
import React from "react";
import {
  ShieldCheck,
  Bell,
  UserCircle,
  Signal,
  Wifi,
  Battery,
} from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="phone-frame animate-in fade-in zoom-in duration-500 flex flex-col">
      {/* Simulated Status Bar */}
      <div className="flex justify-between items-center px-4 pt-2 pb-5 text-[12px] text-text-secondary">
        <span className="font-bold text-text-primary tracking-tight">9:41</span>
        <div className="flex gap-1.5 items-center">
          <Signal size={14} strokeWidth={2.5} />
          <Wifi size={14} strokeWidth={2.5} />
          <Battery size={16} strokeWidth={2} className="rotate-0" />
        </div>
      </div>

      {/* Brand Header */}
      <header className="flex justify-between items-center px-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 logo-glow rounded-xl flex items-center justify-center font-black text-xl italic">
            P
          </div>
          <span className="text-2xl font-black font-display tracking-tight text-gradient">
            PesaLocal
          </span>
        </div>
        <div className="flex gap-4 text-text-secondary relative">
          <div className="relative cursor-pointer hover:text-emerald transition-colors p-1">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-rust text-[9px] flex items-center justify-center rounded-full border-2 border-obsidian text-white font-bold">
              3
            </span>
          </div>
          <UserCircle
            size={28}
            className="cursor-pointer hover:text-emerald transition-colors"
          />
        </div>
      </header>

      {/* Encryption Pill */}
      <div className="mx-2 mb-6">
        <div className="inline-flex items-center gap-2 bg-emerald/5 border border-emerald/10 rounded-full px-4 py-1.5 text-[12px] text-emerald font-semibold uppercase tracking-wider">
          <ShieldCheck size={14} />
          <span>Local Vault Encrypted</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">{children}</div>
    </div>
  );
};

export default Layout;
