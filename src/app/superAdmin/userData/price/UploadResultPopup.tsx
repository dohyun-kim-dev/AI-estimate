'use client';

import React from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import { AppColors } from '@/styles/colors';

// 팝업 내용 영역 스타일
const PopupContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AlertIcon = styled.div`
  font-size: 32px;
  text-align: center;
  margin-bottom: 8px;
`;

const AlertMessage = styled.div<{ type: 'success' | 'error' | 'warning' }>`
  white-space: pre-line;
  line-height: 1.6;
  font-size: 14px;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'warning': return '#856404';
      default: return '#333';
    }
  }};
  background-color: ${props => {
    switch (props.type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'warning': return '#fff3cd';
      default: return '#f8f9fa';
    }
  }};
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      case 'warning': return '#ffeaa7';
      default: return '#dee2e6';
    }
  }};
`;

// Footer 버튼 스타일
const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
`;

const FooterButton = styled.button`
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
`;

const CancelButton = styled(FooterButton)`
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};

  &:hover {
    background-color: #f8f9fa;
  }
`;

const SaveButton = styled(FooterButton)`
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.primary};

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    border: 1px solid #ccc;
  }
`;

// Props 타입 정의
interface UploadResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void; // 저장 버튼 콜백 추가
  type: 'success' | 'error' | 'warning';
  message: string;
}

const UploadResultPopup: React.FC<UploadResultPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  message
}) => {
  const getTitle = () => {
    switch (type) {
      case 'success': return '성공';
      case 'warning': return '경고';
      case 'error': return '오류';
      default: return '알림';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <CmsPopup 
      title={getTitle()} 
      isOpen={isOpen} 
      onClose={onClose}
      bottomFloating={
        <PopupFooter>
          <CancelButton onClick={onClose}>닫기</CancelButton>
          {onSave && (
            <SaveButton onClick={onSave}>저장</SaveButton>
          )}
        </PopupFooter>
      }
    >
      <PopupContent>
        <AlertIcon>
          {getIcon()}
        </AlertIcon>
        <AlertMessage type={type}>
          {message}
        </AlertMessage>
      </PopupContent>
    </CmsPopup>
  );
};

export default UploadResultPopup;
