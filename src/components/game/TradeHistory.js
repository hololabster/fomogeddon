// src/components/game/TradeHistory.js
import React from 'react';

const TradeHistory = ({ gameHistory }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Trade History</h2>
      
      {gameHistory.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No trades yet.
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {gameHistory.map((record, index) => (
            <div key={index} className="border-b border-gray-100 py-2 last:border-0">
              {record.type === 'opened' ? (
                <div>
                  <div className={`font-medium ${
                    record.position === 'long' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Opened {record.position.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Price: ${record.price.toFixed(2)} | Amount: {record.amount.toFixed(6)} BTC
                  </div>
                </div>
              ) : (
                <div>
                  <div className={`font-medium ${
                    record.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Closed {record.position.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Entry: ${record.entryPrice.toFixed(2)} | Exit: ${record.exitPrice.toFixed(2)}
                  </div>
                  <div className={`text-sm ${record.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    P&L: ${record.pnl.toFixed(2)} ({((record.pnl / 1000) * 100).toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
