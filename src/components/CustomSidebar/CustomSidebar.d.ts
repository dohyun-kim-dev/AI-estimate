import React from 'react';
export interface MenuItemConfig {
    icon: React.ReactElement;
    title: string;
    path: string;
    subMenu?: MenuItemConfig[] | null;
    id: string;
}
interface CustomSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    menuItems: MenuItemConfig[];
    footerIcon: React.ReactElement;
    onFooterClick: () => void;
    children: React.ReactNode;
}
declare const CustomSidebar: React.FC<CustomSidebarProps>;
export default CustomSidebar;
