import React from 'react';
type SimplifiedDeviceType = 'mobile' | 'desktop';
export declare const useDevice: () => SimplifiedDeviceType;
export declare const DeviceProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export {};
