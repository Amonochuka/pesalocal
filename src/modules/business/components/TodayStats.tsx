import React from "react";

interface Props {
  totalSales: number;
  cash: number;
  mpesa: number;
  credit: number;
  creditOwed: number;
}

export const TodayStats: React.FC<Props> = ({
  totalSales,
  cash,
  mpesa,
  credit,
  creditOwed,
}) => {
  return (
    <>
      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <i className="fas fa-shopping-cart text-emerald"></i> Sales today
          </div>
          <div className="stat-value">KSh {totalSales}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <i className="fas fa-coins text-emerald"></i> Cash
          </div>
          <div className="stat-value">KSh {cash}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <i className="fas fa-mobile-alt text-emerald"></i> M-PESA
          </div>
          <div className="stat-value">KSh {mpesa}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <i className="fas fa-credit-card text-amber"></i> Credit
          </div>
          <div className="stat-value">KSh {credit}</div>
        </div>
      </div>

      {/* Credit Owed Banner */}
      {creditOwed > 0 && (
        <div className="glass-card p-4 border-l-4 border-amber">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <i className="fas fa-hand-holding-usd text-amber"></i>
              </div>
              <div>
                <p className="text-sm text-text-secondary">
                  Outstanding Credit
                </p>
                <p className="text-2xl font-bold text-amber">
                  KSh {creditOwed}
                </p>
              </div>
            </div>
            <div className="text-xs text-text-secondary">
              <i className="fas fa-info-circle"></i> From customers
            </div>
          </div>
        </div>
      )}
    </>
  );
};
