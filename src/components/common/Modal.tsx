import React from 'react'
import styled from 'styled-components'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  width?: number | string
  children: React.ReactNode
  centerTitle?: boolean
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const Container = styled.div<{ width: number | string }>`
  background-color: ${({ theme }) => theme.body};
  border-radius: 12px;
  padding: 24px;
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width)};
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`

const Header = styled.div<{ centerTitle?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ centerTitle }) => (centerTitle ? 'center' : 'space-between')};
  margin-bottom: 20px;
`

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`

const CloseButton = styled.button`
  position: absolute;
  right: 24px;
  top: 24px;
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  width = 480,
  children,
  centerTitle = false,
}) => {
  if (!open) return null

  return (
    <Overlay isOpen={open} onClick={onClose}>
      <Container
        width={width}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <Header centerTitle={centerTitle}>
            <Title>{title}</Title>
            {!centerTitle && (
              <CloseButton onClick={onClose}>×</CloseButton>
            )}
          </Header>
        )}
        {children}
      </Container>
    </Overlay>
  )
}

export default Modal
