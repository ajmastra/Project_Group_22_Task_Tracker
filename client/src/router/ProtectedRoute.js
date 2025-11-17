// src/router/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // Show loader while profile is being fetched
  if (loading) return <div>Loading...</div>;

  // If no user, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // User exists, render protected content
  return children;
}
