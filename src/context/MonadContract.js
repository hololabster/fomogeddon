import { BrowserProvider, Contract, ethers } from "ethers";
import { ABI } from "./Abi.constant";
import { MONAD_CONTRACT_ADDRESS } from "./Network.constant";

// MonadAITradingRecorder 컨트랙트 ABI - 실제 ABI로 교체해야 합니다
const MonadAITradingRecorderABI = ABI;

/**
 * 지갑에 연결하고 컨트랙트 인스턴스를 생성하는 함수
 * @param {string} contractAddress - MonadAITradingRecorder 컨트랙트 주소
 * @returns {Promise<{provider: ethers.providers.Web3Provider, signer: ethers.Signer, contract: ethers.Contract, userAddress: string}>}
 */
export async function connectWalletAndContract(contractAddress) {
  if (!window.ethereum) {
    throw new Error("MetaMask 또는 다른 Web3 공급자가 설치되어 있지 않습니다");
  }

  // 계정 접근 요청
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const userAddress = accounts[0];

  // 공급자 및 서명자 생성
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // 컨트랙트 인스턴스 생성
  const contract = new Contract(
    contractAddress,
    MonadAITradingRecorderABI,
    signer
  );

  console.log("지갑 연결됨:", userAddress);
  console.log("컨트랙트 연결됨:", contractAddress);

  return { provider, signer, contract, userAddress };
}

/**
 * 예제 거래 데이터를 체인에 저장하는 함수
 * @param {ethers.Contract} contract - MonadAITradingRecorder 컨트랙트 인스턴스
 * @param {Array} tradeData - tradeData 배열
 * @returns {Promise<ethers.providers.TransactionReceipt>}
 */
export async function storeTrades(contract, tradeData) {
  if (!contract) {
    throw new Error("컨트랙트가 초기화되지 않았습니다");
  }

  console.log("거래 데이터를 일괄 저장 중...");

  const refinedTradeData = tradeData.map((v) => {
    // Helper function to safely format decimal values
    const formatDecimal = (value, decimals) => {
      if (value === undefined || value === null) return "0";
      return Math.abs(parseFloat(value)).toFixed(decimals);
    };

    // Calculate PnL with proper handling for negative values
    let pnlBigInt = 0;
    if (v.pnl !== undefined && v.pnl !== null) {
      const isNegative = parseFloat(v.pnl) < 0;
      const absoluteValue = Math.abs(parseFloat(v.pnl));
      const formattedValue = formatDecimal(absoluteValue, 8);
      const scaledValue = ethers.parseUnits(formattedValue, 8);
      pnlBigInt = isNegative ? -1n * scaledValue : scaledValue;
    }

    return {
      tradeType: v.type || "",
      position: v.position || "",
      price: v.price ? ethers.parseUnits(formatDecimal(v.price, 8), 8) : 0,
      amount: v.amount ? ethers.parseUnits(formatDecimal(v.amount, 18), 18) : 0,
      investment: v.investment || 0,
      leverage: v.leverage || 0,
      previousPosition: v.previousPosition || "",
      entryPrice: v.entryPrice
        ? ethers.parseUnits(formatDecimal(v.entryPrice, 8), 8)
        : 0,
      exitPrice: v.exitPrice
        ? ethers.parseUnits(formatDecimal(v.exitPrice, 8), 8)
        : 0,
      pnl: pnlBigInt,
    };
  });

  console.log("Refined trade data:", refinedTradeData);

  try {
    // First check with estimateGas to see if it would work
    const gasEstimate = await contract.batchSaveUserTrades.estimateGas(
      refinedTradeData
    );
    console.log("Gas estimate:", gasEstimate.toString());

    // If we get here, the estimate worked, so we can send the transaction
    const tx = await contract.batchSaveUserTrades(refinedTradeData);
    console.log("Transaction hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    return receipt;
  } catch (error) {
    console.error("Transaction error:", error);

    // Log more detailed error information
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.reason) {
      console.error("Error reason:", error.reason);
    }

    throw error;
  }
}

/**
 * 사용자의 거래 데이터를 조회하는 함수
 * @param {ethers.Contract} contract - MonadAITradingRecorder 컨트랙트 인스턴스
 * @param {string} userAddress - 사용자 지갑 주소
 * @returns {Promise<{tradeCount: number, lastTrade: Object|null}>}
 */
export async function getUserTradeData(contract, userAddress) {
  if (!contract || !userAddress) {
    throw new Error("컨트랙트 또는 사용자 주소가 제공되지 않았습니다");
  }

  // 사용자의 거래 수 조회
  const tradeCount = await contract.getTradeCount(userAddress);
  // BigInt를 Number로 변환 (toNumber 대신 Number() 사용)
  const countNumber = Number(tradeCount);
  console.log(`사용자 ${userAddress}의 거래 수(원시값):`, tradeCount);
  console.log("숫자로 변환된 거래 수:", countNumber);

  let lastTrade = null;

  // 마지막 거래 조회 (있는 경우)
  if (countNumber > 0) {
    const lastIndex = countNumber - 1;
    lastTrade = await contract.getTradeByIndex(userAddress, lastIndex);
    console.log("저장된 마지막 거래:", lastTrade);
  } else {
    console.log("이 사용자에 대한 거래를 찾을 수 없습니다.");
  }

  return { tradeCount: countNumber, lastTrade };
}

/**
 * 전체 프로세스를 실행하는 주요 함수
 */
export async function executeTradeOperations(tradeData) {
  const contractAddress = MONAD_CONTRACT_ADDRESS;
  try {
    // 지갑 연결 및 컨트랙트 초기화
    const { contract, userAddress } = await connectWalletAndContract(
      contractAddress
    );

    // 예제 거래 저장
    const receipt = await storeTrades(contract, tradeData);

    // 거래 데이터 조회
    const { tradeCount, lastTrade } = await getUserTradeData(
      contract,
      userAddress
    );

    console.log("스크립트가 성공적으로 완료되었습니다.");

    return {
      userAddress,
      tradeCount,
      lastTrade,
      tx : receipt.hash
    };
  } catch (error) {
    console.error("스크립트 실패:", error);
    throw error;
  }
}
