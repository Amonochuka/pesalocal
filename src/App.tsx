import React, { useState, useEffect } from "react";
import { Layout } from "./core/Layout";
import { AuthWrapper } from "./modules/auth/components/AuthWrapper";
import { RoleSelection } from "./modules/onboarding/pages/RoleSelection";
import { PersonalDashboard } from "./modules/personal/pages/PersonalDashboard";
import { BusinessDashboard } from "./modules/business/pages/BusinessDashboard";
import { AppMode } from "./core/types";
import { useAuthStore } from "./store/authStore";
import { useUserId } from "./hooks/useCurrentUser";

function App() {
  const [mode, setMode] = useState<AppMode>("onboarding");
  const [alertCount] = useState(3);
  const userId = useUserId();
  const { currentUser } = useAuthStore();

  // Reset to onboarding if no mode is selected (but user is logged in)
  useEffect(() => {
    if (userId && mode === "onboarding") {
      // You could check if user has a preferred mode saved in preferences
      const savedMode = currentUser?.preferences?.defaultMode;
      if (savedMode) {
        setMode(savedMode as AppMode);
      }
    }
  }, [userId, mode, currentUser]);

  const handleSelectRole = (
    role: "personal" | "business" | "personal-business",
  ) => {
    setMode(role);
    // In the future, you could save this preference to the user's profile
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    setMode("onboarding");
  };

  const renderContent = () => {
    // If no user is logged in, AuthWrapper will show login/register
    // This content will only render when user is authenticated
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
            {/* Welcome Banner with User Info */}
            {currentUser && (
              <div className="glass-card p-4 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald/20 rounded-full flex items-center justify-center text-emerald font-bold">
                    {currentUser.businessName?.charAt(0) || "B"}
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Welcome back,</p>
                    <p className="font-medium">{currentUser.ownerName}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-text-secondary hover:text-rust transition-colors"
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            )}

            {/* Split View Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className="glass-card p-5 cursor-pointer hover:border-emerald transition-all group"
                onClick={() => setMode("personal")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-text-secondary">
                    <i className="fas fa-user mr-2 text-emerald"></i>Personal
                  </div>
                  <i className="fas fa-arrow-right text-emerald opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
                <div className="text-3xl md:text-4xl font-bold font-display">
                  KSh 24,850
                </div>
                <div className="text-emerald text-sm mt-2 flex items-center gap-1">
                  <i className="fas fa-arrow-up text-xs"></i> 12% from last
                  month
                </div>
              </div>

              <div
                className="glass-card p-5 cursor-pointer hover:border-emerald transition-all group"
                onClick={() => setMode("business")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-text-secondary">
                    <i className="fas fa-store mr-2 text-emerald"></i>Business
                  </div>
                  <i className="fas fa-arrow-right text-emerald opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
                <div className="text-3xl md:text-4xl font-bold font-display">
                  KSh 12,450
                </div>
                <div className="text-emerald text-sm mt-2 flex items-center gap-1">
                  <i className="fas fa-arrow-up text-xs"></i> 8% from last month
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="alert-section">
              <div className="alert-title">
                <i className="fas fa-bell text-amber"></i> Today's alerts
              </div>

              <div className="alert-item">
                <div className="alert-left">
                  <div className="alert-icon bg-rust/10">
                    <i className="fas fa-store text-rust"></i>
                  </div>
                  <div className="alert-details">
                    <h4>Business: 2 customers owe KSh 900</h4>
                    <p>Mama Kevin (500) · Boda John (400)</p>
                  </div>
                </div>
              </div>

              <div className="alert-item">
                <div className="alert-left">
                  <div className="alert-icon bg-amber/10">
                    <i className="fas fa-coins text-amber"></i>
                  </div>
                  <div className="alert-details">
                    <h4>Personal: KSh 420 paid in fees</h4>
                    <p>This month · 20% excise duty included</p>
                  </div>
                </div>
              </div>

              <div className="alert-item">
                <div className="alert-left">
                  <div className="alert-icon bg-emerald/10">
                    <i className="fas fa-boxes text-emerald"></i>
                  </div>
                  <div className="alert-details">
                    <h4>Low stock alert: 2 items</h4>
                    <p>Tomatoes (2kg) · Onions (1kg)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setMode("personal")}
                className="glass-card p-4 text-center hover:border-emerald transition-all"
              >
                <i className="fas fa-chart-line text-emerald text-xl mb-2"></i>
                <p className="text-sm">View Personal</p>
              </button>
              <button
                onClick={() => setMode("business")}
                className="glass-card p-4 text-center hover:border-emerald transition-all"
              >
                <i className="fas fa-store text-emerald text-xl mb-2"></i>
                <p className="text-sm">View Business</p>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthWrapper>
      <Layout alertCount={alertCount}>
        <div className="pb-20 md:pb-0">{renderContent()}</div>
      </Layout>
    </AuthWrapper>
  );
}

export default App;
