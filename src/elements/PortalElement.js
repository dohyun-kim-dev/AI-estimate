'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
/**
 * 범용 Portal 컴포넌트
 * - React 컴포넌트 트리 외부로 children을 렌더링할 수 있음
 * - 기본적으로 document.body에 렌더링
 */
const PortalElement = ({ children, container }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted)
        return null;
    return createPortal(_jsx("div", { style: { maxWidth: '100vw', overflowX: 'hidden' }, children: children }), container ?? document.body);
};
export default PortalElement;
