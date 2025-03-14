// src/pages/Login/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDigitalNoiseEffect,
  addEMPWaveEffect,
} from "../../utils/effectsUtils";
import { useAuth } from "../../context/AuthContext";
import { MONAD_NETWORK } from "../../context/Network.constant";
import useGameStore from "../../stores/gameStore";

const LoginPage = () => {
  const { setNotification } = useGameStore();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
      // Verify network even for already connected wallets
      checkAndSwitchNetwork(false);
    }
  }, []);

  // Import useAuth hook
  const { connectWallet: authConnectWallet } = useAuth();

  // Check if connected to Monad network and switch if needed
  const checkAndSwitchNetwork = async (showEffects = true) => {
    if (!window.ethereum) return false;

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      if (chainId !== MONAD_NETWORK.chainId) {
        if (showEffects) {
          setNetworkError(true);
          playDigitalSound("fail");
        }

        try {
          setIsSwitchingNetwork(true);

          // First try to switch to the network if it's already added
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MONAD_NETWORK.chainId }],
          });

          setNetworkError(false);
          if (showEffects) {
            setNotification({
              message: "Successfully switched to Monad Network",
              type: "success",
            });
          }
          setIsSwitchingNetwork(false);
          return true;
        } catch (switchError) {
          // If the network is not added yet, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: MONAD_NETWORK.chainId,
                    chainName: MONAD_NETWORK.chainName,
                    nativeCurrency: MONAD_NETWORK.nativeCurrency,
                    rpcUrls: MONAD_NETWORK.rpcUrls,
                    blockExplorerUrls: MONAD_NETWORK.blockExplorerUrls,
                  },
                ],
              });

              setNetworkError(false);
              if (showEffects) {
                setNotification({
                  message: "Successfully added and switched to Monad Network",
                  type: "success",
                });
              }
              setIsSwitchingNetwork(false);
              return true;
            } catch (addError) {
              console.error("Error adding Monad network:", addError);
              setError("Failed to add Monad network. Please add it manually.");
              setIsSwitchingNetwork(false);
              return false;
            }
          }

          console.error("Error switching to Monad network:", switchError);
          setError("Failed to switch to Monad network. Please try manually.");
          setIsSwitchingNetwork(false);
          return false;
        }
      }

      // Already on Monad network
      setNetworkError(false);
      return true;
    } catch (checkError) {
      console.error("Error checking network:", checkError);
      return false;
    }
  };

  // Listen for network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (chainId) => {
        // Check if the new chain is Monad
        if (chainId !== MONAD_NETWORK.chainId) {
          setNetworkError(true);
          setError("Please connect to Monad Testnet to use this application.");
        } else {
          setNetworkError(false);
          setError("");
          // If user manually switched to Monad and we were showing an error
          if (networkError) {
            setNotification({
              message: "Successfully connected to Monad Network",
              type: "success",
            });
          }
        }
      };

      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [networkError]);

  // Function to connect to wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");
    setNetworkError(false);

    // Add cyberpunk visual effects
    addDigitalNoiseEffect();
    setTimeout(() => {
      addEMPWaveEffect("#00b3ff");
    }, 800);

    // Play connection sound
    playDigitalSound("select");

    // Simulate wallet connection with a slight delay
    setTimeout(async () => {
      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          setError("MetaMask not detected. Please install a Web3 wallet.");
          playDigitalSound("fail");
          setIsConnecting(false);
          return;
        }

        // Use the connectWallet function from AuthContext
        const result = await authConnectWallet();

        if (result.success) {
          // Set local state for immediate UI update
          setWalletAddress(result.address);

          // Check and switch to Monad network if necessary
          const isCorrectNetwork = await checkAndSwitchNetwork();

          if (!isCorrectNetwork) {
            // Network switching was attempted but failed
            // Error states are already set by checkAndSwitchNetwork
            setIsConnecting(false);
            return;
          }

          // Show success notification
          setNotification({
            message: result.demo
              ? "Demo wallet connected on Monad Testnet!"
              : "Wallet connected successfully on Monad Testnet!",
            type: "success",
          });

          // Play success sound
          playDigitalSound("success");

          // Redirect after a moment
          setTimeout(() => {
            navigate("/scenario");
          }, 1500);
        } else {
          setError(
            result.error || "Failed to connect wallet. Please try again."
          );
          playDigitalSound("fail");
        }
      } catch (err) {
        console.error("Wallet connection error:", err);
        setError("Failed to connect wallet. Please try again later.");
        playDigitalSound("fail");
      } finally {
        setIsConnecting(false);
      }
    }, 2000);
  };

  // Audio feedback
  const playDigitalSound = (type) => {
    try {
      // Create AudioContext
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect oscillator to gain and output
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set sound parameters based on type
      switch (type) {
        case "select":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            880,
            audioContext.currentTime + 0.1
          );
          oscillator.frequency.exponentialRampToValueAtTime(
            990,
            audioContext.currentTime + 0.2
          );
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          );
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case "success":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            660,
            audioContext.currentTime + 0.15
          );
          oscillator.frequency.setValueAtTime(
            880,
            audioContext.currentTime + 0.3
          );
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.4
          );
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;

        case "fail":
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            220,
            audioContext.currentTime + 0.3
          );
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.4
          );
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  // Button to manually switch network
  const handleSwitchToMonad = async () => {
    setIsSwitchingNetwork(true);
    const success = await checkAndSwitchNetwork();
    setIsSwitchingNetwork(false);

    if (!success) {
      setNotification({
        message:
          "Failed to switch network. Please try manually in your wallet.",
        type: "error",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl main-content">
      <div className="cyber-card p-6 mt-12 main-description">
        <div className="text-center mb-8 top-text">
          <h1 className="text-4xl font-bold mb-2">FOMOGEDDON</h1>
          <div className="text-xl text-blue-400 mb-6">
            Cyberpunk Trading Simulator
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Test your trading skills in historical cryptocurrency scenarios.
            Make the right calls, avoid FOMO, and prove your trading expertise
            in this high-stakes simulation.
          </p>
          <div className="mt-4 bg-blue-900 bg-opacity-40 inline-block px-4 py-2 rounded-md text-cyan-300 border border-cyan-700">
            Exclusively on Monad Testnet
          </div>
        </div>

        {walletAddress ? (
          <div className="text-center mb-6 p-6 mt-12 wallet-content">
            <div className="text-green-400 mb-2">Wallet Connected</div>
            <div className="bg-gray-800 inline-block px-4 py-2 rounded-md font-mono">
              {walletAddress}
            </div>

            {networkError ? (
              <div className="mt-4">
                <div className="text-red-400 mb-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Wrong Network Detected
                </div>
                <button
                  onClick={handleSwitchToMonad}
                  disabled={isSwitchingNetwork}
                  className="btn btn-blue px-4 py-2 text-sm"
                >
                  {isSwitchingNetwork
                    ? "Switching..."
                    : "Switch to Monad Testnet"}
                </button>
              </div>
            ) : (
              <div className="mt-2 text-cyan-400 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 mr-2"></span>
                Connected to Monad Testnet
              </div>
            )}

            <div className="mt-6 btn-wrap">
              <button
                onClick={() => navigate("/scenario")}
                disabled={networkError}
                className={`btn ${
                  networkError ? "btn-gray" : "btn-blue"
                } px-8 py-3 text-lg`}
              >
                ENTER GAME
              </button>
              {networkError && (
                <p className="text-xs mt-2 text-red-400">
                  Please switch to Monad Testnet to continue
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center wallet-content">
            <p className="mb-2 text-red-400">
              Wallet connection required to play
            </p>
            {networkError && (
              <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-800 p-3 rounded-md">
                <p className="text-red-300">
                  <strong>Network Error:</strong> This application only supports
                  Monad Testnet.
                </p>
                <div className="mt-2 text-xs text-white bg-blue-900 bg-opacity-30 p-2 border border-blue-800 rounded">
                  <p className="mb-1 font-bold">Monad Testnet Details:</p>
                  <p>
                    <span className="text-gray-400">Network Name:</span>{" "}
                    {MONAD_NETWORK.chainName}
                  </p>
                  <p>
                    <span className="text-gray-400">Chain ID:</span> 10143
                  </p>
                  <p>
                    <span className="text-gray-400">RPC URL:</span>{" "}
                    {MONAD_NETWORK.rpcUrls[0]}
                  </p>
                  <p>
                    <span className="text-gray-400">Symbol:</span>{" "}
                    {MONAD_NETWORK.nativeCurrency.symbol}
                  </p>
                  <p>
                    <span className="text-gray-400">Explorer:</span>{" "}
                    {MONAD_NETWORK.blockExplorerUrls[0]}
                  </p>
                </div>
                <button
                  onClick={handleSwitchToMonad}
                  disabled={isSwitchingNetwork}
                  className="mt-3 btn btn-blue w-full py-2 text-sm"
                >
                  {isSwitchingNetwork
                    ? "Switching..."
                    : "Switch to Monad Testnet"}
                </button>
              </div>
            )}
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`btn ${
                isConnecting ? "btn-gray" : "btn-blue"
              } px-8 py-3 text-lg`}
            >
              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  CONNECTING...
                </span>
              ) : (
                "CONNECT WALLET"
              )}
            </button>
            {error && <p className="mt-4 text-red-400">{error}</p>}
          </div>
        )}

        <div className="mt-10 text-center text-gray-500 text-sm text-wrap">
          <div className="mb-1">
            Compatible with MetaMask, WalletConnect, and other Web3 wallets
          </div>
          <div>
            All trading happens in simulation mode - no real assets are used
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
