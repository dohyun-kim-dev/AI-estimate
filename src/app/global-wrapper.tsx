"use client";

import { DeviceProvider } from "@/contexts/DeviceContext";
import { PageLoaderProvider } from "@/contexts/PageLoaderContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { GlobalStyle } from "@/styles/globalStyles";
import { useEffect } from "react";
import ActivationProvider from "@/components/ActivationProvider";
import { ToastContainer } from 'react-toastify';
import { SocialLoginModal } from '@/components/ai-esti/SocialLoginModal';
import { useModalStore } from '@/store/modalStore';
import { useAuthStore } from '@/store/authStore';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AdditionalInfoModal from '@/components/common/AdditionalInfoModal';

import 'react-toastify/dist/ReactToastify.css'; 
// src/app/providers.tsx

/**
 * GlobalWrapper는 애플리케이션 전역에 필요한 컨텍스트와 스타일을 감싸주는 최상위 Provider 컴포넌트입니다.
 * 디바이스 정보, 페이지 로딩 상태, 글로벌 스타일 등을 일괄 적용하는 용도로 사용됩니다.
 *
 * GlobalWrapper is the top-level provider component that wraps the app with global context and styles.
 * It applies device info, page loader state, and global styles across the application.
 */


function ModalContainer() {
  const { isLoginModalOpen, closeLoginModal } = useModalStore();
  const { isAdditionalInfoModalOpen, closeAdditionalInfoModal } = useAuthStore();
  
  return (
    <>
      <SocialLoginModal
        $isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />
      <AdditionalInfoModal
        open={isAdditionalInfoModalOpen}
        onClose={closeAdditionalInfoModal}
      />
    </>
  )
}

export function GlobalWrapper({ children }: { children: React.ReactNode }) {
  // 앱 시작과 동시에 구성품 이미지들을 preload

  return (
    <>
      {/* HTML link preload 추가 */}
      
      <ToastContainer style={{ zIndex: 9999 }} />
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}
      >
      {/* react-activation Provider | Keep components alive */}
      {/* <ActivationProvider> */}
        {/* 페이지 로딩 상태 전역 관리 | Global page loading state */}
        <PageLoaderProvider>
            <DeviceProvider>
              {/* 글로벌 스타일 적용 | Apply global base styles */}
              {/* <GlobalStyle /> */}
              {children}
              <ModalContainer />
            </DeviceProvider>
        </PageLoaderProvider>
      {/* </ActivationProvider> */}
      </GoogleOAuthProvider>

    </>
  );
}
