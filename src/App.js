// src/App.js - With chart line runner character
import React, { useState, useEffect, useRef } from 'react';
import { fetchBitcoinData } from './services/api';
import { SimulatorEngine } from './services/simulator';
import { calculatePnL } from './utils/calculations';
import { SCENARIOS } from './data/scenarios';
import CyberpunkChart from './components/game/Chart'; // Import the fixed chart component
import ChartRunnerCharacter from './components/game/ChartRunnerCharacter'; // Import the chart runner
import EffectsController from './components/effects/TradeEffects';
import { 
  triggerTradeEffect, 
  triggerPriceAlert, 
  triggerPriceFlash, 
  triggerEventAlert,
  triggerChartUpdate,
  addMatrixCodeRainEffect,
  addEMPWaveEffect,
  addDigitalNoiseEffect,
  addDataDisplayEffect
} from './utils/effectsUtils';
// Import styles
import './styles/modern-cyberpunk.css';
import './styles/enhanced-effects.css';
import './styles/chart-effects.css'; // Add the new chart effects CSS
import './styles/cyberpunk-particles.css'; // Add the new cyberpunk particle effects
import './fonts';

function App() {
  // State management
  const [currentScreen, setCurrentScreen] = useState('select'); // 'select', 'simulation'
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulator, setSimulator] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [eventInfo, setEventInfo] = useState(null);
  const [wallet, setWallet] = useState({
    cash: 10000,  // Initial cash
    bitcoin: 0    // Initial bitcoin
  });
  
  const [gameProgress, setGameProgress] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // 기본 1초 간격, 조절 가능
  const [position, setPosition] = useState('neutral');  // 'long', 'short', 'neutral'
  const [entryPrice, setEntryPrice] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [btcOnChainData, setBtcOnChainData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [dataUpdating, setDataUpdating] = useState(false);
  const [characterSpeed, setCharacterSpeed] = useState('normal'); // 캐릭터 애니메이션 속도
  
  const simulationInterval = useRef(null);
  const onChainDataInterval = useRef(null);
  const lastPriceUpdateRef = useRef(0);
  
  // Fetch Bitcoin data periodically
  useEffect(() => {
    const loadBitcoinData = async () => {
      try {
        // Trigger data update effect
        setDataUpdating(true);
        triggerChartUpdate(true);
        
        const data = await fetchBitcoinData();
        setBtcOnChainData(data);
        console.log("Bitcoin data loaded:", data.length, "points");
        
        // End data update effect
        setTimeout(() => {
          setDataUpdating(false);
          triggerChartUpdate(false);
        }, 1000);
      } catch (error) {
        console.error("Error loading Bitcoin data:", error);
        setDataUpdating(false);
        triggerChartUpdate(false);
      }
    };
    
    // Initial data load
    loadBitcoinData();
    
    // Refresh every minute
    onChainDataInterval.current = setInterval(loadBitcoinData, 60000);
    
    return () => {
      if (onChainDataInterval.current) {
        clearInterval(onChainDataInterval.current);
      }
    };
  }, []);
  
  // 시뮬레이션 속도에 따라 캐릭터 속도 설정
  useEffect(() => {
    if (simulationSpeed === 4000) {
      setCharacterSpeed('very-slow');
    } else if (simulationSpeed === 2000) {
      setCharacterSpeed('slow');
    } else if (simulationSpeed === 1000) {
      setCharacterSpeed('normal');
    } else if (simulationSpeed === 500) {
      setCharacterSpeed('fast');
    } else {
      setCharacterSpeed('very-fast');
    }
  }, [simulationSpeed]);
  
  // Scenario selection handler
  const selectScenario = (scenario) => {
    setSelectedScenario(scenario);
    
    // Initialize simulator with real Bitcoin price or fallback
    const initialPrice = btcOnChainData.length > 0 
      ? btcOnChainData[btcOnChainData.length - 1].price 
      : 40000;
    
    const newSimulator = new SimulatorEngine(initialPrice, scenario);
    setSimulator(newSimulator);
    setChartData(newSimulator.getHistory());
    setCurrentPrice(initialPrice);
    setPreviousPrice(initialPrice);
    
    // Switch screen
    setCurrentScreen('simulation');
    
    // Display notification
    setNotification({
      message: `${scenario.name} scenario selected. Start the simulation!`,
      type: 'info'
    });
    
    // Trigger glitch effect
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 1000);
    
    // Digital noise effect 추가
    addDigitalNoiseEffect();
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
    
    // Play digital sound effect
    playDigitalSound('select');
  };
  
  // Start simulation
  const startSimulation = () => {
    if (!simulator) return;
    
    setIsSimulationRunning(true);
    
    // Play digital sound effect
    playDigitalSound('start');
    
    // Add digital noise effect
    addDigitalNoiseEffect();
    
    // 게임 완료 상태 초기화
    setIsGameComplete(false);
    
    // Update price at the set interval speed
    simulationInterval.current = setInterval(() => {
      if (simulator) {
        // Save previous price
        setPreviousPrice(currentPrice);
        
        // Check if game is complete before stepping
        if (simulator.isGameComplete()) {
          setIsGameComplete(true);
          stopSimulation();
          setNotification({
            message: `Simulation complete! Final P&L: $${pnl.toFixed(2)}`,
            type: pnl >= 0 ? 'success' : 'warning'
          });
          setTimeout(() => setNotification(null), 5000);
          return;
        }
        
        const result = simulator.step(btcOnChainData);
        setCurrentPrice(result.price);
        setPercentChange(result.percentChange);
        
        // Update game progress
        setGameProgress(simulator.getGameProgress());
        
        // Update chart data with the latest price
        setChartData(prevData => {
          // Ensure we have a valid array
          if (!Array.isArray(prevData)) return simulator.getHistory();
          
          // Get the latest history directly from the simulator
          return simulator.getHistory();
        });
        
        // Handle price changes for visual effects
        updatePriceDisplay(result.price, currentPrice);
        
        // Update event info
        const eventStatus = simulator.getEventInfo();
        setEventInfo(eventStatus);
        
        // Alert on big price change
        if (Math.abs(result.percentChange) >= 0.5) {
          const alertType = result.percentChange > 0 ? 'up' : 'down';
          triggerPriceAlert(alertType, result.percentChange);
          
          // Add matrix code rain effect for big price changes
          addMatrixCodeRainEffect(alertType === 'up' ? '#00ff7f' : '#ff3e4d');
        }
        
        // Show notification when event starts
        if (eventStatus && eventStatus.isActive && eventStatus.progress === 1) {
          // Play alert sound
          playDigitalSound('alert');
          
          // Trigger glitch effect
          setGlitchEffect(true);
          setTimeout(() => setGlitchEffect(false), 1500);
          
          // Trigger event alert effect
          triggerEventAlert();
          
          // Add EMP wave effect
          addEMPWaveEffect('#ffcc00');
          
          setNotification({
            message: `${eventStatus.name} event triggered: ${eventStatus.description}`,
            type: 'warning'
          });
          
          // Clear notification after 5 seconds
          setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
        
        // Calculate PnL if position exists
        if (position !== 'neutral') {
          const positionPnl = calculatePnL(position, entryPrice, result.price, wallet.bitcoin);
          setPnl(positionPnl);
        }
      }
    }, simulationSpeed);
    
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  };
  
  // Update price display with visual effects
  const updatePriceDisplay = (newPrice, oldPrice) => {
    if (!oldPrice) return;
    
    // Get price display element
    const priceElement = document.querySelector('.price-value');
    if (!priceElement) return;
    
    // Remove existing classes
    priceElement.classList.remove('price-flash-up', 'price-flash-down');
    
    // Add appropriate flash class based on price movement
    if (newPrice > oldPrice) {
      priceElement.classList.add('price-flash-up');
    } else if (newPrice < oldPrice) {
      priceElement.classList.add('price-flash-down');
    }
    
    // Also trigger the generic price flash effect
    triggerPriceFlash(newPrice, oldPrice);
  };
  
  // Stop simulation
  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsSimulationRunning(false);
    
    // Play digital sound effect
    playDigitalSound('stop');
  };
  
  // Cyberpunk digital sound function
  const playDigitalSound = (type) => {
    try {
      // Create AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect oscillator to gain and output
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set sound parameters based on type
      switch (type) {
        case 'select':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
          oscillator.frequency.exponentialRampToValueAtTime(990, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'start':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'stop':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'alert':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.3);
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.4);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
          
        case 'trade':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'success':
          // First sound
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          
          // Second sound (chord)
          setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator2.start();
            oscillator2.stop(audioContext.currentTime + 0.4);
          }, 100);
          break;
          
        case 'fail':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };
  
  // Enter long position
  const enterLongPosition = () => {
    if (wallet.cash < 1000) {
      setNotification({
        message: 'Insufficient funds: Transaction rejected',
        type: 'error'
      });
      playDigitalSound('fail');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    // Play trade sound
    playDigitalSound('trade');
    
    // Trigger visual effect
    triggerTradeEffect('long');
    
    // Add data display effect for long
    addDataDisplayEffect('#00ff7f');
    
    const investment = 1000; // Fixed amount
    const btcAmount = investment / currentPrice;
    
    // Update position
    if (position === 'neutral') {
      setPosition('long');
      setEntryPrice(currentPrice);
      setWallet({
        cash: wallet.cash - investment,
        bitcoin: btcAmount
      });
    } else if (position === 'short') {
      // Switch from short to long (close short, enter long)
      const shortPnl = calculatePnL('short', entryPrice, currentPrice, wallet.bitcoin);
      
      // First close the short position with a "close" effect
      triggerTradeEffect('close');
      
      // Add the closed position to history
      setGameHistory([
        ...gameHistory,
        {
          type: 'closed',
          position: 'short',
          entryPrice,
          exitPrice: currentPrice,
          amount: wallet.bitcoin,
          pnl: shortPnl
        }
      ]);
      
      // Then enter the long position after a slight delay
      setTimeout(() => {
        triggerTradeEffect('long');
        addDataDisplayEffect('#00ff7f');
        
        setPosition('long');
        setEntryPrice(currentPrice);
        setWallet({
          cash: wallet.cash + shortPnl - investment,
          bitcoin: btcAmount
        });
        
        // Add the new long position to history
        setGameHistory(prevHistory => [
          ...prevHistory,
          {
            type: 'opened',
            position: 'long',
            price: currentPrice,
            amount: btcAmount,
            investment
          }
        ]);
        
        setNotification({
          message: `SHORT position closed and LONG position entered: ${btcAmount.toFixed(6)} BTC @ $${currentPrice.toFixed(2)}`,
          type: 'success'
        });
        
        setTimeout(() => setNotification(null), 3000);
      }, 800); // 딜레이 증가 (500 → 800)
      
      return;
    }
    
    // Add trade to history (for neutral to long)
    setGameHistory([
      ...gameHistory,
      {
        type: 'opened',
        position: 'long',
        price: currentPrice,
        amount: btcAmount,
        investment
      }
    ]);
    
    setNotification({
      message: `LONG position entered: ${btcAmount.toFixed(6)} BTC @ $${currentPrice.toFixed(2)}`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
    
    // Success sound
    setTimeout(() => playDigitalSound('success'), 300);
  };
  
  // Enter short position
  const enterShortPosition = () => {
    if (wallet.cash < 1000) {
      setNotification({
        message: 'Insufficient funds: Transaction rejected',
        type: 'error'
      });
      playDigitalSound('fail');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    // Play trade sound
    playDigitalSound('trade');
    
    // Trigger visual effect
    triggerTradeEffect('short');
    
    // Add data display effect for short
    addDataDisplayEffect('#ff3e4d');
    
    const investment = 1000; // Fixed amount
    const btcAmount = investment / currentPrice;
    
    // Update position
    if (position === 'neutral') {
      setPosition('short');
      setEntryPrice(currentPrice);
      setWallet({
        cash: wallet.cash - investment,
        bitcoin: btcAmount
      });
    } else if (position === 'long') {
      // Switch from long to short (close long, enter short)
      const longPnl = calculatePnL('long', entryPrice, currentPrice, wallet.bitcoin);
      
      // First close the long position with a "close" effect
      triggerTradeEffect('close');
      
      // Add the closed position to history
      setGameHistory([
        ...gameHistory,
        {
          type: 'closed',
          position: 'long',
          entryPrice,
          exitPrice: currentPrice,
          amount: wallet.bitcoin,
          pnl: longPnl
        }
      ]);
      
      // Then enter the short position after a slight delay
      setTimeout(() => {
        triggerTradeEffect('short');
        addDataDisplayEffect('#ff3e4d');
        
        setPosition('short');
        setEntryPrice(currentPrice);
        setWallet({
          cash: wallet.cash + longPnl - investment,
          bitcoin: btcAmount
        });
        
        // Add the new short position to history
        setGameHistory(prevHistory => [
          ...prevHistory,
          {
            type: 'opened',
            position: 'short',
            price: currentPrice,
            amount: btcAmount,
            investment
          }
        ]);
        
        setNotification({
          message: `LONG position closed and SHORT position entered: ${btcAmount.toFixed(6)} BTC @ $${currentPrice.toFixed(2)}`,
          type: 'success'
        });
        
        setTimeout(() => setNotification(null), 3000);
      }, 800); // 딜레이 증가 (500 → 800)
      
      return;
    }
    
    // Add trade to history (for neutral to short)
    setGameHistory([
      ...gameHistory,
      {
        type: 'opened',
        position: 'short',
        price: currentPrice,
        amount: btcAmount,
        investment
      }
    ]);
    
    setNotification({
      message: `SHORT position entered: ${btcAmount.toFixed(6)} BTC @ $${currentPrice.toFixed(2)}`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
    
    // Success sound
    setTimeout(() => playDigitalSound('success'), 300);
  };
  
  const closePosition = () => {
    if (position === 'neutral' || wallet.bitcoin === 0) {
      return;
    }
    
    // Play trade sound
    playDigitalSound('trade');
    
    // Trigger the close visual effect with yellow color
    triggerTradeEffect('close');
    
    // Add data display effect for close
    addDataDisplayEffect('#ffcc00');
    
    const positionPnl = calculatePnL(position, entryPrice, currentPrice, wallet.bitcoin);
    
    // Add to trade history
    setGameHistory([
      ...gameHistory,
      {
        type: 'closed',
        position,
        entryPrice,
        exitPrice: currentPrice,
        amount: wallet.bitcoin,
        pnl: positionPnl
      }
    ]);
    
    // Update wallet
    setWallet({
      cash: wallet.cash + 1000 + positionPnl, // Initial investment + PnL
      bitcoin: 0
    });
    
    // Reset position to neutral
    setPosition('neutral');
    setEntryPrice(0);
    setPnl(0);
    
    const pnlResult = positionPnl >= 0 ? 'PROFIT' : 'LOSS';
    
    setNotification({
      message: `POSITION CLOSED! ${pnlResult}: $${positionPnl.toFixed(2)}`,
      type: positionPnl >= 0 ? 'success' : 'warning'
    });
    setTimeout(() => setNotification(null), 3000);
    
    // Success/fail sound
    setTimeout(() => playDigitalSound(positionPnl >= 0 ? 'success' : 'fail'), 300);
  };
  
  // Restart simulation
  const restartSimulation = () => {
    // Stop simulation
    stopSimulation();
    
    // Reset state
    setWallet({
      cash: 10000,
      bitcoin: 0
    });
    setPosition('neutral');
    setEntryPrice(0);
    setPnl(0);
    setGameHistory([]);
    
    // Go back to scenario selection
    setCurrentScreen('select');
  };
  
  // Get CSS class for price change
  const getPriceChangeClass = () => {
    if (percentChange > 0) return 'price-change-positive';
    if (percentChange < 0) return 'price-change-negative';
    return 'price-change-neutral';
  };
  
  // Get CSS class for notification
  const getNotificationClass = (type) => {
    switch (type) {
      case 'success': return 'notification notification-success';
      case 'error': return 'notification notification-error';
      case 'warning': return 'notification notification-warning';
      default: return 'notification';
    }
  };
  
  // Get CSS class for PnL
  const getPnlClass = (value) => {
    return value >= 0 ? 'position-pnl-positive' : 'position-pnl-negative';
  };
  
  return (
    <div className={`min-h-screen ${glitchEffect ? 'glitch' : ''}`} data-text="SIMULATOR">
      {/* Header */}
      <header>
        <div className="container mx-auto">
          <h1>Trading Simulator Game</h1>
          <p>Real-time onchain data based scenario trading</p>
        </div>
      </header>
      
      {/* Notification */}
      {notification && (
        <div className={getNotificationClass(notification.type)}>
          {notification.message}
        </div>
      )}
      
      {/* Main content */}
      <main className="container mx-auto p-4">
        {/* Scenario selection screen */}
        {currentScreen === 'select' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Scenario</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SCENARIOS.map(scenario => (
                <div 
                  key={scenario.id}
                  className="scenario-card cyber-card"
                  onClick={() => selectScenario(scenario)}
                >
                  <h3>{scenario.name}</h3>
                  <p>{scenario.description}</p>
                  <div className={`impact-badge ${scenario.eventImpact.max > 0 ? 'impact-positive' : 'impact-negative'}`}>
                    Expected Impact: {scenario.eventImpact.min}% ~ {scenario.eventImpact.max}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Simulation screen */}
        {currentScreen === 'simulation' && (
          <>
            {/* Scenario banner */}
            <div className="scenario-banner">
              <div className="scenario-banner-text">
                {selectedScenario?.name} scenario selected. Start the simulation!
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left panel: Chart and trading controls */}
              <div className="lg:col-span-2">
                {/* Use the fixed chart component with character */}
                <div style={{ position: 'relative' }}>
                  <CyberpunkChart 
                    data={chartData}
                    currentPrice={currentPrice}
                    percentChange={percentChange}
                  />
                  
                  <ChartRunnerCharacter 
                    isRunning={isSimulationRunning}
                    speed={characterSpeed}
                    position={position}
                    chartData={chartData}
                    currentPrice={currentPrice}
                    progress={gameProgress}
                  />
                </div>
                
                {/* Trading controls */}
                {/* Game Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-blue-300 text-sm">Simulation Progress</h3>
                    <span className="text-xs text-gray-300">{Math.floor(gameProgress)}%</span>
                  </div>
                  <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full"
                      style={{ width: `${gameProgress}%` }}
                    ></div>
                  </div>
                </div>
                {/* Simulation Speed Control */}
                <div className="mt-4">
                  <h3 className="font-medium text-blue-300 text-sm mb-2">Simulation Speed</h3>
                  <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={() => {
                        const newSpeed = Math.min(simulationSpeed * 2, 4000);
                        setSimulationSpeed(newSpeed);
                        if (isSimulationRunning) {
                          stopSimulation();
                          setTimeout(() => startSimulation(), 100);
                        }
                      }}
                      className="py-1 px-3 bg-gray-700 text-white text-sm rounded"
                      disabled={simulationSpeed >= 4000}
                    >
                      Slower
                    </button>
                    
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-300">
                        {simulationSpeed === 4000 ? 'Very Slow' : 
                        simulationSpeed === 2000 ? 'Slow' : 
                        simulationSpeed === 1000 ? 'Normal' : 
                        simulationSpeed === 500 ? 'Fast' : 'Very Fast'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const newSpeed = Math.max(simulationSpeed / 2, 250);
                        setSimulationSpeed(newSpeed);
                        if (isSimulationRunning) {
                          stopSimulation();
                          setTimeout(() => startSimulation(), 100);
                        }
                      }}
                      className="py-1 px-3 bg-gray-700 text-white text-sm rounded"
                      disabled={simulationSpeed <= 250}
                    >
                      Faster
                    </button>
                  </div>
                </div>
                {isGameComplete && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="cyber-card p-6 max-w-md w-full">
                      <h2 className="text-xl font-bold mb-4 text-center">Simulation Complete!</h2>
                      
                      <div className="mb-4 text-center">
                        <div className="text-lg">Final Balance</div>
                        <div className="text-3xl font-bold mt-2">
                          ${(wallet.cash + (wallet.bitcoin * currentPrice)).toFixed(2)}
                        </div>
                      </div>
                      
                      {position !== 'neutral' && (
                        <div className="mb-4 p-3 bg-blue-900 bg-opacity-20 rounded-md">
                          <div className="text-center mb-2">Open Position</div>
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className={position === 'long' ? 'text-green-400' : 'text-red-400'}>
                              {position.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>P&L:</span>
                            <span className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                              ${pnl.toFixed(2)} ({((pnl / 1000) * 100).toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            setIsGameComplete(false);
                            restartSimulation();
                          }}
                          className="flex-1 btn btn-blue"
                        >
                          New Game
                        </button>
                        
                        <button 
                          onClick={() => setIsGameComplete(false)}
                          className="flex-1 btn btn-gray"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="cyber-card">
                  <div className="wallet-container">
                    <h2 className="wallet-title">Trading</h2>
                    
                    <div className="trade-buttons">
                      <button
                        onClick={enterLongPosition}
                        disabled={!isSimulationRunning}
                        className={`btn btn-long ${!isSimulationRunning ? 'btn-disabled' : ''}`}
                      >
                        LONG
                      </button>
                      
                      <button
                        onClick={closePosition}
                        disabled={!isSimulationRunning || position === 'neutral'}
                        className={`btn btn-close ${(!isSimulationRunning || position === 'neutral') ? 'btn-disabled' : ''}`}
                      >
                        CLOSE
                      </button>
                      
                      <button
                        onClick={enterShortPosition}
                        disabled={!isSimulationRunning}
                        className={`btn btn-short ${!isSimulationRunning ? 'btn-disabled' : ''}`}
                      >
                        SHORT
                      </button>
                    </div>
                    
                    {/* Simulation controls */}
                    <div className="flex gap-4">
                      {!isSimulationRunning ? (
                        <button
                          onClick={startSimulation}
                          className="btn btn-blue flex-1"
                        >
                          START SIMULATION
                        </button>
                      ) : (
                        <button
                          onClick={stopSimulation}
                          className="btn btn-gray flex-1"
                        >
                          PAUSE
                        </button>
                      )}
                      
                      <button
                        onClick={restartSimulation}
                        className="btn btn-gray flex-1"
                      >
                        RESTART
                      </button>
                      
                      {/* 매트릭스 코드 레인 효과 테스트 버튼 */}
                      {/* <button
                        onClick={() => {
                          // 매트릭스 효과 직접 테스트
                          addMatrixCodeRainEffect('#00ff7f'); // 녹색 효과
                          
                          // 3초 후 적색 효과도 테스트
                          setTimeout(() => {
                            addMatrixCodeRainEffect('#ff3e4d'); // 적색 효과
                          }, 3000);
                        }}
                        className="btn btn-gray"
                      >
                        MATRIX
                      </button> */}
                    </div>
                    
                    {/* Current scenario */}
                    <div className="mt-4 p-3 bg-blue-800 bg-opacity-20 rounded-md">
                      <h3 className="font-medium text-blue-300 mb-1">Current Scenario</h3>
                      <p className="text-sm text-white">{selectedScenario?.name}</p>
                      <p className="text-xs text-gray-300 mt-1">{selectedScenario?.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right panel: Status and event info */}
              <div>
                {/* Wallet info */}
                <div className="cyber-card mb-4">
                  <div className="wallet-container">
                    <h2 className="wallet-title">Wallet Status</h2>
                    
                    <div className="wallet-stats">
                      <div className="wallet-stat">
                        <div className="wallet-stat-label">Cash</div>
                        <div className="wallet-stat-value">${wallet.cash.toFixed(2)}</div>
                      </div>
                      
                      <div className="wallet-stat">
                        <div className="wallet-stat-label">Bitcoin</div>
                        <div className="wallet-stat-value">{wallet.bitcoin.toFixed(6)} BTC</div>
                      </div>
                    </div>
                    
                    {/* Position info */}
                    <div className="position-container">
                      <div className="wallet-stat-label">Current Position</div>
                      <div className="position-details">
                        <div className={`position-type position-type-${position === 'long' ? 'long' : position === 'short' ? 'short' : 'none'}`}>
                          {position === 'long' ? 'LONG' : position === 'short' ? 'SHORT' : 'NONE'}
                        </div>
                        {position !== 'neutral' && (
                          <div className="position-entry">
                            Entry: ${entryPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      {position !== 'neutral' && (
                        <div className={`position-pnl ${getPnlClass(pnl)}`}>
                          P&L: ${pnl.toFixed(2)} ({((pnl / 1000) * 100).toFixed(2)}%)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Event info */}
                <div className="cyber-card mb-4">
                  <div className="event-container">
                    <h2 className="event-title">Event Status</h2>
                    
                    {eventInfo && eventInfo.isActive ? (
                      <div className="event-active">
                        <div className="event-name">{eventInfo.name} In Progress</div>
                        <div className="event-description">{eventInfo.description}</div>
                        <div className="event-progress">
                          <div 
                            className="event-progress-bar"
                            style={{ width: `${(eventInfo.progress / eventInfo.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="event-progress-text">
                          {eventInfo.progress} / {eventInfo.total}
                        </div>
                      </div>
                    ) : (
                      <div className="event-inactive">
                        {eventInfo && !eventInfo.isActive ? (
                          <p>Event has ended.</p>
                        ) : (
                          <p>No events have triggered yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Trade history */}
                <div className="cyber-card">
                  <div className="history-container">
                    <h2 className="history-title">Trade History</h2>
                    
                    {gameHistory.length === 0 ? (
                      <div className="history-empty">
                        No trade history yet.
                      </div>
                    ) : (
                      <div className="history-scroll">
                        {gameHistory.map((record, index) => (
                          <div key={index} className="history-item">
                            {record.type === 'opened' ? (
                              <div>
                                <div className={`history-action history-action-${record.position}`}>
                                  {record.position === 'long' ? 'LONG' : 'SHORT'} Position Opened
                                </div>
                                <div className="history-details">
                                  Price: ${record.price.toFixed(2)} | Amount: {record.amount.toFixed(6)} BTC
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className={`history-action ${record.pnl >= 0 ? 'history-action-long' : 'history-action-short'}`}>
                                  POSITION CLOSED
                                </div>
                                <div className="history-details">
                                  Entry: ${record.entryPrice.toFixed(2)} | Exit: ${record.exitPrice.toFixed(2)}
                                </div>
                                <div className={`history-pnl ${record.pnl >= 0 ? 'history-pnl-positive' : 'history-pnl-negative'}`}>
                                  P&L: ${record.pnl.toFixed(2)} ({((record.pnl / 1000) * 100).toFixed(2)}%)
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer>
        <div className="container mx-auto">
          Trading Simulator Game - Test your trading strategies in historical scenarios
        </div>
      </footer>
      
      {/* Effects controller */}
      <EffectsController />
    </div>
  );
  
}
export default App;