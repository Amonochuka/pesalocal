// src/modules/personal/pages/PersonalDashboard.tsx
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../services/storage/db";
import { formatCurrency } from "../../../core/utils/formatters";
import { useUserId } from "../../../hooks/useCurrentUser";

export const PersonalDashboard: React.FC = () => {
  const userId = useUserId();

  // If no user is logged in, show login prompt
  if (!userId) {
    return (
      <div className="glass-card p-8 text-center">
        <div
          className="w-16 h-16 bg-amber/10 rounded-full flex items-center 
          justify-center mx-auto mb-4 text-2xl text-amber"
        >
          <i className="fas fa-user-lock"></i>
        </div>
        <h3 className="text-lg font-display font-bold mb-2">Please Log In</h3>
        <p className="text-text-secondary text-sm">
          You need to be logged in to view your personal dashboard
        </p>
      </div>
    );
  }

  // Fetch transactions for this specific user
  const transactions = useLiveQuery(async () => {
    if (!userId) return [];

    const results = await db.transactions
      .where("userId")
      .equals(userId)
      .and((tx) => tx.type === "personal")
      .reverse()
      .sortBy("completionTime");

    return results.slice(0, 5); // Get last 5 transactions
  }, [userId]);

  // Calculate total balance (last transaction balance) for this user
  const latestTransaction = useLiveQuery(async () => {
    if (!userId) return null;

    return await db.transactions
      .where("userId")
      .equals(userId)
      .and((tx) => tx.type === "personal")
      .reverse()
      .first();
  }, [userId]);

  // Calculate totals for the month for this user
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyStats = useLiveQuery(async () => {
    if (!userId) return { spent: 0, received: 0, totalFees: 0 };

    const allTransactions = await db.transactions
      .where("userId")
      .equals(userId)
      .and((tx) => tx.type === "personal")
      .toArray();

    const thisMonth = allTransactions.filter((tx) => {
      const txDate = new Date(tx.completionTime);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });

    const spent = thisMonth
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const received = thisMonth
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalFees = thisMonth.reduce((sum, tx) => sum + (tx.fee || 0), 0);

    return { spent, received, totalFees };
  }, [userId, currentMonth, currentYear]);

  // Calculate category spending for this user
  const categorySpending = useLiveQuery(async () => {
    if (!userId) return {};

    const allTransactions = await db.transactions
      .where("userId")
      .equals(userId)
      .and((tx) => tx.type === "personal")
      .toArray();

    const thisMonth = allTransactions.filter((tx) => {
      const txDate = new Date(tx.completionTime);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear &&
        tx.amount < 0
      ); // Only expenses
    });

    const categories: Record<string, number> = {};
    thisMonth.forEach((tx) => {
      const cat = tx.category || "Other";
      categories[cat] = (categories[cat] || 0) + Math.abs(tx.amount);
    });

    return categories;
  }, [userId, currentMonth, currentYear]);

  // Calculate category percentages
  const getCategoryPercentage = (category: string) => {
    const total = Object.values(categorySpending || {}).reduce(
      (a, b) => a + b,
      0,
    );
    const amount = categorySpending?.[category] || 0;
    return total > 0 ? Math.round((amount / total) * 100) : 0;
  };

  const balance = latestTransaction?.balance || 0;
  const spent = monthlyStats?.spent || 0;
  const received = monthlyStats?.received || 0;
  const totalFees = monthlyStats?.totalFees || 0;

  // Show loading state while fetching data
  if (
    transactions === undefined ||
    monthlyStats === undefined ||
    categorySpending === undefined
  ) {
    return (
      <div className="glass-card p-8 text-center">
        <div
          className="w-16 h-16 bg-emerald/10 rounded-full flex items-center 
          justify-center mx-auto mb-4 text-2xl text-emerald"
        >
          <i className="fas fa-spinner fa-pulse"></i>
        </div>
        <h3 className="text-lg font-display font-bold mb-2">
          Loading your data...
        </h3>
        <p className="text-text-secondary text-sm">
          Please wait while we fetch your transactions
        </p>
      </div>
    );
  }

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
            <i
              className="fas fa-arrow-down"
              style={{ color: "var(--accent-rust)" }}
            ></i>{" "}
            Spent
          </div>
          <div className="stat-value">{formatCurrency(spent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <i
              className="fas fa-arrow-up"
              style={{ color: "var(--accent-emerald)" }}
            ></i>{" "}
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
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span>🍔 Food</span>
            <span>{formatCurrency(categorySpending?.Food || 0)}</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "3px",
            }}
          >
            <div
              style={{
                width: `${getCategoryPercentage("Food")}%`,
                height: "100%",
                background: "var(--accent-emerald)",
                borderRadius: "3px",
              }}
            ></div>
          </div>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span>🚗 Transport</span>
            <span>{formatCurrency(categorySpending?.Transport || 0)}</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "3px",
            }}
          >
            <div
              style={{
                width: `${getCategoryPercentage("Transport")}%`,
                height: "100%",
                background: "var(--accent-amber)",
                borderRadius: "3px",
              }}
            ></div>
          </div>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span>📱 Airtime</span>
            <span>{formatCurrency(categorySpending?.Airtime || 0)}</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "3px",
            }}
          >
            <div
              style={{
                width: `${getCategoryPercentage("Airtime")}%`,
                height: "100%",
                background: "var(--accent-mint)",
                borderRadius: "3px",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Fee Insight */}
      <div className="alert-section">
        <div className="alert-title">
          <i
            className="fas fa-exclamation-triangle"
            style={{ color: "var(--accent-amber)" }}
          ></i>{" "}
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
        {transactions && transactions.length > 0 ? (
          transactions.map((tx) => (
            <div className="alert-item" key={tx.id}>
              <div className="alert-left">
                <div
                  className="alert-icon"
                  style={{
                    background:
                      tx.amount < 0
                        ? "rgba(231,111,81,0.1)"
                        : "rgba(59,206,172,0.1)",
                  }}
                >
                  <i
                    className={
                      tx.amount < 0 ? "fas fa-arrow-up" : "fas fa-arrow-down"
                    }
                    style={{
                      color:
                        tx.amount < 0
                          ? "var(--accent-rust)"
                          : "var(--accent-emerald)",
                    }}
                  ></i>
                </div>
                <div className="alert-details">
                  <h4>{tx.counterparty || tx.description}</h4>
                  <p>
                    {new Date(tx.completionTime).toLocaleDateString("en-KE", {
                      hour: "2-digit",
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
                  <div
                    style={{ fontSize: "11px", color: "var(--accent-amber)" }}
                  >
                    +{formatCurrency(tx.fee)} fee
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
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
      </div>
    </div>
  );
};
