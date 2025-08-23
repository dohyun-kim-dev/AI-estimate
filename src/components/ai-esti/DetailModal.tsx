// src/app/ai-estimate/components/DetailModal.tsx
"use client";

import React from 'react';
import styled from 'styled-components';
import { EstimateItem } from '@/app/ai-estimate/types/estimateItem';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  color: ${({ theme }) => theme.text};
`;

const ModalHeader = styled.h2`
  font-size: 1.5em;
  margin: 0 0 10px 0;
  color: ${({ theme }) => theme.accent};
`;

const ModalPrice = styled.p`
  font-size: 1.2em;
  font-weight: bold;
  margin: 0 0 20px 0;
`;

const ModalDescription = styled.p`
  font-size: 1em;
  line-height: 1.6;
  color: ${({ theme }) => theme.subtleText};
`;

interface DetailModalProps {
  item: EstimateItem;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>{item.name}</ModalHeader>
        <ModalPrice>₩ {item.price}</ModalPrice>
        <ModalDescription>{item.description}</ModalDescription>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DetailModal;
