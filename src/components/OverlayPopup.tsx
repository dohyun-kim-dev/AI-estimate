'use client';

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { AppColors } from "@/styles/colors";
import { Breakpoints } from "@/constants/layoutConstants";

// 페이드 인 효과
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ModalOverlay = styled.div<{ $isMobile: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  ${({ $isMobile }) => !$isMobile && `min-width: 1200px;`}
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-out;
  padding: ${({ $isMobile }) => ($isMobile ? '20px' : '0')};
`;

const ModalContent = styled.div<{ $isMobile: boolean }>`
  width: ${({ $isMobile }) => ($isMobile ? '100%' : '900px')};
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${AppColors.border || "#ccc"};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

// Close 버튼만 겹쳐서 표시
const CloseButton = styled.button<{ $isMobile: boolean }>`
  position: absolute;
  top: ${({ $isMobile }) => ($isMobile ? '6px' : '8px')};
  right: ${({ $isMobile }) => ($isMobile ? '6px' : '8px')};
  background: #fff;
  color: #000;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

interface OverlayPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const OverlayPopup: React.FC<OverlayPopupProps> = ({ isOpen, onClose, children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < Breakpoints.mobile);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!isOpen) return null;

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 팝업 외부 닫힘 방지
    onClose();
  };

  return (
    <ModalOverlay $isMobile={isMobile} onClick={onClose}>
      <ModalContent
        $isMobile={isMobile}
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
      >
        <CloseButton $isMobile={isMobile} onClick={handleCloseClick}>
          ✕
        </CloseButton>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};
