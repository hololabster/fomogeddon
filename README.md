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


# ARIMA Model Implementation for FOMOGEDDON Chart Generation

## Algorithm Requirements

To enhance the realism and engagement in FOMOGEDDON's cryptocurrency trading simulation, we implemented a sophisticated price chart generation algorithm with the following requirements:

1. **Predictability with Learning Curve**: Generate data patterns that users can learn to recognize and predict with experience, creating motivation for continued engagement
2. **Realistic Market Dynamics**: Incorporate unpredictable elements including sudden price surges and crashes similar to real cryptocurrency markets
3. **Scenario-Based Events**: Allow for specific price movements triggered by predefined scenario events (like FTX collapse, Terra Luna crash, etc.)

## Implementation Approach: ARIMA Model

We selected the **ARIMA (Autoregressive Integrated Moving Average)** model as the core algorithm for price chart generation due to its ability to create time series data with both predictable patterns and stochastic elements.

### Why ARIMA for FOMOGEDDON?

ARIMA models are particularly suitable for our trading simulation because they:

- Create partially predictable patterns based on historical values (creating a learning opportunity)
- Incorporate random noise elements (maintaining unpredictability)
- Allow fine-tuning of parameters to achieve desired volatility levels
- Mimic actual financial time series data characteristics

## Technical Implementation

For FOMOGEDDON, we specifically implemented an **ARMA(1,1)** model, which is equivalent to **ARIMA(1,0,1)** (where the differencing parameter is zero). This configuration provides a good balance between pattern recognition and unpredictability.

### ARMA(1,1) Model Components Explained

The ARMA(1,1) model is defined by the equation:

$$Y_t = c + \phi Y_{t-1} + \theta \epsilon_{t-1} + \epsilon_t$$

Where:
- $Y_t$ is the current price value
- $c$ is a constant (baseline value)
- $\phi$ is the autoregressive (AR) coefficient
- $Y_{t-1}$ is the previous price value
- $\theta$ is the moving average (MA) coefficient
- $\epsilon_{t-1}$ is the previous random noise term
- $\epsilon_t$ is the current random noise term

### Code Implementation

```csharp
// ARIMA model (ARMA(1,1)) parameters
this.arCoefficient = 0.5;    // AR coefficient (φ)
this.maCoefficient = 0.4;    // MA coefficient (θ)
this.previousARIMAChange = 0.0;  // Previous change in price
this.previousNoise = 0.0;    // Previous random noise term

public StepResult Step(List<HistoryPoint> onChainData = null)
{
    // Dynamic volatility increases over time to create more challenging scenarios
    double dynamicVolatility = volatility * (1 + (currentStep / 100.0));
    
    // Generate current random noise term (Gaussian distribution)
    double arimaNoise = NextGaussian() * dynamicVolatility;
    
    // Calculate price change using ARMA(1,1) model
    double arimaChange = (arCoefficient * previousARIMAChange) + 
                         arimaNoise + 
                         (maCoefficient * previousNoise);
    
    // Store current values for next iteration
    previousNoise = arimaNoise;
    previousARIMAChange = arimaChange;
    
    // Warm-up period to start with smaller changes
    if (currentStep < warmupPeriod)
    {
        arimaChange *= (currentStep / (double)warmupPeriod);
    }

    // Random price spikes/crashes for additional unpredictability
    double spikeEffect = 0;
    if (random.NextDouble() < spikeProbability)
    {
        spikeEffect = NextGaussian() * spikeMagnitude;
    }
    
    // Additional code for event effects, trend components, etc.
}
```

## Parameter Tuning

The current implementation uses:
- **AR Coefficient (φ) = 0.5**: Creates moderate dependency on previous price changes
- **MA Coefficient (θ) = 0.4**: Incorporates previous random noise influence

These parameters were chosen to create price charts that:
1. Have visible patterns that reward attentive players
2. Maintain enough randomness to be challenging
3. Exhibit realistic autocorrelation typical in financial markets

## Enhanced Features

Beyond the basic ARMA model, we incorporated several enhancements:

1. **Dynamic Volatility**: Volatility increases as the simulation progresses, making later stages more challenging
2. **Warm-up Period**: Reduces volatility in early stages to allow users to adapt
3. **Random Spikes**: Low-probability but high-magnitude price movements to simulate market shocks
4. **Event-Triggered Effects**: Predetermined price impacts when specific scenario events are triggered

## Integration with Game Mechanics

The ARIMA model integrates with FOMOGEDDON's game mechanics by:

1. Creating price charts that reward pattern recognition skills
2. Providing enough volatility to make trading decisions challenging
3. Allowing scenario-specific price movements that align with the chosen historical events
4. Generating realistic market data that can be collected and used for future AI training

## Future Enhancements

Potential improvements to the price generation algorithm include:

1. Adaptive difficulty based on player performance
2. More complex ARIMA models (higher order p and q parameters)
3. Incorporation of seasonal components for longer timeframe simulations
4. Regime-switching models to simulate different market conditions
