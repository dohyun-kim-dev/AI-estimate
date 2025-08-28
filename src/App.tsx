import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { useThemeStore } from '@store/themeStore'
import { GlobalStyle } from '@styles/globalStyles'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppRoutes from './routes'
import { lightTheme, darkTheme } from '@styles/theme'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { DeviceProvider } from '@/contexts/DeviceContext'
import ScrollAwareWrapper from '@/layout/ScrollAwareWrapper'
import ScreenWrapper from '@/layout/ScreenWrapper'
import { ToastProvider } from '@components/common/ToastProvider'
import { PageLoaderProvider } from '@contexts/PageLoaderContext'
import { useModalStore } from '@store/modalStore'
import { SocialLoginModal } from '@components/ai-esti/SocialLoginModal'

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
`

const ContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.body};
  flex: 1;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`

function App() {
  const { isDarkMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  const { isLoginModalOpen, closeLoginModal } = useModalStore();

  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR/Hydration 문제 방지를 위한 초기 테마 설정
  const theme = mounted ? (isDarkMode ? darkTheme : lightTheme) : lightTheme

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DeviceProvider>
            <GlobalStyle />
            <PageLoaderProvider>
                <ToastProvider>
                  
                  <AppWrapper>
                    <ContentWrapper>
                      <AppRoutes />
                    </ContentWrapper>
                    <ToastContainer
                      position="top-right"
                      autoClose={3000}
                      newestOnTop
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="colored"
                    />
                  </AppWrapper>
                  <SocialLoginModal $isOpen={isLoginModalOpen} onClose={closeLoginModal} />

                </ToastProvider>
              </PageLoaderProvider>
          </DeviceProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App