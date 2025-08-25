'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { Breakpoints } from '@/constants/layoutConstants';
const DeviceContext = createContext('desktop');
export const useDevice = () => useContext(DeviceContext);
export const DeviceProvider = ({ children }) => {
    const [device, setDevice] = useState('desktop');
    useEffect(() => {
        const detectDevice = () => {
            const width = window.innerWidth;
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const isSmallScreen = window.matchMedia(`(max-width: ${Breakpoints.mobile}px)`).matches;
            console.log("📱 Device Detection Log:");
            console.log("📏 window.innerWidth:", width);
            console.log("🧭 userAgent:", ua);
            console.log("📐 matchMedia:", isSmallScreen);
            if (isSmallScreen) {
                console.log("✅ Set device: mobile");
                setDevice('mobile');
            }
            else {
                console.log("✅ Set device: desktop");
                setDevice('desktop');
            }
        };
        detectDevice(); // 초기 체크
        window.addEventListener('resize', detectDevice);
        return () => window.removeEventListener('resize', detectDevice);
    }, []);
    return _jsx(DeviceContext.Provider, { value: device, children: children });
};
