// src/app/ai-estimate/components/PeriodSlider.tsx
"use client";

import React from 'react';
import styled from 'styled-components';

const SliderWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface2};
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
`;

const Title = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  margin: 0 0 5px 0;

  .p{
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

const Slider = styled.input<{ $value: number; $min: string; $max: string; }>`
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
  margin-top:0px;
`;

interface PeriodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const PeriodSlider: React.FC<PeriodSliderProps> = ({ value, onChange }) => {
  return (
    <SliderWrapper>
      <Title>프로젝트 기간 설정 <span className="p">(주 단위)</span></Title>
      <Description>견적기간을 늘릴 경우 할인된 금액으로 변경됩니다</Description>
      <SliderContainer>
        <WeekDisplay>{value}주</WeekDisplay>
        <Slider 
          type="range" 
          min="12" 
          max="36" 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          $value={value}
          $min="12"
          $max="36"
        />
        <Labels>
          <span>12주</span>
          <span>36주</span>
        </Labels>
      </SliderContainer>
    </SliderWrapper>
  );
};

export default PeriodSlider;