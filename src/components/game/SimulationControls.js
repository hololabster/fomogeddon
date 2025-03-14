// src/components/game/SimulationControls.js
import React from 'react';

const SimulationControls = ({ 
  startSimulation, 
  stopSimulation, 
  restartSimulation,
  isSimulationRunning
}) => {
  return (
    <div className="flex gap-4 mb-4">
      {!isSimulationRunning ? (
        <button
          onClick={startSimulation}
          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
        >
          Start Simulation
        </button>
      ) : (
        <button
          onClick={stopSimulation}
          className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
        >
          Pause Simulation
        </button>
      )}
      
      <button
        onClick={restartSimulation}
        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
      >
        Restart
      </button>
    </div>
  );
};

export default SimulationControls;