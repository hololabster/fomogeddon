// src/services/chartDataService.js

import { realChartData } from "../data/chartData";

// const API_BASE_URL = "http://localhost:9998";
const API_BASE_URL = "https://fomogeddon-api.playarts.ai";

/**
 * Fetches chart data from the backend API
 * Returns properly formatted data for the chart component
 * @returns {Promise<Array>} Array of chart data points in the format [{time: timestamp, price: value}]
 */
export const getChartData = async (gameId) => {
  try {
    // const chartDataKey = gameId.replace("-", "_");
    // const chartData = realChartData[chartDataKey];
    // const data = chartData.slice(-200);

    const response = await fetch(`${API_BASE_URL}/Chart/getChartData?origin_scenario_id=${gameId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return data.map((point) => ({
      time: point.Time,
      price: point.Price,
    }));
  } catch (error) {
    console.error("Error fetching chart data:", error);

    // Return empty array in case of error
    // The application can handle this gracefully
    return [];
  }
};

// {
//   "wallet_address": "사용자_지갑_주소",
//   "origin_scenario_id": 1,
//   "balance": 1000.0,
//   "customChartDataJson": "{\"1231\": 10, \"3123\": 20}"
// }
export const savePlayData = async (bodyData={}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Chart/save-playData`,{
      method: 'POST',
      headers:{
        "Content-type": "application/json"
      },
      body: JSON.stringify(bodyData)
    })
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }else{
      return true;
    }
  } catch (error) {
    console.error("Error saving play data:", error);
    return false;
  }
}

export const getLeaderBoard = async (scenarioId) => {
  try {
    let url = `${API_BASE_URL}/Chart/getLeaderBoard`;
    if(scenarioId){
      url += `?scenarioId=${scenarioId}`
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
}