import React from 'react';
import { MenuItemConfig } from './CustomSidebar';
interface ResponsiveSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    menuItems: MenuItemConfig[];
    footerIcon: React.ReactElement;
    onFooterClick: () => void;
    children: React.ReactNode;
    onMobileSidebarOpenChange?: (isOpen: boolean) => void;
}
declare const ResponsiveSidebar: React.FC<ResponsiveSidebarProps>;
export default ResponsiveSidebar;
