// src/components/game/CharacterAnimation.js
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/dot-character.css';

const CharacterAnimation = ({ 
  isRunning, 
  speed = 'normal', 
  position = 'neutral',
  chartData,
  progress = 0
}) => {
  const [characterState, setCharacterState] = useState('idle');
  const [characterClass, setCharacterClass] = useState('character-idle');
  const [showBullet, setShowBullet] = useState(false);
  const lastJumpTime = useRef(0);
  const characterRef = useRef(null);
  const containerRef = useRef(null);

  // 속도에 따른 캐릭터 애니메이션 클래스 결정
  const getAnimationClass = () => {
    switch (speed) {
      case 'very-fast':
        return 'character-anim-very-fast';
      case 'fast':
        return 'character-anim-fast';
      case 'slow':
        return 'character-anim-slow';
      case 'very-slow':
        return 'character-anim-very-slow';
      default:
        return 'character-anim-normal';
    }
  };

  // 캐릭터 상태 업데이트
  useEffect(() => {
    if (!isRunning) {
      if (characterState === 'running') {
        setCharacterState('stopping');
        setCharacterClass('character-stop');
        
        // 멈출 때 잠시 후 idle 상태로 전환
        setTimeout(() => {
          setCharacterState('idle');
          setCharacterClass('character-idle');
        }, 300);
      } else if (characterState !== 'idle' && characterState !== 'stopping') {
        setCharacterState('idle');
        setCharacterClass('character-idle');
      }
    } else {
      if (characterState !== 'running') {
        setCharacterState('running');
        const frames = ['character-run1', 'character-run2', 'character-run3', 'character-run4'];
        let currentFrame = 0;
        
        // 직접 스프라이트 프레임 전환 처리 (애니메이션 속도에 맞게)
        const animInterval = setInterval(() => {
          if (characterRef.current) {
            // 이전 클래스 제거
            characterRef.current.classList.remove(...frames);
            // 새 프레임 클래스 추가
            characterRef.current.classList.add(frames[currentFrame]);
            currentFrame = (currentFrame + 1) % frames.length;
          }
        }, speed === 'very-fast' ? 75 : 
           speed === 'fast' ? 125 : 
           speed === 'slow' ? 300 : 
           speed === 'very-slow' ? 450 : 200);
        
        return () => clearInterval(animInterval);
      }
    }
  }, [isRunning, speed, characterState]);

  // 포지션에 따른 캐릭터 색상 클래스 설정
  useEffect(() => {
    if (position === 'long') {
      characterRef.current?.classList.add('character-long');
      characterRef.current?.classList.remove('character-short');
    } else if (position === 'short') {
      characterRef.current?.classList.add('character-short');
      characterRef.current?.classList.remove('character-long');
    } else {
      characterRef.current?.classList.remove('character-long', 'character-short');
    }
  }, [position]);

  // 차트 데이터에 따른 점프 및 공격 효과
  useEffect(() => {
    if (!chartData || chartData.length < 2 || !isRunning) return;
    
    // 최신 데이터 2개를 비교해서 상승/하락 확인
    const current = chartData[chartData.length - 1]?.price;
    const previous = chartData[chartData.length - 2]?.price;
    
    if (!current || !previous) return;
    
    const now = Date.now();
    const percentChange = ((current - previous) / previous) * 100;
    
    // 큰 변동이 있으면 점프 또는 공격 애니메이션
    if (Math.abs(percentChange) > 0.5 && now - lastJumpTime.current > 2000) {
      lastJumpTime.current = now;
      
      if (percentChange > 0) {
        // 상승 시 점프
        characterRef.current?.classList.add('character-jump');
        setTimeout(() => {
          characterRef.current?.classList.remove('character-jump');
        }, 500);
      } else {
        // 하락 시 공격
        characterRef.current?.classList.add('character-attack');
        setShowBullet(true);
        
        setTimeout(() => {
          characterRef.current?.classList.remove('character-attack');
        }, 300);
        
        setTimeout(() => {
          setShowBullet(false);
        }, 500);
      }
    }
  }, [chartData, isRunning]);

  // 차트 진행에 따라 캐릭터 위치 이동
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.left = `${10 + (progress * 0.8)}%`;
    }
  }, [progress]);
  
  // 랜덤 점프 (게임적 요소)
  useEffect(() => {
    if (!isRunning) return;
    
    const jumpInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        characterRef.current?.classList.add('character-jump');
        setTimeout(() => {
          characterRef.current?.classList.remove('character-jump');
        }, 500);
      }
    }, 5000);
    
    return () => clearInterval(jumpInterval);
  }, [isRunning]);

  return (
    <>
      <div className="character-path"></div>
      <div className="character-container" ref={containerRef}>
        <div 
          className={`character ${characterClass}`} 
          ref={characterRef}
        >
          <div className="cyber-glow" style={{ color: position === 'long' ? '#00ff7f' : position === 'short' ? '#ff3e4d' : '#ffffff' }}></div>
        </div>
        {showBullet && <div className="bullet"></div>}
      </div>
    </>
  );
};

export default CharacterAnimation;