import Modal from '@components/common/Modal';
  
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
import { useAuthStore } from '@store/authStore'
import AdditionalInfoModal from '@components/common/AdditionalInfoModal'
import { EstimateConfirmModal } from './components/ai-esti/EstimateConfirmModal'

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
  const { isLoginModalOpen, closeLoginModal, loginModalPurpose } = useModalStore();
  const { isAdditionalInfoModalOpen, closeAdditionalInfoModal } = useAuthStore();
  const { isEstimateModalOpen, closeEstimateModal } = useAuthStore();
  const { shareModal, shareUrl, closeShareModal } = useModalStore();
  // 공유 링크 복사 핸들러
  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // 무음 처리
    }
    closeShareModal();
  };

  const handleEstimateConfirm = () => {
    closeEstimateModal( );
    // 원하는 동작 수행
  };

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
                  <SocialLoginModal $isOpen={isLoginModalOpen} onClose={closeLoginModal} purpose={loginModalPurpose} />
                  {/* 전역 공유 모달 */}
                  <Modal open={shareModal} title="견적서 공유" onClose={closeShareModal} width={520}>
                    <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>
                      공유받은 사용자는 견적 내용을 확인할 수 있습니다.
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input
                        readOnly
                        value={shareUrl}
                        placeholder="https://aigocorp.com/id..."
                        style={{ flex: 1, height: 44, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#111827', padding: '0 12px' }}
                      />
                      <button
                        style={{ height: 44, padding: '0 14px', borderRadius: 8, background: '#2E2E48', color: 'white', fontSize: 14, fontWeight: 400, lineHeight: '160%', letterSpacing: 0.32 }}
                        onClick={handleCopyShareUrl}
                      >
                        링크복사
                      </button>
                    </div>
                  </Modal>
                  <AdditionalInfoModal
        open={isAdditionalInfoModalOpen}
        onClose={closeAdditionalInfoModal}
      />
       <EstimateConfirmModal
        isOpen={isEstimateModalOpen} // ✅ 스토어 상태와 연결
        onClose={closeEstimateModal} // ✅ 스토어 상태 변경 함수와 연결
        onConfirm={handleEstimateConfirm}
      />
                </ToastProvider>
              </PageLoaderProvider>
          </DeviceProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>

    
  )
}

export default App