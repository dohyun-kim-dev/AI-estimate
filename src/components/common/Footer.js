import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import Icon from '@/components/ai-esti/Icon';
const FooterWrapper = styled.footer `
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: ${({ theme }) => theme.body};
  border-top: 1px solid ${({ theme }) => theme.border};
  z-index: 100;
`;
const FooterContent = styled.div `
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
`;
const NavItem = styled(Link) `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: ${({ theme, $isActive }) => ($isActive ? theme.accent : theme.subtleText)};
  font-size: 12px;
  min-width: 56px;
  padding: 8px 0;

  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;
const ButtonLike = styled.a `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: ${({ theme, $isActive }) => ($isActive ? theme.accent : theme.subtleText)};
  font-size: 12px;
  min-width: 56px;
  padding: 8px 0;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.accent}; }
`;
const IconWrapper = styled.div `
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.7)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;
const NavText = styled.span `
  font-weight: 500;
`;
function getIconSrc(key, isDark, isActive) {
    const themePart = isDark ? 'dark' : 'light';
    const pickPart = isActive ? '_pick' : '';
    return `/main/${key}_${themePart}${pickPart}.png`;
}
const Footer = ({ compact }) => {
    const location = useLocation();
    const { isDarkMode } = useThemeStore();
    // 부모 창의 뷰포트 폭(Widget에서 전달)을 기반으로 임베드 모바일 여부 판정
    const [parentWidth, setParentWidth] = useState(null);
    const [isEmbed, setIsEmbed] = useState(false);
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setIsEmbed(searchParams.get('embed') === '1');
        const onMsg = (e) => {
            if (e?.data?.type === 'aiw:parentViewport' && typeof e.data.width === 'number') {
                setParentWidth(e.data.width);
            }
        };
        window.addEventListener('message', onMsg);
        return () => window.removeEventListener('message', onMsg);
    }, [location]);
    const hideFull = isEmbed && parentWidth !== null && parentWidth <= 520;
    const navItems = [
        { key: 'consultation', href: '/', fallbackIcon: 'chat', text: '견적상담' },
        { key: 'estimate', href: '/my-estimate', fallbackIcon: 'document', text: '나의견적' },
        { key: 'setting', href: '/settings', fallbackIcon: 'settings', text: '설정' },
        { key: 'full', fallbackIcon: 'expand', text: '전체화면', external: true },
    ];
    return (_jsx(FooterWrapper, { "$compact": compact, children: _jsx(FooterContent, { children: navItems.map((item, idx) => {
                // 임베드 + 부모 모바일이면 전체화면 메뉴 숨김
                if (item.external && hideFull)
                    return null;
                const isActive = item.href ? location.pathname === item.href : false;
                const iconSrc = getIconSrc(item.key, isDarkMode, item.external ? false : isActive);
                if (item.external) {
                    return (_jsx(ButtonLike, { "$isActive": false, onClick: (e) => {
                            e.preventDefault();
                            window.open('/ai-estimate', '_blank', 'noopener,noreferrer');
                        }, children: _jsx(IconWrapper, { "$isActive": false, children: _jsx(Icon, { src: iconSrc, width: 80, height: 60, fallbackIcon: item.fallbackIcon }) }) }, idx));
                }
                return (_jsx(NavItem, { to: item.href, "$isActive": isActive, children: _jsx(IconWrapper, { "$isActive": isActive, children: _jsx(Icon, { src: iconSrc, width: 80, height: 60, fallbackIcon: item.fallbackIcon }) }) }, item.href));
            }) }) }));
};
export default Footer;
