import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '@components/ai-esti/Icon';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useThemeStore } from '@store/themeStore';
import { useChatStore } from '@store/chatStore';
import { useToast } from '@components/common/ToastProvider';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import { useModalStore } from '@store/modalStore';
const LayoutWrapper = styled.div `
  min-height: 100vh;
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
  background-color: ${({ theme }) => theme.body};
`;
const TopNav = styled.nav `
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
const NavTitle = styled.h1 `
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;
const ThemeToggleButton = styled.button `
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
const DropdownMenu = styled.div `
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
const DropdownItem = styled.button `
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
const ProfileIconWrapper = styled.div `
  position: relative;
`;
const ShareInput = styled.div `
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { openLoginModal } = useModalStore();
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
        setting: isLightTheme ? '/ai-estimate/setting.png' : '/ai-estimate/setting_dark.png',
    };
    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest('.profile-menu')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
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
        }
        catch {
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
    return (_jsxs(LayoutWrapper, { children: [_jsxs(TopNav, { children: [_jsxs("div", { className: "left-icons", children: [_jsx("span", { className: "icon", onClick: handleBack, children: _jsx(Icon, { src: icons.back, width: 24, height: 24 }) }), pageTitle && _jsx(NavTitle, { children: pageTitle })] }), !pageTitle && (_jsxs("div", { className: "right-icons", children: [_jsx("span", { className: "icon", onClick: handleOpenShare, children: _jsx(Icon, { src: icons.share, width: 36, height: 36 }) }), _jsx("span", { className: "icon", onClick: handleNewChat, children: _jsx(Icon, { src: icons.new, width: 36, height: 36 }) }), _jsx("span", { className: "icon", onClick: handleGoToMyEstimate, children: _jsx(Icon, { src: icons.estimate, width: 36, height: 36 }) }), _jsx(ProfileIconWrapper, { className: "profile-menu", children: isAuthenticated() ? (_jsx("span", { className: "icon", onClick: handleGoToSettings, children: _jsx(Icon, { src: icons.profile, width: 36, height: 36 }) })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "icon", onClick: () => setIsDropdownOpen(!isDropdownOpen), children: _jsx(Icon, { src: icons.setting, width: 36, height: 36 }) }), _jsxs(DropdownMenu, { "$isOpen": isDropdownOpen, children: [_jsx(DropdownItem, { onClick: () => {
                                                        setIsDropdownOpen(false);
                                                        openLoginModal();
                                                    }, children: "\uB85C\uADF8\uC778 \uD558\uAE30" }), _jsx(DropdownItem, { onClick: () => {
                                                        setIsDropdownOpen(false);
                                                        toggleTheme();
                                                    }, children: isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경' })] })] })) })] }))] }), _jsx("div", { style: { paddingTop: '80px' }, children: _jsx(Outlet, {}) }), _jsx(ThemeToggleButton, { onClick: toggleTheme, children: isDarkMode ? '☀️' : '🌙' }), _jsxs(Modal, { open: openShare, title: "\uD398\uC774\uC9C0 \uACF5\uC720", onClose: handleCloseShare, width: 520, children: [_jsx("div", { style: { color: '#A1A1AA', fontSize: 14, marginBottom: 32 }, children: "\uACF5\uC720\uBC1B\uC740 \uC0AC\uC6A9\uC790\uB294 \uD604\uC7AC \uD398\uC774\uC9C0\uC758 \uB0B4\uC6A9\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsxs(ShareInput, { children: [_jsx("input", { readOnly: true, value: shareUrl, placeholder: "https://aigocorp.com/id..." }), _jsx("button", { onClick: handleCopy, children: "\uB9C1\uD06C\uBCF5\uC0AC" })] })] })] }));
}
