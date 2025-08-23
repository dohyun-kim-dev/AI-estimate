"use client";

import React from 'react';
import styled, { keyframes } from 'styled-components';

const MessageWrapper = styled.div`
  display: flex;
  gap: 15px;
  padding: 12px 0;
  max-width: 800px;
`;


const ProfileImage = styled.img<{ 'data-is-loading'?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;

  ${props => props['data-is-loading'] && `
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid transparent;
      border-top-color: #3498db; // 로딩 바 색상
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
      z-index: -1;
    }
  `}
`;


const ContentWrapper = styled.div`
  flex: 1;
`;

const Header = styled.div`
  display:flex;
  gap: 8px;
  margin-bottom: 4px;

  h2 {
    font-size: 18px;
    font-weight: 500;
    line-height: 160%;
    margin: 4px 0 4px 0;
    color: ${({ theme }) => theme.text};
  }
`;

const MessageContent = styled.div`
  font-size: 14px;
  line-height: 160%;
  color: ${({ theme }) => theme.text};
  white-space: pre-wrap;
  
  p {
    margin: 0;
  }
`;

interface AiResponseMessageProps {
  profileImage?: string;
  name?: string;
  content: string | React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const AiResponseMessage: React.FC<AiResponseMessageProps> = ({
  profileImage = "/ai-estimate/pretty.png",
  name = "AI 컨설턴트",
  content,
  className,
  isLoading = false
}) => {

const spin = keyframes`
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
`;

  return (
    <MessageWrapper className={className}>
      <ContentWrapper>
        <Header>
        <ProfileImage src={profileImage} alt={name} data-is-loading={isLoading} />
          <h2>{name}</h2>
        </Header>
        <MessageContent>
          {typeof content === 'string' ? <p>{content}</p> : content}
        </MessageContent>
      </ContentWrapper>
    </MessageWrapper>
  );
};

export default AiResponseMessage;