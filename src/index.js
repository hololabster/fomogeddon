// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import "./styles/cyberpunk-theme.css";
// import "./styles/enhanced-effects.css"; // 추가
import "./styles/main.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
