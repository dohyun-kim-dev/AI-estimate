// src/app/ai-estimate/page.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useEstimateStore } from '@/store/estimateStore';
import { mockEstimateData } from './mockData';
import AiConsultantHeader from '@/components/ai-esti/AiConsultantHeader';
import EstimateCard from '@/components/ai-esti/EstimateCard';
import PeriodSlider from '@/components/ai-esti/PeriodSlider';
import EstimateAccordion from '@/components/ai-esti/EstimateAccordion';
import DetailModal from '@/components/ai-esti/DetailModal';
import EstimateActionButtons from '@/components/ai-esti/EstimateActionButtons';
const PageWrapper = styled.div `
  background-color: ${({ theme }) => theme.body};
  max-width: 1200px;
  margin: 0px auto;
  padding: 12px 20px;
`;
const AnimatedContainer = styled.div `
  display: grid;
  grid-template-rows: ${({ $isvisible }) => ($isvisible ? '1fr' : '0fr')};
  transition: grid-template-rows 0.5s ease-in-out;
  overflow: hidden;

  > * {
    min-height: 0;
  }
`;
const DetailsToggle = styled.div `
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 160%; 
  letter-spacing: 0.28px;
  color: ${({ theme }) => theme.subtleText};
  cursor: pointer;
  margin: -20px 0 20px;
`;
const DetailsToggleIcon = styled.div `
  margin-top: 4px;
  margin-left: 10px;
`;
const TopSection = styled.div `
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
`;
const MainContent = styled.div `
  flex: 1;
  width: 100%;

  @media (min-width: 1024px) {
    max-width: 800px;
  }
`;
const SideContent = styled.div `
  width: 100%;

  @media (min-width: 1024px) {
    width: 320px;
    position: sticky;
    top: 120px;
  }
`;
const AiEstimatePage = () => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const { projectEstimate, projectPeriod, setProjectEstimate, setProjectPeriod } = useEstimateStore();
    useEffect(() => {
        setProjectEstimate(mockEstimateData);
    }, [setProjectEstimate]);
    const handleItemClick = (item) => {
        setSelectedItem(item);
    };
    const handleCloseModal = () => {
        setSelectedItem(null);
    };
    return (_jsxs(PageWrapper, { children: [_jsx(AiConsultantHeader, {}), projectEstimate && (_jsx(_Fragment, { children: _jsxs(TopSection, { children: [_jsxs(MainContent, { children: [_jsx(EstimateCard, { estimate: projectEstimate }), _jsxs(DetailsToggle, { onClick: () => setIsDetailsVisible(!isDetailsVisible), children: ["\uC0C1\uC138\uACAC\uC801 \uBCF4\uAE30 ", isDetailsVisible ? _jsx(DetailsToggleIcon, { children: _jsx(IoChevronUp, { size: 24 }) }) : _jsx(DetailsToggleIcon, { children: _jsx(IoChevronDown, { size: 24 }) })] }), _jsx(PeriodSlider, { value: projectPeriod, onChange: setProjectPeriod }), _jsx(AnimatedContainer, { "$isvisible": isDetailsVisible, children: _jsx(EstimateAccordion, { data: projectEstimate, onItemClick: handleItemClick }) })] }), _jsx(SideContent, { children: _jsx(EstimateActionButtons, { onConsult: () => console.log('문의하기'), onAiEstimate: () => console.log('AI 예산 줄이기'), onAiOptimize: () => console.log('AI 맞춤 추천') }) })] }) })), selectedItem && _jsx(DetailModal, { item: selectedItem, onClose: handleCloseModal })] }));
};
export default AiEstimatePage;
