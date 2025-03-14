// src/components/effects/TradeEffects.js
import React, { useState, useEffect } from 'react';
import '../../styles/enhanced-effects.css';

// 트레이드 오버레이 효과 컴포넌트
export const TradeOverlay = ({ type, visible, onFinished }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onFinished();
      }, 1500); // 1.5초 후 오버레이 제거
      
      return () => clearTimeout(timer);
    }
  }, [visible, onFinished]);
  
  if (!visible) return null;
  
  return (
    <div className={`trade-overlay trade-overlay-${type} ${visible ? 'trade-overlay-visible' : ''}`}>
      <div className={`trade-text trade-text-${type}`}>
        {type === 'long' ? 'LONG POSITION!' : 'SHORT POSITION!'}
      </div>
    </div>
  );
};

// 차트에 애니메이션 화살표 생성 효과
export const TradeArrows = ({ type, count = 15 }) => {
  const [arrows, setArrows] = useState([]);
  
  useEffect(() => {
    if (!type) return;
    
    // 기존 화살표 제거
    setArrows([]);
    
    // 새 화살표 생성
    const newArrows = [];
    for (let i = 0; i < count; i++) {
      newArrows.push({
        id: `arrow-${Date.now()}-${i}`,
        left: Math.random() * 100, // 화면 전체에 랜덤하게 배치
        delay: Math.random() * 1.5, // 무작위 지연
        distance: type === 'long' ? '-200px' : '200px' // 롱은 위로, 숏은 아래로
      });
    }
    
    setArrows(newArrows);
    
    // 화살표 애니메이션 완료 후 제거
    const timer = setTimeout(() => {
      setArrows([]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [type, count]);
  
  return (
    <div className="trade-arrows">
      {arrows.map(arrow => (
        <div
          key={arrow.id}
          className={`arrow arrow-${type}`}
          style={{
            left: `${arrow.left}%`,
            top: type === 'long' ? 'auto' : '0',
            bottom: type === 'long' ? '0' : 'auto',
            animationDelay: `${arrow.delay}s`,
            '--arrow-distance': arrow.distance
          }}
        />
      ))}
    </div>
  );
};

// 파티클 효과 생성
export const TradeParticles = ({ type, count = 100 }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (!type) return;
    
    // 새 파티클 생성
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        left: 50 + (Math.random() * 40 - 20), // 화면 중앙 주변에 집중
        top: 50 + (Math.random() * 40 - 20),
        x: (Math.random() - 0.5) * 800, // 랜덤한 방향으로 퍼짐
        y: (Math.random() - 0.5) * 800
      });
    }
    
    setParticles(newParticles);
    
    // 파티클 애니메이션 완료 후 제거
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [type, count]);
  
  return (
    <div className="particles-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`particle particle-${type}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            '--x': `${particle.x}px`,
            '--y': `${particle.y}px`
          }}
        />
      ))}
    </div>
  );
};

// 극단적 가격 변동 알림
export const ExtremePriceAlert = ({ visible, type, message }) => {
  return (
    <div className={`extreme-price-alert ${visible ? 'visible' : ''}`}>
      <div className={`alert-text alert-${type}`}>
        {message}
      </div>
    </div>
  );
};

// 모든 효과를 관리하는 효과 컨트롤러
const EffectsController = () => {
  const [tradeEffect, setTradeEffect] = useState({ type: null, visible: false });
  const [priceAlertEffect, setPriceAlertEffect] = useState({ visible: false, type: 'up', message: '' });
  
  // 글로벌 이벤트 리스너 설정
  useEffect(() => {
    const handleTradeEvent = (event) => {
      if (event.detail.action === 'trade') {
        const { type } = event.detail;
        
        // 트레이드 오버레이 효과 표시
        setTradeEffect({ type, visible: true });
        
        // 2초 후 자동으로 제거
        setTimeout(() => {
          setTradeEffect({ type: null, visible: false });
        }, 2000);
      }
      
      if (event.detail.action === 'priceAlert') {
        const { type, message } = event.detail;
        
        // 가격 알림 효과 표시
        setPriceAlertEffect({ visible: true, type, message });
        
        // 3초 후 자동으로 제거
        setTimeout(() => {
          setPriceAlertEffect({ visible: false, type, message: '' });
        }, 3000);
      }
    };
    
    // 커스텀 이벤트 리스너 등록
    window.addEventListener('tradeEffect', handleTradeEvent);
    
    return () => {
      window.removeEventListener('tradeEffect', handleTradeEvent);
    };
  }, []);
  
  // 효과 종료 핸들러
  const handleEffectFinished = () => {
    setTradeEffect({ type: null, visible: false });
  };
  
  return (
    <>
      <TradeOverlay 
        type={tradeEffect.type} 
        visible={tradeEffect.visible} 
        onFinished={handleEffectFinished}
      />
      <TradeArrows type={tradeEffect.type} />
      <TradeParticles type={tradeEffect.type} />
      <ExtremePriceAlert {...priceAlertEffect} />
      
      {/* 화면에 항상 존재하는 디지털 노이즈 효과 */}
      <div className="digital-noise"></div>
    </>
  );
};

export default EffectsController;