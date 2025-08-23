import React from 'react'
import styled from 'styled-components'
import { useEstimateStore } from '@/store/estimateStore'
import EstimateCard from '@/components/ai-esti/EstimateCard'
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 16px;
  color: ${({ theme }) => theme.subtleText};
`
const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 12px 0 4px;
`
const Desc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
`
const CTAButton = styled.button`
  margin-top: 12px;
  background-color: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.surface2};
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`


// 추가: 라이브 섹션
const LiveSection = styled.section`
  margin-top: 32px;
`;

const LiveTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 12px;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  background: #000;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;


export default function MyEstimatePage() {
  const navigate = useNavigate();
  const { projectEstimate } = useEstimateStore()

  return (
    <Container>
      {!projectEstimate ? (
        <EmptyState>
          <Title>저장된 견적이 없습니다</Title>
          <Desc>AI 상담으로 첫 견적을 만들어 보세요.</Desc>
          <CTAButton onClick={() => navigate('/ai-estimate')}>AI 견적 시작하기</CTAButton>
        </EmptyState>
      ) : (
        <>
          <Title>나의 최신 견적</Title>
          <EstimateCard estimate={projectEstimate as any} />
        </>
      )}
       {/* 유튜브 라이브 섹션 */}
       <LiveSection>
                  <LiveTitle>실시간 라이브</LiveTitle>
                  <VideoWrapper>
                    <iframe
                      src="https://www.youtube.com/embed/GhleiSfZCOM?rel=0&modestbranding=1&playsinline=1&autoplay=0&mute=0"
                      title="YouTube live"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </VideoWrapper>
                </LiveSection>


    </Container>
  )
}
