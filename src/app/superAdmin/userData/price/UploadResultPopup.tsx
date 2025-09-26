'use client';

import React from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import SuccessModal from './SuccessModal';
import { AppColors } from '@/styles/colors';

// 팝업 내용 영역 스타일
const PopupContent = styled.div`
  // padding: 20px;
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
  height: 200px;
  color: #000;
  background-color: ${props => {
    switch (props.type) {
      case 'success': return '#F2F2F2';
      case 'error': return '#F2F2F2';
      case 'warning': return '#F2F2F2';
      default: return '#f8f9fa';
    }
  }};
  //세로 스크롤 되게
  overflow-y: auto;
  padding: 16px;
  border-radius: 8px;
  /* 커스텀 스크롤바: 윈도우/맥 모두 밝은 회색 */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f2f2f2;
  &::-webkit-scrollbar {
    width: 8px;
    background: #f2f2f2;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #bdbdbd;
  }
  &::-webkit-scrollbar-track {
    background: #f2f2f2;
    border-radius: 4px;
  }
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
  background-color: #2C2E3C;
  color: #ffffff;
  border: 1px solid #2C2E3C;
  width: 100%;
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: #ffffff;
  border: 1px solid #2C2E3C;
  width: 100%;
  &:hover {
    background-color: #1a1c24;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    border: 1px solid #ccc;
  }
`;

// 카운트 표시 스타일
const CountDisplay = styled.div`
  // text-align: center;
`;

const CountTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const CountDetails = styled.div`
  font-size: 14px;
  color: #666;
`;

// Props 타입 정의
interface UploadResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void; // 저장 버튼 콜백 추가
  type: 'success' | 'error' | 'warning';
  message: string;
}

// 메시지에서 성공/실패 건수 추출하는 함수
const extractCounts = (message: string) => {
  const successMatch = message.match(/성공:\s*(\d+)행/);
  const failMatch = message.match(/실패:\s*(\d+)행/);
  const totalMatch = message.match(/전체\s*(\d+)행/);
  
  return {
    total: totalMatch ? parseInt(totalMatch[1]) : 0,
    success: successMatch ? parseInt(successMatch[1]) : 0,
    fail: failMatch ? parseInt(failMatch[1]) : 0
  };
};

const UploadResultPopup: React.FC<UploadResultPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  message
}) => {
  const getTitle = () => {
    switch (type) {
      case 'success': return '업로드 완료';
      case 'warning': return '업로드 완료';
      case 'error': return '업로드 실패';
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

  // 메시지에서 카운트 정보와 세부 내용 분리
  const counts = extractCounts(message);
  const detailMessage = message.includes('업로드 중 아래 항목에서 오류가 발생했습니다.')
    ? message.split('업로드 중 아래 항목에서 오류가 발생했습니다.')[1]?.trim() || ''
    : '';
    
  const showDetailMessage = type === 'warning' && detailMessage;

  // 성공 메시지인지 확인 (실패 건수가 0이고 성공 건수가 있는 경우)
  const isAllSuccess = counts.total > 0 && counts.fail === 0;

  // 모든 업로드가 성공한 경우 새로운 SuccessModal 사용
  if (isAllSuccess) {
    return (
      <SuccessModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
        successCount={counts.success}
      />
    );
  }

  // 실패가 1건 이상 있으면 닫기 버튼만 노출
  const showOnlyCloseButton = counts.fail > 0;

  return (
    <CmsPopup
      title={getTitle()}
      isOpen={isOpen}
      onClose={onClose}
      backgroundColor='#fff'
      hideHeader
      height='360px'
      contentPadding="24px"
    >
      <PopupContent>
        <CountDisplay>
          <CountTitle>
            {counts.total > 0 ? `${counts.success}건 업로드, ${counts.fail}건 실패` : getIcon()}
          </CountTitle>
        </CountDisplay>
        {showDetailMessage && (
          <AlertMessage type={type}>
            업로드 중 아래 항목에서 오류가 발생했습니다.
            {detailMessage && `\n\n${detailMessage}`}
          </AlertMessage>
        )}
        {!showDetailMessage && counts.total === 0 && (
          <AlertMessage type={type}>
            {message}
          </AlertMessage>
        )}
        <PopupFooter>
          <CancelButton onClick={onClose}>닫기</CancelButton>
          {/* 실패가 없을 때만 저장 버튼 노출 */}
          {!showOnlyCloseButton && onSave && type === 'warning' && (
            <SaveButton onClick={onSave}>저장</SaveButton>
          )}
        </PopupFooter>
      </PopupContent>
    </CmsPopup>
  );
};

export default UploadResultPopup;
