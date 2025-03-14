// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MonadAITradingRecorder {
    struct OffChainTrade {
        string tradeType;         // "opened", "leveraged", "closed"
        string position;          // "long", "short", "5XLong", ...
        uint256 price;            // price at moment (if applicable)
        uint256 amount;           // amount of the position
        uint256 investment;       // for "opened" (if applicable)
        uint256 leverage;         // for "leveraged" (if applicable)
        string previousPosition;  // for "leveraged" (if needed)
        uint256 entryPrice;       // for "closed" (if needed)
        uint256 exitPrice;        // for "closed" (if needed)
        int256 pnl;               // for "closed" (if needed)
    }

    // Each user can store multiple arrays of trades (e.g. multiple batches)
    // Or just store them in a single array, depending on your design.
    mapping(address => OffChainTrade[]) public userTradeHistory;

    event BatchTradeSaved(address indexed user, uint256 count);

    // Save an array of trades in a single transaction
    function batchSaveUserTrades(OffChainTrade[] calldata _trades) external {
        for (uint256 i = 0; i < _trades.length; i++) {
            userTradeHistory[msg.sender].push(_trades[i]);
        }
        emit BatchTradeSaved(msg.sender, _trades.length);
    }

    // Retrieve entire trade history for a user
    function getUserTrades(address _user) external view returns (OffChainTrade[] memory) {
        return userTradeHistory[_user];
    }

    // Retrieve trade count for a user
    function getTradeCount(address _user) external view returns (uint256) {
        return userTradeHistory[_user].length;
    }

    // Retrieve a single trade by index
    function getTradeByIndex(address _user, uint256 _index) external view returns (OffChainTrade memory) {
        require(_index < userTradeHistory[_user].length, "Index out of range");
        return userTradeHistory[_user][_index];
    }
}