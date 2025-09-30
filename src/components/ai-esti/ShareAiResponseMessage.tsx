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
      // 일반 텍스트 메시지인 경우 <script> 태그 제거
      const cleanContent = content.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '').trim();
      
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
