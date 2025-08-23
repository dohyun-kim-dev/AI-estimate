'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface PortalElementProps {
  children: React.ReactNode;
  container?: HTMLElement; // Optional: 기본은 document.body
}

/**
 * 범용 Portal 컴포넌트
 * - React 컴포넌트 트리 외부로 children을 렌더링할 수 있음
 * - 기본적으로 document.body에 렌더링
 */
const PortalElement: React.FC<PortalElementProps> = ({ children, container }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {children}
    </div>,
    container ?? document.body
  );
};


export default PortalElement;
