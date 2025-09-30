import React from 'react';
import styled from 'styled-components';
import EstimateRenderer from './EstimateRenderer';

const MessageWrapper = styled.div`
  display: flex;
  gap: 15px;
  padding: 12px 0;
  max-width: 800px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Header = styled.div`
  display: flex;
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
  font-size: 18px;
  line-height: 2.0;
  line-height: 160%;
  color: ${({ theme }) => theme.text};
  white-space: pre-wrap;
  
  p {
    margin: 0;
  }
`;

interface ShareAiResponseMessageProps {
  content: string | React.ReactNode;
  profileImage?: string;
  name?: string;
  className?: string;
  isLoading?: boolean;
  chatSessionId?: string;
}

const ShareAiResponseMessage: React.FC<ShareAiResponseMessageProps> = ({
  content,
  profileImage = "/ai-estimate/pretty.png",
  name = "AI 컨설턴트",
  className,
  isLoading = false
}) => {
  const isEstimateMessage = (content: string) => {
    if (typeof content !== 'string') return false;
    
    // 1. script 태그 형식
    if (content.includes('<script type="application/json" id="invoiceData">')) return true;
    
    // 2. 마크다운 코드 블록 형식
    if (/```json\s*\n[\s\S]*?"uuid"[\s\S]*?\n```/.test(content)) return true;
    
    // 3. 직접 JSON 형식 (uuid나 project_name 포함)
    if (/^[\s]*{[\s\S]*"(uuid|project_name)"[\s\S]*}[\s]*$/.test(content.trim())) return true;
    
    return false;
  };

  const renderContent = () => {
    if (typeof content === 'string' && isEstimateMessage(content)) {
      return <EstimateRenderer content={content} />;
    }

    if (typeof content === 'string') {
      // 일반 텍스트 메시지인 경우 JSON 관련 태그 및 불필요한 텍스트 제거
      let cleanContent = content
        .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/```json\s*\n[\s\S]*?\n```/g, '')
        .trim();

      // JSON 시작 직전의 불필요한 텍스트 패턴들 제거
      const unnecessaryPatterns = [
        /\b[a-zA-Z0-9_]*uuid[a-zA-Z0-9_]*\b/gi,
        /\b[a-zA-Z0-9_]*estimate[a-zA-Z0-9_]*\b/gi,
        /\b[a-zA-Z0-9_]*recommended[a-zA-Z0-9_]*\b/gi,
        /\b[a-zA-Z0-9_]*features?[a-zA-Z0-9_]*\b/gi,
        /\b[a-zA-Z0-9_]*data[a-zA-Z0-9_]*\b/gi,
        /\bnew_[a-zA-Z0-9_]+\b/gi,
        /\b[a-zA-Z0-9_]+_for_[a-zA-Z0-9_]+\b/gi,
        /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      ];

      unnecessaryPatterns.forEach(pattern => {
        cleanContent = cleanContent.replace(pattern, '').trim();
      });

      // 연속된 공백 정리
      cleanContent = cleanContent.replace(/\s+/g, ' ').trim();
      
      if (cleanContent) {
        return <p>{cleanContent}</p>;
      }
    }

    return typeof content === 'string' ? <p>{content}</p> : content;
  };

  return (
    <MessageWrapper className={className}>
      <ContentWrapper>
        <Header>
          <ProfileImage src={profileImage} alt={name} data-is-loading={isLoading} />
          <h2>{name}</h2>
        </Header>
        <MessageContent>
          {renderContent()}
        </MessageContent>
      </ContentWrapper>
    </MessageWrapper>
  );
};

export default ShareAiResponseMessage;
