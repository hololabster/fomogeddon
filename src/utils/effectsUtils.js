// src/utils/effectsUtils.js
// Effect utility functions for the trading simulator

// Trigger trade effect (long, short, or close position)
export const triggerTradeEffect = (type) => {
  // Create effect element for the text
  const effectElement = document.createElement("div");

  // Set appropriate classes based on type
  if (type === "long") {
    effectElement.className = "trade-effect trade-effect-long";
    effectElement.textContent = "LONG";
    createParticleExplosion(type);
  } else if (type === "short") {
    effectElement.className = "trade-effect trade-effect-short";
    effectElement.textContent = "SHORT";
    createParticleExplosion(type);
  } else if (type === "5XLong") {
    effectElement.className = "trade-effect trade-effect-5xlong";
    effectElement.textContent = "5X LONG";
    createParticleExplosion(type);
  } else if (type === "5XShort") {
    effectElement.className = "trade-effect trade-effect-5xshort";
    effectElement.textContent = "5X SHORT";
    createParticleExplosion(type);
  } else if (type === "close") {
    effectElement.className = "trade-effect trade-effect-close";
    effectElement.textContent = "CLOSE";
    createParticleExplosion(type);
  } else if (type === "liquidation") {
    effectElement.className = "trade-effect trade-effect-liquidation";
    effectElement.textContent = "LIQUIDATED";
  }

  // Add to document
  document.body.appendChild(effectElement);

  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(effectElement);
  }, 1500);
};

// Create particle explosion effect
const createParticleExplosion = (type) => {
  // Create container for particles
  const particleContainer = document.createElement("div");
  particleContainer.className = "particle-container";
  document.body.appendChild(particleContainer);

  // Set particle color based on type
  let particleColor;
  if (type === "long") {
    particleColor = "#00ff7f"; // Green
  } else if (type === "short") {
    particleColor = "#ff3e4d"; // Red
  } else if (type === "5XLong") {
    particleColor = "#11eefe"; // Blue
  } else if (type === "5XShort") {
    particleColor = "#f9381e"; // Orange
  } else if (type === "close") {
    particleColor = "#ffcc00"; // Yellow
  } else if (type === "liquidation") {
    particleColor = "#898989"; // Gray
  }

  // Create multiple particles - 증가된 수와 크기
  const particleCount = 250; // 150에서 250으로 증가

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "trade-particle";

    // Set random properties - 크기 증가
    const size = Math.random() * 20 + 5; // 크기 2배 증가
    const posX = 50 + (Math.random() - 0.5) * 20; // 더 넓은 분포
    const posY = 50 + (Math.random() - 0.5) * 20;
    const angle = Math.random() * 360;
    const distance = 40 + Math.random() * 60; // 더 멀리 퍼지도록
    const delay = Math.random() * 0.2;
    const duration = 0.8 + Math.random() * 1.2;

    // Set particle styles
    particle.style.backgroundColor = particleColor;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.opacity = Math.random() * 0.6 + 0.4;

    // Set animations with custom properties
    particle.style.setProperty("--start-x", `${posX}%`);
    particle.style.setProperty("--start-y", `${posY}%`);
    particle.style.setProperty("--angle", `${angle}deg`);
    particle.style.setProperty("--distance", `${distance}`);
    particle.style.setProperty("--delay", `${delay}s`);
    particle.style.setProperty("--duration", `${duration}s`);

    // Add glowing effect for cyberpunk feel - 더 강한 글로우
    particle.style.boxShadow = `0 0 ${size * 3}px ${particleColor}`;

    // Add to container
    particleContainer.appendChild(particle);
  }

  // Add digital circuit lines (cyberpunk effect) - 더 많고 긴 라인
  const lineCount = 40; // 20에서 40으로 증가
  for (let i = 0; i < lineCount; i++) {
    const line = document.createElement("div");
    line.className = "circuit-line";

    // Random properties
    const angle = Math.random() * 360;
    const length = 80 + Math.random() * 200; // 더 긴 라인
    const thickness = 1 + Math.random() * 3; // 다양한 두께
    const delay = Math.random() * 0.3;

    // Set line styles
    line.style.backgroundColor = particleColor;
    line.style.width = `${length}px`;
    line.style.height = `${thickness}px`;
    line.style.opacity = Math.random() * 0.7 + 0.3;

    // Set animations with custom properties
    line.style.setProperty("--angle", `${angle}deg`);
    line.style.setProperty("--delay", `${delay}s`);

    // Add to container
    particleContainer.appendChild(line);
  }

  // Create holographic rings - 더 많고 큰 링
  const ringCount = 8; // 5에서 8로 증가
  for (let i = 0; i < ringCount; i++) {
    const ring = document.createElement("div");
    ring.className = "holo-ring";

    // 더 두꺼운 경계와 더 강한 글로우
    ring.style.borderWidth = `${Math.random() * 3 + 2}px`;
    ring.style.borderColor = particleColor;
    ring.style.boxShadow = `0 0 10px ${particleColor}`;
    ring.style.setProperty("--delay", `${i * 0.1}s`);

    // Add to container
    particleContainer.appendChild(ring);
  }

  // Add digital glitch blocks
  const glitchCount = 25; // 증가
  for (let i = 0; i < glitchCount; i++) {
    const glitch = document.createElement("div");
    glitch.className = "digital-glitch";

    // Random properties - 더 큰 크기
    const size = 20 + Math.random() * 80; // 더 큰 크기
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 0.2 + Math.random() * 0.5;

    // Set glitch styles
    glitch.style.backgroundColor = particleColor;
    glitch.style.width = `${size}px`;
    glitch.style.height = `${size / 3}px`;
    glitch.style.opacity = Math.random() * 0.3 + 0.1;

    // Set animations with custom properties
    glitch.style.setProperty("--pos-x", `${posX}%`);
    glitch.style.setProperty("--pos-y", `${posY}%`);
    glitch.style.setProperty("--delay", `${delay}s`);
    glitch.style.setProperty("--duration", `${duration}s`);

    // Add to container
    particleContainer.appendChild(glitch);
  }

  // Remove container after all animations complete
  setTimeout(() => {
    document.body.removeChild(particleContainer);
  }, 3000);
};

// Trigger price alert effect (for big price movements)
export const triggerPriceAlert = (type, percentChange) => {
  // Create alert element
  const alertElement = document.createElement("div");

  // Set appropriate classes based on type (up/down)
  alertElement.className = `price-alert price-alert-${type}`;

  // Set content based on movement direction
  if (type === "up") {
    alertElement.innerHTML = `<span>▲</span> ${Math.abs(percentChange).toFixed(
      2
    )}%`;
  } else {
    alertElement.innerHTML = `<span>▼</span> ${Math.abs(percentChange).toFixed(
      2
    )}%`;
  }

  // Add to document
  document.body.appendChild(alertElement);

  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(alertElement);
  }, 2000);
};

// Trigger price flash effect
export const triggerPriceFlash = (newPrice, oldPrice) => {
  if (!oldPrice) return;

  // Get chart and elements
  const chartContainer = document.querySelector(".chart-container");
  if (!chartContainer) return;

  // Create flash overlay
  const flashOverlay = document.createElement("div");

  // Set class based on price movement
  if (newPrice > oldPrice) {
    flashOverlay.className = "chart-flash chart-flash-up";
  } else if (newPrice < oldPrice) {
    flashOverlay.className = "chart-flash chart-flash-down";
  } else {
    return; // No change, no flash
  }

  // Add to chart
  chartContainer.appendChild(flashOverlay);

  // Remove after animation
  setTimeout(() => {
    chartContainer.removeChild(flashOverlay);
  }, 500);
};

// Trigger event alert effect
export const triggerEventAlert = () => {
  // Get main container
  const container = document.querySelector("main");
  if (!container) return;

  // Create alert element
  const alertElement = document.createElement("div");
  alertElement.className = "event-alert-overlay";

  // Add to document
  container.appendChild(alertElement);

  // Remove after animation
  setTimeout(() => {
    container.removeChild(alertElement);
  }, 1000);
};

// Trigger chart data update effect
export const triggerChartUpdate = (isUpdating) => {
  // Get chart container
  const chartContainer = document.querySelector(".chart-container");
  if (!chartContainer) return;

  if (isUpdating) {
    // Add loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "chart-loading";
    loadingIndicator.innerHTML =
      '<div class="chart-loading-spinner"></div><div class="chart-loading-text">Updating Data...</div>';

    // Remove any existing indicators first
    const existingIndicator = chartContainer.querySelector(".chart-loading");
    if (existingIndicator) {
      chartContainer.removeChild(existingIndicator);
    }

    chartContainer.appendChild(loadingIndicator);
  } else {
    // Remove loading indicator
    const loadingIndicator = chartContainer.querySelector(".chart-loading");
    if (loadingIndicator) {
      // Add fade-out class
      loadingIndicator.classList.add("chart-loading-fade");

      // Remove after fade animation
      setTimeout(() => {
        if (loadingIndicator.parentNode === chartContainer) {
          chartContainer.removeChild(loadingIndicator);
        }
      }, 500);
    }
  }
};

// Add matrix code rain effect
export const addMatrixCodeRainEffect = (color) => {
  const container = document.createElement("div");
  container.className = "code-rain";
  document.body.appendChild(container);

  // Create columns of code
  for (let i = 0; i < 20; i++) {
    const column = document.createElement("div");
    column.className = "code-column";
    column.style.left = `${Math.random() * 100}%`;
    column.style.animationDuration = `${1 + Math.random() * 2}s`;
    column.style.color = color;

    // Fill with random characters
    for (let j = 0; j < 20; j++) {
      const char = document.createElement("div");
      char.className = "code-char";
      char.style.top = `${j * 5}%`;
      char.style.animationDelay = `${j * 0.1}s`;

      // Use cyberpunk-style characters
      const chars =
        "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
      char.textContent = chars[Math.floor(Math.random() * chars.length)];

      column.appendChild(char);
    }

    container.appendChild(column);
  }

  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(container);
  }, 2000);
};

// Add EMP wave effect
export const addEMPWaveEffect = (color) => {
  const empElement = document.createElement("div");
  empElement.className = "emp-wave";
  empElement.style.borderColor = color;
  document.body.appendChild(empElement);

  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(empElement);
  }, 1500);
};

// Add digital noise effect
export const addDigitalNoiseEffect = () => {
  const noiseElement = document.createElement("div");
  noiseElement.className = "digital-noise";
  document.body.appendChild(noiseElement);

  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(noiseElement);
  }, 1500);

  // Add scanlines
  const scanlinesElement = document.createElement("div");
  scanlinesElement.className = "scanlines";
  document.body.appendChild(scanlinesElement);

  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(scanlinesElement);
  }, 1500);
};

// Add data display effect
export const addDataDisplayEffect = (color) => {
  const container = document.createElement("div");
  container.className = "data-display";
  document.body.appendChild(container);

  // Create circles
  for (let i = 0; i < 3; i++) {
    const circle = document.createElement("div");
    circle.className = "data-circle";
    circle.style.width = `${200 + i * 80}px`; // 크게 증가
    circle.style.height = `${200 + i * 80}px`;
    circle.style.borderColor = color;
    circle.style.animationDelay = `${i * 0.2}s`;

    container.appendChild(circle);
  }

  // Create data segments
  for (let i = 0; i < 12; i++) {
    const segment = document.createElement("div");
    segment.className = "data-segment";
    segment.style.backgroundColor = color;
    segment.style.setProperty("--angle", `${i * 30}deg`);
    segment.style.animationDelay = `${i * 0.05}s`;

    container.appendChild(segment);
  }

  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(container);
  }, 2000);
};
