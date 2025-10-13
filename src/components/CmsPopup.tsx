'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';

// 모바일 디바이스 감지 함수
const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

type CmsPopupProps = {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  isWide?: boolean;
  showRequiredMark?: boolean;
  requiredText?: string; // ✅ 필수 항목 텍스트 커스터마이징
  bottomFloating?: React.ReactNode;
  height?: string | null; // ✅ 팝업 높이 지정
  backgroundColor?: string; // ✅ 팝업 배경 색상 지정
  hideHeader?: boolean; // ✅ 헤더 숨김 여부
  contentPadding?: string | { top?: string; right?: string; bottom?: string; left?: string }; // ✅ 콘텐츠 패딩 설정
};



const Overlay = styled.div<{ $scrollX: number }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  min-width: 1450px;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  overflow-x: auto;
  overflow-y: auto;
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(${({ $scrollX }) => -$scrollX}px);

  @media (max-width: 768px) {
    min-width: 100vw;
    padding: 0;
    align-items: center;
    overflow-x: hidden;
    transform: none;
  }
`;

const PopupContainer = styled.div<{
  $isWide?: boolean;
  $hasBottomFloating?: boolean;
  $customHeight?: string | null;
  $backgroundColor?: string;
}>`
  position: relative;
  width: ${({ $isWide }) => ($isWide ? '1200px' : '800px')};
  min-width: ${({ $isWide }) => ($isWide ? '1200px' : '800px')};
  height: ${({ $customHeight }) => $customHeight ?? '94vh'};
  // max-height: 85vh;
  background: ${({ $backgroundColor }) => $backgroundColor ?? '#2c2e3c'}; // ✅ 배경색
  border-radius: 4px;
  padding-bottom: ${({ $hasBottomFloating }) => ($hasBottomFloating ? '100px' : '0')};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 90vw !important;
    min-width: 90vw !important;
    height: auto !important;
    max-height: 80vh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    padding-bottom: ${({ $hasBottomFloating }) => ($hasBottomFloating ? '80px' : '0')};
  }
`;



const HeaderRow = styled.div<{ $backgroundColor?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  background-color: #2C2E3C;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 16px;
  }
`;

const RequiredMark = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #A8ABC3;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    padding: 4px;
    margin-left: 8px;
  }
`;

const PopupContent = styled.div<{ $contentPadding?: string | { top?: string; right?: string; bottom?: string; left?: string } }>`
  flex: 1;
  overflow-y: auto;
  padding: ${({ $contentPadding }) => {
    if (!$contentPadding) return '20px 38px';
    if (typeof $contentPadding === 'string') return $contentPadding;
    const { top = '20px', right = '38px', bottom = '20px', left = '38px' } = $contentPadding;
    return `${top} ${right} ${bottom} ${left}`;
  }};
  min-height: 0; /* Flexbox에서 올바른 스크롤을 위해 필요 */

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: ${({ $contentPadding }) => {
      if (!$contentPadding) return '12px';
      if (typeof $contentPadding === 'string') return $contentPadding;
      const { top = '12px', right = '12px', bottom = '0', left = '12px' } = $contentPadding;
      return `${top} ${right} ${bottom} ${left}`;
    }};
  }
`;

const BottomFloatingWrapper = styled.div<{ $backgroundColor?: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 20;
  background: ${({ $backgroundColor }) => $backgroundColor ?? '#2c2e3c'};
  /* background-color: white; */
  padding: 16px 24px;
  /* border-top: 1px solid ${AppColors.border}; */
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 6px;
  }
`;

const CmsPopup: React.FC<CmsPopupProps> = ({
  title,
  children,
  isOpen,
  onClose,
  isWide,
  showRequiredMark = false,
  requiredText = '필수 항목 *', // ✅ 기본값으로 기존 텍스트 사용
  bottomFloating,
  height,
  backgroundColor,
  hideHeader = false, // ✅ 기본값으로 헤더 표시
  contentPadding, // ✅ 콘텐츠 패딩 설정
}) => {
  const [scrollX, setScrollX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 모바일에서 배경 스크롤 방지
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
    }

    return () => {
      if (isMobile) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile) {
        setScrollX(window.scrollX || window.pageXOffset);
      }
    };
    handleScroll();
    
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile]);

  // ESC 키로 팝업 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // 오버레이 클릭으로 팝업 닫기 (헤더가 없을 때만)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (hideHeader && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay $scrollX={scrollX} onClick={handleOverlayClick}>
      <PopupContainer
  $isWide={isWide || isMobile}
  $hasBottomFloating={!!bottomFloating}
  $customHeight={height ?? null}
  $backgroundColor={backgroundColor}
>

        {!hideHeader && (
          <HeaderRow $backgroundColor={backgroundColor}>
            <span>{title}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {showRequiredMark && <RequiredMark>{requiredText}</RequiredMark>}
              <CloseButton onClick={onClose}>×</CloseButton>
            </div>
          </HeaderRow>
        )}
        <PopupContent $contentPadding={contentPadding}>{children}</PopupContent>
        {bottomFloating && (
          <BottomFloatingWrapper $backgroundColor={backgroundColor}>{bottomFloating}</BottomFloatingWrapper>
        )}
      </PopupContainer>
    </Overlay>
  );
};

export default CmsPopup;
