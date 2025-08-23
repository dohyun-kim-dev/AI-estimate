import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

const Container = styled.div`
  min-height: 78vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.body};
  padding: 20px;
  text-align: center;
  gap: 24px;
`

const MainTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.subtleText};
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`

const CTAButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.surface2};
  font-size: 1.125rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`

const Highlight = styled.span`
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
`

export default function Home() {
  const navigate = useNavigate()

  return (
    <Container>
      <MainTitle>
        AI가 분석하는 맞춤형 프로젝트 견적
        <br />
        <Highlight>5분 만에 받아보세요</Highlight>
      </MainTitle>
      <Subtitle>
        복잡한 견적 계산은 이제 그만! 
        AI가 프로젝트의 규모와 특성을 분석하여
        최적화된 견적과 기간을 제안해드립니다.
      </Subtitle>
      <CTAButton onClick={() => navigate('/ai-estimate')}>
        AI 견적서 받아보기
      </CTAButton>
      <CTAButton onClick={() => navigate('/ai')}>
        테스트
      </CTAButton>
    </Container>
  )
}