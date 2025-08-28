import React, { useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { useThemeStore } from "@store/themeStore";
import { lightTheme, darkTheme } from "@styles/theme";
import { GlobalStyle } from "@styles/globalStyles";
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import styled from "styled-components";
import { ToastProvider } from "@components/common/ToastProvider";
import { PageLoaderProvider } from "@contexts/PageLoaderContext";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useModalStore } from "@store/modalStore";
import { SocialLoginModal } from "@components/ai-esti/SocialLoginModal";

const Main = styled.main` 
  width: 100vw;
  padding: 56px 0 84px;
  min-height: 100vh;
      
`;

interface HeaderFooterProps {
  isCompact?: boolean;
}

const HeaderWrapper = ({ isCompact }: HeaderFooterProps) => (
  <Header compact={isCompact || false} />
);

const FooterWrapper = ({ isCompact }: HeaderFooterProps) => (
  <Footer compact={isCompact || false} />
);

export default function RootLayout() {
  const { isDarkMode } = useThemeStore();
  const { isLoginModalOpen, closeLoginModal } = useModalStore();
  const location = useLocation();
  const [compact, setCompact] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const searchParams = new URLSearchParams(location.search);
    setCompact(searchParams.get("embed") === "1");
  }, [location]);

  const theme = mounted ? (isDarkMode ? darkTheme : lightTheme) : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageLoaderProvider>
        <ToastProvider>
         <HeaderWrapper isCompact={compact} />
          <Main >
            <Outlet />
          </Main>
          <FooterWrapper isCompact={compact} />
          <SocialLoginModal $isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        </ToastProvider>
      </PageLoaderProvider>
    </ThemeProvider>
  );
}