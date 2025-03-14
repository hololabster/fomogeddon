// src/components/game/WalletStatus.js
import React from 'react';

const WalletStatus = ({ wallet, position, entryPrice, pnl }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Cash</div>
          <div className="text-lg font-bold">${wallet.cash.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Bitcoin</div>
          <div className="text-lg font-bold">{wallet.bitcoin.toFixed(6)} BTC</div>
        </div>
      </div>
      
      {/* Position info */}
      <div className="bg-gray-50 p-3 rounded-md">
        <div className="text-sm text-gray-500">Current Position</div>
        <div className="flex justify-between items-center">
          <div className={`font-bold ${
            position === 'long' ? 'text-green-600' : 
            position === 'short' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {position === 'long' ? 'LONG' : 
             position === 'short' ? 'SHORT' : 'None'}
          </div>
          {position !== 'neutral' && (
            <div className="text-sm">
              Entry: ${entryPrice.toFixed(2)}
            </div>
          )}
        </div>
        
        {position !== 'neutral' && (
          <div className={`mt-2 text-right ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            P&L: ${pnl.toFixed(2)} ({((pnl / 1000) * 100).toFixed(2)}%)
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletStatus;
