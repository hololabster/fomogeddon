// src/components/game/Chart.js
import React, { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CyberpunkChart = ({ data, currentPrice, percentChange }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  
  // Add a flashing pulse effect to the chart
  useEffect(() => {
    // Add pulse effect on data update
    if (chartContainerRef.current) {
      chartContainerRef.current.classList.add('chart-pulse');
      setTimeout(() => {
        if (chartContainerRef.current) {
          chartContainerRef.current.classList.remove('chart-pulse');
        }
      }, 500);
    }
  }, [data.length]); // This will trigger when new data points are added

  // Ensure data is properly formatted and has a minimum length
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) {
      // Generate dummy data if no real data
      return Array(10).fill(0).map((_, i) => ({
        time: Date.now() - (10 - i) * 1000,
        price: currentPrice * (0.99 + Math.random() * 0.02)
      }));
    }
    
    // Convert data to proper format if needed 
    return data.map(point => ({
      time: point.time,
      price: typeof point.price === 'number' ? point.price : parseFloat(point.price)
    }));
  }, [data, currentPrice]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="time">{new Date(label).toLocaleTimeString()}</p>
          <p className="price">Price: ${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="price-chart-container cyber-card" ref={chartContainerRef}>
      <div className="price-header">
        <div className="price-title">Bitcoin (BTC)</div>
        <div className="flex items-center">
          <div className="price-value">${currentPrice.toFixed(2)}</div>
          <div className={`price-change ${percentChange > 0 ? 'price-change-positive' : percentChange < 0 ? 'price-change-negative' : 'price-change-neutral'}`}>
            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="chart-container" ref={chartRef}>
        {/* Add glowing effect overlay */}
        <div className="chart-glow-effect"></div>
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={processedData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 179, 255, 0.1)" />
            <XAxis 
              dataKey="time"
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
              }}
              stroke="#8884d8"
              tick={{ fill: '#00b3ff', fontSize: 12 }}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#8884d8"
              tick={{ fill: '#00b3ff', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffdd" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00ffdd" stopOpacity={0.1}/>
              </linearGradient>
              
              {/* Glow filter for the line */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#00ffdd" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#00ffa3', strokeWidth: 0 }}
              isAnimationActive={false}
              filter="url(#glow)"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Add animated scan line */}
        <div className="chart-scan-line"></div>
        
        {/* Add grid effect */}
        <div className="chart-grid-effect"></div>
      </div>
    </div>
  );
};

export default CyberpunkChart;