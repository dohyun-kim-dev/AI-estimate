'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const AdminAuthContext = createContext(null);
let externalLogout = null;
export const AdminAuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const adminId = localStorage.getItem('adminId');
        setIsLoggedIn(!!adminId);
        setReady(true);
        const syncAuthState = () => {
            const currentAdminId = localStorage.getItem('adminId');
            setIsLoggedIn(!!currentAdminId);
        };
        window.addEventListener('storage', syncAuthState);
        return () => {
            window.removeEventListener('storage', syncAuthState);
        };
    }, []);
    const login = (id) => {
        localStorage.setItem('adminId', id);
        setIsLoggedIn(true);
    };
    const logout = () => {
        localStorage.removeItem('adminId');
        setIsLoggedIn(false);
    };
    // 외부에서 사용할 수 있게 등록
    externalLogout = logout;
    return (_jsx(AdminAuthContext.Provider, { value: { isLoggedIn, ready, login, logout }, children: children }));
};
// 외부에서 호출 가능하도록 export
export const triggerAdminLogout = () => {
    if (externalLogout)
        externalLogout();
};
export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context)
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return context;
};
