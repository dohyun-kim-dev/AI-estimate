'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import CloseIcon from '@mui/icons-material/Close';
const OverlayWrapper = styled.div `
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: ${AppColors.background};
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;
const Header = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  height: 64px;
  border-bottom: 1px solid ${AppColors.divider || '#444'};
`;
const LogoImg = styled.img `
  height: 32px;
`;
const CloseButton = styled.button `
  background: none;
  border: none;
  color: ${AppColors.onBackground};
  font-size: 24px;
  cursor: pointer;
`;
const MenuList = styled.div `
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  gap: 24px;
`;
const MenuItem = styled.button `
  ${AppTextStyles.label4};
  background: none;
  border: none;
  color: ${AppColors.onBackground};
  text-align: left;
  padding: 0;
  cursor: pointer;
`;
const MobileMenuOverlay = ({ navLinks, onClose, onNavigate }) => {
    return (_jsxs(OverlayWrapper, { children: [_jsxs(Header, { children: [_jsx(LogoImg, { src: "/assets/logo.svg", alt: "Heredot logo" }), _jsx(CloseButton, { onClick: onClose, children: _jsx(CloseIcon, {}) })] }), _jsx(MenuList, { children: navLinks.map((link, index) => (_jsx(MenuItem, { onClick: () => onNavigate(link.targetId, link.content, link.memo), children: link.label }, index))) })] }));
};
export default MobileMenuOverlay;
