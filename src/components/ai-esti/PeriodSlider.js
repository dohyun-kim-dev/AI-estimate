// src/app/ai-estimate/components/PeriodSlider.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
const SliderWrapper = styled.div `
  background-color: ${({ theme }) => theme.surface2};
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
`;
const Title = styled.h3 `
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
const Description = styled.p `
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${({ theme }) => theme.subtleText};
  margin: 0 0 20px 0;
`;
const SliderContainer = styled.div `
  text-align: center;
`;
const WeekDisplay = styled.p `
  font-family: Roboto;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  color: ${({ theme }) => theme.text};
  margin-bottom: 15px;
`;
const Slider = styled.input `
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
const Labels = styled.div `
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
const PeriodSlider = ({ value, onChange }) => {
    return (_jsxs(SliderWrapper, { children: [_jsxs(Title, { children: ["\uD504\uB85C\uC81D\uD2B8 \uAE30\uAC04 \uC124\uC815 ", _jsx("span", { className: "p", children: "(\uC8FC \uB2E8\uC704)" })] }), _jsx(Description, { children: "\uACAC\uC801\uAE30\uAC04\uC744 \uB298\uB9B4 \uACBD\uC6B0 \uD560\uC778\uB41C \uAE08\uC561\uC73C\uB85C \uBCC0\uACBD\uB429\uB2C8\uB2E4" }), _jsxs(SliderContainer, { children: [_jsxs(WeekDisplay, { children: [value, "\uC8FC"] }), _jsx(Slider, { type: "range", min: "12", max: "36", value: value, onChange: (e) => onChange(parseInt(e.target.value, 10)), "$value": value, "$min": "12", "$max": "36" }), _jsxs(Labels, { children: [_jsx("span", { children: "12\uC8FC" }), _jsx("span", { children: "36\uC8FC" })] })] })] }));
};
export default PeriodSlider;
