// src/components/wallet/WalletInfo.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import WalletAvatar from "./WalletAvatar";
import { formatAddress } from "../../utils/format";

const WalletInfo = ({ className = "" }) => {
  const { walletAddress } = useAuth();

  return (
    <div className={`wallet-info ${className}`}>
      <div className="flex items-center gap-3 p-3 bg-blue-900 bg-opacity-20 rounded-md wellet-info">
        {/* 지갑 아바타 추가 */}
        <div className="flex-shrink-0 profile">
          <WalletAvatar address={walletAddress} size={40} animation={true} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-grow">
          <div className="text-sm text-blue-300">Wallet Address:</div>
          <div className="flex items-center">
            <div className="font-mono bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
              {formatAddress(walletAddress)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
