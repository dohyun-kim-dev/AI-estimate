import React, { useState } from 'react';
import styled from 'styled-components';
import EstimateCard from './EstimateCard';
import EstimateAccordion from './EstimateAccordion';
import DetailModal from './DetailModal';
import EstimateActionButtons from './EstimateActionButtons';
import PeriodSlider from './PeriodSlider';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import type { EstimateItem } from '@/app/ai-estimate/types';
import { useChatActions} from '@/hooks/useChatActions';

// 메인 페이지와 동일한 스타일 컴포넌트들
const EstimateContainer = styled.div`
  width: 100%;  
  max-width: 1200px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 320px;
  width: 100%;
  padding-bottom: 20px;

  @media (min-width: 1024px) {
    width: 560px;
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
  margin: -20px 0 -20px;
`;

const DetailsToggleIcon = styled.div`
  margin-top: 4px;
  margin-left: 10px;
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

const StyledDiv = styled.div`
  font-size: 18px;
  line-height: 2.0;
  color: ${({ theme }) => (theme.body === '#FFFFFF' ? '#333333' : '#dddddd')};
`;

const EstimateRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);
  const [projectPeriod, setProjectPeriod] = useState(20);
  const { handleSubmit } = useChatActions({ modelName: 'gemini-2.5-flash', selectedPromptId: 'default' });

  const extractEstimateData = (content: string): ProjectEstimate | null => {
    try {
      // 1. 먼저 <script> 태그에서 JSON 찾기 (기존 로직)
      const scriptMatch = content.match(/<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/);
      if (scriptMatch) {
        const data = JSON.parse(scriptMatch[1]);
        if (data && typeof data === 'object' && Array.isArray(data.categories)) {
          return data as ProjectEstimate;
        }
      }
      
      // 2. <script> 태그가 없으면 마크다운 코드블록에서 JSON 찾기
      const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        const data = JSON.parse(codeBlockMatch[1]);
        if (data && typeof data === 'object' && Array.isArray(data.categories)) {
          return data as ProjectEstimate;
        }
      }
      
      // 3. 위 두 방법이 안되면 JSON 형태인지 먼저 확인 후 파싱 시도
      const trimmedContent = content.trim();
      
      // JSON 형태일 가능성이 높은 패턴만 체크 (객체나 배열로 시작/끝)
      if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
          (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
        
        try {
          const data = JSON.parse(trimmedContent);
          if (data && typeof data === 'object' && Array.isArray(data.categories)) {
            return data as ProjectEstimate;
          }
        } catch (jsonErr) {
          // JSON 파싱 실패는 정상적인 경우 (일반 텍스트)이므로 에러 로그 없이 넘어감
          console.log("Raw JSON parsing failed - likely normal text content");
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to parse estimate data:', error);
      return null;
    }
  };

  const estimateData = extractEstimateData(content);
  
  if (!estimateData) {
    return null;
  }

  const handleItemClick = (item: EstimateItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  if (estimateData && estimateData.categories) {
    return (
      <EstimateContainer>
        {content.split('<script')[0].trim() && (
          <div style={{ marginBottom: '16px' }}>
            {content.split('<script')[0].trim()}
          </div>
        )}

        <TopSection>
          <MainContent>
            <EstimateCard estimate={estimateData} />
            <DetailsToggle onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
              상세견적 보기 {isDetailsVisible ?
                <DetailsToggleIcon><IoChevronUp size={24} /></DetailsToggleIcon> :
                <DetailsToggleIcon><IoChevronDown size={24} /></DetailsToggleIcon>
              }
            </DetailsToggle>
            <PeriodSlider value={projectPeriod} onChange={setProjectPeriod} $isvisible={isDetailsVisible} />
            <AnimatedContainer $isvisible={isDetailsVisible}>
              <EstimateAccordion
                data={estimateData}
                onItemClick={handleItemClick}

              />
            </AnimatedContainer>
          </MainContent>
          <SideContent>
            <EstimateActionButtons
              onConsult={() => console.log('문의하기')}
              onSubmit={handleSubmit}
            />
          </SideContent>
        </TopSection>

        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={handleCloseModal}
          />
        )}
      </EstimateContainer>
    );
  }
  
  if (content.includes('<script')) {
    return <StyledDiv>견적서를 불러오는 중...</StyledDiv>;
  }

  return <StyledDiv dangerouslySetInnerHTML={{ __html: content }} />;
};

export default EstimateRenderer;
