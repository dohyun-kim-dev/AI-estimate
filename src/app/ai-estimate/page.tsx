// src/app/ai-estimate/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
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

const PageWrapper = styled.div`
  background-color: ${({ theme }) => theme.body};
  max-width: 1200px;
  margin: 0px auto;
  padding: 12px 20px;
`;

const AnimatedContainer = styled.div<{ $isvisible: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isvisible }) => ($isvisible ? '1fr' : '0fr')};
  transition: grid-template-rows 0.5s ease-in-out;
  overflow: hidden;

  > * {
    min-height: 0;
  }
`;

const DetailsToggle = styled.div`
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

const DetailsToggleIcon = styled.div`
  margin-top: 4px;
  margin-left: 10px;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  width: 100%;

  @media (min-width: 1024px) {
    max-width: 800px;
  }
`;

const SideContent = styled.div`
  width: 100%;

  @media (min-width: 1024px) {
    width: 320px;
    position: sticky;
    top: 120px;
  }
`;


import { EstimateItem } from './types';

interface AiEstimatePageProps {
  toggleTheme?: () => void;
  themeMode?: 'light' | 'dark';
}

const AiEstimatePage: React.FC<AiEstimatePageProps> = () => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);

  const { 
    projectEstimate, 
    projectPeriod, 
    setProjectEstimate, 
    setProjectPeriod 
  } = useEstimateStore();

  useEffect(() => {
    setProjectEstimate(mockEstimateData);
  }, [setProjectEstimate]);

  const handleItemClick = (item: EstimateItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
      <PageWrapper>
        <AiConsultantHeader />
        
        {projectEstimate && (
          <>
            <TopSection>
              <MainContent>
                <EstimateCard estimate={projectEstimate} />
                <DetailsToggle onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
                  상세견적 보기 {isDetailsVisible ? <DetailsToggleIcon><IoChevronUp size={24}/></DetailsToggleIcon> : <DetailsToggleIcon><IoChevronDown size={24}/></DetailsToggleIcon>
                }
                </DetailsToggle>
                <PeriodSlider value={projectPeriod} onChange={setProjectPeriod} />

                <AnimatedContainer $isvisible={isDetailsVisible}>
                  <EstimateAccordion data={projectEstimate} onItemClick={handleItemClick} />
                </AnimatedContainer>

               
              </MainContent>
              <SideContent>
                <EstimateActionButtons 
                  onConsult={() => console.log('문의하기')}
                  onAiEstimate={() => console.log('AI 예산 줄이기')}
                  onAiOptimize={() => console.log('AI 맞춤 추천')}
                />
              </SideContent>
            </TopSection>
          </>
        )}
      
      {selectedItem && <DetailModal item={selectedItem} onClose={handleCloseModal} />}
      </PageWrapper>
  );
};

export default AiEstimatePage;
