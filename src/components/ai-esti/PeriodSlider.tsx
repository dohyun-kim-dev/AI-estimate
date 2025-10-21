"use client";

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useCompanyStore } from '@/store/companyStore';
import { calculateDiscountInfo, type DiscountSettings } from '@/utils/discountCalculator';

const SliderWrapper = styled.div<{ $isvisible: boolean }>`
  max-height: ${({ $isvisible }) => ($isvisible ? '1000px' : '0')};
  transition: max-height 0.6s ease-in-out;
  overflow: hidden;

  @media (min-width: 1020px) {
    max-height: 1000px !important;
    overflow: visible;
  }
`;

const InnerContainer = styled.div`
  background-color: ${({ theme }) => theme.surface2};
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0 20px 0;
  position: relative; /* Tooltip 위치 지정을 위해 추가 */
`;

const Title = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  margin: 0 0 5px 0;

  .p {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

const Description = styled.p`
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${({ theme }) => theme.subtleText};
  padding-bottom: 10px;
  margin: 0 0 20px 0;
`;

const SliderContainer = styled.div`
  text-align: center;
`;

const WeekDisplay = styled.p`
  font-family: Roboto;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  color: ${({ theme }) => theme.text};
  margin-bottom: 15px;
`;

const DiscountDisplay = styled.p`
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  // color: ${({ theme }) => theme.accent};
  margin-top: -10px;
  margin-bottom: 15px;
`;

const Slider = styled.input<{ $value: number; $min: number; $max: number; }>`
  width: 100%;
  cursor: pointer;
  -webkit-appearance: none;
  background-color: transparent;
  appearance: none;
  outline: none;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    background: linear-gradient(to right, #81AFE9 ${props => ((Number(props.$value) - Number(props.$min)) / (Number(props.$max) - Number(props.$min))) * 100}%, ${({ theme }) => theme.track} 0%);
    border-radius: 5px;
    border: none;
  }

  &::-moz-range-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    background: linear-gradient(to right, #81AFE9 ${props => ((Number(props.$value) - Number(props.$min)) / (Number(props.$max) - Number(props.$min))) * 100}%, ${({ theme }) => theme.track} 0%);
    border-radius: 5px;
    border: none;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #60A5FA;
    cursor: pointer;
    margin-top: -6px;
    
  }

  &::-moz-range-thumb {
    border: none;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #60A5FA;
    cursor: pointer;
  }
`;

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: Roboto;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${({ theme }) => theme.subtleText};
  margin-top: 0px;
`;

// 말풍선 컴포넌트 추가
const Tooltip = styled.div<{ $left: string }>`
  position: absolute;
  top: 135px; /* SliderContainer 위쪽으로 위치 조정 및 20px 아래로 이동 */
  transform: translateX(-50%);
  left: ${({ $left }) => $left};
  background-color: #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0; /* 초기에는 숨김 */
  transition: opacity 0.3s ease;
  z-index: 10;
  pointer-events: none; /* 클릭 이벤트 방지 */

  .slider-container:hover &,
  .slider-container.dragging & {
    opacity: 1; /* 호버 또는 드래그 시 나타남 */
  }
`;

// 말풍선 위쪽의 삼각형 컴포넌트 (방향 변경)
const TooltipArrow = styled.div`
  position: absolute;
  top: -6px; /* 위쪽으로 위치 */
  left: 50%;
  transform: translateX(-50%) rotate(225deg); /* 위를 향하도록 회전 */
  width: 10px;
  height: 10px;
  background-color: #333;
`;


interface PeriodSliderProps {
  value: number;
  onChange: (value: number) => void;
  $isvisible?: boolean;
  min?: number;
  max?: number;
  discountedPrice?: number;
  basePrice?: number;
  totalDiscountAmount?: number; // ✅ 추가: EstimateCard에서 계산한 총 할인 금액
}

const PeriodSlider: React.FC<PeriodSliderProps> = ({ 
  value = 0, 
  onChange, 
  $isvisible, 
  min=0, 
  max=8, 
  discountedPrice, 
  basePrice,
  totalDiscountAmount = 0 // ✅ 추가
}) => {
  // url에 'share'가 포함되어 있으면 렌더링하지 않음
  if (typeof window !== 'undefined' && window.location.pathname.includes('share')) {
    return null;
  }
  
  const { companyInfo } = useCompanyStore();
  const [isDragging, setIsDragging] = useState(false);

  // 컴퍼니 데이터에서 할인 설정 가져오기
  const discountSettings = useMemo(() => {
    if (!companyInfo) {
      return {
        checkpointList: [{ checkpoint: 1, discountRate: 1.25 }],
        discountRate: 'WEEK',
        rateRule: 'FIXED',
        minValue: 1,
        maxValue: 8
      };
    }

    return {
      checkpointList: companyInfo.checkpointList || [{ checkpoint: 1, discountRate: 1.25 }],
      discountRate: companyInfo.discountRate || 'WEEK',
      rateRule: companyInfo.rateRule || 'FIXED',
      minValue: (companyInfo as any).minValue || 0, // 임시로 any 타입 사용
      maxValue: (companyInfo as any).maxValue || 8   // 임시로 any 타입 사용
    };
  }, [companyInfo]);

  // 슬라이더 설정 계산
  const sliderConfig = useMemo(() => {
    const { checkpointList, rateRule, minValue, maxValue } = discountSettings;

    if (rateRule === 'FIXED') {
      return {
        min: 0,
        max: maxValue - minValue,
        step: checkpointList[0]?.checkpoint || 1
      };
    } else {
      // DYNAMIC의 경우 체크포인트만 선택 가능하도록 설정
      const checkpoints = [0, ...checkpointList.map(cp => cp.checkpoint)].sort((a, b) => a - b);
      return {
        min: 0,
        max: checkpoints.length - 1, // 인덱스 기반으로 설정
        step: 1,
        checkpoints // 실제 체크포인트 값들
      };
    }
  }, [discountSettings]);

  // DYNAMIC 모드에서 실제 값과 슬라이더 인덱스 변환
  const getActualValue = (sliderIndex: number) => {
    if (discountSettings.rateRule === 'DYNAMIC' && sliderConfig.checkpoints) {
      return sliderConfig.checkpoints[sliderIndex] || 0;
    }
    return sliderIndex;
  };

  const getSliderIndex = (actualValue: number) => {
    if (discountSettings.rateRule === 'DYNAMIC' && sliderConfig.checkpoints) {
      const index = sliderConfig.checkpoints.indexOf(actualValue);
      return index >= 0 ? index : 0; // 찾지 못하면 0 반환
    }
    return actualValue;
  };

  // 현재 슬라이더 인덱스와 실제 값
  const currentSliderIndex = getSliderIndex(value);
  const actualValue = discountSettings.rateRule === 'DYNAMIC' ? value : value;

  // ✅ EstimateCard에서 전달받은 할인 금액 사용, 비율은 자체 계산
  const discountInfo = useMemo(() => {
    const calculatedInfo = calculateDiscountInfo(value, basePrice || 0, discountSettings);
    
    // totalDiscountAmount가 있으면 그 값을 사용하고, percentage는 자체 계산
    if (totalDiscountAmount > 0) {
      return {
        amount: totalDiscountAmount,
        percentage: calculatedInfo.percentage
      };
    }
    
    // fallback: 기존 계산 로직
    return calculatedInfo;
  }, [value, discountSettings, basePrice, totalDiscountAmount]);

  // 단위 텍스트 생성
  const getUnitText = () => {
    switch (discountSettings.discountRate) {
      case 'WEEK':
        return '주';
      case 'MONTH':
        return '월';
      case 'QUANTITY':
        return '수량';
      default:
        return '주';
    }
  };

  const getDisplayText = () => {
    const unit = getUnitText();
    if (value === 0) {
      return `기본 ${unit}`;
    }
    switch (discountSettings.discountRate) {
      case 'WEEK':
        return `${value}주 연장`;
      case 'MONTH':
        return `${value}개월 연장`;
      case 'QUANTITY':
        return `${value}개 추가`;
      default:
        return `${value}주 연장`;
    }
  };
  // const tooltipPosition = `calc(${((value - min) / (max - min)) * 50}% + 75px)`;
  const tooltipPosition = `238px`;
  
  return (
    <SliderWrapper $isvisible={$isvisible}>
      <InnerContainer>
        <Title>프로젝트 기간 설정 <span className="p">({getUnitText()} 단위)</span></Title>
        <Description>견적기간을 늘릴 경우 할인된 금액으로 변경됩니다</Description>
        <SliderContainer className={`slider-container ${isDragging ? 'dragging' : ''}`}>
          <Tooltip $left={tooltipPosition}>
            {discountInfo.percentage.toFixed(1)}% 할인이 적용되었어요! 
          {value > 0 && (
            <DiscountDisplay>
              (- {discountInfo.amount.toLocaleString()}원)
            </DiscountDisplay>
          )}
            <TooltipArrow />
          </Tooltip>
          <WeekDisplay>{getDisplayText()}</WeekDisplay>
          {value > 0 && (
            <DiscountDisplay>
              {/* {discountInfo.percentage.toFixed(1)}% 할인 ({discountInfo.amount.toLocaleString()}원) */}
            </DiscountDisplay>
          )}
          <Slider 
          min={sliderConfig.min}
          max={sliderConfig.max}
          value={currentSliderIndex}
          step={sliderConfig.step}
          type="range"
          $value={currentSliderIndex}
          $min={sliderConfig.min}
          $max={sliderConfig.max}
            onChange={e => {
              const sliderIndex = Number(e.target.value);
              if (discountSettings.rateRule === 'DYNAMIC') {
                // DYNAMIC 모드에서는 슬라이더 인덱스를 실제 체크포인트 값으로 변환해서 전달
                const actualValue = getActualValue(sliderIndex);
                onChange(actualValue);
              } else {
                onChange(sliderIndex);
              }
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
          />
  
          <Labels>
            {discountSettings.rateRule === 'DYNAMIC' && sliderConfig.checkpoints ? (
              <>
                <span>{sliderConfig.checkpoints[0]}{getUnitText()}</span>
                <span>{sliderConfig.checkpoints[sliderConfig.checkpoints.length - 1]}{getUnitText()}</span>
              </>
            ) : (
              <>
                <span>{sliderConfig.min}{getUnitText()}</span>
                <span>{sliderConfig.max}{getUnitText()}</span>
              </>
            )}
          </Labels>
        </SliderContainer>
      </InnerContainer>
      <Description>기획 및 디자인은 할인에서 제외됩니다</Description>
    </SliderWrapper>
  );
};

export default PeriodSlider;