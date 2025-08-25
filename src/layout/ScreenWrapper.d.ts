import React from "react";
interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingHorizontal?: string;
}
export default function ScreenWrapper({ children, className, paddingTop, paddingBottom, paddingHorizontal, }: ScreenWrapperProps): import("react/jsx-runtime").JSX.Element;
export {};
