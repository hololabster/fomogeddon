import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS is not defined in .env");
  }

  const tradeHistory = await ethers.getContractAt("MonadAITradingRecorder", contractAddress);
  const [deployer] = await ethers.getSigners();

  console.log("Deployer address:", deployer.address);
  console.log("Contract address:", contractAddress);

  const trades = [
    {
      tradeType: "opened",
      position: "long",
      price: 4253773268,
      amount: 2350854022,
      investment: 1000,
      leverage: 0,
      previousPosition: "",
      entryPrice: 0,
      exitPrice: 0,
      pnl: 0
    },
    {
      tradeType: "leveraged",
      position: "5XLong",
      price: 4252904005,
      amount: 2350854022,
      investment: 0,
      leverage: 5,
      previousPosition: "long",
      entryPrice: 0,
      exitPrice: 0,
      pnl: 0
    },
    {
      tradeType: "closed",
      position: "5XLong",
      price: 0,
      amount: 2350854022,
      investment: 0,
      leverage: 5,
      previousPosition: "",
      entryPrice: 4253773268,
      exitPrice: 4263504444,
      pnl: 114382864
    },
    {
      tradeType: "opened",
      position: "short",
      price: 4248667770,
      amount: 2353678974,
      investment: 1000,
      leverage: 0,
      previousPosition: "",
      entryPrice: 0,
      exitPrice: 0,
      pnl: 0
    },
    {
      tradeType: "closed",
      position: "short",
      price: 0,
      amount: 2353678974,
      investment: 0,
      leverage: 0,
      previousPosition: "",
      entryPrice: 4248667770,
      exitPrice: 4241605773,
      pnl: 166216734
    },
    {
      tradeType: "leveraged",
      position: "5XShort",
      price: 4236405978,
      amount: 2360634281,
      investment: 0,
      leverage: 5,
      previousPosition: "short",
      entryPrice: 0,
      exitPrice: 0,
      pnl: 0
    }
  ];

  console.log(`Storing ${trades.length} trades in batch...`);
  const tx = await tradeHistory.batchSaveUserTrades(trades);
  console.log("batchSaveUserTrades tx hash:", tx.hash);
  await tx.wait();
  console.log("Trades have been stored on-chain.");

  // Get total count
  const tradeCount = await tradeHistory.getTradeCount(deployer.address);
  console.log(`Trade count (raw) for user ${deployer.address}:`, tradeCount);

  // Convert to a JavaScript number if needed
  const countNumber = Number(tradeCount);
  console.log("Converted tradeCount to number:", countNumber);

  // Fetch all trades in one go
  const fullTrades = await tradeHistory.getUserTrades(deployer.address);
  console.log("All trades for this user:");
  console.log(fullTrades);

  // Or loop through each trade by index
  console.log("Trades by index:");
  for (let i = 0; i < countNumber; i++) {
    const t = await tradeHistory.getTradeByIndex(deployer.address, i);
    console.log(`Index ${i}:`, t);
  }

  console.log("Script completed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
