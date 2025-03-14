// src/data/scenarios.js
export const SCENARIOS = [
    {
      id: 'ftx-collapse',
      name: 'FTX Collapse (Nov 2022)',
      description: 'Market crash triggered by the insolvency and bankruptcy of FTX, the second-largest crypto exchange',
      eventDescription: 'Concerns about FTX\'s financial position spread as CZ announces selling FTT tokens, triggering market panic.',
      eventImpact: { min: -25, max: -15 },
      eventDuration: 5
    },
    {
      id: 'bitmex-cftc',
      name: 'BitMEX CFTC Charges (Oct 2020)',
      description: 'Market shock from BitMEX executives being charged with violating AML regulations',
      eventDescription: 'CFTC and DOJ file charges against BitMEX and its founders, leading to executive arrests and market uncertainty.',
      eventImpact: { min: -15, max: -8 },
      eventDuration: 3
    },
    {
      id: 'eth-merge',
      name: 'Ethereum Merge (Sep 2022)',
      description: 'Ethereum\'s transition from Proof of Work to Proof of Stake',
      eventDescription: 'Ethereum successfully completes the transition to Proof of Stake, marking a significant technical milestone.',
      eventImpact: { min: 5, max: 15 },
      eventDuration: 4
    },
    {
      id: 'tesla-bitcoin',
      name: 'Tesla Bitcoin Purchase (Feb 2021)',
      description: 'Tesla announces $1.5B Bitcoin purchase and plans to accept BTC as payment',
      eventDescription: 'Elon Musk\'s Tesla invests $1.5 billion in Bitcoin and announces plans to accept it as payment for vehicles.',
      eventImpact: { min: 10, max: 20 },
      eventDuration: 4
    },
    {
      id: 'china-ban',
      name: 'China Crypto Ban (Sep 2021)',
      description: 'People\'s Bank of China declares all crypto transactions illegal',
      eventDescription: 'China intensifies its crackdown on cryptocurrencies, declaring all crypto trading activities illegal.',
      eventImpact: { min: -18, max: -10 },
      eventDuration: 5
    }
  ];