// src/modules/personal/pages/PersonalDashboard.tsx
import React from "react";

export const PersonalDashboard: React.FC = () => {
  return (
    <div className="dashboard-grid">
      {/* Balance Card */}
      <div className="balance-card">
        <div style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
          Total Balance
        </div>
        <div className="balance-amount">KSh 24,850</div>
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
          <div className="stat-value">KSh 18,420</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <i
              className="fas fa-arrow-up"
              style={{ color: "var(--accent-emerald)" }}
            ></i>{" "}
            Received
          </div>
          <div className="stat-value">KSh 22,150</div>
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
            <span>KSh 8,450</span>
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
                width: "45%",
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
            <span>KSh 3,200</span>
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
                width: "17%",
                height: "100%",
                background: "var(--accent-amber)",
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
              <h4>KSh 420 paid in M-PESA fees</h4>
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
        <div className="alert-item">
          <div className="alert-left">
            <div
              className="alert-icon"
              style={{ background: "rgba(231,111,81,0.1)" }}
            >
              <i
                className="fas fa-arrow-up"
                style={{ color: "var(--accent-rust)" }}
              ></i>
            </div>
            <div className="alert-details">
              <h4>Sent to John</h4>
              <p>Today, 09:45</p>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>-KSh 500</div>
            <div style={{ fontSize: "11px", color: "var(--accent-amber)" }}>
              +KSh 30 fee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

