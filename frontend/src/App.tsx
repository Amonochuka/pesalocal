import React, { useState } from "react";
import { Layout } from "./core/Layout";
import { RoleSelection } from "./modules/onboarding/pages/RoleSelection";
import { PersonalDashboard } from "./modules/personal/pages/PersonalDashboard";
import { BusinessDashboard } from "./modules/business/pages/BusinessDashboard";
import { AppMode } from "./core/types";

function App() {
  const [mode, setMode] = useState<AppMode>("onboarding");
  const [alertCount] = useState(3);

  const handleSelectRole = (
    role: "personal" | "business" | "personal-business",
  ) => {
    setMode(role);
  };

  const renderContent = () => {
    switch (mode) {
      case "onboarding":
        return <RoleSelection onSelectRole={handleSelectRole} />;
      case "personal":
        return <PersonalDashboard />;
      case "business":
        return <BusinessDashboard />;
      case "personal-business":
        return (
          <div className="dashboard-grid">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className="glass-card p-5 cursor-pointer hover:border-emerald transition-all"
                onClick={() => setMode("personal")}
              >
                <div className="text-text-secondary mb-2">
                  <i className="fas fa-user mr-2"></i>Personal
                </div>
                <div className="text-3xl md:text-4xl font-bold font-display">
                  KSh 24,850
                </div>
                <div className="text-emerald text-sm mt-2">↑ 12%</div>
              </div>
              <div
                className="glass-card p-5 cursor-pointer hover:border-emerald transition-all"
                onClick={() => setMode("business")}
              >
                <div className="text-text-secondary mb-2">
                  <i className="fas fa-store mr-2"></i>Business
                </div>
                <div className="text-3xl md:text-4xl font-bold font-display">
                  KSh 12,450
                </div>
                <div className="text-emerald text-sm mt-2">↑ 8%</div>
              </div>
            </div>

            <div className="alert-section">
              <div className="alert-title">
                <i className="fas fa-bell"></i> Today's alerts
              </div>
              <div className="alert-item">
                <div className="alert-left">
                  <div className="alert-icon">
                    <i className="fas fa-store"></i>
                  </div>
                  <div className="alert-details">
                    <h4>Business: 2 customers owe KSh 900</h4>
                    <p>Mama Kevin, Boda John</p>
                  </div>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-left">
                  <div className="alert-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="alert-details">
                    <h4>Personal: KSh 420 in fees</h4>
                    <p>This month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout alertCount={alertCount}>
      <div className="pb-20 md:pb-0">{renderContent()}</div>
    </Layout>
  );
}

export default App;
