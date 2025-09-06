// src/app/ai-estimate/components/DetailModal.tsx
"use client";

import React from 'react';
import styled from 'styled-components';
import { EstimateItem } from '@/app/ai-estimate/types/estimateItem';
import { IoCloseCircle } from 'react-icons/io5';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.detailSurface1};
  text-align: center;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  color: ${({ theme }) => theme.text};
  position: relative;
`;

const CloseButtonTop = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${({ theme }) => theme.subtleText};
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.text};
    transform: scale(1.1);
  }
`;

const ModalHeader = styled.h2`
  font-size: 1.5em;
  margin: 0 0 10px 0;
  color: ${({ theme }) => theme.accent};
`;

const ModalPrice = styled.p`
  font-size: 1.2em;
  font-weight: bold;
  color: ${({ theme }) => theme.detailSubtleText};
`;

const FormContainer = styled.div`
  width: 100%;
  text-align: left;
  margin-top: 20px;
`;

const Label = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.detailSubtleText};
`;

const DescriptionBox = styled.div`
  background-color: ${({ theme }) => theme.detailModalBg};
  color: ${({ theme }) => theme.text};
  padding: 16px;
  border-radius: 4px;
  height: 131px;
  overflow-y: auto;
  position: relative;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  text-align: left;
  margin-bottom: 20px;
  
  // 스크롤바 스타일링 (웹킷 기반 브라우저)
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  // 하단 블러 효과
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20%;
    background: linear-gradient(to top, ${({ theme }) => theme.detailModalBg}, transparent);
    pointer-events: none;
  }
`;

const CloseButtonBottom = styled.button`
  width: 100%;
  background-color: ${({ theme }) => theme.detailButton}; // #668EC0에 가까운 색상
  color: white;
  border: none;
  padding: 12px 24px;
  margin-top: 20px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #668EC0;
  }
`;

interface DetailModalProps {
  item: EstimateItem;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButtonTop onClick={onClose}>
          {/* <IoCloseCircle size={30} /> */}
        </CloseButtonTop>
        <ModalHeader>{item.task}</ModalHeader>
        <ModalPrice>₩ {item.cost.toLocaleString()}</ModalPrice>
        <FormContainer>
          <Label>상세 설명</Label>
          <DescriptionBox>{item.description}</DescriptionBox>
        </FormContainer>
        <CloseButtonBottom onClick={onClose}>
          닫기
        </CloseButtonBottom>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DetailModal;