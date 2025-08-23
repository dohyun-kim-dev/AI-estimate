import styled from "styled-components";
import { ReactNode } from "react";
import { useEffect, useState } from "react";

interface ComponentModalProps {
  header: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  color?: string;
  headerColor?: string;
  bodyColor?: string;
  footerColor?: string;
}

const ModalOverlay = styled.div<{ $scrollX: number }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  min-width: 1200px;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: auto;
  transform: translateX(${({ $scrollX }) => -$scrollX}px);
  pointer-events: none;
`;

const ModalWrapper = styled.div`
  width: 1000px;
  max-height: calc(100vh - 120px);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1;
  /* position: relative; */
`;

const ModalHeader = styled.div<{ $bg: string }>`
  height: 36px;
  background-color: ${({ $bg }) => $bg};
  color: #4eff63;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;

`;

const CloseButton = styled.button`
  color: #4eff63;
  font-size: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
`;

const ModalBody = styled.div<{ $bg: string }>`
  flex: 1;
  overflow-y: auto;
  background-color: ${({ $bg }) => $bg};
  /* overscroll-behavior: contain; */
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModalFooter = styled.div<{ $bg: string }>`
  height: 60px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: ${({ $bg }) => $bg};
  position: sticky;
  bottom: 0;
`;
const ComponentModal = ({
    header,
    body,
    footer,
    onClose,
    color = 'rgba(37, 39, 54, 0.82)',
    headerColor,
    bodyColor,
    footerColor,
  }: ComponentModalProps) => {
    const [scrollX, setScrollX] = useState(0);
  
    useEffect(() => {
      const handleScroll = () => {
        setScrollX(window.scrollX || window.pageXOffset);
      };
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    return (
      <ModalOverlay $scrollX={scrollX} >
        <ModalWrapper onClick={(e) => e.stopPropagation()}>
          <ModalHeader $bg={headerColor || color}>
            {header}
            <CloseButton onClick={onClose}>✕</CloseButton>
          </ModalHeader>
          <ModalBody $bg={bodyColor || color}>{body}</ModalBody>
          <ModalFooter $bg={footerColor || color}>{footer}</ModalFooter>
        </ModalWrapper>
      </ModalOverlay>
    );
  };

export default ComponentModal;