// src/components/modals/NetworkSwitchModal.jsx
import React, { useEffect, useState } from "react";
import { addDigitalNoiseEffect } from "../../utils/effectsUtils";
import "../../styles/network-modal.css";
import { MONAD_NETWORK } from "../../context/Network.constant";
import { playDigitalSound } from "../../utils/soundEffects";

const NetworkSwitchModal = ({ isOpen, onNetworkSwitch }) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(()=>{
    if(isOpen){
      playDigitalSound('alert');
    }
  },[isOpen])

  // No close option - modal stays open until network is switched
  if (!isOpen) return null;

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    setMessage({ text: "", type: "" });

    // Add cyberpunk effect
    addDigitalNoiseEffect();

    try {
      if (!window.ethereum) {
        setMessage({
          text: "MetaMask not detected. Please install a Web3 wallet.",
          type: "error",
        });
        setIsSwitching(false);
        return;
      }

      try {
        // First try to switch to the network if it's already added
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MONAD_NETWORK.chainId }],
        });

        // If successful, the modal will automatically close due to chain change event
        setMessage({
          text: "Switching to Monad network...",
          type: "success",
        });

        // 성공 후 콜백 호출
        if (onNetworkSwitch) {
          setTimeout(onNetworkSwitch, 500); // 약간의 지연을 두어 이벤트 처리 시간 확보
        }
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

            // If successful, the modal will automatically close due to chain change event
            setMessage({
              text: "Adding and switching to Monad network...",
              type: "success",
            });
          } catch (addError) {
            console.error("Error adding Monad network:", addError);
            setMessage({
              text: "Failed to add Monad network. Please try again or add it manually.",
              type: "error",
            });
          }
        } else {
          console.error("Error switching to Monad network:", switchError);
          setMessage({
            text: "Failed to switch to Monad network. Please try again.",
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error("Error switching network:", err);
      setMessage({
        text: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Copy network details to clipboard
  const copyNetworkDetails = () => {
    const details = `
Network Name: ${MONAD_NETWORK.chainName}
Chain ID: 10143
RPC URL: ${MONAD_NETWORK.rpcUrls[0]}
Currency Symbol: ${MONAD_NETWORK.nativeCurrency.symbol}
Block Explorer URL: ${MONAD_NETWORK.blockExplorerUrls[0]}
    `.trim();

    navigator.clipboard
      .writeText(details)
      .then(() => {
        setMessage({
          text: "Network details copied to clipboard!",
          type: "success",
        });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      })
      .catch(() => {
        setMessage({
          text: "Failed to copy network details",
          type: "error",
        });
      });
  };

  return (
    <div className="network-modal-overlay">
      <div className="network-modal-card">
        {/* Background elements */}
        <div className="circuit-pattern"></div>
        <div className="data-line"></div>
        <div className="data-line"></div>
        <div className="data-line"></div>
        <div className="data-line"></div>

        <div className="network-modal-header">
          <h2
            className="network-modal-title digital-glitch"
            data-text="Network Switch Required"
          >
            Network Switch Required
          </h2>
          <div className="network-modal-alert">
            This application runs exclusively on Monad Testnet
          </div>
        </div>

        <div className="network-details-panel">
          <h3 className="network-details-title">Monad Testnet Details:</h3>

          <div className="network-detail-row">
            <div className="network-detail-label">Network:</div>
            <div className="network-detail-value">
              {MONAD_NETWORK.chainName}
            </div>
          </div>

          <div className="network-detail-row">
            <div className="network-detail-label">Chain ID:</div>
            <div className="network-detail-value">10143</div>
          </div>

          <div className="network-detail-row">
            <div className="network-detail-label">RPC URL:</div>
            <div className="network-detail-value">
              {MONAD_NETWORK.rpcUrls[0]}
            </div>
          </div>

          <div className="network-detail-row">
            <div className="network-detail-label">Symbol:</div>
            <div className="network-detail-value">
              {MONAD_NETWORK.nativeCurrency.symbol}
            </div>
          </div>

          <div className="network-detail-row">
            <div className="network-detail-label">Explorer:</div>
            <div className="network-detail-value">
              {MONAD_NETWORK.blockExplorerUrls[0]}
            </div>
          </div>

          <button onClick={copyNetworkDetails} className="copy-button">
            Copy Network Details
          </button>
        </div>

        <div className="network-modal-actions">
          <button
            onClick={handleSwitchNetwork}
            disabled={isSwitching}
            className="switch-button"
          >
            {isSwitching ? (
              <span className="switch-button-content">
                <svg
                  className="spinner h-5 w-5"
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
                SWITCHING TO MONAD...
              </span>
            ) : (
              "SWITCH TO MONAD NETWORK"
            )}
          </button>

          {message.text && (
            <p
              className={
                message.type === "error" ? "error-message" : "success-message"
              }
            >
              {message.text}
            </p>
          )}

          <p className="footer-text">
            You must switch to Monad Testnet to continue using this application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkSwitchModal;
