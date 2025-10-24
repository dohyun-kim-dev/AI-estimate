
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
import { HeaderProvider, useHeader } from "@contexts/HeaderContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useModalStore } from "@store/modalStore";
import { SocialLoginModal } from "@components/ai-esti/SocialLoginModal";
import { getCompanyInfo } from "@/lib/api/user/userApi";
import { devLog } from "@/utils/devLogger";

const Main = styled.main` 
  width: 100vw;
  padding: 56px 0 84px;
  min-height: 100vh;
      
`;

interface HeaderFooterProps {
  isCompact?: boolean;
}

const HeaderWrapper = ({ isCompact }: HeaderFooterProps) => {
  const { title } = useHeader();
  return <Header compact={isCompact || false} title={title} />;
};

const FooterWrapper = ({ isCompact }: HeaderFooterProps) => (
  <Footer compact={isCompact || false} />
);

function LayoutContent() {
  const { isLoginModalOpen, closeLoginModal } = useModalStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { setTitle } = useHeader();
  const [compact, setCompact] = useState(false);
  const [chatBotActive, setChatBotActive] = useState<boolean | null>(null);
  const [isCheckingChatBot, setIsCheckingChatBot] = useState(true);
  
  const isProfileEditPage = location.pathname.includes('/settings') && location.search.includes('edit=profile');
  const stepParam = new URLSearchParams(location.search).get('step');
  const showCustomHeader = isProfileEditPage && (stepParam === 'profile' || stepParam === 'phone');

  // 챗봇 활성화 여부 확인
  useEffect(() => {
    const checkChatBotActive = async () => {
      try {
        const response = await getCompanyInfo();
        
        devLog('[Layout] 챗봇 활성화 체크:', response);
        
        if (response && response.statusCode === 200 && response.data) {
          const isActive = response.data.activateChatBot;
          setChatBotActive(isActive !== false);
          
          if (isActive === false) {
            devLog('[Layout] 챗봇이 비활성화되어 있습니다.');
            alert('현재 서비스를 이용할 수 없습니다. 관리자에게 문의해주세요.');
            // 접근 차단 - 빈 페이지로 이동하거나 에러 페이지로 리다이렉트
            navigate('/service-unavailable', { replace: true });
          }
        } else {
          devLog('[Layout] 회사 정보를 불러올 수 없습니다.');
          setChatBotActive(false);
          alert('서비스 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
          navigate('/service-unavailable', { replace: true });
        }
      } catch (error) {
        devLog('[Layout] 챗봇 활성화 체크 에러:', error);
        setChatBotActive(false);
        alert('서비스를 확인하는 중 오류가 발생했습니다.');
        navigate('/service-unavailable', { replace: true });
      } finally {
        setIsCheckingChatBot(false);
      }
    };

    // aiclient 경로에서만 체크
    if (location.pathname.includes('/aiclient/')) {
      checkChatBotActive();
    } else {
      setIsCheckingChatBot(false);
      setChatBotActive(true);
    }
  }, [location.pathname, navigate]);


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setCompact(searchParams.get("embed") === "1");
    
    // 경로에 따른 헤더 제목 설정
    const pathname = location.pathname;
    if (pathname.includes('/setting')) {
      setTitle('설정');
    } else {
      setTitle(undefined);
    }
  }, [location, setTitle]);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const targetUrl = window.location.href;
    const currentDomain = window.location.hostname;

    // 특정 도메인들에서는 알럿을 표시하지 않음
    const exemptDomains = [
      'aigopartners.com',
      'heredotcorp.com',
      'localhost',
      '127.0.0.1'
    ];
    
    const isExemptDomain = exemptDomains.some(domain => 
      currentDomain === domain || currentDomain.endsWith('.' + domain)
    );
    
    if (isExemptDomain) {
      return;
    }

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


  // 챗봇 활성화 체크 중이거나 비활성화 상태면 렌더링 안 함
  if (isCheckingChatBot) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        서비스 확인 중...
      </div>
    );
  }

  if (chatBotActive === false && location.pathname.includes('/aiclient/')) {
    return null; // 비활성화된 경우 아무것도 렌더링하지 않음
  }

  
  return (
    <>
      {!showCustomHeader && <HeaderWrapper isCompact={compact} />}
    <Main style={showCustomHeader ? { paddingTop: 60 } : {}}>
      <Outlet />
    </Main>
    {!showCustomHeader && <FooterWrapper isCompact={compact} />}
    </>
  );
}

export default function RootLayout() {
  const { isDarkMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = mounted ? (isDarkMode ? darkTheme : lightTheme) : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageLoaderProvider>
        <ToastProvider>
          <HeaderProvider>
            <LayoutContent />
          </HeaderProvider>
        </ToastProvider>
      </PageLoaderProvider>
    </ThemeProvider>
  );
}