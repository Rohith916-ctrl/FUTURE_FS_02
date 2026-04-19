import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#f8fafc",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.35)"
          }
        }}
      />
    </AuthProvider>
  );
}