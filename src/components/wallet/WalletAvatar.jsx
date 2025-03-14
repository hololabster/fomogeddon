// src/components/wallet/WalletAvatar.jsx
import React, { useMemo } from "react";
// import { createHash } from "crypto-browserify"; // 필요한 경우 설치 필요

/**
 * 향상된 SVG 지갑 아바타 컴포넌트
 * 다양한 스타일 옵션과 복잡한 패턴을 지원합니다.
 *
 * @param {Object} props 컴포넌트 속성
 * @param {string} props.address 지갑 주소
 * @param {number} props.size 아바타 크기 (픽셀 단위)
 * @param {string} props.className 추가 CSS 클래스
 * @param {boolean} props.animation 애니메이션 효과 여부
 */
const WalletAvatar = ({
  address,
  size = 64,
  className = "",
  animation = false,
}) => {
  // 주소가 없거나 짧으면 기본 생성
  const cleanAddress = useMemo(() => {
    if (!address || address.length < 10) {
      return "0x" + Math.random().toString(16).substring(2, 42);
    }
    return address.toLowerCase();
  }, [address]);

  // 해시로 더 많은 색상과 값 추출 (sha256 활용)
  const createPseudoRandomValues = (input, length = 64) => {
    try {
      // 브라우저에서 사용 가능한 경우, crypto 사용
      if (window.crypto && window.crypto.subtle) {
        // 간단하게 문자열 해시 생성
        let hash = "";
        for (let i = 0; i < input.length; i++) {
          hash += input.charCodeAt(i).toString(16);
        }
        return hash.substring(0, length);
      } else {
        // SHA-256 사용 (crypto-browserify 필요)
        // const hash = createHash("sha256");
        // hash.update(input);
        // return hash.digest("hex").substring(0, length);
      }
    } catch (e) {
      // 폴백 - 간단한 문자열 해싱
      let hash = "";
      for (let i = 0; i < input.length; i++) {
        hash += input.charCodeAt(i).toString(16);
      }
      return hash.substring(0, length);
    }
  };

  // 주소에서 시각화 데이터 생성
  const visualData = useMemo(() => {
    // 해시 생성
    const hash = cleanAddress.replace(/^0x/, "");
    const extendedHash = createPseudoRandomValues(cleanAddress, 128);

    // 색상 팔레트 생성
    const palette = {
      primary: `#${extendedHash.substring(0, 6)}`,
      secondary: `#${extendedHash.substring(6, 12)}`,
      tertiary: `#${extendedHash.substring(12, 18)}`,
      accent: `#${extendedHash.substring(18, 24)}`,
      background: `#${extendedHash.substring(24, 30)}`,
    };

    // 사이버펑크 스타일은 네온 색상 강화
    let colors = {
      primary: adjustColor(palette.primary, { s: 100, l: 50 }),
      secondary: adjustColor(palette.secondary, { s: 100, l: 40 }),
      tertiary: adjustColor(palette.tertiary, { s: 90, l: 60 }),
      accent: adjustColor(palette.accent, { s: 100, l: 50 }),
      background: "#121212", // 어두운 배경
    };

    // 각 스타일에 맞는 패턴 생성
    let gridSize, pattern;
    gridSize = 7;
    pattern = createCyberpunkPattern(extendedHash, gridSize);

    return { colors, pattern, gridSize, hash: extendedHash };
  }, [cleanAddress]);

  // 색상 조정 도우미 함수 (HSL 조정)
  function adjustColor(hex, { h = null, s = null, l = null }) {
    // 헥스 -> RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // RGB -> HSL 변환
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue,
      sat,
      light = (max + min) / 2;

    if (max === min) {
      hue = sat = 0; // 무채색
    } else {
      const d = max - min;
      sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          hue = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          hue = (b - r) / d + 2;
          break;
        case b:
          hue = (r - g) / d + 4;
          break;
      }

      hue /= 6;
    }

    // HSL 값 조정
    hue = h !== null ? h / 360 : hue;
    sat = s !== null ? s / 100 : sat;
    light = l !== null ? l / 100 : light;

    // HSL -> RGB 변환
    let r1, g1, b1;

    if (sat === 0) {
      r1 = g1 = b1 = light;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
      const p = 2 * light - q;

      r1 = hue2rgb(p, q, hue + 1 / 3);
      g1 = hue2rgb(p, q, hue);
      b1 = hue2rgb(p, q, hue - 1 / 3);
    }

    // RGB -> 헥스 변환
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
  }

  // 기하학적 패턴 생성 함수
  function createGeometricPattern(hash, gridSize) {
    const pattern = [];
    const halfGrid = Math.floor(gridSize / 2) + (gridSize % 2);

    for (let y = 0; y < gridSize; y++) {
      const row = [];

      // 왼쪽 절반만 생성
      for (let x = 0; x < halfGrid; x++) {
        const seedValue = parseInt(
          hash.charAt((y * halfGrid + x) % hash.length),
          16
        );
        row.push(seedValue > 7);
      }

      // 오른쪽 절반은 미러링 (대칭)
      for (let x = gridSize - 1; x >= halfGrid - (gridSize % 2 ? 0 : 1); x--) {
        row.push(row[gridSize - 1 - x]);
      }

      pattern.push(row);
    }

    return pattern;
  }

  // 픽셀 아트 패턴 생성 함수
  function createPixelPattern(hash, gridSize) {
    const pattern = [];

    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        const seedIndex = (y * gridSize + x) % hash.length;
        const seedValue = parseInt(hash.charAt(seedIndex), 16);

        // 0: 비어있음, 1-3: 기본 색상, 4-5: 보조 색상
        row.push(seedValue % 6);
      }
      pattern.push(row);
    }

    return pattern;
  }

  // 사이버펑크 패턴 생성 함수
  function createCyberpunkPattern(hash, gridSize) {
    const pattern = [];
    const halfGrid = Math.floor(gridSize / 2) + (gridSize % 2 ? 1 : 0);

    // 사이버펑크 요소 추가 (회로, 선 등)
    const addCircuitLines = Math.random() > 0.5;

    for (let y = 0; y < gridSize; y++) {
      const row = [];

      // 일부 행에 회로 패턴 추가
      const isCircuitRow = addCircuitLines && (y === 1 || y === gridSize - 2);

      // 왼쪽 절반 생성
      for (let x = 0; x < halfGrid; x++) {
        const idx = (y * halfGrid + x) % hash.length;
        const seedValue = parseInt(hash.charAt(idx), 16);

        // 회로 행인 경우 다른 패턴 적용
        if (isCircuitRow) {
          row.push(seedValue % 4); // 0-3 값 (0: 비어있음, 1-3: 회로 유형)
        } else {
          row.push(seedValue % 8 > 3 ? seedValue % 4 : 0); // 50% 확률로 비어있음
        }
      }

      // 오른쪽 절반 미러링 (대칭) - 회로는 대칭 안 함
      for (let x = gridSize - 1; x >= halfGrid - (gridSize % 2 ? 0 : 1); x--) {
        if (isCircuitRow) {
          // 회로 라인은 랜덤하게 유지
          const seedValue = parseInt(hash.charAt((y * x) % hash.length), 16);
          row.push(seedValue % 4);
        } else {
          // 나머지는 미러링
          row.push(row[gridSize - 1 - x]);
        }
      }

      pattern.push(row);
    }

    return pattern;
  }

  // 모던 패턴 생성 함수
  function createModernPattern(hash, gridSize) {
    const pattern = [];

    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        // 중앙에 더 많은 원소 배치
        const distFromCenter = Math.sqrt(
          Math.pow(x - gridSize / 2, 2) + Math.pow(y - gridSize / 2, 2)
        );

        const idx = (y * gridSize + x) % hash.length;
        const seedValue = parseInt(hash.charAt(idx), 16);

        // 중앙에 가까울수록 채워질 확률 높음
        const threshold = 8 - Math.floor(distFromCenter * 2);
        row.push(seedValue < threshold ? (seedValue % 3) + 1 : 0);
      }
      pattern.push(row);
    }

    return pattern;
  }

  // SVG 렌더링
  const cellSize = size / visualData.gridSize;

  const renderPattern = () => {
    const elements = [];

    for (let y = 0; y < visualData.gridSize; y++) {
      for (let x = 0; x < visualData.gridSize; x++) {
        const cellValue = visualData.pattern[y][x];

        if (cellValue) {
          let shape = null;

          // 사이버펑크 스타일 - 회로 패턴
          if (cellValue > 0) {
            const colors = [
              "none",
              visualData.colors.primary,
              visualData.colors.secondary,
              visualData.colors.accent,
            ];

            if (cellValue === 1) {
              // 사각형
              shape = (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={colors[cellValue]}
                  opacity={0.8}
                  rx={cellSize * 0.2}
                />
              );
            } else if (cellValue === 2) {
              // 회로 선
              shape = (
                <line
                  key={`${x}-${y}`}
                  x1={x * cellSize}
                  y1={y * cellSize + cellSize / 2}
                  x2={(x + 1) * cellSize}
                  y2={y * cellSize + cellSize / 2}
                  stroke={colors[cellValue]}
                  strokeWidth={cellSize * 0.4}
                  opacity={0.8}
                />
              );
            } else {
              // 원형 노드
              shape = (
                <circle
                  key={`${x}-${y}`}
                  cx={x * cellSize + cellSize / 2}
                  cy={y * cellSize + cellSize / 2}
                  r={cellSize * 0.3}
                  fill={colors[cellValue]}
                  opacity={0.8}
                />
              );
            }
          }

          if (shape) {
            elements.push(shape);
          }
        }
      }
    }

    return elements;
  };

  // 애니메이션 정의
  const animationProps = animation
    ? {
        animate: true,
        animationDuration: "5s",
      }
    : {};

  // 추가 효과 및 장식
  const renderEffects = () => {
    const effects = [];

    // 사이버펑크 스타일 추가 효과
    effects.push(
      <filter key="glow" id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    );

    // 네온 테두리
    effects.push(
      <rect
        key="neon-border"
        x="0"
        y="0"
        width={size}
        height={size}
        fill="none"
        stroke={visualData.colors.primary}
        strokeWidth={size * 0.02}
        rx={size * 0.15}
        filter="url(#glow)"
      />
    );

    // 중심 장식
    effects.push(
      <circle
        key="core"
        cx={size / 2}
        cy={size / 2}
        r={size * 0.12}
        fill={visualData.colors.accent}
        opacity={0.7}
        filter="url(#glow)"
      >
        {animation && (
          <animate
            attributeName="opacity"
            values="0.5;0.8;0.5"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    );

    return effects;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`wallet-avatar wallet-avatar-cyberpunk ${className}`}
      {...animationProps}
    >
      {/* 배경 */}
      <rect
        width={size}
        height={size}
        fill={visualData.colors.background}
        rx={size * 0.15}
      />

      {/* 필터와 효과 정의 */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 패턴 그리기 */}
      {renderPattern()}

      {/* 추가 효과 */}
      {renderEffects()}
    </svg>
  );
};

export default WalletAvatar;
