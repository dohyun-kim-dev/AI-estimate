import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@store/themeStore';
import { GlobalStyle } from '@styles/globalStyles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes';
import { lightTheme, darkTheme } from '@styles/theme';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GoogleOAuthProvider } from '@react-oauth/google';
const AppWrapper = styled.div `
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
`;
const ContentWrapper = styled.main `
  flex: 1;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;
function App() {
    const { isDarkMode } = useThemeStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    // SSR/Hydration 문제 방지를 위한 초기 테마 설정
    const theme = mounted ? (isDarkMode ? darkTheme : lightTheme) : lightTheme;
    return (_jsx(GoogleOAuthProvider, { clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID, children: _jsx(BrowserRouter, { children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(GlobalStyle, {}), _jsxs(AppWrapper, { children: [_jsx(ContentWrapper, { children: _jsx(AppRoutes, {}) }), _jsx(ToastContainer, { position: "top-right", autoClose: 3000, newestOnTop: true, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true, theme: "colored" })] })] }) }) }));
}
export default App;
