import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Icon from '@components/ai-esti/Icon';
import { useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { useThemeStore } from '@store/themeStore';
import { useChatStore } from '@store/chatStore';
import { useToast } from '@components/common/ToastProvider';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import { useModalStore } from '@store/modalStore';
import { SocialLoginModal } from '../../components/ai-esti/SocialLoginModal';
import { HeaderProvider } from '@/contexts/HeaderContext';
import { tr } from 'date-fns/locale';
import useAI from '@/hooks/useAI';
import { devLog } from '../../utils/devLogger';

const LayoutWrapper = styled.div`
  min-height: 100dvh;
  width: 100vw;
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
  background-color: ${({ theme }) => theme.body};
`;

const TopNav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.body};
  // border-bottom: 1px solid ${({ theme }) => theme.border};
  z-index: 100;

  .left-icons, .right-icons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    border-radius: 8px;

    &:hover {
      background-color: ${({ theme }) => `${theme.body}`};
    }
  }
`;

const NavTitle = styled.h1`
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;

const ThemeToggleButton = styled.button`
  position: fixed;
  bottom: 120px;
  right: 20px;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-weight: bold;
  z-index: 1000;
  
  &:hover {
    opacity: 0.8;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 133%;
  right: -16px;
  width: 150px;
  background-color: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 0px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  border-radius: 0px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.border};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const ProfileIconWrapper = styled.div`
  position: relative;
`;


const Main = styled.main` 
  width: 100vw;
  padding: 60px 0 80px;
  min-height: auto;
  
`;

const ShareInput = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;

  input {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
    padding: 0 12px;
  }

  button {
    height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    background: #2E2E48;
    color: white;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 160%;
    letter-spacing: 0.32px;
  }
`;


const ProfileImage = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.surface1};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export default function AILayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyCode } = useParams();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { success, error } = useToast();
  const resetChat = useChatStore((s) => s.clear);
  const chatSessionId = useChatStore((s) => s.chatSessionId);
  const getChatSessionId = useChatStore((s) => s.getChatSessionId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const {
    isLoginModalOpen,
    loginModalPurpose,
    closeLoginModal,
    openLoginModal,
    shareChatModal,
    closeShareChatModal,
    openShareChatModal,
  } = useModalStore();
  const { startChatWithHistory, startNewChat } = useAI();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      useThemeStore.setState({ isDarkMode: storedTheme === 'dark' });
    }
  }, []);

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
      //   // alert('URL이 복사되었습니다. Safari에서 주소창을 길게 터치한 뒤, "붙여넣기 및 이동"을 선택하세요.');
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

  const isLightTheme = !isDarkMode;
  const icons = {
    back: '/ai-estimate/arrow_back.png',
    share: isLightTheme ? '/ai-estimate/share.png' : '/ai-estimate/share_dark.png',
    new: isLightTheme ? '/ai-estimate/new.png' : '/ai-estimate/new_dark.png',
    estimate: isLightTheme ? '/ai-estimate/esti.png' : '/ai-estimate/esti_dark.png',
    profile: isLightTheme ? '/ai-estimate/profile.png' : '/ai-estimate/profile_dark.png',
    setting: isLightTheme ? '/ai-estimate/setting.png' : '/ai-estimate/setting_dark.png',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const pageTitle = location.pathname.includes('/ai/my-estimate') ? '내 견적서' : location.pathname.includes('/ai/setting') ? '설정' : null;

  // 동적 페이지 제목 생성
  const getDynamicPageTitle = () => {
    if (location.pathname.includes('/ai/my-estimate')) {
      return '내 견적서';
    }
    
    if (location.pathname.includes('/ai/setting')) {
      const urlParams = new URLSearchParams(location.search);
      const isProfileEdit = urlParams.get('edit') === 'profile';
      const currentStep = urlParams.get('step') || 'profile';
      
      if (isProfileEdit) {
        return currentStep === 'phone' ? '전화번호 변경' : '회원정보 수정';
      }
      
      return '설정';
    }
    
    return null;
  };

  const dynamicPageTitle = getDynamicPageTitle();

  // 스마트 뒤로가기 핸들러
  const handleBack = () => {
    const urlParams = new URLSearchParams(location.search);
    const isProfileEdit = urlParams.get('edit') === 'profile';
    const currentStep = urlParams.get('step') || 'profile';
     
    // 프로필 수정 페이지에서의 뒤로가기 처리
    if (location.pathname.includes('/ai/setting') && isProfileEdit) {
      if (currentStep === 'phone') {
        // 전화번호 변경 단계에서는 프로필로 돌아가기
        const newParams = new URLSearchParams();
        newParams.set('edit', 'profile');
        newParams.set('step', 'profile');
        navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
      } else {
        // 프로필 편집에서는 설정 메인으로 돌아가기 (히스토리 교체)
        navigate(location.pathname, { replace: true });
      }
    } else if (location.pathname.includes('/ai/setting') || location.pathname.includes('/ai/my-estimate')) {
      // 설정 메인에서는 AI 홈으로 돌아가기
      navigate(`/aiclient/${companyCode}/ai`);
    } else if (isMobile) {
      navigate(`/aiclient/${companyCode}/ai`, { replace: true });
      return;
    } else {
      // 일반적인 뒤로가기
      navigate(-1);
    }
  };


  // 비회원 견적서 업로드 함수
  const uploadEstimateForGuestShare = async () => {
    devLog('[uploadEstimateForGuestShare] 비회원 견적서 업로드 시작');
    
    // 비회원이고 URL에 share가 없을 때만 실행
    const isGuest = !isAuthenticated();
    const hasShareInUrl = window.location.href.includes('share');
    
    if (isGuest && !hasShareInUrl) {
      try {
        // 게스트 정보 가져오기
        const guestInfoStr = sessionStorage.getItem('guestinfo');
        if (!guestInfoStr) {
          devLog('guestinfo 없음, 업로드 건너뛰기');
          return;
        }
        
        const guestInfo = JSON.parse(guestInfoStr);
        
        // ✅ Zustand 상태에서 메시지 데이터 가져오기
        const messages = useChatStore.getState().messages;
        if (!messages || messages.length === 0) {
          devLog('채팅 데이터 없음, 업로드 건너뛰기');
          return;
        }
        
        // 맨 아래부터 content에서 uuid를 추출해서 estimateId로 사용
        let estimateId = null;
        for (let i = messages.length - 1; i >= 0; i--) {
          const message = messages[i];
          if (message.content && typeof message.content === 'string') {
            try {
              // 1. script 태그에서 JSON 추출
              const scriptMatch = message.content.match(/<script[^>]*id="invoiceData"[^>]*>(.*?)<\/script>/s);
              if (scriptMatch) {
                const jsonStr = scriptMatch[1].trim();
                const invoiceData = JSON.parse(jsonStr);
                if (invoiceData.uuid) {
                  estimateId = invoiceData.uuid;
                  break;
                }
              }
              
              // 2. 마크다운 코드 블록에서 JSON 추출
              const markdownMatch = message.content.match(/```json\s*\n([\s\S]*?)\n```/);
              if (markdownMatch) {
                const jsonStr = markdownMatch[1].trim();
                const invoiceData = JSON.parse(jsonStr);
                if (invoiceData.uuid) {
                  estimateId = invoiceData.uuid;
                  break;
                }
              }
              
              // 3. JSON 형태인지 먼저 확인 후 파싱 시도
              const trimmedContent = message.content.trim();
              
              // JSON 형태일 가능성이 높은 패턴만 체크 (객체나 배열로 시작/끝)
              if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
                  (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
                
                try {
                  const invoiceData = JSON.parse(trimmedContent);
                  if (invoiceData.uuid) {
                    estimateId = invoiceData.uuid;
                    break;
                  }
                } catch (jsonErr) {
                  // JSON 파싱 실패는 정상적인 경우 (일반 텍스트)이므로 에러 로그 없이 넘어감
                  devLog("Raw JSON parsing failed - likely normal text content");
                }
              }
            } catch (error) {
              devLog('JSON 파싱 실패:', error);
              continue;
            }
          }
        }
        
        if (!estimateId) {
          devLog('estimateId 없음, 업로드 건너뛰기');
          return;
        }
        
        // 게스트 UUID 보장
        let guestUuid = localStorage.getItem('guest-uuid');
        if (!guestUuid) {
          guestUuid = crypto.randomUUID();
          localStorage.setItem('guest-uuid', guestUuid);
        }
        
        // 채팅 세션 ID 가져오기
        const chatSessionId = await getChatSessionId();
        
        if (chatSessionId && estimateId) {
          // uploadEstimatePdf를 동적으로 임포트
          const { uploadEstimatePdf } = await import('@/lib/api/user/userApi');
          
          await uploadEstimatePdf(
            chatSessionId,
            undefined, // title
            guestUuid,
            undefined, // data
            estimateId,
            {
              id: guestUuid,
              name: guestInfo.name || '',
              email: guestInfo.email || '',
              cellphone: guestInfo.cellphone || ''
            },
            undefined // amount - 여기서는 견적서 데이터에 접근할 수 없으므로 undefined
          );

          devLog('✅ 비회원 채팅 공유 시 견적서 업로드 완료');
        } else {
          devLog('❌ 필수 데이터 누락:', { chatSessionId, estimateId });
        }
      } catch (error) {
        devLog('❌ 견적서 업로드 실패:', error);
      }
    }
  };

  // '공유' 버튼을 눌렀을 때 실행될 함수 (AILayout에서 호출됨)
  const handleOpenShare = async () => {
    // ✅ Zustand 상태에서 메시지 가져오기
    const messages = useChatStore.getState().messages;
    
    if (messages && messages.length >= 2) {
      if (!isAuthenticated()) {
        // 비회원인 경우 견적서 업로드 시도
        await uploadEstimateForGuestShare();
        openLoginModal('shareChat');
        return;
      }
      openShareChatModal();
    } else {
      error('공유할 대화내역이 없습니다');
    }
  };

  const handleCloseShare = () => {
    closeShareChatModal();
  }

  // '가입없이 이용하기' 버튼 클릭 시 실행될 함수
  const handleNonMemberAction = () => {
    // 여기에 비회원 상태에서 실행할 로직을 추가합니다.
    devLog("가입없이 이용하기 버튼 클릭! 비회원 로직 실행...");
    success('비회원 상태로 기능이 활성화되었습니다.');
    closeLoginModal(); // 모달 닫기
  };

  // ✅ 구글 로그인 성공 후 실행될 함수.
  // 이 함수는 로그인 모달이 닫히고, 'shareChat' 모달을 열도록 합니다.
  const handleGoogleLoginSuccess = async (userData) => {
    devLog("구글 로그인 성공!", userData);
    success('로그인되었습니다!'); // 사용자에게 즉시 피드백을 주기 위해 delay 전에 호출
    
    // 1초(1000ms) 지연
    await new Promise(resolve => setTimeout(resolve, 1000));

    closeLoginModal(); // 로그인 모달 닫기
    openShareChatModal();
  }

  const handleCopy = async () => {
    const fullShareText = getFullShareText();
    
    try {
      // shareText가 비어있는지 확인
      if (!fullShareText) {
        error('공유할 링크가 없습니다.');
        return;
      }

      devLog('복사하려는 텍스트:', fullShareText); // 디버깅용

      // fallback 방법을 먼저 시도 (더 안정적)
      const copyWithFallback = () => {
        const textArea = document.createElement('textarea');
        textArea.value = fullShareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          return successful;
        } catch (err) {
          document.body.removeChild(textArea);
          throw err;
        }
      };

      // 먼저 fallback 방법 시도
      try {
        const fallbackSuccess = copyWithFallback();
        if (fallbackSuccess) {
          success('링크가 복사되었습니다.');
          handleCloseShare();
          return;
        }
      } catch (fallbackErr) {
        devLog('Fallback 복사 실패, Clipboard API 시도:', fallbackErr);
      }

      // fallback이 실패하면 Clipboard API 시도
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(fullShareText);
          success('링크가 복사되었습니다.');
          handleCloseShare();
          return;
        } catch (clipboardErr) {
          devLog('Clipboard API 실패:', clipboardErr);
        }
      }

      throw new Error('모든 복사 방법이 실패했습니다.');

    } catch (err) {
      devLog('링크 복사 실패:', err);
      error(`링크 복사에 실패했습니다. 수동으로 링크를 복사해주세요.`);
    }
  };

  // 실제 복사될 전체 텍스트를 생성하는 함수
  const getFullShareText = () => {

      const shareUrl = getCurrentShareUrl();

    
    return `${shareUrl}


⏫위 링크 클릭 시 에이고가 발급한 견적서로 이동합니다

🏢공급사명 : 주식회사 여기닷
 
📞전화문의 : 031-8039-7981

🌐공급사 홈페이지
https://heredotcorp.com 

※ 위 견적서는 공급사 공식 
홈페이지에서도 조회할 수 있습니다
 
 `;
  };

const getCurrentShareUrl = () => {
  // Zustand 스토어에서 chatSessionId 가져오기
  const sessionId = useChatStore.getState().chatSessionId;
  
  if (sessionId) {
    return `${window.location.origin}/aiclient/${companyCode}/ai/share/${sessionId}`;
  }
  
  // 없으면 현재 URL 반환
  return window.location.href;
};


const handleNewChat = () => {
  // ✅ Zustand 상태에서 메시지 가져오기
  const messages = useChatStore.getState().messages;
  
  if (messages && messages.length >= 2) {
    resetChat();
    startNewChat();
    setTimeout(() => {
      devLog('messages after clear:', useChatStore.getState().messages); // 빈 배열이어야 정상
    }, 0);

    // URL의 sessionId 파라미터 제거
    const url = new URL(window.location.href);
    if (url.searchParams.has('sessionId')) {
      url.searchParams.delete('sessionId');
      window.history.replaceState({}, '', url.pathname + url.search);
    }

    success('새로운 견적 상담 시작됨');
  } else {
    success('이미 새로운 채팅방입니다');
  }
};

  const handleGoToSettings = () => {
    if (isAuthenticated()) {
      navigate(`/aiclient/${companyCode}/ai/setting`);
    } else {
      openLoginModal();
    }
  };

  const handleGoToMyEstimate = () => {
    if (isAuthenticated()) {
      navigate(`/aiclient/${companyCode}/ai/my-estimate`);
    } else {
      openLoginModal();
    }
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 801 : false;
  const isAiHome = location.pathname === `/aiclient/${companyCode}/ai`;
  const shouldShowBackButton = isMobile || !isAiHome; // 모바일이면 항상, 데스크탑은 AI 홈에서 숨김

  return (
    <HeaderProvider>
      <LayoutWrapper>
        <TopNav>
          <div className="left-icons">
            {shouldShowBackButton && (
              <span className="icon" onClick={handleBack}>
                <Icon src={icons.back} width={24} height={24} />
              </span>
            )}
            {dynamicPageTitle && <NavTitle>{dynamicPageTitle}</NavTitle>}
          </div>
        {!dynamicPageTitle && (
          <div className="right-icons">
            <span className="icon" onClick={handleOpenShare}><Icon src={icons.share} width={36} height={36} /></span>
            <span className="icon" onClick={handleNewChat}><Icon src={icons.new} width={36} height={36} /></span>
            
            {/* 나의 견적 버튼 */}
            <span className="icon" onClick={handleGoToMyEstimate}><Icon src={icons.estimate} width={36} height={36} /></span>
            
            {/* 설정/로그인 버튼 */}
            <ProfileIconWrapper className="profile-menu">
  {isAuthenticated() ? (
    // 로그인 상태일 때 프로필 이미지를 클릭하면 드롭다운 메뉴가 열리도록 변경
    <ProfileImage onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
      <img
        src={user?.profileImage ? user.profileImage.replace('s96-c', 's400-c') : '/ai-estimate/no_profile.png'}
        alt="프로필"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        style={{ width: '36px', height: '36px' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/ai-estimate/no_profile.png';
        }}
      />
    </ProfileImage>
  ) : (
    // 로그인하지 않은 상태일 때 설정 아이콘을 클릭하면 드롭다운 메뉴가 열림
    <span className="icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
      <Icon src={icons.setting} width={36} height={36} />
    </span>
  )}

  {/* 드롭다운 메뉴 - 로그인 상태와 비로그인 상태 모두에서 사용 */}
  <DropdownMenu $isOpen={isDropdownOpen}>
    {isAuthenticated() ? (
      <>
        <DropdownItem onClick={() => {
          setIsDropdownOpen(false);
          handleGoToSettings(); // 마이페이지로 이동
        }}>
          마이페이지
        </DropdownItem>
        <DropdownItem onClick={() => {
          setIsDropdownOpen(false);
          toggleTheme(); // 테마 변경
        }}>
          {isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
        </DropdownItem>
      </>
    ) : (
      <>
        <DropdownItem onClick={() => {
          setIsDropdownOpen(false);
          openLoginModal();
        }}>
          로그인 하기
        </DropdownItem>
        <DropdownItem onClick={() => {
          setIsDropdownOpen(false);
          toggleTheme();
        }}>
          {isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
        </DropdownItem>
      </>
    )}
  </DropdownMenu>
</ProfileIconWrapper>
          </div>
        )}
      </TopNav>
      <Main >
        <div style={{ paddingTop: '0px' }}>
          <Outlet />
        </div>
      </Main>

      {/* <ThemeToggleButton onClick={toggleTheme}>
        {isDarkMode ? '☀️' : '🌙'}
      </ThemeToggleButton> */}

 {/* <SocialLoginModal
        $isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        purpose={loginModalPurpose}
        onPrimaryButtonClick={handleNonMemberAction} // 비회원 로직 함수 연결
        onGoogleLoginSuccess={handleGoogleLoginSuccess} // ✅ 구글 로그인 성공 후 함수 연결
      /> */}

      <Modal open={shareChatModal} title="페이지 공유" onClose={handleCloseShare} width={520}>
        <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>공유받은 사용자는 현재 페이지의 내용을 확인할 수 있습니다.</div>
        <ShareInput>
          <input readOnly value={getCurrentShareUrl()} placeholder="https://aigocorp.com/id..." />
          <button onClick={handleCopy}>링크복사</button>
        </ShareInput>
      </Modal>
    </LayoutWrapper>
    </HeaderProvider>
  );
}