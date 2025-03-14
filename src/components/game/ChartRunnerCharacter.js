// src/components/game/ChartRunnerCharacter.js
import React, { useState, useEffect, useRef } from 'react';

const ChartRunnerCharacter = ({
  isRunning,
  speed = 'normal',
  position = 'neutral',
  progress = 0,
  chartData = [],
  currentPrice = 0
}) => {
  const [characterState, setCharacterState] = useState('idle');
  const [isJumping, setIsJumping] = useState(false);
  const containerRef = useRef(null);
  const lastJumpTime = useRef(0);
  
  const getAnimationDuration = () => {
    switch (speed) {
      case 'very-fast': return 0.2;
      case 'fast': return 0.3;
      case 'normal': return 0.5;
      case 'slow': return 0.8;
      case 'very-slow': return 1.2;
      default: return 0.5;
    }
  };
  
  const getPositionColor = () => {
    switch (position) {
      case 'long': return '#00ff7f';
      case 'short': return '#ff3e4d';
      default: return '#60a5fa';
    }
  };
  
  useEffect(() => {
    if (!isRunning) {
      if (characterState === 'running') {
        setCharacterState('stopping');
        
        // 멈춤 상태 후 idle로
        setTimeout(() => {
          setCharacterState('idle');
        }, 300);
      }
    } else {
      if (characterState !== 'running' && characterState !== 'jumping') {
        setCharacterState('running');
      }
    }
  }, [isRunning, characterState]);
  
  // 차트 데이터에 따른 점프 효과
  useEffect(() => {
    if (!chartData || chartData.length < 2 || !isRunning) return;
    
    const current = chartData[chartData.length - 1]?.price;
    const previous = chartData[chartData.length - 2]?.price;
    
    if (!current || !previous) return;
    
    const now = Date.now();
    const percentChange = ((current - previous) / previous) * 100;
    
    // 0.5% 이상 변동이 있고 마지막 점프로부터 2초 이상 지났으면 점프
    if (Math.abs(percentChange) > 0.5 && now - lastJumpTime.current > 2000) {
      lastJumpTime.current = now;
      
      if (percentChange > 0) {
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 500);
      }
    }
  }, [chartData, isRunning]);
  
  // 차트 진행에 따라 캐릭터 X축 위치 및 Y축 위치 이동
  useEffect(() => {
    if (containerRef.current && chartData.length > 0) {
      const leftPosition = 10 + (progress * 0.8);
      
      const recentData = chartData.slice(-30);
      const maxPrice = Math.max(...recentData.map(d => d.price));
      const minPrice = Math.min(...recentData.map(d => d.price));
      
      let yPosition;
      if (maxPrice === minPrice) {
        yPosition = 50; // 중간 위치
      } else {
        const priceRatio = (currentPrice - minPrice) / (maxPrice - minPrice);
        yPosition = 60 - (priceRatio * 40);
      }
      
      // 컨테이너에 위치 설정
      containerRef.current.style.left = `${leftPosition}%`;
      containerRef.current.style.top = `${yPosition}%`;
    }
  }, [progress, chartData, currentPrice]);
  
  // 랜덤 점프 (간헐적으로)
  useEffect(() => {
    if (!isRunning) return;
    
    const jumpInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 500);
      }
    }, 5000);
    
    return () => clearInterval(jumpInterval);
  }, [isRunning]);
  
  // SVG 애니메이션 스타일
  const animationStyle = {
    animation: characterState === 'running' 
      ? `running ${getAnimationDuration()}s infinite alternate` 
      : characterState === 'stopping' 
        ? 'stopping 0.3s forwards' 
        : 'none'
  };
  
  // 도트 캐릭터 렌더링 위치
  const containerStyle = {
    position: 'absolute',
    top: '50%',  // 기본값, 동적으로 업데이트 됨
    left: '10%', // 기본값, 동적으로 업데이트 됨
    zIndex: 100,
    transition: 'left 0.3s ease, top 0.3s ease',
    transform: isJumping ? 'translateY(-15px)' : 'translateY(0)',
  };
  
  return (
    <div
      ref={containerRef}
      style={containerStyle}
    >
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 32 32" 
        style={animationStyle}
      >
        {/* 네온 글로우 필터 */}
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feFlood floodColor={getPositionColor()} floodOpacity="0.5" result="neon" />
            <feComposite in="neon" in2="SourceGraphic" operator="in" result="comp" />
            <feGaussianBlur in="comp" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* 호흡 애니메이션 */}
          <animate 
            xlinkHref="#chest-light" 
            attributeName="opacity" 
            values="0.5;1;0.5" 
            dur="1.5s" 
            repeatCount="indefinite" 
          />
        </defs>
      
        {/* 사이버펑크 도트 캐릭터 - 픽셀 아트 스타일 */}
        <g filter="url(#neon-glow)">
          {/* 머리 */}
          <rect x="12" y="4" width="8" height="8" fill="#1a1a2e" rx="1" />
          
          {/* 눈 */}
          <rect id="left-eye" x="14" y="7" width="2" height="2" fill={getPositionColor()} rx="0.5">
            <animate 
              attributeName="opacity" 
              values="0.7;1;0.7" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </rect>
          <rect id="right-eye" x="18" y="7" width="2" height="2" fill={getPositionColor()} rx="0.5">
            <animate 
              attributeName="opacity" 
              values="0.7;1;0.7" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </rect>
          
          {/* 헬멧 디테일 */}
          <rect x="12" y="4" width="8" height="2" fill={getPositionColor()} rx="0.5" />
          <rect x="12" y="4" width="1" height="8" fill={getPositionColor()} />
          <rect x="19" y="4" width="1" height="8" fill={getPositionColor()} />
          
          {/* 몸통 */}
          <rect x="10" y="12" width="12" height="10" fill="#1a1a2e" rx="1" />
          
          {/* 몸통의 사이버네틱 디테일 */}
          <rect id="chest-light" x="14" y="14" width="4" height="2" fill={getPositionColor()} rx="0.5" opacity="0.8" />
          <rect x="16" y="16" width="2" height="6" fill={getPositionColor()} />
          
          {/* 왼팔 */}
          <rect 
            id="left-arm" 
            x="8" 
            y="12" 
            width="2" 
            height="6" 
            fill="#1a1a2e" 
          >
            {characterState === 'running' && (
              <animateTransform 
                attributeName="transform"
                type="rotate"
                from="0 10 12"
                to="20 10 12"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 10 12; 20 10 12; 0 10 12"
              />
            )}
          </rect>
          
          {/* 오른팔 */}
          <rect 
            id="right-arm" 
            x="22" 
            y="12" 
            width="2" 
            height="6" 
            fill="#1a1a2e"
          >
            {characterState === 'running' && (
              <animateTransform 
                attributeName="transform"
                type="rotate"
                from="0 22 12"
                to="-20 22 12"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 22 12; -20 22 12; 0 22 12"
              />
            )}
          </rect>
          
          {/* 무기 - 사이버 건 */}
          {position === 'short' && (
            <g id="cyber-gun">
              <rect x="24" y="15" width="7" height="2" fill={getPositionColor()} />
              <rect x="27" y="13" width="2" height="6" fill={getPositionColor()} />
              <rect x="30" y="14" width="1" height="4" fill={getPositionColor()} />
              <animate 
                attributeName="opacity" 
                values="0.7;1;0.7" 
                dur="0.5s" 
                repeatCount="indefinite" 
              />
            </g>
          )}
          
          {/* 왼다리 */}
          <rect 
            id="left-leg" 
            x="12" 
            y="22" 
            width="3" 
            height="6" 
            fill="#1a1a2e"
          >
            {characterState === 'running' && (
              <animateTransform 
                attributeName="transform"
                type="rotate"
                from="0 13.5 22"
                to="30 13.5 22"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 13.5 22; 30 13.5 22; 0 13.5 22"
              />
            )}
          </rect>
          
          {/* 오른다리 */}
          <rect 
            id="right-leg" 
            x="17" 
            y="22" 
            width="3" 
            height="6" 
            fill="#1a1a2e"
          >
            {characterState === 'running' && (
              <animateTransform 
                attributeName="transform"
                type="rotate"
                from="0 18.5 22"
                to="-30 18.5 22"
                dur={`${getAnimationDuration()}s`}
                repeatCount="indefinite"
                additive="sum"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                values="0 18.5 22; -30 18.5 22; 0 18.5 22"
              />
            )}
          </rect>
          
          {/* 사이버네틱 부츠 */}
          <rect x="11" y="28" width="4" height="2" fill={getPositionColor()} rx="0.5" />
          <rect x="17" y="28" width="4" height="2" fill={getPositionColor()} rx="0.5" />
        </g>
        
        {/* 추가 네온 효과 */}
        {position === 'long' && (
          <circle 
            cx="16" 
            cy="16" 
            r="14" 
            fill="none" 
            stroke={getPositionColor()} 
            strokeWidth="0.5" 
            strokeOpacity="0.3"
          >
            <animate 
              attributeName="r" 
              values="14;16;14" 
              dur="2s" 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="stroke-opacity" 
              values="0.3;0.6;0.3" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </circle>
        )}

        {/* 호버보드/스케이트보드 효과 - 차트 라인 위를 타는 느낌 */}
        <rect 
          x="10" 
          y="30" 
          width="12" 
          height="2" 
          fill={getPositionColor()}
          opacity="0.8"
          rx="1"
        >
          <animate 
            attributeName="opacity" 
            values="0.6;1;0.6" 
            dur="1s" 
            repeatCount="indefinite" 
          />
        </rect>
        
        {/* 속도감 줄무늬 */}
        {characterState === 'running' && (
          <g>
            <line x1="5" y1="15" x2="0" y2="15" stroke={getPositionColor()} strokeWidth="0.5" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${getAnimationDuration() * 0.7}s`} repeatCount="indefinite" />
            </line>
            <line x1="5" y1="20" x2="0" y2="20" stroke={getPositionColor()} strokeWidth="0.5" opacity="0.5">
              <animate attributeName="opacity" values="0;0.5;0" dur={`${getAnimationDuration() * 0.8}s`} repeatCount="indefinite" />
            </line>
            <line x1="5" y1="25" x2="0" y2="25" stroke={getPositionColor()} strokeWidth="0.5" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${getAnimationDuration() * 0.6}s`} repeatCount="indefinite" />
            </line>
          </g>
        )}
      </svg>
    </div>
  );
};

export default ChartRunnerCharacter;