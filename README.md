# FOMOGEDDON

**Cyberpunk Trading Simulator**<br>
Test your trading skills in historical cryptocurrency scenarios. Make the right calls, avoid FOMO, and prove your trading expertise in this high-stakes simulation.

**Exclusively on Monad Testnet**

## Overview

FOMOGEDDON immerses players in an addictive gaming experience and stores all their trading decisions on the Monad blockchain, creating the foundation for training future AI systems.

Choose a scenario and play the game!

> All trading occurs in simulation mode – no real assets are involved.

## Key Differentiators

**Immersive Gaming Experience**

- Execute long/short positions in a cyberpunk-styled neon interface
- Emotional feedback with screens that vibrate and colors that explode according to price movements
- Scenarios based on real historical events (FTX collapse, Terra Luna crisis)

<br>

**Leveraging Monad's High Performance**

- Batch processing of thousands of players' data in real-time
- Capturing every micro trading decision with 10,000 TPS processing capability
- On-chain compression and structured storage of data with high-efficiency EVM

<br>

**Data Repository for Future AI Learning**

- Storage of trading patterns, market reactions, and psychological indicators in structured format
- Accumulation of rich response data for various scenarios and market conditions
- Creating a valuable foundation for future trading AI development

## Technical Advantages

**Data Collection**

- Capturing all micro-data including timing, psychological indicators, and position size—not just wins/losses

<br>

**Real-time Processing**

- Processing data from thousands of simultaneous players without delay using Monad's high performance

<br>

**Structured Data**

- Normalizing and patterning data directly on-chain, storing it in a format optimized for future AI learning

## Features

- **Scenario-based Trading**: Experience historical or fictional market events
  - Select Scenario
    - **FTX Collapse (Nov 2022)** - Market crash triggered by the insolvency and bankruptcy of FTX, the second-largest crypto exchange _(Expected Impact: -25% ~ -15%)_
    - **BitMEX CFTC Charges (Oct 2020)** - Market shock from BitMEX executives being charged with violating AML regulations _(Expected Impact: -15% ~ -8%)_
    - **Ethereum Merge (Sep 2022)** - Ethereum's transition from Proof of Work to Proof of Stake _(Expected Impact: 5% ~ 15%)_
    - **Tesla Bitcoin Purchase (Feb 2021)** - Tesla announces $1.5B Bitcoin purchase and plans to accept BTC as payment _(Expected Impact: 10% ~ 20%)_
- **China Crypto Ban (Sep 2021)** - People's Bank of China declares all crypto transactions illegal _(Expected Impact: -18% ~ -10%)_
- **Real-time Data**: Connect to cryptocurrency price feeds
- **Cyberpunk UI**: Immersive trading interface with cyberpunk visual elements
- **Leaderboard System**: Compete with other traders
- **Game-like Experience**: Engaging trading environment with sound effects and visual feedback
- **Wallet Connected**: Exclusively on Monad Testnet
  - Compatible with MetaMask, WalletConnect, and other Web3 wallets

## Project Structure

```
FOMOGEDDON/
├── .vscode/               # VSCode configuration
├── node_modules/          # NPM packages
├── public/                # Static assets
├── smart-contract/        # Smart contract integration
├── src/                   # Source code
│   ├── backend/           # Backend services
│   ├── components/        # React components
│   │   ├── effects/       # Visual effects
│   │   ├── game/          # Game-related components
│   │   ├── layouts/       # Layout components
│   │   ├── leaderboard/   # Leaderboard components
│   │   ├── modals/        # Modal dialogs
│   │   └── wallet/        # Wallet components
│   ├── context/           # React context providers
│   ├── data/              # Data files
│   │   ├── chartData.js   # Chart data
│   │   └── scenarios.js   # Trading scenarios
│   ├── pages/             # Page components
│   ├── routes/            # Application routes
│   ├── services/          # API services
│   ├── stores/            # State management
│   ├── styles/            # CSS and styled components
│   └── utils/             # Utility functions
│   ├── App.js             # Main application component
│   ├── fonts.js           # Font configuration
│   └── index.js           # Application entry point
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── package-lock.json      # NPM lock file
├── package.json           # NPM package configuration
├── pnpm-lock.yaml         # PNPM lock file
├── postcss.config.js      # PostCSS configuration
├── README.md              # Project documentation
└── tailwind.config.js     # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git@gitlab.com:AURA2285416/fomogeddon.git

   cd fomogeddon
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
