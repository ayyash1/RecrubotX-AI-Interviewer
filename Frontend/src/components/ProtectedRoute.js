import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getCurrentUser } from "../utils/userDatabase";

// Protected Route Component
// Wrap any route that requires authentication with this component
const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    // Redirect to login if not authenticated
    return <Navigate to="/candidate/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;

// Usage example in App.js:
// import ProtectedRoute from "./components/ProtectedRoute";
// <Route path="/candidate/dashboard" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
