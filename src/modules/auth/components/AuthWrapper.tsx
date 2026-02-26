import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [view, setView] = useState<"login" | "register">("login");
  const { currentUser } = useAuthStore();

  if (currentUser) {
    return <>{children}</>;
  }

  if (view === "login") {
    return (
      <Login
        onNavigateToRegister={() => setView("register")}
        onLoginSuccess={() => {}} // Will redirect automatically via store
      />
    );
  }

  return (
    <Register
      onNavigateToLogin={() => setView("login")}
      onRegisterSuccess={() => {}} // Will redirect automatically via store
    />
  );
};
