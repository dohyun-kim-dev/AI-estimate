import React from "react";
interface CustomSidebarHeaderProps {
    isCollapsed: boolean;
    showTime?: boolean;
    iconSrc?: string;
    name?: string;
    iconSize?: number;
}
declare const CustomSidebarHeader: React.FC<CustomSidebarHeaderProps>;
export default CustomSidebarHeader;
