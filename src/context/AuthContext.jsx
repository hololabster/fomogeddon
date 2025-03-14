// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import NetworkSwitchModal from "../components/modals/NetworkSwitchModal";
import { MONAD_NETWORK } from "./Network.constant";

// Create auth context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  // Check if connected to Monad Testnet
  const checkNetwork = async () => {
    if (!window.ethereum) return true; // Skip check if no ethereum provider

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const isMonad = chainId === MONAD_NETWORK.chainId;

      setIsCorrectNetwork(isMonad);
      setShowNetworkModal(!isMonad && isAuthenticated);

      return isMonad;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedAddress = localStorage.getItem("walletAddress");

      if (savedAddress) {
        setWalletAddress(savedAddress);
        setIsAuthenticated(true);
        console.log("Auth restored from localStorage:", savedAddress);

        // Check network after authentication is restored
        await checkNetwork();
      } else {
        console.log("No wallet address found in localStorage");
      }

      setIsLoading(false);
    };

    // Slight delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 300);
    return () => clearTimeout(timer);
  }, []);

  // Listen for network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async (chainId) => {
        console.log("Chain changed to:", chainId);
        const isMonad = chainId === MONAD_NETWORK.chainId;

        setIsCorrectNetwork(isMonad);
        setShowNetworkModal(!isMonad && isAuthenticated);
      };

      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", (accounts) => {
        // If user disconnected their wallet in MetaMask
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          // If user switched accounts, update the wallet address
          setWalletAddress(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);

          // Check network again with new account
          checkNetwork();
        }
      });

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("accountsChanged", () => {});
      };
    }
  }, [walletAddress, isAuthenticated]);

  // Listen for storage changes (if user logs in from another tab)
  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === "walletAddress") {
        if (e.newValue) {
          setWalletAddress(e.newValue);
          setIsAuthenticated(true);

          // Check network when authentication changes
          await checkNetwork();
        } else {
          setWalletAddress("");
          setIsAuthenticated(false);
          setShowNetworkModal(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      // Check if browser has ethereum provider
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const address = accounts[0];

          // Store wallet address
          setWalletAddress(address);
          setIsAuthenticated(true);
          localStorage.setItem("walletAddress", address);

          console.log("Wallet connected successfully:", address);

          // Check network after successful connection
          await checkNetwork();

          return { success: true, address };
        } catch (error) {
          console.error("User denied account access:", error);
          return { success: false, error: "User denied account access" };
        }
      } else {
        // For demo/testing, create a mock address
        const mockAddress =
          "0x" + Math.random().toString(16).slice(2, 12) + "...";
        setWalletAddress(mockAddress);
        setIsAuthenticated(true);
        localStorage.setItem("walletAddress", mockAddress);

        // For demo, assume correct network
        setIsCorrectNetwork(true);
        setShowNetworkModal(false);

        console.log("Mock wallet created:", mockAddress);
        return { success: true, address: mockAddress, demo: true };
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      return { success: false, error: "Failed to connect wallet" };
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setWalletAddress("");
    setIsAuthenticated(false);
    setShowNetworkModal(false);
    localStorage.removeItem("walletAddress");
    console.log("Wallet disconnected");
  };

  // Value object to be provided to consumers
  const value = {
    walletAddress,
    isAuthenticated,
    isLoading,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    checkNetwork,
  };

  const handleNetworkSwitch = async () => {
    const isMonad = await checkNetwork();
    if (isMonad) {
      setShowNetworkModal(false);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <NetworkSwitchModal
        isOpen={showNetworkModal}
        onNetworkSwitch={handleNetworkSwitch}
      />
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
