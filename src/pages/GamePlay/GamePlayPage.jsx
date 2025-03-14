import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CyberpunkChart from "../../components/game/Chart";
import ChartRunnerCharacter from "../../components/game/ChartRunnerCharacter";
import { playDigitalSound } from "../../utils/soundEffects";
import {
  triggerTradeEffect,
  triggerPriceAlert,
  triggerPriceFlash,
  triggerEventAlert,
  triggerChartUpdate,
  addMatrixCodeRainEffect,
  addEMPWaveEffect,
  addDigitalNoiseEffect,
  addDataDisplayEffect,
} from "../../utils/effectsUtils";
import { calculatePnL } from "../../utils/calculations";
import useGameStore from "../../stores/gameStore";
import { SCENARIOS } from "../../data/scenarios";
import { simulatorEngine } from "../../services/simulator";
import { getChartData } from "../../services/chartDataService";
import { executeTradeOperations } from "../../context/MonadContract";
import { savePlayData } from "../../services/chartDataService";
import { MONAD_NETWORK } from "../../context/Network.constant";
// import { fetchBitcoinData } from "../../services/api";

const GamePlayPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { walletAddress } = useAuth();
  const {
    selectedScenario,
    setSelectedScenario,
    setNotification
  } = useGameStore();

  // Find scenario by ID from URL
  useEffect(() => {
    if (gameId && (!selectedScenario || selectedScenario.id !== gameId)) {
      // console.log("Looking for scenario with ID:", gameId);
      const scenario = SCENARIOS.find((s) => s.id === gameId);

      if (scenario) {
        // console.log("Found scenario, setting in store:", scenario);
        setSelectedScenario(scenario);
      } else {
        console.log("Scenario not found, redirecting to selection page");
        navigate("/scenario");
      }
    }
  }, [
    gameId,
    selectedScenario,
    setSelectedScenario,
    navigate,
  ]);

  const INITIAL_CASH = 10000;
  const BASE_INVESTMENT = 1000;

  // State management
  const [simulator, setSimulator] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [eventInfo, setEventInfo] = useState(null);
  const [wallet, setWallet] = useState({
    cash: INITIAL_CASH,
    bitcoin: 0,
  });

  const [gameProgress, setGameProgress] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [position, setPosition] = useState("neutral");
  const [entryPrice, setEntryPrice] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [apiChartData, setApiChartData] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [dataUpdating, setDataUpdating] = useState(false);
  const [characterSpeed, setCharacterSpeed] = useState("normal");
  const [tradeMarkers, setTradeMarkers] = useState([]);
  const [investment, setInvestment] = useState(1000); // 기본값 1000으로 설정
  const [inputValue, setInputValue] = useState("1000"); // 입력 필드 관리용 상태
  const [tx, setTx] = useState(""); // 트랜잭션용

  // 입력값 변경 핸들러 (새 함수로 추가)
  const handleInvestmentChange = (e) => {
    const value = e.target.value;
    
    // 숫자만 입력되도록 확인
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
      
      // 숫자로 변환하여 investment 상태 업데이트
      const numValue = value === "" ? 0 : parseInt(value, 10);
      
      // 숫자가 최소 금액보다 크고 사용자의 현금보다 작은지 확인
      if (numValue > 0 && numValue <= wallet.cash) {
        setInvestment(numValue);
      } else if (numValue > wallet.cash) {
        // 가능한 최대 금액으로 설정
        setInvestment(wallet.cash);
      }
    }
  };

  // 퀵 버튼 핸들러 (새 함수로 추가)
  const handleQuickInvestment = (percentage) => {
    let amount;
    
    if (percentage === 'all') {
      // 전체 금액
      amount = wallet.cash;
    } else {
      // 현금의 일정 비율
      amount = Math.floor(wallet.cash * (percentage / 100));
    }
    
    // 최소 금액 확인 (최소 1)
    amount = Math.max(1, amount);
    
    // 상태 업데이트
    setInvestment(amount);
    setInputValue(amount.toString());
  };

  const InvestmentInput = () => {
    return (
      <div className="investment-input-container">
        <h3 className="font-medium text-blue-300 text-sm">Investment Amount</h3>
        
        <div className="investment-input-wrapper">
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInvestmentChange}
              disabled={!isSimulationRunning || position !== "neutral"}
              className="investment-input"
            />
          </div>
          
          <div className="quick-buttons">
            <button
              onClick={() => handleQuickInvestment(10)}
              disabled={!isSimulationRunning || position !== "neutral"}
              className="btn btn-gray btn-small"
            >
              10%
            </button>
            <button
              onClick={() => handleQuickInvestment(25)}
              disabled={!isSimulationRunning || position !== "neutral"}
              className="btn btn-gray btn-small"
            >
              25%
            </button>
            <button
              onClick={() => handleQuickInvestment(50)}
              disabled={!isSimulationRunning || position !== "neutral"}
              className="btn btn-gray btn-small"
            >
              50%
            </button>
            <button
              onClick={() => handleQuickInvestment('all')}
              disabled={!isSimulationRunning || position !== "neutral"}
              className="btn btn-gray btn-small"
            >
              All
            </button>
          </div>
        </div>
        
        <div className="available-cash">
          <span>Available: ${wallet.cash.toFixed(2)}</span>
        </div>
      </div>
    );
  };


  const simulationInterval = useRef(null);
  const dataFetchInterval = useRef(null);
  const positionStateRef = useRef({
    type: "neutral",
    entryPrice: 0,
    amount: 0,
  });

  // 게임 종료 감지
  useEffect(()=> {
    // 게임 종료시 데이터 저장
    if(isGameComplete){
      setNotification({
        message: `Simulation complete! Final P&L: $${(wallet.cash - INITIAL_CASH).toFixed(2)}`,
        type: (wallet.cash - INITIAL_CASH) >= 0 ? "success" : "warning",
      });
      try {
        savePlayData({
          wallet_address: walletAddress,
          origin_scenario_id: gameId,
          balance: Math.floor(wallet.cash - INITIAL_CASH),
          customChartDataJson: JSON.stringify(chartData.slice(20))
        })
      } catch (error) {
        console.error(error);
      }
    }
  }, [chartData, gameId, isGameComplete, wallet.cash, walletAddress, setNotification])

  useEffect(()=>{
    // 파산 시
    if(isSimulationRunning && wallet.cash < 1 && wallet.bitcoin === 0){
      setNotification({
        message: `You were bankrupt!`,
        type: "warning",
      });
    }
  }, [isSimulationRunning, wallet.cash, wallet.bitcoin, setNotification])

  // Update position ref when state changes
  useEffect(() => {
    positionStateRef.current = {
      type: position,
      entryPrice,
      amount: wallet.bitcoin,
    };
  }, [position, entryPrice, wallet.bitcoin]);

  // Fetch chart data from API
  useEffect(() => {
    // fetchBitcoinData().then((data) => console.log(data));
    const loadChartData = async () => {
      try {
        setDataUpdating(true);
        triggerChartUpdate(true);

        const data = await getChartData(gameId);
        setApiChartData(data);
        console.log("Chart data loaded:", data.length, "points");

        setTimeout(() => {
          setDataUpdating(false);
          triggerChartUpdate(false);
        }, 1000);
      } catch (error) {
        console.error("Error loading chart data:", error);
        setDataUpdating(false);
        triggerChartUpdate(false);
      }
    };

    // Initial data load
    loadChartData();

    // Set up interval for periodically refreshing data
    // dataFetchInterval.current = setInterval(loadChartData, 60000);

    return () => {
      // if (dataFetchInterval.current) {
      // clearInterval(dataFetchInterval.current);
      // }

      // Clear simulation interval when unmounting
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }

      setSimulator(null);
    };
  }, []);

  // Initialize simulator with scenario and API data
  useEffect(() => {
    if (
      selectedScenario &&
      apiChartData &&
      apiChartData.length > 0 &&
      !simulator
    ) {
      console.log(
        "Initializing simulator with scenario:",
        selectedScenario.name
      );
      const initialPrice =
        apiChartData.length > 0 ? apiChartData[0].price : 40000;

      const newSimulator = new simulatorEngine(initialPrice, selectedScenario);
      setSimulator(newSimulator);
      setChartData(newSimulator.getHistory());
      setCurrentPrice(initialPrice);
      setPreviousPrice(initialPrice);

      // Display notification
      setNotification({
        message: `${selectedScenario.name} scenario loaded. Ready to start!`,
        type: "info"
      });
    }
  }, [selectedScenario, apiChartData, simulator, setNotification]);

  // Update character speed based on simulation speed
  useEffect(() => {
    if (simulationSpeed === 4000) {
      setCharacterSpeed("very-slow");
    } else if (simulationSpeed === 2000) {
      setCharacterSpeed("slow");
    } else if (simulationSpeed === 1000) {
      setCharacterSpeed("normal");
    } else if (simulationSpeed === 500) {
      setCharacterSpeed("fast");
    } else {
      setCharacterSpeed("very-fast");
    }
  }, [simulationSpeed]);

  // Start simulation
  const startSimulation = () => {
    console.log("Starting simulation with:", {
      simulator: simulator ? "Available" : "Not available",
      scenario: selectedScenario?.name,
      apiData: apiChartData.length > 0 ? "Available" : "Not available",
    });

    if (!simulator) {
      if (selectedScenario && apiChartData && apiChartData.length > 0) {
        console.log("No simulator but scenario exists, initializing now");
        const initialPrice =
          apiChartData.length > 0 ? apiChartData[0].price : 40000;

        const newSimulator = new simulatorEngine(
          initialPrice,
          selectedScenario
        );
        setSimulator(newSimulator);
        setChartData(newSimulator.getHistory());
        setCurrentPrice(initialPrice);
        setPreviousPrice(initialPrice);

        // Start after initialization
        setTimeout(() => {
          setIsSimulationRunning(true);
          playDigitalSound("start");
          addDigitalNoiseEffect();
          startSimulationLoop(newSimulator);
        }, 100);
        return;
      } else {
        console.log("No simulator and no scenario available");
        playDigitalSound("fail");
        setNotification({
          message: `No simulator and no scenario available. Please try later.`,
          type: "error",
          time:5000})
        return;
      }
    }

    setIsSimulationRunning(true);
    playDigitalSound("start");
    addDigitalNoiseEffect();
    setIsGameComplete(false);
    startSimulationLoop(simulator);
  };

  // Simulation loop
  const startSimulationLoop = (simulatorInstance) => {
    simulationInterval.current = setInterval(() => {
      if (simulatorInstance) {
        // Save previous price
        setPreviousPrice(currentPrice);

        // Step simulation forward using API data
        const result = simulatorInstance.step(apiChartData);
        setCurrentPrice(result.price);
        setPercentChange(result.percentChange);

        // Update game progress
        setGameProgress(simulatorInstance.getGameProgress());

        // Update chart data
        setChartData((prevData) => {
          if (!Array.isArray(prevData)) return simulatorInstance.getHistory();
          return simulatorInstance.getHistory();
        });

        // Check if game is complete
        if (simulatorInstance.isGameComplete()) {
          // Auto-close position at game end if any is open
          if (positionStateRef.current.type !== "neutral") {
            // Save position info
            const lastTradePosition = positionStateRef.current.type;
            const lastTradeEntryPrice = positionStateRef.current.entryPrice;
            const lastTradeAmount = positionStateRef.current.amount;

            // Calculate PnL
            const lastTradePnl = calculatePnL(
              lastTradePosition,
              lastTradeEntryPrice,
              result.price,
              lastTradeAmount
            );

            // Calculate return amount (minimum 0)
            let returnAmount = investment + lastTradePnl;
            returnAmount = Math.max(0, returnAmount);

            // Add to trade history
            setGameHistory((prev) => [
              ...prev,
              {
                type: "closed",
                position: lastTradePosition,
                entryPrice: lastTradeEntryPrice,
                exitPrice: result.price,
                amount: lastTradeAmount,
                pnl: lastTradePnl,
                autoClose: true,
              },
            ]);

            // Update wallet
            setWallet((prev) => ({
              cash: prev.cash + returnAmount,
              bitcoin: 0,
            }));

            // Reset position
            setPosition("neutral");
            setEntryPrice(0);
            setPnl(0);
          }

          // End game
          setIsGameComplete(true);
          stopSimulation();
          return;
        }

        // Visual effects for price changes
        updatePriceDisplay(result.price, currentPrice);

        // Update event info
        const eventStatus = simulatorInstance.getEventInfo();
        setEventInfo(eventStatus);

        // Handle large price movements
        if (Math.abs(result.percentChange) >= 1) {
          const alertType = result.percentChange > 0 ? "up" : "down";
          triggerPriceAlert(alertType, result.percentChange);
          addMatrixCodeRainEffect(alertType === "up" ? "#00ff7f" : "#ff3e4d");
        }

        // Handle event start notifications
        if (eventStatus && eventStatus.isActive && eventStatus.progress === 1) {
          playDigitalSound("alert");
          setGlitchEffect(true);
          setTimeout(() => setGlitchEffect(false), 1500);
          triggerEventAlert();
          addEMPWaveEffect("#ffcc00");

          setNotification({
            message: `${eventStatus.name} event triggered: ${eventStatus.description}`,
            type: "warning",
            time: 7000
          });
        }

        // Position P&L calculation and liquidation check
        if (positionStateRef.current.type !== "neutral") {
          // Calculate PnL
          const calculatedPnl = calculatePnL(
            positionStateRef.current.type,
            positionStateRef.current.entryPrice,
            result.price,
            positionStateRef.current.amount
          );

          setPnl(calculatedPnl);

          // Check for liquidation (100% loss)
          const shouldLiquidate =
            (calculatedPnl / investment) * 100 <= -100;

          // Handle liquidation
          if (shouldLiquidate) {
            triggerTradeEffect("liquidation");
            playDigitalSound("fail");
            addDataDisplayEffect("#898989");

            // Add liquidation marker
            const latestDataPoint = chartData[chartData.length - 1] || {
              time: Date.now(),
            };
            setTradeMarkers((prev) => [
              ...prev,
              {
                type: "liquidate",
                position: position,
                time: latestDataPoint.time,
                price: result.price,
                amount: wallet.bitcoin,
              },
            ]);

            // Add to history
            setGameHistory((prevHistory) => [
              ...prevHistory,
              {
                type: "liquidated",
                position,
                entryPrice: positionStateRef.current.entryPrice,
                exitPrice: result.price,
                amount: wallet.bitcoin,
                pnl: -investment,
              },
            ]);

            // Reset position
            setWallet((prevWallet) => ({
              ...prevWallet,
              bitcoin: 0,
            }));
            setPosition("neutral");
            setEntryPrice(0);
            setPnl(0);

            // Show notification
            setNotification({
              message: `LIQUIDATION! Your ${position.toUpperCase()} position has been liquidated`,
              type: "error",
            });
          }
        }
      }
    }, simulationSpeed);
  };

  // Update price display with visual effects
  const updatePriceDisplay = (newPrice, oldPrice) => {
    if (!oldPrice) return;

    const priceElement = document.querySelector(".price-value");
    if (!priceElement) return;

    priceElement.classList.remove("price-flash-up", "price-flash-down");

    if (newPrice > oldPrice) {
      priceElement.classList.add("price-flash-up");
    } else if (newPrice < oldPrice) {
      priceElement.classList.add("price-flash-down");
    }

    triggerPriceFlash(newPrice, oldPrice);
  };

  // Stop simulation
  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsSimulationRunning(false);
    playDigitalSound("stop");
  };

  // Enter long position
  const enterLongPosition = () => {
    if (wallet.cash < investment) {
      setNotification({
        message: "Insufficient funds: Transaction rejected",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }

    // Only allow if not in any position
    if (position !== "neutral") {
      setNotification({
        message: "Close current position before opening a new one",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }

    playDigitalSound("trade");
    triggerTradeEffect("long");
    addDataDisplayEffect("#00ff7f");

    const btcAmount = investment / currentPrice;

    const latestDataPoint = chartData[chartData.length - 1] || {
      time: Date.now(),
    };

    // Add trade marker
    setTradeMarkers((prev) => [
      ...prev,
      {
        type: "open",
        position: "long",
        time: latestDataPoint.time,
        price: currentPrice,
        amount: btcAmount,
      },
    ]);

    // Update wallet and position
    setPosition("long");
    setEntryPrice(currentPrice);
    setWallet({
      cash: wallet.cash - investment,
      bitcoin: btcAmount,
    });

    // Add to trade history
    setGameHistory((prev) => [
      ...prev,
      {
        type: "opened",
        position: "long",
        price: currentPrice,
        amount: btcAmount,
        investment: investment,
      },
    ]);

    // Show notification
    setNotification({
      message: `LONG position entered: ${btcAmount.toFixed(
        6
      )} BTC @ $${currentPrice.toFixed(2)}`,
      type: "success",
    });
    setTimeout(() => playDigitalSound("success"), 300);
  };

  // Enter 5X long position
  const enter5XLongPosition = () => {
    if (wallet.cash < investment) {
      setNotification({
        message: "Insufficient funds: Transaction rejected",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }
  
    // 중립 상태일 때만 새 포지션 허용 (기존 포지션과 무관하게)
    if (position !== "neutral") {
      setNotification({
        message: "Close current position before opening a new one",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }
  
    playDigitalSound("trade");
    triggerTradeEffect("5XLong");
    addDataDisplayEffect("#11eefe");
  
    const btcAmount = investment / currentPrice;
  
    const latestDataPoint = chartData[chartData.length - 1] || {
      time: Date.now(),
    };
  
    // 트레이드 마커 추가
    setTradeMarkers((prev) => [
      ...prev,
      {
        type: "open",
        position: "5XLong",
        time: latestDataPoint.time,
        price: currentPrice,
        amount: btcAmount,
      },
    ]);
  
    // 지갑과 포지션 업데이트
    setPosition("5XLong");
    setEntryPrice(currentPrice);
    setWallet({
      cash: wallet.cash - investment,
      bitcoin: btcAmount,
    });
  
    // 거래 내역에 추가
    setGameHistory((prev) => [
      ...prev,
      {
        type: "opened",
        position: "5XLong",
        price: currentPrice,
        amount: btcAmount,
        investment: investment,
        leverage: 5
      },
    ]);
  
    // 알림 표시
    setNotification({
      message: `5X LONG position entered: ${btcAmount.toFixed(
        6
      )} BTC @ $${currentPrice.toFixed(2)}`,
      type: "success",
    });
    setTimeout(() => playDigitalSound("success"), 300);
  };  

  // Enter short position
  const enterShortPosition = () => {
    if (wallet.cash < investment) {
      setNotification({
        message: "Insufficient funds: Transaction rejected",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }

    // Only allow if not in any position
    if (position !== "neutral") {
      setNotification({
        message: "Close current position before opening a new one",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }

    playDigitalSound("trade");
    triggerTradeEffect("short");
    addDataDisplayEffect("#ff3e4d");

    const btcAmount = investment / currentPrice;

    const latestDataPoint = chartData[chartData.length - 1] || {
      time: Date.now(),
    };

    // Add trade marker
    setTradeMarkers((prev) => [
      ...prev,
      {
        type: "open",
        position: "short",
        time: latestDataPoint.time,
        price: currentPrice,
        amount: btcAmount,
      },
    ]);

    // Update wallet and position
    setPosition("short");
    setEntryPrice(currentPrice);
    setWallet({
      cash: wallet.cash - investment,
      bitcoin: btcAmount,
    });

    // Add to trade history
    setGameHistory((prev) => [
      ...prev,
      {
        type: "opened",
        position: "short",
        price: currentPrice,
        amount: btcAmount,
        investment: investment,
      },
    ]);

    // Show notification
    setNotification({
      message: `SHORT position entered: ${btcAmount.toFixed(
        6
      )} BTC @ ${currentPrice.toFixed(2)}`,
      type: "success",
    });
    setTimeout(() => playDigitalSound("success"), 300);
  };

  // Enter 5X short position
  const enter5XShortPosition = () => {
    if (wallet.cash < investment) {
      setNotification({
        message: "Insufficient funds: Transaction rejected",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }
  
    // 중립 상태일 때만 새 포지션 허용 (기존 포지션과 무관하게)
    if (position !== "neutral") {
      setNotification({
        message: "Close current position before opening a new one",
        type: "error",
      });
      playDigitalSound("fail");
      return;
    }
  
    playDigitalSound("trade");
    triggerTradeEffect("5XShort");
    addDataDisplayEffect("#f9381e");
  
    const btcAmount = investment / currentPrice;
  
    const latestDataPoint = chartData[chartData.length - 1] || {
      time: Date.now(),
    };
  
    // 트레이드 마커 추가
    setTradeMarkers((prev) => [
      ...prev,
      {
        type: "open",
        position: "5XShort",
        time: latestDataPoint.time,
        price: currentPrice,
        amount: btcAmount,
      },
    ]);
  
    // 지갑과 포지션 업데이트
    setPosition("5XShort");
    setEntryPrice(currentPrice);
    setWallet({
      cash: wallet.cash - investment,
      bitcoin: btcAmount,
    });
  
    // 거래 내역에 추가
    setGameHistory((prev) => [
      ...prev,
      {
        type: "opened",
        position: "5XShort",
        price: currentPrice,
        amount: btcAmount,
        investment: investment,
        leverage: 5
      },
    ]);
  
    // 알림 표시
    setNotification({
      message: `5X SHORT position entered: ${btcAmount.toFixed(
        6
      )} BTC @ $${currentPrice.toFixed(2)}`,
      type: "success",
    });
    setTimeout(() => playDigitalSound("success"), 300);
  };

  // Close position
  const closePosition = () => {
    if (position === "neutral" || wallet.bitcoin === 0) {
      return;
    }

    playDigitalSound("trade");
    triggerTradeEffect("close");
    addDataDisplayEffect("#ffcc00");

    const positionPnl = calculatePnL(
      position,
      entryPrice,
      currentPrice,
      wallet.bitcoin
    );

    // Calculate return amount (BASE_INVESTMENT + PnL)
    let returnAmount = investment + positionPnl;
    returnAmount = Math.max(0, returnAmount);

    const latestDataPoint = chartData[chartData.length - 1] || {
      time: Date.now(),
    };

    // Add trade marker
    setTradeMarkers((prev) => [
      ...prev,
      {
        type: "close",
        position: position,
        time: latestDataPoint.time,
        price: currentPrice,
        amount: wallet.bitcoin,
        pnl: positionPnl,
      },
    ]);

    // Add to trade history
    setGameHistory((prev) => [
      ...prev,
      {
        type: "closed",
        position,
        entryPrice,
        exitPrice: currentPrice,
        amount: wallet.bitcoin,
        pnl: positionPnl,
      },
    ]);

    // Update wallet
    setWallet((prev) => ({
      cash: prev.cash + returnAmount,
      bitcoin: 0,
    }));

    // Reset position
    setPosition("neutral");
    setEntryPrice(0);
    setPnl(0);

    const pnlResult = positionPnl >= 0 ? "PROFIT" : "LOSS";

    // Show notification
    setNotification({
      message: `POSITION CLOSED! ${pnlResult}: ${positionPnl.toFixed(2)}`,
      type: positionPnl >= 0 ? "success" : "warning",
    });
    setTimeout(
      () => playDigitalSound(positionPnl >= 0 ? "success" : "fail"),
      300
    );
  };

  // Restart simulation
  const restartSimulation = () => {
    // Stop the simulation
    stopSimulation();

    // Reset all game states
    setWallet({
      cash: 10000,
      bitcoin: 0,
    });
    setPosition("neutral");
    setEntryPrice(0);
    setPnl(0);
    setGameHistory([]);
    setTradeMarkers([]);

    // Reset simulation-specific states
    setSimulator(null);
    setChartData([]);
    setCurrentPrice(0);
    setPreviousPrice(0);
    setPercentChange(0);
    setEventInfo(null);
    setGameProgress(0);
    setIsGameComplete(false);
  };

  // Reset handler with confirmation
  const resetHandler = () => {
    if (gameProgress !== 0) {
      const isReset = window.confirm(
        "Do you want to reset the game in progress?"
      );
      if (isReset) {
        restartSimulation();
      }
    } else {
      restartSimulation();
    }
  };

  const savePlayHandler = async () => {
    try {
      const {userAddress, tradeCount, lastTrade, tx} = await executeTradeOperations(gameHistory);
      setTx(tx);
      setNotification({
        message: `Your transaction was successful! \n Transaction hash: ${tx}`,
        type: "success",
        time: 7000
      })
    } catch (error) {
      setNotification({
        message: "Failed to save your play data",
        type: "error"
      })
    }
  };

  // CSS class helpers
  const getPriceChangeClass = () => {
    if (percentChange > 0) return "price-change-positive";
    if (percentChange < 0) return "price-change-negative";
    return "price-change-neutral";
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case "success":
        return "notification notification-success";
      case "error":
        return "notification notification-error";
      case "warning":
        return "notification notification-warning";
      default:
        return "notification";
    }
  };

  const getPnlClass = (value) => {
    return value >= 0 ? "position-pnl-positive" : "position-pnl-negative";
  };

  return (
    <div className="game-wrap">
      <div className="scenario-banner">
        <div className="scenario-banner-text">
          <span>{selectedScenario?.name}</span> scenario selected. Start the
          simulation!
          <p className="text-xs text-gray-300 mt-1">
            {selectedScenario?.description}
          </p>
        </div>

        <button
          onClick={() => navigate("/scenario")}
          className="btn btn-blue"
          style={{ marginBottom: 1.5 + "rem" }}
        >
          Go to Scenario Selection
        </button>
      </div>

      {isGameComplete && (
        <div className="basics-card">
          <div className="complete-wrap">
            <h3 className="font-medium text-blue-300 text-sm">
              Simulation Complete!
            </h3>

            <div className="wallet-stats">
              <div className="mb-4 text-center wallet-stat">
                <div className="text-lg complete-text">Final Balance </div>
                <div className="text-3xl font-bold mt-2">
                  ${(wallet.cash + wallet.bitcoin * currentPrice).toFixed(2)}
                </div>
              </div>

              {position !== "neutral" && (
                <div className="mb-4 p-3 bg-blue-900 bg-opacity-20 rounded-md wallet-stat">
                  <div className="text-center mb-2 complete-text">
                    Open Position
                  </div>

                  <div className="open-pos-wrap">
                    <div className="flex justify-between">
                      <span>Type : </span>
                      <span
                        className={
                          position === "long"
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {position.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>P&L : </span>
                      <span
                        className={pnl >= 0 ? "text-green-400" : "text-red-400"}
                      >
                        ${pnl.toFixed(2)} (
                        {((pnl / investment) * 100).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {tx !== "" && (
                <div className="mb-4 p-3 bg-blue-900 bg-opacity-20 rounded-md wallet-stat">
                  <div className="text-center mb-2 complete-text">
                    Transaction successful
                  </div>

                  <div className="open-pos-wrap">
                    <div className="flex justify-between">
                      <a href={MONAD_NETWORK.blockExplorerUrls[0] + "tx/" + tx}>
                        {tx}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div style={{ position: "relative" }}>
            <CyberpunkChart
              data={chartData}
              currentPrice={currentPrice}
              percentChange={percentChange}
              tradeMarkers={tradeMarkers}
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

          <div className="btn-wrap">
        <div className="flex gap-4" style={{ marginBottom: 1 + "rem" }}>
          {isGameComplete ? (
            <>
              <button
                onClick={restartSimulation}
                className="flex-1 btn btn-blue"
              >
                New Game
              </button>
            </>
          ) : (
            <>
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
            </>
          )}

          {isGameComplete ? (
            <button onClick={savePlayHandler} className="btn btn-gray flex-1" disabled={tx}>
              SAVE YOUR PLAY
            </button>
          ) : (
            <button onClick={resetHandler} className="btn btn-gray flex-1">
              RESET
            </button>
          )}
        </div>

        <div className="mt-4 speed-wrap">
          <p>Simulation Speed</p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8 + "px",
              marginBottom: 8 + "px",
            }}
          >
            <div className="flex-1 text-center speed-text">
              <span className="text-sm text-gray-300">
                {simulationSpeed === 4000
                  ? "Very Slow"
                  : simulationSpeed === 2000
                  ? "Slow"
                  : simulationSpeed === 1000
                  ? "Normal"
                  : simulationSpeed === 500
                  ? "Fast"
                  : "Very Fast"}
              </span>
            </div>

            <div className="up-down-btns">
              <button
                onClick={() => {
                  const newSpeed = Math.min(simulationSpeed * 2, 4000);
                  setSimulationSpeed(newSpeed);
                  if (isSimulationRunning) {
                    stopSimulation();
                    setTimeout(() => startSimulation(), 100);
                  }
                }}
                className=""
                disabled={simulationSpeed >= 4000}
              >
                <div className="triangle-down-small"></div>
              </button>

              <button
                onClick={() => {
                  const newSpeed = Math.max(simulationSpeed / 2, 250);
                  setSimulationSpeed(newSpeed);
                  if (isSimulationRunning) {
                    stopSimulation();
                    setTimeout(() => startSimulation(), 100);
                  }
                }}
                className=""
                disabled={simulationSpeed <= 250}
              >
                <div className="triangle-up-small"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
          <div className="basics-card">
            <div className="progress-wrap">
              <div className="flex justify-between items-center mb-1">
                <div className="top-wrap">
                  <h3 className="font-medium text-blue-300 text-sm">
                    Simulation Progress
                  </h3>
                  <span className="text-xs text-gray-300">
                    {Math.floor(gameProgress)}%
                  </span>
                </div>
              </div>
              <div className="bg-gray-700 h-2 rounded-full overflow-hidden progress-content">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${gameProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="basics-card grid-content">
            <div className="event-container">
              <h3 className="font-medium text-blue-300 text-sm">
                Event Status
              </h3>

              {eventInfo && eventInfo.isActive ? (
                <div className="event-active">
                  <div className="event-name">{eventInfo.name} In Progress</div>
                  <div className="event-description">
                    {eventInfo.description}
                  </div>
                  <div className="event-progress">
                    <div
                      className="event-progress-bar"
                      style={{
                        width: `${
                          (eventInfo.progress / eventInfo.total) * 100
                        }%`,
                      }}
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

            <div className="wallet-container">
              <h3 className="font-medium text-blue-300 text-sm">Trading</h3>
              <InvestmentInput/>
              <div className="trade-buttons">
                <button
                  onClick={enter5XLongPosition}
                  disabled={!isSimulationRunning || position !== "neutral"}
                  className={`btn btn-long x5 ${
                    !isSimulationRunning || position !== "neutral" ? "btn-disabled" : ""
                  }`}
                >
                  5X LONG
                </button>

                <button
                  onClick={enterLongPosition}
                  disabled={!isSimulationRunning || position !== "neutral"}
                  className={`btn btn-long ${
                    !isSimulationRunning || position !== "neutral" ? "btn-disabled" : ""
                  }`}
                >
                  LONG
                </button>
                
                <button
                  onClick={closePosition}
                  disabled={!isSimulationRunning || position === "neutral"}
                  className={`btn btn-close ${
                    !isSimulationRunning || position === "neutral" ? "btn-disabled" : ""
                  }`}
                >
                  CLOSE
                </button>
                
                <button
                  onClick={enterShortPosition}
                  disabled={!isSimulationRunning || position !== "neutral"}
                  className={`btn btn-short ${
                    !isSimulationRunning || position !== "neutral" ? "btn-disabled" : ""
                  }`}
                >
                  SHORT
                </button>
                
                <button
                  onClick={enter5XShortPosition}
                  disabled={!isSimulationRunning || position !== "neutral"}
                  className={`btn btn-short x5 ${
                    !isSimulationRunning || position !== "neutral" ? "btn-disabled" : ""
                  }`}
                >
                  5X SHORT
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="basics-card grid-content">
          <div className="wallet-container">
            <h3 className="font-medium text-blue-300 text-sm">Wallet Status</h3>

            <div className="wallet-stats">
              <div className="wallet-stat">
                <div className="wallet-stat-label">Cash</div>
                <div className="wallet-stat-value">
                  ${wallet.cash.toFixed(2)}
                </div>
              </div>

              <div className="wallet-stat">
                <div className="wallet-stat-label">Bitcoin</div>
                <div className="wallet-stat-value">
                  {wallet.bitcoin.toFixed(6)} BTC
                </div>
              </div>
            </div>

            <div className="position-container">
              <div className="wallet-stat-label">Current Position</div>
              <div className="position-details">
                <div
                  className={`position-type position-type-${
                    position === "long" || position === "5XLong"
                      ? "long"
                      : position === "short" || position === "5XShort"
                      ? "short"
                      : "none"
                  }`}
                >
                  {position === "long"
                    ? "LONG"
                    : position === "short"
                    ? "SHORT"
                    : position === "5XLong"
                    ? "5X LONG"
                    : position === "5XShort"
                    ? "5X SHORT"
                    : "NONE"}
                </div>
                {position !== "neutral" && (
                  <div className="position-entry">
                    Entry: ${entryPrice.toFixed(2)}
                  </div>
                )}
              </div>

              {position !== "neutral" && (
                <div className={`position-pnl ${getPnlClass(pnl)}`}>
                  P&L: ${pnl.toFixed(2)} (
                  {((pnl / investment) * 100).toFixed(2)}%)
                </div>
              )}
            </div>
          </div>
          <div className="history-container">
            <h3 className="font-medium text-blue-300 text-sm">Trade History</h3>

            {gameHistory.length === 0 ? (
              <div className="history-empty">No trade history yet.</div>
            ) : (
              <div className="history-scroll">
                {gameHistory.map((record, index) => (
                  <div key={index} className="history-item">
                    {record.type === "opened" ? (
                      <div>
                        <div
                          className={`history-action history-action-${record?.position}`}
                        >
                          {record?.position.toUpperCase()} Position Opened
                        </div>
                        <div className="history-details">
                          Price: ${record?.price?.toFixed(2) || "0.00"} |
                          Amount: {record?.amount?.toFixed(6) || "0.000000"} BTC
                        </div>
                      </div>
                    ) : record.type === "leveraged" ? (
                      <div>
                        <div
                          className={`history-action history-action-${record?.position}`}
                        >
                          {record?.position?.replace("5X", "5X ")} Activated
                        </div>
                        <div className="history-details">
                          Price: ${record?.price?.toFixed(2) || "0.00"} |
                          Amount: {record?.amount?.toFixed(6) || "0.000000"} BTC
                        </div>
                        <div className="history-details">
                          Leverage: {record?.leverage || 5}x
                        </div>
                      </div>
                    ) : record.type === "liquidated" ? (
                      <div>
                        <div className="history-action history-action-short">
                          POSITION LIQUIDATED
                        </div>
                        <div className="history-details">
                          Entry: ${record?.entryPrice?.toFixed(2) || "0.00"} |
                          Exit: ${record?.exitPrice?.toFixed(2) || "0.00"}
                        </div>
                        <div className="history-pnl history-pnl-negative">
                          P&L: ${record?.pnl?.toFixed(2) || "0.00"} (100% Loss)
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className={`history-action ${
                            (record?.pnl || 0) >= 0
                              ? "history-action-long"
                              : "history-action-short"
                          }`}
                        >
                          POSITION CLOSED
                        </div>
                        <div className="history-details">
                          Entry: ${record?.entryPrice?.toFixed(2) || "0.00"} |
                          Exit: ${record?.exitPrice?.toFixed(2) || "0.00"}
                        </div>
                        <div
                          className={`history-pnl ${
                            (record?.pnl || 0) >= 0
                              ? "history-pnl-positive"
                              : "history-pnl-negative"
                          }`}
                        >
                          P&L: ${record?.pnl?.toFixed(2) || "0.00"} (
                          {(
                            ((record?.pnl || 0) / investment) *
                            100
                          ).toFixed(2)}
                          %)
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
  );
};

export default GamePlayPage;
