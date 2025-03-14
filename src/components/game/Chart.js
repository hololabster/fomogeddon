import React, { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Label,
} from "recharts";

const CyberpunkChart = ({
  data,
  currentPrice,
  percentChange,
  displayLimit = 20,
  tradeMarkers = [],
}) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  // State for dragging functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dataStartIndex, setDataStartIndex] = useState(0);
  const [visibleDataRange, setVisibleDataRange] = useState({
    start: Math.max(0, data.length - displayLimit),
    end: data.length,
  });

  // Update the visible range when data changes
  useEffect(() => {
    if (data.length > 0 && !isDragging) {
      setVisibleDataRange({
        start: Math.max(0, data.length - displayLimit),
        end: data.length,
      });
    }
  }, [data.length, displayLimit, isDragging]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDataStartIndex(visibleDataRange.start);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Calculate how many data points to shift based on mouse movement
    const deltaX = e.clientX - startX;
    const chartWidth = chartContainerRef.current.getBoundingClientRect().width;
    const dataPointsPerPixel = displayLimit / chartWidth;
    const dataDelta = Math.round(deltaX * dataPointsPerPixel);

    // Calculate new data range
    let newStart = Math.max(0, dataStartIndex - dataDelta);
    newStart = Math.min(newStart, data.length - displayLimit);

    setVisibleDataRange({
      start: newStart,
      end: Math.min(newStart + displayLimit, data.length),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse leave to prevent drag continuing outside chart
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Add a flashing pulse effect to the chart
  useEffect(() => {
    // Add pulse effect on data update
    if (chartContainerRef.current && !isDragging) {
      chartContainerRef.current.classList.add("chart-pulse");
      setTimeout(() => {
        if (chartContainerRef.current) {
          chartContainerRef.current.classList.remove("chart-pulse");
        }
      }, 500);
    }
  }, [data.length, isDragging]);

  // Process data to show only the visible range
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) {
      // Generate dummy data if no real data
      return Array(displayLimit)
        .fill(0)
        .map((_, i) => ({
          time: Date.now() - (displayLimit - i) * 1000,
          price: currentPrice * (0.99 + Math.random() * 0.02),
        }));
    }

    // Convert data to proper format if needed
    const formattedData = data.map((point) => ({
      time: point.time,
      price:
        typeof point.price === "number" ? point.price : parseFloat(point.price),
    }));

    // Only return the visible range
    if (visibleDataRange.end <= formattedData.length) {
      return formattedData.slice(visibleDataRange.start, visibleDataRange.end);
    }

    return formattedData.slice(-displayLimit);
  }, [data, currentPrice, displayLimit, visibleDataRange]);

  // Filter markers to show only those within the visible range
  const visibleMarkers = React.useMemo(() => {
    if (
      !tradeMarkers ||
      tradeMarkers.length === 0 ||
      processedData.length === 0
    ) {
      return [];
    }

    const timeRange = {
      min: processedData[0].time,
      max: processedData[processedData.length - 1].time,
    };

    return tradeMarkers.filter(
      (marker) =>
        marker &&
        marker.time &&
        !isNaN(marker.time) &&
        marker.price &&
        !isNaN(marker.price) &&
        marker.time >= timeRange.min &&
        marker.time <= timeRange.max
    );
  }, [tradeMarkers, processedData]);

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

  // Marker helper functions
  const getMarkerColor = (type, position) => {
    if (type === "open") {
      if (position === "long" || position === "5XLong") return "#00ff7f";
      if (position === "short" || position === "5XShort") return "#ff3e4d";
      return "#ffffff";
    } else if (type === "close") {
      return "#ffcc00";
    } else if (type === "liquidate") {
      return "#898989";
    }
    return "#ffffff";
  };

  const getMarkerLabel = (type, position) => {
    if (type === "open") {
      if (position === "long") return "LONG";
      if (position === "5XLong") return "5X LONG";
      if (position === "short") return "SHORT";
      if (position === "5XShort") return "5X SHORT";
      return "OPEN";
    } else if (type === "close") {
      return "CLOSE";
    } else if (type === "liquidate") {
      return "LIQUIDATE";
    }
    return "";
  };

  return (
    <div className="price-chart-container basics-card" ref={chartContainerRef}>
      <div className="price-header">
        <div className="price-title">Bitcoin (BTC)</div>
        <div className="flex items-center">
          <div className="price-value">${currentPrice.toFixed(2)}</div>
          <div
            className={`price-change ${
              percentChange > 0
                ? "price-change-positive"
                : percentChange < 0
                ? "price-change-negative"
                : "price-change-neutral"
            }`}
          >
            {percentChange > 0 ? "+" : ""}
            {percentChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <div
        className={`chart-container ${isDragging ? "grabbing" : "grab"}`}
        ref={chartRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Add glowing effect overlay */}
        <div className="chart-glow-effect"></div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0, 179, 255, 0.1)"
            />
            <XAxis
              dataKey="time"
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return `${date.getHours()}:${date
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`;
              }}
              stroke="#8884d8"
              tick={{ fill: "#00b3ff", fontSize: 12 }}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              domain={["auto", "auto"]}
              stroke="#8884d8"
              tick={{ fill: "#00b3ff", fontSize: 12 }}
              width={50}
              allowDataOverflow={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffdd" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00ffdd" stopOpacity={0.1} />
              </linearGradient>

              {/* Glow filter for the line */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Line
              type="monotone"
              dataKey="price"
              stroke="#00ffdd"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#00ffa3", strokeWidth: 0 }}
              isAnimationActive={false}
              filter="url(#glow)"
            />

            {/* Trade markers */}
            {visibleMarkers.map((marker, index) => (
              <ReferenceDot
                key={`marker-${index}`}
                x={marker.time}
                y={marker.price}
                r={6}
                fill={getMarkerColor(marker.type, marker.position)}
                stroke="none"
                strokeWidth={2}
                ifOverflow="extendDomain"
              >
                <Label
                  value={getMarkerLabel(marker.type, marker.position)}
                  position="top"
                  fill={getMarkerColor(marker.type, marker.position)}
                  fontSize={10}
                  offset={8}
                />
              </ReferenceDot>
            ))}
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
