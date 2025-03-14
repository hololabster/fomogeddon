// scripts/deploy-monad-ai-trading-recorder.js
const { ethers } = require("hardhat");

/**
 * This script deploys the MonadAITradingRecorder contract
 */
async function main() {
  // Get the contract factory
  const Contract = await ethers.getContractFactory("MonadAITradingRecorder");
  console.log("Deploying MonadAITradingRecorder...");
  
  // Deploy the contract
  const contract = await Contract.deploy();
  
  // Wait for the contract to be deployed
  await contract.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await contract.getAddress();
  
  console.log("MonadAITradingRecorder deployed to:", contractAddress);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });