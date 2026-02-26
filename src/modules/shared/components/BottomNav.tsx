// src/modules/shared/components/BottomNav.tsx
import React from "react";

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onImport: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activePage,
  onNavigate,
  onImport,
}) => {
  const navItems = [
    { id: "home", icon: "fa-home", label: "Home" },
    { id: "insights", icon: "fa-chart-simple", label: "Insights" },
    { id: "import", icon: "fa-plus-circle", label: "Add", isImport: true },
    { id: "history", icon: "fa-history", label: "History" },
    { id: "profile", icon: "fa-user", label: "Profile" },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activePage === item.id ? "active" : ""} ${item.isImport ? "import-btn" : ""}`}
          onClick={() => (item.isImport ? onImport() : onNavigate(item.id))}
        >
          <i className={`fas ${item.icon}`}></i>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
