import React from 'react'
import styled from 'styled-components'
import { ProjectEstimate } from '@/types/projectEstimate'
import EstimateAccordion from './EstimateAccordion'
import { formatPrice } from '@/utils/format'

const SheetWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`

const Header = styled.div`
  background-color: ${({ theme }) => theme.surface2};
  padding: 32px 25px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`

const ProjectName = styled.h1`
  font-size: 1.8em;
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  font-weight: 700;
  line-height: 1.3;
`

const PriceInfo = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 0 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`

const PriceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;

  strong {
    font-size: 14px;
    color: ${({ theme }) => theme.subtleText};
    margin-bottom: 4px;
  }

  span {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }
`

const Content = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`

interface EstimateSheetProps {
  data: ProjectEstimate
  onItemClick?: (item: any) => void
}

export const EstimateSheet: React.FC<EstimateSheetProps> = ({
  data,
  onItemClick,
}) => {
  // VAT 계산 (10%)
  const totalPrice = parseFloat(data.total_price.replace(/,/g, ''))
  const vatIncludedPrice = totalPrice * 1.1

  return (
    <SheetWrapper>
      <Header>
        <ProjectName>{data.description}</ProjectName>
        <PriceInfo>
          <PriceItem>
            <strong>총 합계</strong>
            <span>{data.total_price}원</span>
          </PriceItem>
          <PriceItem>
            <strong>부가세 포함</strong>
            <span>{formatPrice(vatIncludedPrice)}원</span>
          </PriceItem>
          <PriceItem>
            <strong>예상 기간</strong>
            <span>{data.total_period}</span>
          </PriceItem>
        </PriceInfo>
      </Header>
      <Content>
        <EstimateAccordion data={data} onItemClick={onItemClick} />
      </Content>
    </SheetWrapper>
  )
}

export default EstimateSheet
