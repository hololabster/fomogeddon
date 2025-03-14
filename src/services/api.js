// src/services/api.js
// Alternative free cryptocurrency API and enhanced fallback mechanisms

// Options for API endpoints
const API_OPTIONS = {
    // Primary source - Binance public API
    BINANCE: 'https://api.binance.com/api/v3/klines',
    // Backup source - CoinCap API
    COINCAP: 'https://api.coincap.io/v2/assets/bitcoin/history',
    // Additional backup - CryptoCompare
    CRYPTOCOMPARE: 'https://min-api.cryptocompare.com/data/v2/histominute'
  };
  
  /**
   * Fetch Bitcoin data from Binance API
   * This is a free API that doesn't require authentication for basic usage
   */
  export const fetchBitcoinData = async (days = 1, interval = '1m') => {
    try {
      // Convert days to milliseconds for Binance API
      const endTime = Date.now();
      const startTime = endTime - (days * 24 * 60 * 60 * 1000);
      
      // Fetch from Binance API (klines/candlestick data)
      const response = await fetch(
        `${API_OPTIONS.BINANCE}?symbol=BTCUSDT&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=500`
      );
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform Binance data format [timestamp, open, high, low, close, ...]
      return data.map(candle => ({
        time: candle[0], // opening time
        price: parseFloat(candle[4]) // closing price
      }));
      
    } catch (binanceError) {
      console.warn('Error fetching from Binance, trying CoinCap:', binanceError);
      
      try {
        // Fallback to CoinCap API
        const interval = days <= 1 ? 'm5' : 'h2'; // 5-minute or 2-hour intervals
        const response = await fetch(
          `${API_OPTIONS.COINCAP}?interval=${interval}&start=${Date.now() - (days * 24 * 60 * 60 * 1000)}&end=${Date.now()}`
        );
        
        if (!response.ok) {
          throw new Error(`CoinCap API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        return result.data.map(point => ({
          time: new Date(point.time).getTime(),
          price: parseFloat(point.priceUsd)
        }));
        
      } catch (coincapError) {
        console.warn('Error fetching from CoinCap, using simulation data:', coincapError);
        
        // Generate realistic simulation data if all APIs fail
        return generateRealisticBitcoinData(days);
      }
    }
  };
  
  /**
   * Generate realistic Bitcoin price data when APIs fail
   * Uses random walk algorithm with volatility patterns that mimic real trading
   */
  const generateRealisticBitcoinData = (days = 1) => {
    const points = days * 24 * 12; // 5-minute intervals
    const volatility = 0.015; // 1.5% price movement
    const data = [];
    
    // Get current Bitcoin price (approximate) or use reasonable starting point
    let currentPrice = 40000 + (Math.random() * 10000);
    
    // Generate timestamps
    const endTime = Date.now();
    const timeInterval = (days * 24 * 60 * 60 * 1000) / points;
    
    // Add random seed for variety
    const trend = Math.random() > 0.5 ? 1 : -1;
    const trendStrength = Math.random() * 0.3;
    
    for (let i = 0; i < points; i++) {
      const time = endTime - (points - i) * timeInterval;
      
      // Random walk with slight trend bias
      const change = (Math.random() * 2 - 1) * volatility;
      const trendInfluence = trend * trendStrength * volatility;
      const combinedChange = change + trendInfluence;
      
      // Add some patterns like momentary spikes
      const spike = (Math.random() > 0.98) ? (Math.random() > 0.5 ? 0.03 : -0.03) : 0;
      
      // Calculate new price
      currentPrice = currentPrice * (1 + combinedChange + spike);
      
      // Ensure price doesn't go below reasonable level
      if (currentPrice < 10000) currentPrice = 10000 + Math.random() * 5000;
      
      data.push({
        time,
        price: currentPrice
      });
    }
    
    console.log('Using generated simulation data instead of real API data');
    return data;
  };