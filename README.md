# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

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
