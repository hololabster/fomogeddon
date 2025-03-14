// src/components/layouts/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, checkNetwork } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  // Add a small delay to ensure localStorage is checked properly
  // Also verify network status
  useEffect(() => {
    const verifyAuthAndNetwork = async () => {
      // Check network if authenticated
      if (isAuthenticated) {
        await checkNetwork();
      }

      // After all checks, update checking state
      setTimeout(() => {
        setChecking(false);
      }, 500);
    };

    verifyAuthAndNetwork();
  }, [isAuthenticated, checkNetwork]);

  // Show loading indicator while checking auth state
  if (isLoading || checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-blue-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Debug - log authentication state
  // console.log("Auth state:", {
  //   isAuthenticated,
  //   walletAddress: localStorage.getItem("walletAddress"),
  // });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated, render child routes
  // The network check modal will be rendered automatically by AuthContext if needed
  return <Outlet />;
};

export default ProtectedRoute;
