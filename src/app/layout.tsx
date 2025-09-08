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

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const targetUrl = window.location.href;

    if (userAgent.match(/kakaotalk/i)) {
      if (window.confirm('카카오톡 인앱 브라우저에서는 외부 브라우저로 이동해야 합니다. 이동하시겠습니까?')) {
        window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`;
      }
    } else if (userAgent.match(/iphone|ipad|ipod/i)) {
      // if (window.confirm('iOS 기기에서는 Safari로 이동해야 합니다. 이동하시겠습니까?')) {
      //   alert('URL이 복사되었습니다. Safari에서 주소창을 길게 터치한 뒤, "붙여넣기 및 이동"을 선택하세요.');
      //   const textarea = document.createElement('textarea');
      //   textarea.value = targetUrl;
      //   document.body.appendChild(textarea);
      //   textarea.select();
      //   document.execCommand('copy');
      //   document.body.removeChild(textarea);
      //   window.location.href = 'x-web-search://?';
      // }
    }
  }, []);

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
          {/* <SocialLoginModal 
            $isOpen={isLoginModalOpen} 
            onClose={closeLoginModal}
            purpose="limitExceeded"
            onPrimaryButtonClick={() => {}}
            onGoogleLoginSuccess={() => {}}
          /> */}
        </ToastProvider>
      </PageLoaderProvider>
    </ThemeProvider>
  );
}