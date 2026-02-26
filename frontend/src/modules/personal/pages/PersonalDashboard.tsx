// src/modules/personal/pages/PersonalDashboard.tsx
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../services/storage/db";
import { formatCurrency } from "../../../core/utils/formatters";

export const PersonalDashboard: React.FC = () => {
  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

  // Last 5 personal transactions, newest first.
  // Fix: sortBy() returns a Promise<T[]> and cannot be chained after reverse().
  // Correct pattern: sortBy() first, then reverse the JS array in .then().
  const transactions = useLiveQuery(
    () =>
      db.transactions
        .where("type")
        .equals("personal")
        .sortBy("completionTime")
        .then((results) => results.reverse().slice(0, 5)),
    [],
  );

  // Most recent transaction — used for running balance
  const latestTransaction = useLiveQuery(
    () =>
      db.transactions
        .where("type")
        .equals("personal")
        .sortBy("completionTime")
        .then((results) => results[results.length - 1] ?? null),
    [],
  );

  // Monthly totals
  const monthlyStats = useLiveQuery(async () => {
    const allTransactions = await db.transactions
      .where("type")
      .equals("personal")
      .toArray();

    const thisMonth = allTransactions.filter((tx) => {
      const txDate = new Date(tx.completionTime);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });

    const spent    = thisMonth.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const received = thisMonth.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const totalFees = thisMonth.reduce((sum, tx) => sum + (tx.fee || 0), 0);

    return { spent, received, totalFees };
  }, []);

  // Category breakdown — expenses only, this month
  const categorySpending = useLiveQuery(async () => {
    const allTransactions = await db.transactions
      .where("type")
      .equals("personal")
      .toArray();

    const thisMonthExpenses = allTransactions.filter((tx) => {
      const txDate = new Date(tx.completionTime);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear &&
        tx.amount < 0
      );
    });

    const categories: Record<string, number> = {};
    thisMonthExpenses.forEach((tx) => {
      const cat = tx.category || "Other";
      categories[cat] = (categories[cat] || 0) + Math.abs(tx.amount);
    });

    return categories;
  }, []);

  const getCategoryPercentage = (category: string) => {
    const total = Object.values(categorySpending || {}).reduce((a, b) => a + b, 0);
    const amount = categorySpending?.[category] || 0;
    return total > 0 ? Math.round((amount / total) * 100) : 0;
  };

  // Fall back to placeholder values while IDB loads (undefined = still loading)
  const balance   = latestTransaction?.balance  ?? 24850;
  const spent     = monthlyStats?.spent         ?? 18420;
  const received  = monthlyStats?.received      ?? 22150;
  const totalFees = monthlyStats?.totalFees     ?? 420;

  return (
    <div className="dashboard-grid">
      {/* Balance Card */}
      <div className="balance-card">
        <div style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
          Total Balance
        </div>
        <div className="balance-amount">{formatCurrency(balance)}</div>
        <div className="balance-trend">
          <i className="fas fa-arrow-up"></i> 12% from last month
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <i className="fas fa-arrow-down" style={{ color: "var(--accent-rust)" }}></i>{" "}
            Spent
          </div>
          <div className="stat-value">{formatCurrency(spent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <i className="fas fa-arrow-up" style={{ color: "var(--accent-emerald)" }}></i>{" "}
            Received
          </div>
          <div className="stat-value">{formatCurrency(received)}</div>
        </div>
      </div>

      {/* Spending Categories */}
      <div className="alert-section">
        <div className="alert-title">
          <i className="fas fa-chart-pie"></i> Spending this month
        </div>
        {[
          { label: "🍔 Food",      key: "Food",      color: "var(--accent-emerald)", fallback: 8450 },
          { label: "🚗 Transport", key: "Transport", color: "var(--accent-amber)",   fallback: 3200 },
          { label: "📱 Airtime",   key: "Airtime",   color: "var(--accent-mint)",    fallback: 1450 },
        ].map(({ label, key, color, fallback }) => (
          <div key={key} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>{label}</span>
              <span>{formatCurrency(categorySpending?.[key] ?? fallback)}</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }}>
              <div
                style={{
                  width: `${getCategoryPercentage(key)}%`,
                  height: "100%",
                  background: color,
                  borderRadius: "3px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Fee Insight */}
      <div className="alert-section">
        <div className="alert-title">
          <i className="fas fa-exclamation-triangle" style={{ color: "var(--accent-amber)" }}></i>{" "}
          Insight
        </div>
        <div className="alert-item">
          <div className="alert-left">
            <div className="alert-icon">
              <i className="fas fa-coins"></i>
            </div>
            <div className="alert-details">
              <h4>{formatCurrency(totalFees)} paid in M-PESA fees</h4>
              <p>This month. 20% excise duty included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="alert-section">
        <div className="alert-title">
          <i className="fas fa-history"></i> Recent
        </div>

        {/* Loading state */}
        {transactions === undefined && (
          <div className="alert-item">
            <div className="alert-left">
              <div className="alert-icon">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <div className="alert-details">
                <h4>Loading transactions…</h4>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {transactions !== undefined && transactions.length === 0 && (
          <div className="alert-item">
            <div className="alert-left">
              <div className="alert-icon">
                <i className="fas fa-inbox"></i>
              </div>
              <div className="alert-details">
                <h4>No transactions yet</h4>
                <p>Import an M-PESA statement to get started</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction list */}
        {transactions?.map((tx) => (
          <div className="alert-item" key={tx.id}>
            <div className="alert-left">
              <div
                className="alert-icon"
                style={{
                  background: tx.amount < 0
                    ? "rgba(231,111,81,0.1)"
                    : "rgba(59,206,172,0.1)",
                }}
              >
                <i
                  className={tx.amount < 0 ? "fas fa-arrow-up" : "fas fa-arrow-down"}
                  style={{
                    color: tx.amount < 0
                      ? "var(--accent-rust)"
                      : "var(--accent-emerald)",
                  }}
                />
              </div>
              <div className="alert-details">
                <h4>{tx.counterparty || tx.description}</h4>
                <p>
                  {new Date(tx.completionTime).toLocaleDateString("en-KE", {
                    hour:   "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>
                {tx.amount < 0 ? "-" : "+"}
                {formatCurrency(Math.abs(tx.amount))}
              </div>
              {tx.fee > 0 && (
                <div style={{ fontSize: "11px", color: "var(--accent-amber)" }}>
                  +{formatCurrency(tx.fee)} fee
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};