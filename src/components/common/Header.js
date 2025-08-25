import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // ✅ 추가
import { useThemeStore } from '@/store/themeStore';
import { useModalStore } from '@/store/modalStore';
import { useAuthStore } from '@/store/authStore';
import Icon from '@/components/ai-esti/Icon';
const HeaderWrapper = styled.header `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: ${({ theme }) => theme.body};
  z-index: 100;
`;
const HeaderContent = styled.div `
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;
const Logo = styled.div `
  cursor: pointer;
`;
const ProfileSection = styled.div `
  display: flex;
  align-items: center;
  gap: 16px;
`;
const ThemeToggle = styled.button `
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Profile = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`;
const ProfileImage = styled.div `
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.surface1};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;
const ProfileName = styled.span `
  font-size: 16px;
  font-weight: 500;
`;
const Header = ({ compact }) => {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const { openLoginModal } = useModalStore();
    const { user, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate(); // ✅ 추가
    const handleProfileClick = () => {
        if (!isAuthenticated()) {
            openLoginModal();
        }
        // TODO: 로그인된 경우 프로필 메뉴 표시
    };
    return (_jsx(HeaderWrapper, { children: _jsxs(HeaderContent, { children: [_jsxs(Logo, { onClick: () => navigate('/'), children: [" ", _jsx(Icon, { src: isDarkMode ? '/main/logo_dark.png' : '/main/logo_light.png', height: 32, fallbackIcon: "logo" })] }), _jsxs(ProfileSection, { children: [_jsx(ThemeToggle, { onClick: toggleTheme, children: _jsx(Icon, { src: isDarkMode ? '/main/dark_mode.png' : '/main/light_mode.png', width: 36, height: 36, fallbackIcon: isDarkMode ? 'moon' : 'sun' }) }), _jsx(Profile, { onClick: handleProfileClick, children: isAuthenticated() && user ? (_jsxs(_Fragment, { children: [_jsx(ProfileName, { children: user.name }), _jsx(ProfileImage, { children: _jsx("img", { src: user?.profileImage ? user.profileImage.replace('s96-c', 's400-c') : '/main/profile.png', alt: "\uD504\uB85C\uD544", referrerPolicy: "no-referrer", crossOrigin: "anonymous", onError: (e) => {
                                                const target = e.target;
                                                target.src = '/main/profile.png';
                                            } }) })] })) : (_jsx(ProfileName, { children: "\uB85C\uADF8\uC778" })) })] })] }) }));
};
export default Header;
