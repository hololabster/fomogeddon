// src/components/game/PositionControls.js
import React from 'react';

const PositionControls = ({ 
  enterLongPosition, 
  enterShortPosition, 
  closePosition,
  isSimulationRunning,
  position
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <button
        onClick={enterLongPosition}
        disabled={!isSimulationRunning}
        className={`py-3 rounded-md font-medium text-white
          ${isSimulationRunning ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        LONG
      </button>
      
      <button
        onClick={closePosition}
        disabled={!isSimulationRunning || position === 'neutral'}
        className={`py-3 rounded-md font-medium
          ${isSimulationRunning && position !== 'neutral' 
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
      >
        CLOSE
      </button>
      
      <button
        onClick={enterShortPosition}
        disabled={!isSimulationRunning}
        className={`py-3 rounded-md font-medium text-white
          ${isSimulationRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        SHORT
      </button>
    </div>
  );
};

export default PositionControls;