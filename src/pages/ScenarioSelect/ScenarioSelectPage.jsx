import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDigitalNoiseEffect } from "../../utils/effectsUtils";
import { SCENARIOS } from "../../data/scenarios";
import { playDigitalSound } from "../../utils/soundEffects";
import useGameStore from "../../stores/gameStore";

const ScenarioSelectPage = () => {
  const navigate = useNavigate();
  const { setNotification, setSelectedScenario } =
    useGameStore();

  // Scenario selection handler
  const selectScenario = (scenario) => {
    console.log("Scenario selected:", scenario);

    // Update the global store
    setSelectedScenario(scenario);

    // Show notification
    setNotification({
      message: `${scenario.name} scenario selected. Start the simulation!`,
      type: "info",
    });

    // Add visual effects
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 1000);
    addDigitalNoiseEffect();

    // Play sound effect
    playDigitalSound("select");

    // Navigate to game page
    console.log("Navigating to game page with scenario:", scenario.name);
    navigate(`/game/${scenario.id}`);
  };

  // Visual effect state
  const [glitchEffect, setGlitchEffect] = useState(false);

  return (
    <div className="leaderboard-content">
      <h2 className="text-xl font-semibold mb-4">Select Scenario</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 rank-wrap">
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className={`scenario-card cyber-card ${
              glitchEffect ? "glitch" : ""
            }`}
            onClick={() => selectScenario(scenario)}
          >
            <h3>{scenario.name}</h3>
            <p>{scenario.description}</p>
            <div
              className={`impact-badge ${
                scenario.eventImpact.max > 0
                  ? "impact-positive"
                  : "impact-negative"
              }`}
            >
              Expected Impact: {scenario.eventImpact.min}% ~{" "}
              {scenario.eventImpact.max}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelectPage;
