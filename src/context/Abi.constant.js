export const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "BatchTradeSaved",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "tradeType",
            type: "string",
          },
          {
            internalType: "string",
            name: "position",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "investment",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "leverage",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "previousPosition",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "entryPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "exitPrice",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "pnl",
            type: "int256",
          },
        ],
        internalType: "struct MonadAITradingRecorder.OffChainTrade[]",
        name: "_trades",
        type: "tuple[]",
      },
    ],
    name: "batchSaveUserTrades",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "getTradeByIndex",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "tradeType",
            type: "string",
          },
          {
            internalType: "string",
            name: "position",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "investment",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "leverage",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "previousPosition",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "entryPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "exitPrice",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "pnl",
            type: "int256",
          },
        ],
        internalType: "struct MonadAITradingRecorder.OffChainTrade",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getTradeCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getUserTrades",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "tradeType",
            type: "string",
          },
          {
            internalType: "string",
            name: "position",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "investment",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "leverage",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "previousPosition",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "entryPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "exitPrice",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "pnl",
            type: "int256",
          },
        ],
        internalType: "struct MonadAITradingRecorder.OffChainTrade[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userTradeHistory",
    outputs: [
      {
        internalType: "string",
        name: "tradeType",
        type: "string",
      },
      {
        internalType: "string",
        name: "position",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "investment",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "leverage",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "previousPosition",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "entryPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "exitPrice",
        type: "uint256",
      },
      {
        internalType: "int256",
        name: "pnl",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
