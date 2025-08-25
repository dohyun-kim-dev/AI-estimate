'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import LanguageSwitcher from './LanguageSwitcher';
import ResponsiveView from '@/layout/ResponsiveView';
import MenuIcon from '@mui/icons-material/Menu';
import MobileMenuOverlay from './MobileMenuOverlay';
import { Breakpoints } from '@/constants/layoutConstants';
// Animation
const bgGradient = keyframes `
  0% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
`;
// Styled Components
const AppBar = styled.nav `
  position: sticky;
  top: 0;
  left: 0;
  min-width: ${Breakpoints.desktop}px;
  background-color: ${AppColors.background};
  z-index: 1000;
  padding: ${({ padding }) => padding || '0 20px'};
`;
const MobileAppBarWrapper = styled.nav `
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${AppColors.background};
  z-index: 1000;
  padding: 0 20px;
  box-sizing: border-box;
`;
const ContentWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const Logo = styled.img `
  width: ${({ width }) => width || 'auto'};
  height: ${({ height }) => height || '40px'};
  cursor: pointer;
`;
const NavLinks = styled.div `
  display: flex;
  align-items: center;
  gap: 20px;
`;
const NavLink = styled.button `
  ${AppTextStyles.label3};
  background: none;
  border: none;
  color: ${AppColors.onBackground};
  cursor: pointer;

  &:hover {
    color: ${({ hoverColor }) => hoverColor || AppColors.hoverText};
  }
`;
const RightSection = styled.div `
  display: flex;
  align-items: center;
  gap: 20px;
`;
const ContactLink = styled.button `
  ${AppTextStyles.label3};
  padding: 8px 18px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  background: linear-gradient(135deg, #5708fb, #be83ea, #5708fb);
  background-size: 300% 100%;
  animation: ${bgGradient} 3s ease-in-out infinite;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const MobileMenuButton = styled.button `
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${AppColors.onBackground};
`;
// Mobile Component
const MobileAppBar = ({ logoSrc, navLinks, hoverColor, isShowLanguageSwitcher, onNavigate, onContact, onLogoClick, contactText, }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const handleScrollTo = (targetId, content, memo) => {
        if (targetId === 'contact') {
            onContact();
        }
        else {
            onNavigate(targetId, content, memo);
        }
        setMenuOpen(false);
    };
    return (_jsxs(_Fragment, { children: [_jsx(MobileAppBarWrapper, { children: _jsxs(ContentWrapper, { children: [_jsx(Logo, { src: logoSrc, alt: "Logo", width: "84px", height: "32px", onClick: onLogoClick }), _jsxs(RightSection, { children: [isShowLanguageSwitcher && _jsx(LanguageSwitcher, {}), _jsx(MobileMenuButton, { onClick: () => setMenuOpen(true), children: _jsx(MenuIcon, {}) })] })] }) }), menuOpen && (_jsx(MobileMenuOverlay, { navLinks: navLinks, onClose: () => setMenuOpen(false), onNavigate: handleScrollTo }))] }));
};
// Desktop Component
const DesktopAppBar = ({ logoSrc, logoWidth, logoHeight, navLinks, appBarHeight, appBarPadding, hoverColor, isShowLanguageSwitcher, onNavigate, onContact, onLogoClick, contactText, }) => {
    const handleScrollTo = (targetId, content, memo) => {
        onNavigate(targetId, content, memo);
    };
    return (_jsx(AppBar, { height: appBarHeight, padding: appBarPadding, children: _jsxs(ContentWrapper, { children: [_jsx(Logo, { src: logoSrc, alt: "Logo", width: logoWidth, height: logoHeight, onClick: onLogoClick }), _jsxs(RightSection, { children: [_jsx(NavLinks, { children: navLinks.map((link, index) => (_jsx(NavLink, { onClick: () => handleScrollTo(link.targetId, link.content, link.memo), hoverColor: hoverColor, children: link.label }, index))) }), _jsx(ContactLink, { onClick: () => onContact(), children: contactText }), isShowLanguageSwitcher && _jsx(LanguageSwitcher, {})] })] }) }));
};
// Responsive AppBar
const LandingAppBar = (props) => {
    return (_jsx(ResponsiveView, { mobileView: _jsx(MobileAppBar, { ...props }), desktopView: _jsx(DesktopAppBar, { ...props }) }));
};
export default LandingAppBar;
