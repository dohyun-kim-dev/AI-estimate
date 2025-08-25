import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import Icon from '@components/ai-esti/Icon';
import { useNavigate, Outlet } from 'react-router-dom';
import { useThemeStore } from '@store/themeStore';
import BottomInput from '@components/ai-esti/BottomInput';
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
export default function AiEstimateLayout() {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const isLightTheme = !isDarkMode;
    const icons = {
        back: '/ai-estimate/arrow_back.png',
        share: isLightTheme ? '/ai-estimate/share.png' : '/ai-estimate/share_dark.png',
        new: isLightTheme ? '/ai-estimate/new.png' : '/ai-estimate/new_dark.png',
        estimate: isLightTheme ? '/ai-estimate/esti.png' : '/ai-estimate/esti_dark.png',
        profile: isLightTheme ? '/ai-estimate/profile.png' : '/ai-estimate/profile_dark.png',
    };
    const handleBack = () => {
        navigate(-1);
    };
    return (_jsxs(LayoutWrapper, { children: [_jsxs(TopNav, { children: [_jsx("div", { className: "left-icons", children: _jsx("span", { className: "icon", onClick: handleBack, children: _jsx(Icon, { src: icons.back, width: 24, height: 24 }) }) }), _jsxs("div", { className: "right-icons", children: [_jsx("span", { className: "icon", children: _jsx(Icon, { src: icons.share, width: 36, height: 36 }) }), _jsx("span", { className: "icon", children: _jsx(Icon, { src: icons.new, width: 36, height: 36 }) }), _jsx("span", { className: "icon", children: _jsx(Icon, { src: icons.estimate, width: 36, height: 36 }) }), _jsx("span", { className: "icon", children: _jsx(Icon, { src: icons.profile, width: 36, height: 36 }) })] })] }), _jsx("div", { style: { paddingTop: '80px' }, children: _jsx(Outlet, {}) }), _jsx(ThemeToggleButton, { onClick: toggleTheme, children: isDarkMode ? '☀️' : '🌙' }), _jsx(BottomInput, { placeholder: "AI\uC5D0\uAC8C \uACAC\uC801 \uBB38\uC758\uD558\uAE30", onSubmit: (value) => console.log(value) })] }));
}
