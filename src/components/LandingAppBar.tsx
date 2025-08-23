'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import LanguageSwitcher from './LanguageSwitcher';
import ResponsiveView from '@/layout/ResponsiveView';
import MenuIcon from '@mui/icons-material/Menu';
import MobileMenuOverlay from './MobileMenuOverlay';
import { Breakpoints } from '@/constants/layoutConstants';

interface LandingAppBarProps {
  logoSrc: string;
  logoWidth?: string;
  logoHeight?: string;
  navLinks: { label: string; targetId: string; content: string; memo: string }[];
  onNavigate: (targetId: string, content: string, memo: string) => void;
  onContact: () => void;
  onLogoClick?: () => void;
  appBarHeight?: string;
  appBarPadding?: string;
  hoverColor?: string;
  isShowLanguageSwitcher?: boolean;
  contactText: string;
}

// Animation
const bgGradient = keyframes`
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
const AppBar = styled.nav<{ height?: string; padding?: string }>`
  position: sticky;
  top: 0;
  left: 0;
  min-width: ${Breakpoints.desktop}px;
  background-color: ${AppColors.background};
  z-index: 1000;
  padding: ${({ padding }) => padding || '0 20px'};
`;

const MobileAppBarWrapper = styled.nav`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${AppColors.background};
  z-index: 1000;
  padding: 0 20px;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.img<{ width?: string; height?: string }>`
  width: ${({ width }) => width || 'auto'};
  height: ${({ height }) => height || '40px'};
  cursor: pointer;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled.button<{ hoverColor?: string }>`
  ${AppTextStyles.label3};
  background: none;
  border: none;
  color: ${AppColors.onBackground};
  cursor: pointer;

  &:hover {
    color: ${({ hoverColor }) => hoverColor || AppColors.hoverText};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ContactLink = styled.button`
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

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${AppColors.onBackground};
`;

// Mobile Component
const MobileAppBar = ({
  logoSrc,
  navLinks,
  hoverColor,
  isShowLanguageSwitcher,
  onNavigate,
  onContact,
  onLogoClick,
  contactText,
}: LandingAppBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScrollTo = (targetId: string, content: string, memo: string) => {
    if (targetId === 'contact') {
      onContact();
    } else {
      onNavigate(targetId, content, memo);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <MobileAppBarWrapper>
        <ContentWrapper>
          <Logo src={logoSrc} alt="Logo" width="84px" height="32px" onClick={onLogoClick} />
          <RightSection>
            {isShowLanguageSwitcher && <LanguageSwitcher />}
            <MobileMenuButton onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </MobileMenuButton>
          </RightSection>
        </ContentWrapper>
      </MobileAppBarWrapper>

      {menuOpen && (
        <MobileMenuOverlay
          navLinks={navLinks}
          onClose={() => setMenuOpen(false)}
          onNavigate={handleScrollTo}
        />
      )}
    </>
  );
};

// Desktop Component
const DesktopAppBar = ({
  logoSrc,
  logoWidth,
  logoHeight,
  navLinks,
  appBarHeight,
  appBarPadding,
  hoverColor,
  isShowLanguageSwitcher,
  onNavigate,
  onContact,
  onLogoClick,
  contactText,
}: LandingAppBarProps) => {
  const handleScrollTo = (targetId: string, content: string, memo: string) => {
    onNavigate(targetId, content, memo);
  };

  return (
    <AppBar height={appBarHeight} padding={appBarPadding}>
      <ContentWrapper>
        <Logo src={logoSrc} alt="Logo" width={logoWidth} height={logoHeight} onClick={onLogoClick} />
        <RightSection>
          <NavLinks>
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                onClick={() => handleScrollTo(link.targetId, link.content, link.memo)}
                hoverColor={hoverColor}
              >
                {link.label}
              </NavLink>
            ))}
          </NavLinks>
          <ContactLink onClick={() => onContact()}>{contactText}</ContactLink>
          {isShowLanguageSwitcher && <LanguageSwitcher />}
        </RightSection>
      </ContentWrapper>
    </AppBar>
  );
};

// Responsive AppBar
const LandingAppBar: React.FC<LandingAppBarProps> = (props) => {
  return (
    <ResponsiveView
      mobileView={<MobileAppBar {...props} />}
      desktopView={<DesktopAppBar {...props} />}
    />
  );
};

export default LandingAppBar;
