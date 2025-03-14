// src/services/updatedSimulator.js
export class simulatorEngine {
  constructor(initialPrice, scenario) {
    this.price = initialPrice;
    this.history = [{ time: Date.now(), price: this.price }];
    this.scenario = scenario;
    this.eventTriggered = false;
    this.eventProgress = 0;
    this.eventTotalSteps = 0;
    this.eventImpactPerStep = 0;
    this.randomSeed = Math.random() * 100;

    // Event trigger range (50-150 steps)
    this.eventTriggerPoint = 50 + Math.floor(Math.random() * 100);

    // Simulation settings
    this.totalGameSteps = 200;
    this.currentStep = 0;
    this.currentDataIndex = 0;

    // Market behavior factors
    this.volatilityMultiplier = 1.0; // Can be adjusted based on scenario
    this.trendStrength = Math.random() * 0.3;

    // Ensure we have some initial data points
    this.addInitialDataPoints();
  }

  // Add initial data points to make the chart look better on start
  addInitialDataPoints() {
    const now = Date.now();

    // Add a few historical points with slight variations
    for (let i = 19; i > 0; i--) {
      const historicalTime = now - i * 1000;
      const variation = (Math.random() * 0.2 - 0.1) / 100;
      const historicalPrice = this.price * (1 + variation);

      // Add at the beginning to maintain chronological order
      this.history.unshift({ time: historicalTime, price: historicalPrice });
    }
  }

  // Step the simulation forward using real data from API
  step(apiData = null) {
    this.currentStep++;
    const now = Date.now();

    let priceChange = 0;
    let newPrice = this.price;

    // If we have API data, use it instead of generating random movements
    if (apiData && apiData.length > 0) {
      // Use data points from the API in sequence
      this.currentDataIndex = (this.currentDataIndex + 1) % apiData.length;

      // Get current and previous data points
      const currentDataPoint = apiData[this.currentDataIndex];
      const prevDataPoint =
        apiData[
          this.currentDataIndex > 0
            ? this.currentDataIndex - 1
            : apiData.length - 1
        ];

      if (currentDataPoint && prevDataPoint) {
        // Calculate percentage change from the API data
        const realPercentChange =
          (currentDataPoint.price / prevDataPoint.price - 1) * 100;

        // Use real change with some randomness for variety
        const randomFactor = Math.random() * 0.4 - 0.2; // Small random adjustment ±0.2%
        priceChange = realPercentChange + randomFactor;

        // Update the time to be current
        const timeStamp = now - (this.totalGameSteps - this.currentStep) * 1000;

        // Apply event effects if active
        if (this.eventTriggered && this.eventProgress < this.eventTotalSteps) {
          priceChange += this.getEventEffect();
          this.eventProgress++;
        }

        // Check for event trigger
        if (
          !this.eventTriggered &&
          this.currentStep >= this.eventTriggerPoint
        ) {
          this.triggerEvent();
        }

        // Calculate new price
        newPrice = this.price * (1 + priceChange / 100);

        // Add to history with current timestamp
        this.history.push({
          time: timeStamp,
          price: newPrice,
        });
      }
    } else {
      // Fallback to random movement if no API data
      const baseChange =
        (Math.random() * 0.5 - 0.25) * this.volatilityMultiplier;

      // Apply event effect if active
      if (this.eventTriggered && this.eventProgress < this.eventTotalSteps) {
        priceChange = baseChange + this.getEventEffect();
        this.eventProgress++;
      } else {
        priceChange = baseChange;
      }

      // Check for event trigger
      if (!this.eventTriggered && this.currentStep >= this.eventTriggerPoint) {
        this.triggerEvent();
      }

      // Calculate new price
      newPrice = this.price * (1 + priceChange / 100);

      // Add to history
      this.history.push({
        time: now,
        price: newPrice,
      });
    }

    // Update current price
    this.price = newPrice;

    // Keep history to reasonable size
    // if (this.history.length > 100) {
    //   this.history = this.history.slice(-100);
    // }

    return {
      time: this.history[this.history.length - 1].time,
      price: this.price,
      percentChange: priceChange,
      isEventActive:
        this.eventTriggered && this.eventProgress < this.eventTotalSteps,
      currentStep: this.currentStep,
      totalSteps: this.totalGameSteps,
    };
  }

  // Get current event effect value
  getEventEffect() {
    // Basic effect with some randomness
    const eventRandomness =
      (Math.random() * 0.3 - 0.15) * this.eventImpactPerStep;
    return this.eventImpactPerStep + eventRandomness;
  }

  // Trigger the scenario event
  triggerEvent() {
    this.eventTriggered = true;

    // Extend event duration for more impact
    this.eventTotalSteps = this.scenario.eventDuration * 1;

    // Random impact within scenario range
    const impactMagnitude =
      this.scenario.eventImpact.min +
      Math.random() *
        (this.scenario.eventImpact.max - this.scenario.eventImpact.min);

    // Distribute impact over duration
    this.eventImpactPerStep = impactMagnitude / this.eventTotalSteps;

    return {
      name: this.scenario.name,
      description: this.scenario.eventDescription,
      impact: impactMagnitude,
    };
  }

  // Get current history
  getHistory() {
    return this.history.map((point) => ({
      time: point.time,
      price:
        typeof point.price === "number" ? point.price : parseFloat(point.price),
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
      isActive: this.eventProgress < this.eventTotalSteps,
    };
  }
}

export default simulatorEngine;
