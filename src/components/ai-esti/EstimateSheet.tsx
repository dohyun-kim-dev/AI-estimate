// src/app/ai-estimate/components/EstimateSheet.tsx
"use client";

import React from 'react';
import styled from 'styled-components';
import { ProjectEstimate } from '../types';
import EstimateAccordion from './EstimateAccordion';

const SheetWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const Header = styled.div`
  background-color: ${({ theme }) => theme.surface2};
  padding: 25px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const ProjectName = styled.h1`
  font-size: 1.8em;
  color: ${({ theme }) => theme.text};
  margin-bottom: 15px;
  font-weight: 700;
`;

const PriceInfo = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 1.1em;
  color: ${({ theme }) => theme.subtleText};
  gap: 20px;
`;

interface EstimateSheetProps {
  data: ProjectEstimate;
}

const EstimateSheet: React.FC<EstimateSheetProps> = ({ data }) => {
  return (
    <SheetWrapper>
      <Header>
        <ProjectName>{data.project_name}</ProjectName>
        <PriceInfo>
          <span><strong>총 합계:</strong> {data.total_price}원</span>
          <span><strong>부가세 포함:</strong> {data.vat_included_price}원</span>
          <span><strong>예상 기간:</strong> {data.estimated_period}</span>
        </PriceInfo>
      </Header>
      <EstimateAccordion data={data} />
    </SheetWrapper>
  );
};

export default EstimateSheet;
