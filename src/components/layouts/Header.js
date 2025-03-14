import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Trading Simulator Game</h1>
        <p className="text-sm opacity-80">Test your trading skills in historical scenarios</p>
      </div>
    </header>
  );
};

export default Header;