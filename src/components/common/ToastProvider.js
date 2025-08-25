'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { IoClose, IoCheckmarkCircle, IoAlertCircle, IoInformationCircle } from 'react-icons/io5';
const ToastContext = createContext(null);
const slideDown = keyframes `
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;
const deplete = keyframes `
  from { width: 100%; }
  to { width: 0%; }
`;
const Container = styled.div `
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
`;
const Progress = styled.div `
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${({ $type }) => ($type === 'success' ? '#6565FC' : $type === 'error' ? '#F03E3E' : '#3391FF')};
  animation: ${deplete} ${({ $duration }) => $duration}ms linear;
  transform-origin: left;
`;
const Card = styled.div `
  color: ${({ $type }) => ($type === 'success' ? '#6565FC' : $type === 'error' ? '#F03E3E' : '#3391FF')};
  background: #FFFFFF;
  border-radius: 8px;
  pointer-events: all;
  animation: ${slideDown} 0.16s ease both;
  overflow: hidden;
  min-width: 280px;
  max-width: min(360px, calc(100vw - 24px));
  padding: 16px 20px;
  position: relative;
`;
const Row = styled.div `
  display: flex;
  align-items: center;
  gap: 12px;
`;
const IconBox = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $type }) => ($type === 'success' ? '#6565FC' : $type === 'error' ? '#F03E3E' : '#3391FF')};
`;
const Message = styled.div `
  font-size: 14px;
  line-height: 1.45;
  color: #000;
  font-weight: 500;
  flex: 1;
`;
const CloseButton = styled.button `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #FFFFFF;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;
const TYPE_ICON = {
    success: IoCheckmarkCircle,
    error: IoAlertCircle,
    info: IoInformationCircle,
};
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const show = useCallback((message, type = 'info', durationMs = 2500) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration: durationMs }]);
        window.setTimeout(() => remove(id), durationMs);
    }, [remove]);
    const ctx = useMemo(() => ({
        show,
        success: (m, d) => show(m, 'success', d),
        error: (m, d) => show(m, 'error', d),
        info: (m, d) => show(m, 'info', d),
    }), [show]);
    return (_jsxs(ToastContext.Provider, { value: ctx, children: [children, _jsx(Container, { children: toasts.map((t) => {
                    const Icon = TYPE_ICON[t.type];
                    return (_jsxs(Card, { "$type": t.type, children: [_jsxs(Row, { children: [_jsx(IconBox, { "$type": t.type, children: _jsx(Icon, { size: 24 }) }), _jsx(Message, { children: t.message }), _jsx(CloseButton, { "aria-label": "close", onClick: () => remove(t.id), children: _jsx(IoClose, { size: 20 }) })] }), _jsx(Progress, { "$type": t.type, "$duration": t.duration })] }, t.id));
                }) })] }));
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
