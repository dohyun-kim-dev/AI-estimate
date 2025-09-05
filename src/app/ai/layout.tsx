import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Icon from '@components/ai-esti/Icon';
import { useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { useThemeStore } from '@store/themeStore';
import { useChatStore } from '@store/chatStore';
import { useToast } from '@components/common/ToastProvider';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import { useModalStore } from '@store/modalStore';

const LayoutWrapper = styled.div`
  // min-height: 100vh;
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
  border-bottom: 1px solid ${({ theme }) => theme.border};
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
  font-size: 24px;
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
  padding: 56px 0 84px;
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

export default function AILayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyCode } = useParams();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { success } = useToast();
  const resetChat = useChatStore((s) => s.clear);
  const chatSessionId = useChatStore((s) => s.chatSessionId);
  const [openShare, setOpenShare] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      useThemeStore.setState({ isDarkMode: storedTheme === 'dark' });
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleOpenShare = () => {
    setOpenShare(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleCopy = async () => {
    let shareUrl;
    if (chatSessionId) {
      shareUrl = `${window.location.origin}/aiclient/${companyCode}/ai/share/${chatSessionId}`;
    } else {
      shareUrl = window.location.href;
    }
    
    // 추가할 문구
    const textToCopy = `주식회사 여기닷에서 산출된 견적 대화내용을 확인해보세요 !
 
${shareUrl}

🏢공급사명 : 주식회사 여기닷
 
📞전화문의 : 031-111-1234
 
※ 위 견적서는 공급사 공식 홈페이지에서도 조회할 수 있습니다
 
🌐공급사 홈페이지
https://heredotcorp.com
 
 `;
    
    try {
      // 수정: `shareUrl` 대신 `textToCopy`를 클립보드에 복사
      await navigator.clipboard.writeText(textToCopy);
      success('링크가 복사되었습니다.');
      handleCloseShare();
    } catch {
      console.error('Failed to copy');
      error('링크 복사에 실패했습니다.');
    }
  };

  const handleNewChat = () => {
    resetChat();
    success('새로운 채팅 세션이 시작되었습니다.');
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

  const shareUrl = chatSessionId 
    ? `${window.location.origin}/aiclient/${companyCode}/ai/share/${chatSessionId}`
    : window.location.href;
  
  const isAiHome = location.pathname === `/aiclient/${companyCode}/ai`;
  const isPC = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const shouldShowBackButton = !isAiHome || !isPC;

  return (
    <LayoutWrapper>
      <TopNav>
        <div className="left-icons">
          {shouldShowBackButton && (
            <span className="icon" onClick={handleBack}>
              <Icon src={icons.back} width={24} height={24} />
            </span>
          )}
          {pageTitle && <NavTitle>{pageTitle}</NavTitle>}
        </div>
        {!pageTitle && (
          <div className="right-icons">
            <span className="icon" onClick={handleOpenShare}><Icon src={icons.share} width={36} height={36} /></span>
            <span className="icon" onClick={handleNewChat}><Icon src={icons.new} width={36} height={36} /></span>
            
            {/* 나의 견적 버튼 */}
            <span className="icon" onClick={handleGoToMyEstimate}><Icon src={icons.estimate} width={36} height={36} /></span>
            
            {/* 설정/로그인 버튼 */}
            <ProfileIconWrapper className="profile-menu">
              {isAuthenticated() ? (
                <span className="icon" onClick={handleGoToSettings}>
                  <Icon src={icons.profile} width={36} height={36} />
                </span>
              ) : (
                <>
                  <span className="icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <Icon src={icons.setting} width={36} height={36} />
                  </span>
                  <DropdownMenu $isOpen={isDropdownOpen}>
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
                  </DropdownMenu>
                </>
              )}
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

      <Modal open={openShare} title="페이지 공유" onClose={handleCloseShare} width={520}>
        <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>공유받은 사용자는 현재 페이지의 내용을 확인할 수 있습니다.</div>
        <ShareInput>
          <input readOnly value={shareUrl} placeholder="https://aigocorp.com/id..." />
          <button onClick={handleCopy}>링크복사</button>
        </ShareInput>
      </Modal>
    </LayoutWrapper>
  );
}