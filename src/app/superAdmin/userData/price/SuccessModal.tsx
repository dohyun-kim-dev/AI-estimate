'use client';

import React from 'react';
import styled from 'styled-components';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  successCount: number;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  border: 1px solid #e5e7eb;
  margin: 0 16px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px 24px 0 24px;
  text-align: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const Content = styled.div`
  padding: 16px 24px 24px 24px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const SuccessTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 36px;
`;

const SuccessDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 36px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $isPrimary?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
  
  ${({ $isPrimary }) => $isPrimary ? `
    background-color: #2C2E3C;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #1a1c24;
    }
  ` : `
    background-color: white;
    color: #2C2E3C;
    border: 1px solid #2C2E3C;
    
    &:hover:not(:disabled) {
      background-color: #f8f9fa;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onSave,
  successCount
}) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Header>
          {/* <Title>업로드 완료</Title> */}
        </Header>
        <Content>
          {/* <SuccessIcon>✅</SuccessIcon> */}
          <SuccessTitle>
            {successCount}건 업로드 성공되었습니다
          </SuccessTitle>
          <SuccessDescription>
            첨부된 엑셀 파일 {successCount}건 항목이<br />
            업로드 성공하였습니다
          </SuccessDescription>
          <ButtonGroup>
            <Button onClick={onClose}>
              닫기
            </Button>
            {onSave && (
              <Button $isPrimary onClick={onSave}>
                저장
              </Button>
            )}
          </ButtonGroup>
        </Content>
      </Dialog>
    </Overlay>
  );
};

export default SuccessModal;
