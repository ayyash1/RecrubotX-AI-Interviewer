import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Route guard for superuser pages.
 * Checks for a valid superuserToken in localStorage.
 * Redirects to /superuser/signin if not authenticated.
 */
const SuperuserProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("superuserToken");

    if (!token) {
        return <Navigate to="/superuser/signin" replace />;
    }

    // Basic JWT expiry check (decode payload without verification)
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("superuserToken");
            localStorage.removeItem("superuserUser");
            return <Navigate to="/superuser/signin" replace />;
        }
        if (payload.role !== "superuser") {
            return <Navigate to="/superuser/signin" replace />;
        }
    } catch {
        localStorage.removeItem("superuserToken");
        return <Navigate to="/superuser/signin" replace />;
    }

    return children;
};

export default SuperuserProtectedRoute;
