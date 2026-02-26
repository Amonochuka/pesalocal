import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  alertCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, alertCount = 3 }) => {
  return (
    <div className="min-h-screen w-full bg-obsidian flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald text-obsidian rounded-xl flex items-center justify-center font-black text-xl italic shadow-emerald-glow shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
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

          {/* Action Icons - Using FontAwesome */}
          <div className="flex items-center gap-4 md:gap-6 text-text-secondary">
            <div className="relative cursor-pointer group">
              <i className="fas fa-search text-xl group-hover:text-emerald transition-colors"></i>
            </div>
            <div className="relative cursor-pointer group">
              <i className="fas fa-bell text-xl group-hover:text-emerald transition-colors"></i>
              {alertCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-rust text-[9px] flex items-center justify-center rounded-full border-2 border-obsidian text-white font-bold">
                  {alertCount}
                </span>
              )}
            </div>
            <div className="relative cursor-pointer group">
              <i className="fas fa-user-circle text-xl group-hover:text-emerald transition-colors"></i>
            </div>
            <div className="md:hidden cursor-pointer group">
              <i className="fas fa-bars text-xl group-hover:text-emerald transition-colors"></i>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Encryption Status - Using FontAwesome */}
        <div className="mb-8 flex justify-center md:justify-start">
          <div className="inline-flex items-center gap-2 bg-emerald/5 border border-emerald/10 rounded-full px-4 py-2">
            <i className="fas fa-shield-alt text-emerald text-sm"></i>
            <span className="text-xs md:text-sm text-emerald font-medium">
              End-to-End Encrypted Personal Vault
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="w-full">{children}</div>
      </main>

      {/* Mobile Bottom Navigation - Using FontAwesome */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-vault/90 backdrop-blur-lg border-t border-white/5 px-6 py-2 flex justify-between items-center z-50">
        <div className="flex flex-col items-center text-emerald cursor-pointer group">
          <i className="fas fa-home text-xl group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center text-text-secondary cursor-pointer group">
          <i className="fas fa-chart-pie text-xl group-hover:text-emerald group-hover:scale-110 transition-all"></i>
          <span className="text-[10px] mt-1">Insights</span>
        </div>
        <div className="flex flex-col items-center text-text-secondary cursor-pointer group relative -top-5">
          <div className="bg-emerald p-3 rounded-full shadow-lg shadow-emerald/30">
            <i className="fas fa-plus text-obsidian text-xl"></i>
          </div>
          <span className="text-[10px] mt-1 text-emerald font-bold">Add</span>
        </div>
        <div className="flex flex-col items-center text-text-secondary cursor-pointer group">
          <i className="fas fa-history text-xl group-hover:text-emerald group-hover:scale-110 transition-all"></i>
          <span className="text-[10px] mt-1">History</span>
        </div>
        <div className="flex flex-col items-center text-text-secondary cursor-pointer group">
          <i className="fas fa-user text-xl group-hover:text-emerald group-hover:scale-110 transition-all"></i>
          <span className="text-[10px] mt-1">Profile</span>
        </div>
      </nav>

      {/* Spacer for mobile content */}
      <div className="md:hidden h-20"></div>
    </div>
  );
};
