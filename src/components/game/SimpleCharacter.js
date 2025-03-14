// src/components/game/SimpleCharacter.js
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/simple-character.css';

const SimpleCharacter = ({ 
  isRunning, 
  speed = 'normal', 
  position = 'neutral',
  progress = 0,
  chartData = []
}) => {
  const [characterState, setCharacterState] = useState('idle');
  const containerRef = useRef(null);
  const lastJumpTime = useRef(0);

  // 캐릭터 상태에 따른 클래스 결정
  const getCharacterClasses = () => {
    const classes = ['character'];
    
    // 달리기/정지 상태 클래스
    if (characterState === 'running') {
      classes.push('character-running');
    } else if (characterState === 'stopping') {
      classes.push('character-stopping');
    } else if (characterState === 'jumping') {
      classes.push('character-jumping');
    }
    
    // 속도 클래스
    classes.push(`speed-${speed}`);
    
    // 포지션 클래스
    classes.push(`position-${position}`);
    
    return classes.join(' ');
  };

  // 캐릭터 상태 업데이트
  useEffect(() => {
    if (!isRunning) {
      if (characterState === 'running') {
        setCharacterState('stopping');
        
        // 멈춤 애니메이션 후 idle 상태로
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
    
    // 최신 데이터 2개를 비교해서 상승/하락 확인
    const current = chartData[chartData.length - 1]?.price;
    const previous = chartData[chartData.length - 2]?.price;
    
    if (!current || !previous) return;
    
    const now = Date.now();
    const percentChange = ((current - previous) / previous) * 100;
    
    // 0.5% 이상 변동이 있고 마지막 점프로부터 2초 이상 지났으면 점프
    if (Math.abs(percentChange) > 0.5 && now - lastJumpTime.current > 2000) {
      lastJumpTime.current = now;
      
      if (percentChange > 0) {
        setCharacterState('jumping');
        setTimeout(() => {
          if (isRunning) {
            setCharacterState('running');
          } else {
            setCharacterState('idle');
          }
        }, 500);
      }
    }
  }, [chartData, isRunning]);

  // 차트 진행에 따라 캐릭터 위치 이동
  useEffect(() => {
    if (containerRef.current) {
      const leftPosition = 10 + (progress * 0.8);
      containerRef.current.style.left = `${leftPosition}%`;
    }
  }, [progress]);

  return (
    <>
      <div className="character-path"></div>
      <div 
        className="character-container" 
        ref={containerRef}
      >
        <div className={getCharacterClasses()}>
          <div className="character-basic"></div>
        </div>
      </div>
    </>
  );
};

export default SimpleCharacter;