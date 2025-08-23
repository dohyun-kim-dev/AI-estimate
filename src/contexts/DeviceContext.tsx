'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Breakpoints } from '@/constants/layoutConstants';

type SimplifiedDeviceType = 'mobile' | 'desktop';

const DeviceContext = createContext<SimplifiedDeviceType>('desktop');
export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider = ({ children }: { children: React.ReactNode }) => {
  const [device, setDevice] = useState<SimplifiedDeviceType>('desktop');

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isSmallScreen = window.matchMedia(`(max-width: ${Breakpoints.mobile}px)`).matches;

      console.log("📱 Device Detection Log:");
      console.log("📏 window.innerWidth:", width);
      console.log("🧭 userAgent:", ua);
      console.log("📐 matchMedia:", isSmallScreen);

      if (isSmallScreen) {
        console.log("✅ Set device: mobile");
        setDevice('mobile');
      } else {
        console.log("✅ Set device: desktop");
        setDevice('desktop');
      }
    };

    detectDevice(); // 초기 체크
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>;
};
