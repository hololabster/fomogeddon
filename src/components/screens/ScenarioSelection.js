import React from 'react';
import { SCENARIOS } from '../../data/scenarios';

const ScenarioSelection = ({ onSelectScenario }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Select a Trading Scenario</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCENARIOS.map(scenario => (
          <div 
            key={scenario.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectScenario(scenario)}
          >
            <h3 className="text-lg font-medium mb-2">{scenario.name}</h3>
            <p className="text-gray-600 text-sm">{scenario.description}</p>
            <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block
              ${scenario.eventImpact.max > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Expected Impact: {scenario.eventImpact.min}% ~ {scenario.eventImpact.max}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelection;