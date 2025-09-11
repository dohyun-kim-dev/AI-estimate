'use client'

import React from 'react'
import styled from 'styled-components'
import { IoClose } from 'react-icons/io5'

interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  width?: number
  height?: string | number
  centerTitle?: boolean
  closeOnOverlayClick?: boolean // overlay 클릭 시 닫힘 여부 (기본값 true)
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`

const Dialog = styled.div<{ $width?: number, $height?: string | number }>`
  width: 100%;
  max-width: ${({ $width }) => ($width ? `${$width}px` : '560px')};
  
  height: ${({ $height }) => ($height ? (typeof $height === 'number' ? `${$height}px` : $height) : 'auto')};
  max-height: 90vh;
  background: #ffffff;
  color: #111827;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  border: 1px solid #e5e7eb;
  margin: 0 16px;
  z-index: 99999;
`

const Header = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  padding: 16px 20px 0 20px;
`

const Title = styled.h3<{ $center?: boolean }>`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  text-align: ${({ $center }) => ($center ? 'center' : 'left')};
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  padding: 0;
`


const Body = styled.div`
  padding: 16px 20px 20px;
`

export default function Modal({ open, title, onClose, children, width, height, centerTitle = false, closeOnOverlayClick = true }: ModalProps) {
  if (!open) return null
  
   const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlayClick) return;
    // 오버레이(배경)만 클릭했을 때만 onClose 실행
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog $width={width} $height={height} onClick={(e) => e.stopPropagation()}>
        <Header>
          <CloseButton aria-label="close" onClick={onClose}>
            {/* <IoClose size={20} /> */}
          </CloseButton>
          {title ? <Title $center={centerTitle}>{title}</Title> : <div />}
          <CloseButton aria-label="close" onClick={onClose}>
            <IoClose size={20} />
          </CloseButton>
        </Header>
        <Body>{children}</Body>
      </Dialog>
    </Overlay>
  );
}
