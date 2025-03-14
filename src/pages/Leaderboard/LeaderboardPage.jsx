import React, { useState, useEffect } from "react";
import RankingCard from "../../components/leaderboard/RankingCard";
import { SCENARIOS } from "../../data/scenarios";
import { getLeaderBoard } from "../../services/chartDataService";

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    overall: [],
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("scenarios"); // "overall" or "scenarios"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 모든 API 호출을 병렬로 준비
        const fetchPromises = [
          // 전체 리더보드 데이터를 가져오는 Promise
          getLeaderBoard().then(data => ({ id: 'overall', data })),
          
          // 각 시나리오별 리더보드 데이터를 가져오는 Promise 배열
          ...SCENARIOS.map(scenario => 
            getLeaderBoard(scenario.id).then(data => ({ id: scenario.id, data }))
          )
        ];
        
        // 모든 Promise 병렬 실행
        const results = await Promise.allSettled(fetchPromises);
        
        // 결과 데이터 처리
        const newLeaderboardData = {};
        
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const { id, data } = result.value;
            newLeaderboardData[id] = data;
          } else {
            // 실패한 호출에 대해서는 빈 배열 설정
            console.error(`Failed to fetch data for: ${result.reason}`);
          }
        });
        
        // Promise.allSettled는 하나의 실패가 다른 Promise에 영향을 주지 않음
        // 최소한 overall 데이터가 있는지 확인
        if (!newLeaderboardData.overall) {
          newLeaderboardData.overall = [];
        }
        
        // 상태 업데이트
        setLeaderboardData(newLeaderboardData);
      } catch (error) {
        console.error("Error in leaderboard data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle between overall and scenario-specific rankings
  const toggleViewMode = () => {
    setViewMode(viewMode === "overall" ? "scenarios" : "overall");
  };

  return (
    <div className="leaderboard-wrap">
      <div className="leaderboard-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          
          <div className="toggle-container">
            <button 
              onClick={toggleViewMode}
              className="btn btn-blue px-4 py-2 text-sm"
            >
              {viewMode === "overall" ? "Show Scenario Rankings" : "Show Overall Ranking"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-4">Loading leaderboard data...</div>
        ) : (
          <div className={`rank-wrap ${viewMode}`}>
            {viewMode === "overall" ? (
              // Overall ranking - show only one leaderboard
              <div className="w-full">
                <RankingCard 
                  key="overall"
                  scenario={{ name: "Overall Ranking", id: "overall" }}
                  leaderboardData={leaderboardData.overall || []}
                />
              </div>
            ) : (
              // Scenario-specific rankings - show one for each scenario
              SCENARIOS.map((scenario) => (
                <RankingCard 
                  key={scenario.id} 
                  scenario={scenario} 
                  leaderboardData={leaderboardData[scenario.id] || []}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;