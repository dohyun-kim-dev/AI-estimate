import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
const CustomSidebar = ({ isCollapsed, toggleSidebar, menuItems, footerIcon, onFooterClick, children, }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openMenus, setOpenMenus] = useState({});
    const isActive = (path) => location.pathname === path;
    const handleMenuToggle = (id, path) => {
        setOpenMenus((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
        if (path) {
            navigate(path);
        }
    };
    return (_jsxs(SidebarContainer, { "$isCollapsed": isCollapsed, children: [children, _jsx(ToggleButton, { onClick: toggleSidebar, "$isCollapsed": isCollapsed, "aria-label": isCollapsed ? 'Expand sidebar' : 'Collapse sidebar', children: _jsx(ToggleIconImg, { src: "/icon_burger.png", alt: isCollapsed ? 'Expand' : 'Collapse', width: 16, height: 24, "$rotate": isCollapsed }) }), _jsx(MenuList, { "$isCollapsed": isCollapsed, children: menuItems.map((item) => {
                    const hasSubMenu = !!item.subMenu;
                    const expanded = !!openMenus[item.id];
                    const active = isActive(item.path);
                    return (_jsxs(React.Fragment, { children: [hasSubMenu ? (_jsx(MenuItem, { as: "div", "$isCollapsed": isCollapsed, "$active": active || expanded, onClick: () => handleMenuToggle(item.id, item.path), children: _jsxs(Center, { "$isCollapsed": isCollapsed, children: [_jsx(IconWrapper, { "$isCollapsed": isCollapsed, children: item.icon }), !isCollapsed && (_jsxs(RightContent, { children: [_jsx("span", { children: item.title }), _jsx(ArrowWrapper, { children: expanded ? _jsx(ChevronUp, { size: 16 }) : _jsx(ChevronDown, { size: 16 }) })] }))] }) })) : (_jsx(MenuItem, { as: Link, to: item.path, "$isCollapsed": isCollapsed, "$active": active, children: _jsxs(Center, { "$isCollapsed": isCollapsed, children: [_jsx(IconWrapper, { "$isCollapsed": isCollapsed, children: item.icon }), !isCollapsed && _jsx(RightContent, { children: item.title })] }) })), hasSubMenu && expanded && item.subMenu && (_jsx(SubMenuList, { children: item.subMenu.map((subItem) => (_jsxs(SubMenuItem, { as: Link, to: subItem.path, "$active": isActive(subItem.path), children: [_jsx(IconWrapper, { children: subItem.icon }), subItem.title] }, subItem.id))) }))] }, item.id));
                }) }), _jsxs(FooterSection, { onClick: onFooterClick, "$isCollapsed": isCollapsed, children: [_jsx(IconWrapper, { "$isCollapsed": isCollapsed, children: footerIcon }), !isCollapsed && _jsx(FooterText, { children: "Logout" })] })] }));
};
export default CustomSidebar;
// --- Styled Components ---
const SidebarContainer = styled.div `
  position: fixed;
  left: 0;
  top: 56px;
  width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '250px')};
  height: 100vh;
  overflow: hidden;
  background: #2c2e3c;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
`;
const ToggleButton = styled.button `
  position: absolute;
  top: 50px;
  right: 15px;
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;
const RightContent = styled.div `
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 8px;
  padding-right: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const ToggleIconImg = styled.img `
  display: block;
  transform: ${({ $rotate }) => ($rotate ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
`;
const MenuList = styled.ul `
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  ${({ $isCollapsed }) => $isCollapsed &&
    css `
      display: flex;
      flex-direction: column;
      align-items: center;
    `}
`;
const MenuItem = styled.li `
  height: 60px;
  display: flex;
  justify-content: ${({ $isCollapsed }) => $isCollapsed ? 'center' : 'flex-start'};
  align-items: center;
  color: ${({ $active }) => ($active ? '#fff' : '#8d8e96')};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 1px solid #252736;
  transition: background 0.2s, color 0.2s;
  background-color: ${({ $active }) => ($active ? '#4071ed' : '#2c2e3c')};
  padding-left: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '20px')};
  width: 100%;
  text-decoration: none;
  position: relative;

  &:hover {
    background-color: #3a3f4e;
    color: white;
  }
`;
const Center = styled.div `
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  ${({ $isCollapsed }) => $isCollapsed
    ? css `
          justify-content: center;
        `
    : css `
          justify-content: flex-start;
        `}
`;
const ArrowWrapper = styled.span `
  margin-left: 8px;
  display: flex;
  align-items: center;
`;
const IconWrapper = styled.span `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '15px')};
  flex-shrink: 0;

  & > svg {
    width: 100%;
    height: 100%;
  }
`;
const FooterSection = styled.div `
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => $isCollapsed ? 'center' : 'flex-start'};
  padding: 15px;
  height: 60px;
  color: #8d8e96;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  border-top: 1px solid #444;
  flex-shrink: 0;

  &:hover {
    color: white;
    background-color: #3a3f4e;
  }
`;
const FooterText = styled.span `
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const SubMenuList = styled.ul `
  list-style: none;
  padding: 0;
  margin: 0;
`;
const SubMenuItem = styled.li `
  height: 40px;
  display: flex;
  align-items: center;
  color: ${({ $active }) => ($active ? '#fff' : '#797878')};
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  padding-left: 80px;
  background-color: ${({ $active }) => ($active ? '#3a3f4e' : 'transparent')};

  &:hover {
    background-color: #3a3f4e;
    color: white;
  }
`;
