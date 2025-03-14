// src/components/screens/SimulationScreen.js
import React from 'react';
import Chart from '../game/Chart';
import WalletStatus from '../game/WalletStatus';
import EventPanel from '../game/EventPanel';
import PositionControls from '../game/PositionControls';
import SimulationControls from '../game/SimulationControls';
import TradeHistory from '../game/TradeHistory';

const SimulationScreen = ({
  selectedScenario,
  chartData,
  currentPrice,
  percentChange,
  wallet,
  position,
  entryPrice,
  pnl,
  eventInfo,
  gameHistory,
  isSimulationRunning,
  enterLongPosition,
  enterShortPosition,
  closePosition,
  startSimulation,
  stopSimulation,
  restartSimulation
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left panel: Chart and trading controls */}
        <div className="lg:col-span-2">
          <Chart 
            data={chartData}
            currentPrice={currentPrice}
            percentChange={percentChange}
          />
          
          {/* Trading controls */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Trading</h2>
            
            <PositionControls
              enterLongPosition={enterLongPosition}
              enterShortPosition={enterShortPosition}
              closePosition={closePosition}
              isSimulationRunning={isSimulationRunning}
              position={position}
            />
            
            <SimulationControls
              startSimulation={startSimulation}
              stopSimulation={stopSimulation}
              restartSimulation={restartSimulation}
              isSimulationRunning={isSimulationRunning}
            />
            
            {/* Current scenario */}
            <div className="bg-gray-100 p-3 rounded-md">
              <h3 className="font-medium mb-1">Current Scenario</h3>
              <p className="text-sm">{selectedScenario?.name}</p>
              <p className="text-xs text-gray-600 mt-1">{selectedScenario?.description}</p>
            </div>
          </div>
        </div>
        
        {/* Right panel: Status and event info */}
        <div className="lg:col-span-1">
          <WalletStatus 
            wallet={wallet}
            position={position}
            entryPrice={entryPrice}
            pnl={pnl}
          />
          
          <EventPanel eventInfo={eventInfo} />
          
          <TradeHistory gameHistory={gameHistory} />
        </div>
      </div>
    </div>
  );
};

export default SimulationScreen;