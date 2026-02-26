import React from "react";
import { Shield, User, Store, Layers, ArrowRight } from "lucide-react";

interface RoleSelectionProps {
  onSelectRole: (role: "personal" | "business" | "personal-business") => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onSelectRole,
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
          {/* Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-emerald/20 blur-2xl rounded-full"></div>
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald to-emerald-dark rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-4xl md:text-5xl font-black text-obsidian">
                P
              </span>
            </div>
          </div>

          {/* Title with Gradient */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display mb-3">
            <span className="text-gradient">Karibu</span>{" "}
            <span className="text-gradient bg-gradient-to-r from-emerald to-emerald/70 bg-clip-text">
              PesaLocal
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Choose how you want to use PesaLocal. Your data stays on your phone,
            encrypted and private—always.
          </p>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="inline-flex items-center gap-2 bg-emerald/5 border border-emerald/10 rounded-full px-4 py-2">
              <Shield size={16} className="text-emerald" />
              <span className="text-xs md:text-sm text-emerald font-medium">
                End-to-End Encrypted Personal Vault
              </span>
            </div>
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-4 animate-in fade-in duration-1000 delay-300">
          {/* Personal Card */}
          <button
            onClick={() => onSelectRole("personal")}
            className="group relative glass-card p-6 md:p-8 text-left hover:border-emerald/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald/5"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-card"></div>

            {/* Icon */}
            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald/20">
              <User size={32} className="text-emerald" />
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold font-display mb-2 group-hover:text-emerald transition-colors">
              Personal
            </h3>

            {/* Description */}
            <p className="text-text-secondary text-sm md:text-base mb-4">
              Track M-PESA spending, see hidden fees
            </p>

            {/* Features List */}
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Transaction insights
              </li>
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Fee breakdowns
              </li>
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Spending categories
              </li>
            </ul>

            {/* Arrow Indicator */}
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight size={20} className="text-emerald" />
            </div>
          </button>

          {/* Business Card */}
          <button
            onClick={() => onSelectRole("business")}
            className="group relative glass-card p-6 md:p-8 text-left hover:border-emerald/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-card"></div>

            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald/20">
              <Store size={32} className="text-emerald" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold font-display mb-2 group-hover:text-emerald transition-colors">
              Business
            </h3>

            <p className="text-text-secondary text-sm md:text-base mb-4">
              For Mama Jane - sales, credit, stock, quotes & receipts
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Quick sales
              </li>
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Credit book
              </li>
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Inventory tracking
              </li>
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Quotes & receipts
              </li>
            </ul>

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight size={20} className="text-emerald" />
            </div>
          </button>

          {/* Personal & Business Card */}
          <button
            onClick={() => onSelectRole("personal-business")}
            className="group relative glass-card p-6 md:p-8 text-left hover:border-emerald/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-card"></div>

            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald/20">
              <Layers size={32} className="text-emerald" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold font-display mb-2 group-hover:text-emerald transition-colors">
              Personal & Business
            </h3>

            <p className="text-text-secondary text-sm md:text-base mb-4">
              Keep both separate in one app
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Combined view
              </li>
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Separate tracking
              </li>
              <li className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                <span className="w-1 h-1 bg-emerald rounded-full"></span>
                Unified insights
              </li>
            </ul>

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight size={20} className="text-emerald" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-text-secondary text-xs md:text-sm">
          <p>
            🔒 Your data never leaves your device • 100% offline • Open source
          </p>
        </div>
      </div>
    </div>
  );
};
