"use client";

import React from 'react';
import styled from 'styled-components';

const SliderWrapper = styled.div<{ $isvisible: boolean }>`
  max-height: ${({ $isvisible }) => ($isvisible ? '1000px' : '0')};
  transition: max-height 0.6s ease-in-out;
  overflow: hidden;
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

  ${SliderContainer}:hover & {
    opacity: 1; /* 호버 시 나타남 */
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
  $isvisible: boolean;
  min?: number;
  max?: number;
  discountedPrice?: number;
  basePrice?: number;
}

const PeriodSlider: React.FC<PeriodSliderProps> = ({ value, onChange, $isvisible, min, max, discountedPrice, basePrice }) => {
  const discountPercentage = ((value - min) / (max - min)) * 10;
  const discountAmount = basePrice - discountedPrice;
  // const tooltipPosition = `calc(${((value - min) / (max - min)) * 50}% + 75px)`;
  const tooltipPosition = `155px`;
  return (
    <SliderWrapper $isvisible={$isvisible}>
      <InnerContainer>
        <Title>프로젝트 기간 설정 <span className="p">(주 단위)</span></Title>
        <Description>견적기간을 늘릴 경우 할인된 금액으로 변경됩니다</Description>
        <SliderContainer>
          <Tooltip $left={tooltipPosition}>
            {discountPercentage.toFixed(1)}% 할인이 적용되었어요! 
          {value > min && (
            <DiscountDisplay>
              (- {Math.floor(discountAmount).toLocaleString()}원)
            </DiscountDisplay>
          )}
            <TooltipArrow />
          </Tooltip>
          <WeekDisplay>{value}주 연장</WeekDisplay>
          {value > min && (
            <DiscountDisplay>
              {/* {discountPercentage.toFixed(1)}% 할인 ({Math.floor(discountAmount).toLocaleString()}원) */}
            </DiscountDisplay>
          )}
          <Slider 
          min={min}
          max={max}
            type="range"
            $value={value}
            $min={min}
            $max={max}
            onChange={e => onChange(Number(e.target.value))}
          />
  
          <Labels>
            <span>{min}주</span>
            <span>{max}주</span>
          </Labels>
        </SliderContainer>
      </InnerContainer>
      <Description>기획 및 디자인은 할인에서 제외됩니다</Description>
    </SliderWrapper>
  );
};

export default PeriodSlider;