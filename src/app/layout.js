import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
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
const Main = styled.main `
  width: 100vw;
  ${({ $hideDefault }) => $hideDefault
    ? `
      min-height: 100vh;
      `
    : `
      padding: 76px 0 84px;
      min-height: 100vh;
      `}
`;
const HeaderWrapper = ({ isCompact }) => (_jsx(Header, { compact: isCompact || false }));
const FooterWrapper = ({ isCompact }) => (_jsx(Footer, { compact: isCompact || false }));
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
    // 특정 경로에서는 기본 헤더/푸터를 숨김
    const hideDefaultLayout = location.pathname.startsWith("/cms") ||
        location.pathname.startsWith("/ai") ||
        location.pathname.startsWith("/ai-estimate");
    return (_jsxs(ThemeProvider, { theme: theme, children: [_jsx(GlobalStyle, {}), _jsx(PageLoaderProvider, { children: _jsxs(ToastProvider, { children: [!hideDefaultLayout && _jsx(HeaderWrapper, { isCompact: compact }), _jsx(Main, { "$hideDefault": hideDefaultLayout, children: _jsx(Outlet, {}) }), !hideDefaultLayout && _jsx(FooterWrapper, { isCompact: compact }), _jsx(SocialLoginModal, { "$isOpen": isLoginModalOpen, onClose: closeLoginModal })] }) })] }));
}
