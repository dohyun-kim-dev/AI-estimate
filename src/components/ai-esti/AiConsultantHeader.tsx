// src/app/ai-estimate/components/AiConsultantHeader.tsx
"use client";

import React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;

  white-space: pre-line;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const Info = styled.div`
  h2 {
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 160%; /* 28.8px */
    margin: 0 0 5px 0;
    color: ${({ theme }) => theme.text};
  }
  p {
    font-size: 0.9em;
    color: ${({ theme }) => theme.subtleText};
    margin: 0;
  }
`;

const Description = styled.p`
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; 
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const AiConsultantHeader = () => {
  return (
    <>
    <HeaderWrapper>
      <ProfileImage src="/ai-estimate/pretty.png" alt="AI Consultant" />
      <Info>
        <h2>AI 컨설턴트</h2>
      </Info>
    </HeaderWrapper>
    <Description>AI 가 추정한 견적입니다.<br></br>
      실제 개발 환경이나 요구 조건에 따라 차이가 있을 수 있어요. 지금 전문가와 직접 확인하고 더 정확한 견적을 받아보세요.</Description>

    </>
  );
};

export default AiConsultantHeader;

