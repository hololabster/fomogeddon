// src/components/layouts/Header.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WalletInfo from "../wallet/WalletInfo";

const Header = () => {
  const { isAuthenticated, walletAddress, disconnectWallet } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDisconnect = () => {
    disconnectWallet();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="left-wrap">
          <div>
            <h1
              className="text-2xl font-bold logo"
              onClick={() => navigate("/")}
            >
              FOMOGEDDON
            </h1>
            <p className="text-sm opacity-80">Cyberpunk Trading Simulator</p>
          </div>

          {isAuthenticated && (
            <nav>
              <ul>
                <li
                  className={isActive("/scenario") ? "select" : ""}
                  onClick={() => navigate("/scenario")}
                >
                  <h6>scenario</h6>
                </li>
                <li
                  className={isActive("/leaderboard") ? "select" : ""}
                  onClick={() => navigate("/leaderboard")}
                >
                  <h6>leaderboard</h6>
                </li>
              </ul>
            </nav>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <WalletInfo />
            <button
              onClick={handleDisconnect}
              className="btn btn-gray flex-1 disconnect-btn"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
