// src/services/simulator.js - Extended duration version
export class SimulatorEngine {
    constructor(initialPrice, scenario) {
      this.price = initialPrice;
      this.history = [{ time: Date.now(), price: this.price }];
      this.scenario = scenario;
      this.eventTriggered = false;
      this.eventProgress = 0;
      this.eventTotalSteps = 0;
      this.eventImpactPerStep = 0;
      this.randomSeed = Math.random() * 100;
      
      // Extend the event trigger range significantly (50-100 steps)
      this.eventTriggerPoint = 50 + Math.floor(Math.random() * 50); 
      
      // Extended duration settings
      this.totalGameSteps = 200; // Set a much longer total game duration
      this.currentStep = 0;
      
      // Trend factors to make price movement more realistic
      this.trendDirection = Math.random() > 0.5 ? 1 : -1;
      this.trendStrength = Math.random() * 0.3;
      this.trendChangeProbability = 0.05; // 5% chance to change trend each step
      
      // Market volatility
      this.volatility = 0.015; // Base volatility
      
      // Add slow start with less volatile price movement
      this.warmupPeriod = 15;
      
      // Ensure we have some initial data points
      this.addInitialDataPoints();
    }
    
    // Add some initial data points to make the chart look better
    addInitialDataPoints() {
      const now = Date.now();
      
      // Add 10 historical points with slight variations to create a nice starting chart
      for (let i = 9; i > 0; i--) {
        const historicalTime = now - (i * 1000); // 1 second apart
        const variation = (Math.random() * 0.5 - 0.25) / 100; // Small variation
        const historicalPrice = this.price * (1 + variation);
        
        // Add at the beginning to maintain chronological order
        this.history.unshift({ time: historicalTime, price: historicalPrice });
      }
    }
    
    // Calculate next price step
    step(onChainData = null) {
      this.currentStep++;
      const now = Date.now();
      let baseChange;
      
      // Possibly change trend
      if (Math.random() < this.trendChangeProbability) {
        this.trendDirection *= -1;
        this.trendStrength = Math.random() * 0.3;
      }
      
      // Increase volatility over time for more excitement
      const dynamicVolatility = this.volatility * (1 + (this.currentStep / 100));
      
      // Use real onchain data if available
      if (onChainData && onChainData.length > 1) {
        const latestPrice = onChainData[onChainData.length - 1].price;
        const prevPrice = onChainData[onChainData.length - 2].price;
        const realPercentChange = ((latestPrice / prevPrice) - 1) * 100;
        
        // Real change + some randomness + trend
        baseChange = (realPercentChange * 0.3) + 
                     (Math.random() * dynamicVolatility * 2 - dynamicVolatility) +
                     (this.trendDirection * this.trendStrength * dynamicVolatility);
      } else {
        // Random change if no onchain data
        baseChange = (Math.random() * dynamicVolatility * 2 - dynamicVolatility) +
                     (this.trendDirection * this.trendStrength * dynamicVolatility);
      }
      
      // Reduce volatility during warm-up period
      if (this.currentStep < this.warmupPeriod) {
        baseChange *= (this.currentStep / this.warmupPeriod);
      }
      
      // Check for event trigger
      if (!this.eventTriggered && this.currentStep >= this.eventTriggerPoint) {
        this.triggerEvent();
      }
      
      // Apply event effect if active
      let eventEffect = 0;
      if (this.eventTriggered && this.eventProgress < this.eventTotalSteps) {
        eventEffect = this.eventImpactPerStep;
        this.eventProgress++;
        
        // Add some randomness to event impact for realism
        const eventRandomness = (Math.random() * 0.5 - 0.25) * this.eventImpactPerStep;
        eventEffect += eventRandomness;
      }
      
      // Calculate final percent change
      const percentChange = baseChange + eventEffect;
      
      // Update price
      this.price = this.price * (1 + percentChange / 100);
      
      // Add to history with current timestamp
      this.history.push({ time: now, price: this.price });
      
      // Keep only latest 100 points
      if (this.history.length > 100) {
        this.history = this.history.slice(-100);
      }
      
      return {
        time: now,
        price: this.price,
        percentChange,
        isEventActive: this.eventTriggered && this.eventProgress < this.eventTotalSteps,
        currentStep: this.currentStep,
        totalSteps: this.totalGameSteps
      };
    }
    
    // Trigger the scenario event
    triggerEvent() {
      this.eventTriggered = true;
      
      // Extend event duration to 3x its original value
      this.eventTotalSteps = this.scenario.eventDuration * 3;
      
      // Random impact within range
      const impactMagnitude = this.scenario.eventImpact.min + 
                            Math.random() * (this.scenario.eventImpact.max - this.scenario.eventImpact.min);
      
      // Distribute impact over duration - but with a stronger initial impact
      this.eventImpactPerStep = impactMagnitude / this.eventTotalSteps;
      
      return {
        name: this.scenario.name,
        description: this.scenario.eventDescription,
        impact: impactMagnitude
      };
    }
    
    // Get price history - ensure consistent format
    getHistory() {
      return this.history.map(point => ({
        time: point.time,
        price: typeof point.price === 'number' ? point.price : parseFloat(point.price)
      }));
    }
    
    // Get current price
    getCurrentPrice() {
      return this.price;
    }
    
    // Check if game is complete
    isGameComplete() {
      return this.currentStep >= this.totalGameSteps;
    }
    
    // Get game progress percentage
    getGameProgress() {
      return (this.currentStep / this.totalGameSteps) * 100;
    }
    
    // Check if event is active
    isEventActive() {
      return this.eventTriggered && this.eventProgress < this.eventTotalSteps;
    }
    
    // Get event information
    getEventInfo() {
      if (!this.eventTriggered) {
        return null;
      }
      
      return {
        name: this.scenario.name,
        description: this.scenario.eventDescription,
        progress: this.eventProgress,
        total: this.eventTotalSteps,
        isActive: this.eventProgress < this.eventTotalSteps
      };
    }
  }