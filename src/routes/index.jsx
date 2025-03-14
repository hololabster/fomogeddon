// src/routes/index.jsx
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import ScenarioSelectPage from "../pages/ScenarioSelect/ScenarioSelectPage";
import GamePlayPage from "../pages/GamePlay/GamePlayPage";
import LeaderboardPage from "../pages/Leaderboard/LeaderboardPage";
import Layout from "../components/layouts/Layout";
import ProtectedRoute from "../components/layouts/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/scenario" element={<ScenarioSelectPage />} />
          <Route path="/game/:gameId" element={<GamePlayPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
