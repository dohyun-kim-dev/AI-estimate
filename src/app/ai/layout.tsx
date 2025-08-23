import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '@components/ai-esti/Icon';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useThemeStore } from '@store/themeStore';
import { useChatStore } from '@store/chatStore';
import { useToast } from '@components/common/ToastProvider';
import Modal from '@components/common/Modal';

const LayoutWrapper = styled.div`
  min-height: 100vh;
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
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { success } = useToast();
  const resetChat = useChatStore((s) => s.clear);
  const [openShare, setOpenShare] = useState(false);

  // useEffect를 사용하여 컴포넌트 마운트 시 로컬 스토리지에서 테마를 불러옵니다.
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
  };

  const pageTitle = location.pathname === '/ai/my-estimate' ? '내 견적서' : location.pathname === '/ai/setting' ? '설정' : null;

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
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      success('링크가 복사되었습니다.');
      handleCloseShare();
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleNewChat = () => {
    resetChat();
    success('새로운 채팅 세션이 시작되었습니다.');
  };

  const handleGoToSettings = () => {
    navigate('/ai/setting');
  };

  const handleGoToMyEstimate = () => {
    navigate('/ai/my-estimate');
  };

  const shareUrl = window.location.href;

  return (
    <LayoutWrapper>
      <TopNav>
        <div className="left-icons">
          <span className="icon" onClick={handleBack}>
            <Icon src={icons.back} width={24} height={24} />
          </span>
          {pageTitle && <NavTitle>{pageTitle}</NavTitle>}
        </div>
        {!pageTitle && (
          <div className="right-icons">
            <span className="icon" onClick={handleOpenShare}><Icon src={icons.share} width={36} height={36} /></span>
            <span className="icon" onClick={handleNewChat}><Icon src={icons.new} width={36} height={36} /></span>
            <span className="icon" onClick={handleGoToMyEstimate}><Icon src={icons.estimate} width={36} height={36} /></span>
            <span className="icon" onClick={handleGoToSettings}><Icon src={icons.profile} width={36} height={36} /></span>
          </div>
        )}
      </TopNav>
      
      <div style={{ paddingTop: '80px' }}>
        <Outlet />
      </div>

      <ThemeToggleButton onClick={toggleTheme}>
        {isDarkMode ? '☀️' : '🌙'}
      </ThemeToggleButton>

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