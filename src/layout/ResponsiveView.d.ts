import React from 'react';
interface ResponsiveViewProps {
    mobileView?: React.ReactNode;
    tabletView?: React.ReactNode;
    desktopView: React.ReactNode;
}
export default function ResponsiveView({ mobileView, tabletView, desktopView, }: ResponsiveViewProps): import("react/jsx-runtime").JSX.Element;
export {};
