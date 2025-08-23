import React, { useState, useLayoutEffect, useCallback } from "react";
import styled from "styled-components";

interface ScrollAwareWrapperProps {
  children: React.ReactNode;
}

const ScrollAwareWrapper: React.FC<ScrollAwareWrapperProps> = ({ children }) => {
  const [scrollbar, setScrollbar] = useState({ width: 0, height: 0 });

  const updateScrollbar = useCallback(() => {
    requestAnimationFrame(() => {
      const width = window.innerWidth - document.documentElement.clientWidth;
      const height = window.innerHeight - document.documentElement.clientHeight;
      const newWidth = width > 0 ? width : 0;
      const newHeight = height > 0 ? height : 0;

      setScrollbar((prev) => {
        if (prev.width !== newWidth || prev.height !== newHeight) {
          console.log("✅ [ScrollAwareWrapper] scrollbar updated:", newWidth, newHeight);
        }
        return { width: newWidth, height: newHeight };
      });
    });
  }, []);

  useLayoutEffect(() => {
    updateScrollbar(); // 최초
    const observer = new ResizeObserver(updateScrollbar);
    observer.observe(document.body);
    window.addEventListener("resize", updateScrollbar);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollbar);
    };
  }, [updateScrollbar]);

  return (
    <OuterWrapper $scrollbarWidth={scrollbar.width} $scrollbarHeight={scrollbar.height}>
      {children}
    </OuterWrapper>
  );
};

export default ScrollAwareWrapper;

// styled-components
export const OuterWrapper = styled.div<{
  $scrollbarWidth?: number;
  $scrollbarHeight?: number;
}>`
  width: 100vw;
  max-width: ${({ $scrollbarWidth }) =>
    $scrollbarWidth !== undefined ? `calc(100vw - ${$scrollbarWidth}px)` : "100vw"};
  min-height: ${({ $scrollbarHeight }) =>
    $scrollbarHeight !== undefined ? `calc(100vh - ${$scrollbarHeight}px)` : "100vh"};
  background-color: #e3e4ea;
  box-sizing: border-box;
  min-width: 1240px;


  @media (max-width: 768px) {
    min-width: 100%;
  }
`;
