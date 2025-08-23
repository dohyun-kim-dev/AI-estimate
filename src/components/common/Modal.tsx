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
  centerTitle?: boolean
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

const Dialog = styled.div<{ $width?: number }>`
  width: 100%;
  max-width: ${({ $width }) => ($width ? `${$width}px` : '560px')};
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
  grid-template-columns: 1fr 32px;
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
`

const Body = styled.div`
  padding: 16px 20px 20px;
`

export default function Modal({ open, title, onClose, children, width, centerTitle = false }: ModalProps) {
  if (!open) return null
  return (
    <Overlay onClick={onClose}>
      <Dialog $width={width} onClick={(e) => e.stopPropagation()}>
        <Header>
          {title ? <Title $center={centerTitle}>{title}</Title> : <div />}
          <CloseButton aria-label="close" onClick={onClose}>
            <IoClose size={20} />
          </CloseButton>
        </Header>
        <Body>{children}</Body>
      </Dialog>
    </Overlay>
  )
}
