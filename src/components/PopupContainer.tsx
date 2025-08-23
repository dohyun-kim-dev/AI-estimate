'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { createPortal } from 'react-dom';

interface PopupContainerProps {
  open: boolean;
  onClose: () => void;
  padding?: number;
  heightPercent?: number;
  appBarHeight?: number;
  selectedIndex: number;
  isFullScreen?: boolean;
  children: React.ReactNode | React.ReactNode[];
  onChangeIndex?: (newIndex: number) => void;
}

const PopupPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

export const PopupContainer: React.FC<PopupContainerProps> = ({
  open,
  onClose,
  padding = 20,
  heightPercent = 80,
  appBarHeight = 10,
  selectedIndex,
  isFullScreen = false,
  children,
  onChangeIndex,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  const childArray = React.Children.toArray(children);

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 768);
      const visualH = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(visualH);
    };

    updateSize();

    window.addEventListener('resize', updateSize);
    window.visualViewport?.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.visualViewport?.removeEventListener('resize', updateSize);
    };
  }, []);

  const swipeHandlers = useSwipeable(
    isMobile
      ? {
          onSwipedLeft: () =>
            setCurrentIndex((prev) =>
              Math.min(prev + 1, childArray.length - 1)
            ),
          onSwipedRight: () => setCurrentIndex((prev) => Math.max(prev - 1, 0)),
          preventScrollOnSwipe: true,
          trackTouch: true,
          trackMouse: true,
        }
      : {}
  );

  useEffect(() => {
    if (!open) return;

    history.pushState({ popup: true }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (history.state?.popup) {
        history.back();
      }
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (open) setCurrentIndex(selectedIndex);
  }, [open, selectedIndex]);

  if (!open) return null;

  const popupJSX = (
    <Overlay $isFullScreen={isFullScreen} $viewportHeight={viewportHeight}>
      <NavZone $isMobile={isMobile} $position="left">
        <NavButton
          $isFullScreen={isFullScreen}
          onClick={() => {
            const next = Math.max(currentIndex - 1, 0);
            setCurrentIndex(next);
            onChangeIndex?.(next);
          }}
          disabled={currentIndex === 0}
        >
          <ArrowBackIos />
        </NavButton>
      </NavZone>

      <Popup
        $padding={padding}
        $heightPercent={heightPercent}
        $isFullScreen={isFullScreen}
      >
        <CloseButton
          $isFullScreen={isFullScreen}
          $appBarHeight={appBarHeight}
          onClick={onClose}
        >
          ×
        </CloseButton>
        <Content {...swipeHandlers}>{childArray[currentIndex]}</Content>
      </Popup>

      <NavZone $isMobile={isMobile} $position="right">
        <NavButton
          $isFullScreen={isFullScreen}
          onClick={() => {
            const next = Math.min(currentIndex + 1, childArray.length - 1);
            setCurrentIndex(next);
            onChangeIndex?.(next);
          }}
          disabled={currentIndex === childArray.length - 1}
        >
          <ArrowForwardIos />
        </NavButton>
      </NavZone>
    </Overlay>
  );

  return <PopupPortal>{popupJSX}</PopupPortal>;
};

// ==========================
// Styled Components
// ==========================

const Overlay = styled.div<{
  $isFullScreen?: boolean;
  $viewportHeight: number;
}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100dvw;
  height: ${({ $viewportHeight }) => `${$viewportHeight}px`};
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavZone = styled.div<{
  $isMobile?: boolean;
  $position?: 'left' | 'right';
}>`
  width: 200px;
  min-width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ $isMobile, $position }) =>
    $isMobile &&
    `
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${$position}: 0;
    width: 80px;
    min-width: unset;
    height: 70px;
    z-index: 10;
    pointer-events: auto;
  `}
`;

const NavButton = styled.button<{ $isFullScreen?: boolean }>`
  background: none;
  border: none;
  color: ${({ $isFullScreen }) => ($isFullScreen ? '#ccc' : 'white')};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 70px;
  }

  &:disabled {
    color: rgba(255, 255, 255, 0.3);
    cursor: default;
  }
`;

const Popup = styled.div<{
  $padding: number;
  $heightPercent: number;
  $isFullScreen?: boolean;
}>`
  background: #fff;
  padding: 0;
  width: 800px;
  min-width: 800px;
  height: ${({ $isFullScreen, $heightPercent }) =>
    $isFullScreen ? '100%' : `${$heightPercent}vh`};
  position: relative;
  border-radius: ${({ $isFullScreen }) => ($isFullScreen ? '0px' : '8px')};
  overflow: hidden;
  border: 2px solid #ccc;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  ${({ $isFullScreen }) =>
    $isFullScreen &&
    `
      width: 100vw;
      min-width: unset;
      border: none;
    `}
`;

const CloseButton = styled.button<{
  $isFullScreen?: boolean;
  $appBarHeight?: number;
}>`
  position: absolute;
  top: ${({ $isFullScreen, $appBarHeight }) =>
    $isFullScreen ? `${($appBarHeight || 56) + 8}px` : '12px'};
  right: 20px;
  background: transparent;
  border: none;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  z-index: 1001;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    z-index: -1;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  position: relative;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;
