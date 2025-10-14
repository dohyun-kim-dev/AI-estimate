'use client';

import React from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';

type FullScreenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (content: string) => void;
  title: string;
  description?: string;
  content: string;
};

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  onApply,
  title,
  description,
  content
}) => {
  const [editableContent, setEditableContent] = React.useState(content);

  // content가 변경될 때 editableContent 업데이트
  React.useEffect(() => {
    setEditableContent(content);
  }, [content]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (onApply) {
      onApply(editableContent);
    }
  };

  return (
    <Overlay>
      <ModalContainer>
        <Header>
          <Title>{title}</Title>

            <TitleButtonForm>
          <CloseButton onClick={onClose}>닫기</CloseButton>
          <ApplyButton onClick={handleApply}>적용</ApplyButton>
        </TitleButtonForm>
      </Header>

      <ContentArea>
          <ContentTextarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            placeholder="프롬프트 내용을 입력하세요"
          />
        </ContentArea>
        
      </ModalContainer>
    </Overlay>
  );
};

export default FullScreenModal;

// 스타일 컴포넌트
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContainer = styled.div`
  width: 97vw;
  height: 97vh;
  background-color: white;
  border-radius: 0px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
display: flex;
justify-content: space-between;
  padding: 24px 32px 12px;
  background-color: #fff;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
`;

const TitleButtonForm = styled.div`
  display: flex;
  gap: 12px;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const ContentTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 24px;
  font-size: 15px;
  line-height: 1.8;
  color: #2c3e50;
  resize: none;
  outline: none;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    border-color: #4285f4;
    background-color: #fff;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
  }
  
  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
  
  &::-webkit-scrollbar {
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f9fafb;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 6px;
    border: 2px solid #f9fafb;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: #9ca3af;
  }
`;

const Footer = styled.div`
  padding: 24px 32px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #fff;
`;

const FooterButton = styled.button`
  width: 80px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
`;

const CloseButton = styled(FooterButton)`
  background-color: #ffffff;
  color: #2C2E3C;
  border: 1px solid #2C2E3C;

  &:hover {
    background-color: #f8f9fa;
    border-color: #2C2E3C;
  }
`;

const ApplyButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: white;

  &:hover {
    background-color: #1a1c28;
  }
`;
