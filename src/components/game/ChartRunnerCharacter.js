// src/components/game/ChartRunnerCharacter.js
import React, { useState, useEffect, useRef } from "react";

const ChartRunnerCharacter = ({
  isRunning,
  speed = "normal",
  position = "neutral",
  progress = 0,
  chartData = [],
  currentPrice = 0,
}) => {
  const [characterState, setCharacterState] = useState("idle");
  const [isJumping, setIsJumping] = useState(false);
  const containerRef = useRef(null);
  const lastJumpTime = useRef(0);

  const getAnimationDuration = () => {
    switch (speed) {
      case "very-fast":
        return 0.2;
      case "fast":
        return 0.3;
      case "normal":
        return 0.5;
      case "slow":
        return 0.8;
      case "very-slow":
        return 1.2;
      default:
        return 0.5;
    }
  };

  const getPositionColor = () => {
    switch (position) {
      case "long":
        return "#00ff7f";
      case "short":
        return "#ff3e4d";
      case "5XLong":
        return "#11eefe";
      case "5XShort":
        return "#f9381e";
      default:
        return "#60a5fa";
    }
  };

  // Get flame colors based on position type
  const getFlameColors = () => {
    if (position === "5XLong") {
      return {
        outer: "#11eefe",
        middle: "#00a0ff",
        inner: "#ffffff",
      };
    } else if (position === "5XShort") {
      return {
        outer: "#f9381e",
        middle: "#ff6b35",
        inner: "#ffdd00",
      };
    }
    return null;
  };

  useEffect(() => {
    if (!isRunning) {
      if (characterState === "running") {
        setCharacterState("stopping");

        // Change to idle state after stopping
        setTimeout(() => {
          setCharacterState("idle");
        }, 300);
      }
    } else {
      if (characterState !== "running" && characterState !== "jumping") {
        setCharacterState("running");
      }
    }
  }, [isRunning, characterState]);

  // Jump effect based on chart data
  useEffect(() => {
    if (!chartData || chartData.length < 2 || !isRunning) return;

    const current = chartData[chartData.length - 1]?.price;
    const previous = chartData[chartData.length - 2]?.price;

    if (!current || !previous) return;

    const now = Date.now();
    const percentChange = ((current - previous) / previous) * 100;

    // Jump when price changes more than 0.5% and at least 2 seconds since last jump
    if (Math.abs(percentChange) > 0.5 && now - lastJumpTime.current > 2000) {
      lastJumpTime.current = now;

      if (percentChange > 0) {
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 500);
      }
    }
  }, [chartData, isRunning]);

  // Update character position based on chart progress
  useEffect(() => {
    if (containerRef.current && chartData.length > 0) {
      const leftPosition = 10 + progress * 0.8;

      // const recentData = chartData.slice(-50);
      // const maxPrice = Math.max(...recentData.map((d) => d.price));
      // const minPrice = Math.min(...recentData.map((d) => d.price));

      let yPosition = 76;
      // if (maxPrice === minPrice) {
      //   yPosition = 50; // Middle position
      // } else {
      //   const priceRatio = (currentPrice - minPrice) / (maxPrice - minPrice);
      //   yPosition = 60 - priceRatio * 40;
      // }

      // Update container position
      containerRef.current.style.left = `${leftPosition}%`;
      containerRef.current.style.top = `${yPosition}%`;
    }
  }, [progress, chartData, currentPrice]);

  // Random occasional jumping
  useEffect(() => {
    if (!isRunning) return;

    const jumpInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 500);
      }
    }, 5000);

    return () => clearInterval(jumpInterval);
  }, [isRunning]);

  // Animation style
  const animationStyle = {
    animation:
      characterState === "running"
        ? `running ${getAnimationDuration()}s infinite alternate`
        : characterState === "stopping"
        ? "stopping 0.3s forwards"
        : "none",
  };

  // Container style
  const containerStyle = {
    position: "absolute",
    top: "50%", // Base value, dynamically updated
    left: "10%", // Base value, dynamically updated
    zIndex: 100,
    transition: "left 0.3s ease, top 0.3s ease",
    transform: isJumping ? "translateY(-15px)" : "translateY(0)",
  };

  // Check if we need to render flames (5X positions)
  const renderFlames = position.includes("5X");
  const flameColors = getFlameColors();

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Render flame effect for 5X positions */}
      {renderFlames && (
        <svg
          width="50"
          height="40"
          viewBox="0 0 50 32"
          style={{
            position: "absolute",
            left: "-20px",
            top: "0",
            zIndex: 99,
            transform: "scaleX(-1)", // Flip horizontally to appear behind the character
          }}
        >
          <defs>
            <filter
              id="flame-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="1.5"
                result="blur"
              />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <radialGradient
              id="flame-gradient"
              cx="50%"
              cy="50%"
              r="65%"
              fx="50%"
              fy="50%"
            >
              <stop
                offset="0%"
                stopColor={flameColors.inner}
                stopOpacity="0.9"
              />
              <stop
                offset="40%"
                stopColor={flameColors.middle}
                stopOpacity="0.8"
              />
              <stop
                offset="100%"
                stopColor={flameColors.outer}
                stopOpacity="0.6"
              />
            </radialGradient>
          </defs>

          {/* Main flame group */}
          <g filter="url(#flame-blur)">
            {/* Larger flame shapes */}
            <path
              d="M10,16 Q15,8 18,16 Q23,4 25,16 Q30,8 32,16 Q25,10 32,25 Q20,18 10,25 Q15,18 10,16 Z"
              fill="url(#flame-gradient)"
            >
              <animate
                attributeName="d"
                values="
                  M10,16 Q15,8 18,16 Q23,4 25,16 Q30,8 32,16 Q25,10 32,25 Q20,18 10,25 Q15,18 10,16 Z;
                  M10,16 Q15,6 18,16 Q22,2 25,16 Q28,6 32,16 Q27,12 32,25 Q20,16 10,25 Q13,18 10,16 Z;
                  M10,16 Q15,8 18,16 Q23,4 25,16 Q30,8 32,16 Q25,10 32,25 Q20,18 10,25 Q15,18 10,16 Z
                "
                dur="0.8s"
                repeatCount="indefinite"
              />
            </path>

            {/* Small flame particles */}
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                cx={15 + i * 3}
                cy={20 - Math.random() * 10}
                r={1 + Math.random() * 2}
                fill={flameColors.inner}
                opacity={0.7 + Math.random() * 0.3}
              >
                <animate
                  attributeName="cy"
                  values={`${20 - Math.random() * 10};${
                    15 - Math.random() * 12
                  };${20 - Math.random() * 10}`}
                  dur={`${0.5 + Math.random() * 0.5}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.9;0.4;0.9"
                  dur={`${0.5 + Math.random() * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        </svg>
      )}

      {/* Main character */}
      <svg width="40" height="40" viewBox="0 0 32 32" style={animationStyle}>
        {/* Neon glow filter */}
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feFlood
              floodColor={getPositionColor()}
              floodOpacity="0.5"
              result="neon"
            />
            <feComposite
              in="neon"
              in2="SourceGraphic"
              operator="in"
              result="comp"
            />
            <feGaussianBlur in="comp" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Breathing animation */}
          <animate
            xlinkHref="#chest-light"
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </defs>

        {/* Cyberpunk pixel art character */}
        <g filter="url(#neon-glow)">
          {/* Head */}
          <rect x="12" y="4" width="8" height="8" fill="#1a1a2e" rx="1" />

          {/* Eyes */}
          <rect
            id="left-eye"
            x="14"
            y="7"
            width="2"
            height="2"
            fill={getPositionColor()}
            rx="0.5"
          >
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            id="right-eye"
            x="18"
            y="7"
            width="2"
            height="2"
            fill={getPositionColor()}
            rx="0.5"
          >
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Helmet details */}
          <rect
            x="12"
            y="4"
            width="8"
            height="2"
            fill={getPositionColor()}
            rx="0.5"
          />
          <rect x="12" y="4" width="1" height="8" fill={getPositionColor()} />
          <rect x="19" y="4" width="1" height="8" fill={getPositionColor()} />

          {/* Body */}
          <rect x="10" y="12" width="12" height="10" fill="#1a1a2e" rx="1" />

          {/* Cybernetic details on body */}
          <rect
            id="chest-light"
            x="14"
            y="14"
            width="4"
            height="2"
            fill={getPositionColor()}
            rx="0.5"
            opacity="0.8"
          />
          <rect x="16" y="16" width="2" height="6" fill={getPositionColor()} />

          {/* Left arm */}
          <rect id="left-arm" x="8" y="12" width="2" height="6" fill="#1a1a2e">
            {characterState === "running" && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 10 12"
                to="20 10 12"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 10 12; 20 10 12; 0 10 12"
              />
            )}
          </rect>

          {/* Right arm */}
          <rect
            id="right-arm"
            x="22"
            y="12"
            width="2"
            height="6"
            fill="#1a1a2e"
          >
            {characterState === "running" && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 22 12"
                to="-20 22 12"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 22 12; -20 22 12; 0 22 12"
              />
            )}
          </rect>

          {/* Cyber gun weapon for Short position */}
          {position === "short" && (
            <g id="cyber-gun">
              <rect
                x="24"
                y="15"
                width="7"
                height="2"
                fill={getPositionColor()}
              />
              <rect
                x="27"
                y="13"
                width="2"
                height="6"
                fill={getPositionColor()}
              />
              <rect
                x="30"
                y="14"
                width="1"
                height="4"
                fill={getPositionColor()}
              />
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </g>
          )}

          {/* Enhanced weapon for 5X Short position */}
          {position === "5XShort" && (
            <g id="enhanced-cyber-gun">
              <rect
                x="24"
                y="15"
                width="8"
                height="2"
                fill={getPositionColor()}
              />
              <rect
                x="27"
                y="13"
                width="2"
                height="6"
                fill={getPositionColor()}
              />
              <rect
                x="30"
                y="14"
                width="1"
                height="4"
                fill={getPositionColor()}
              />
              <rect
                x="32"
                y="15"
                width="2"
                height="2"
                fill={getPositionColor()}
              />
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </g>
          )}

          {/* Left leg */}
          <rect id="left-leg" x="12" y="22" width="3" height="6" fill="#1a1a2e">
            {characterState === "running" && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 13.5 22"
                to="30 13.5 22"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 13.5 22; 30 13.5 22; 0 13.5 22"
              />
            )}
          </rect>

          {/* Right leg */}
          <rect
            id="right-leg"
            x="17"
            y="22"
            width="3"
            height="6"
            fill="#1a1a2e"
          >
            {characterState === "running" && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18.5 22"
                to="-30 18.5 22"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 18.5 22; -30 18.5 22; 0 18.5 22"
              />
            )}
          </rect>

          {/* Cybernetic boots */}
          <rect
            x="11"
            y="28"
            width="4"
            height="2"
            fill={getPositionColor()}
            rx="0.5"
          />
          <rect
            x="17"
            y="28"
            width="4"
            height="2"
            fill={getPositionColor()}
            rx="0.5"
          />
        </g>

        {/* Additional neon effects for long position */}
        {position === "long" && (
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke={getPositionColor()}
            strokeWidth="0.5"
            strokeOpacity="0.3"
          >
            <animate
              attributeName="r"
              values="14;16;14"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.3;0.6;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Enhanced aura for 5XLong */}
        {position === "5XLong" && (
          <>
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke={getPositionColor()}
              strokeWidth="1"
              strokeOpacity="0.5"
            >
              <animate
                attributeName="r"
                values="14;17;14"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.5;0.8;0.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke={getPositionColor()}
              strokeWidth="0.8"
              strokeOpacity="0.4"
            >
              <animate
                attributeName="r"
                values="12;15;12"
                dur="1.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.4;0.7;0.4"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}

        {/* Hoverboard/skateboard effect - riding the chart line */}
        <rect
          x="10"
          y="30"
          width="12"
          height="2"
          fill={getPositionColor()}
          opacity="0.8"
          rx="1"
        >
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Speed lines */}
        {characterState === "running" && (
          <g>
            <line
              x1="5"
              y1="15"
              x2="0"
              y2="15"
              stroke={getPositionColor()}
              strokeWidth="0.5"
              opacity="0.5"
            >
              <animate
                attributeName="opacity"
                values="0.5;0;0.5"
                dur={`${getAnimationDuration() * 0.7}s`}
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="5"
              y1="20"
              x2="0"
              y2="20"
              stroke={getPositionColor()}
              strokeWidth="0.5"
              opacity="0.5"
            >
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur={`${getAnimationDuration() * 0.8}s`}
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="5"
              y1="25"
              x2="0"
              y2="25"
              stroke={getPositionColor()}
              strokeWidth="0.5"
              opacity="0.5"
            >
              <animate
                attributeName="opacity"
                values="0.5;0;0.5"
                dur={`${getAnimationDuration() * 0.6}s`}
                repeatCount="indefinite"
              />
            </line>
          </g>
        )}
      </svg>
    </div>
  );
};

export default ChartRunnerCharacter;
