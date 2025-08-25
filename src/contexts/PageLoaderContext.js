'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import styled from 'styled-components';
const Overlay = styled.div `
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  color: #fff;
  font-weight: 600;
`;
const Ctx = createContext(null);
export const pageLoaderController = {
    open: () => { },
    close: () => { },
};
export function PageLoaderProvider({ children }) {
    const [visible, setVisible] = useState(false);
    const open = () => setVisible(true);
    const close = () => setVisible(false);
    // controller에 연결
    pageLoaderController.open = open;
    pageLoaderController.close = close;
    return (_jsxs(Ctx.Provider, { value: { open, close }, children: [children, visible && _jsx(Overlay, { children: "Loading..." })] }));
}
export function usePageLoader() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error('usePageLoader must be used within PageLoaderProvider');
    return ctx;
}
