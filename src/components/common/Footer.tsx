import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import Icon, { IconName } from '@/components/ai-esti/Icon'
import { SocialLoginModal } from '@/components/ai-esti/SocialLoginModal';
import { useAuthStore } from '@/store/authStore';
import { CountModal } from '@/components/ai-esti/CountModal';

interface FooterProps { compact?: boolean }

const FooterWrapper = styled.footer<{ $compact?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: ${({ theme }) => theme.body};
  border-top: 1px solid ${({ theme }) => theme.border};
  z-index: 1001;
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
    z-index: 1001;

`

const NavItem = styled(Link)<{ $isActive?: boolean }>`
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
`

const ButtonLike = styled.a<{ $isActive?: boolean }>`
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
`

const IconWrapper = styled.div<{ $isActive?: boolean }>`
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.7)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`

const NavText = styled.span`
  font-weight: 500;
`

type ItemKey = 'consultation' | 'estimate' | 'setting' | 'full'

function getIconSrc(key: ItemKey, isDark: boolean, isActive: boolean) {
  const themePart = isDark ? 'dark' : 'light'
  const pickPart = isActive ? '_pick' : ''
  return `/main/${key}_${themePart}${pickPart}.png`
}

const Footer: React.FC<FooterProps> = ({ compact }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDarkMode } = useThemeStore()
  const { companyCode } = useParams() // URL에서 companyCode를 가져옵니다.
  const { isAuthenticated } = useAuthStore()
  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false)
  const [parentWidth, setParentWidth] = useState<number | null>(null)
  const [isEmbed, setIsEmbed] = useState(false)
  

  // 모바일 디바이스(아이폰 포함) 감지
  const isMobileDevice = (() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  })();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    setIsEmbed(searchParams.get('embed') === '1')
    const onMsg = (e: MessageEvent) => {
      if (e?.data?.type === 'aiw:parentViewport' && typeof e.data.width === 'number') {
        setParentWidth(e.data.width)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [location])

  const hideFull = (isEmbed && parentWidth !== null && parentWidth <= 520) || isMobileDevice;

  const navItems: { key: ItemKey; href?: string; fallbackIcon: IconName; text: string; external?: boolean }[] = [
    { key: 'consultation', href: `/aiclient/${companyCode}/`, fallbackIcon: 'chat', text: '견적상담' },
    { key: 'estimate', href: `/aiclient/${companyCode}/my-estimate`, fallbackIcon: 'document', text: '나의견적' },
    { key: 'setting', href: `/aiclient/${companyCode}/settings`, fallbackIcon: 'settings', text: '설정' },
    { key: 'full', fallbackIcon: 'expand', text: '전체화면', external: true },
  ]

  const handleConsultationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    const currentPath = `/aiclient/${companyCode}/`

    if (location.pathname === currentPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(currentPath)
    }
  }

  return (
    <FooterWrapper $compact={compact}>
      <FooterContent>
        {navItems.map((item, idx) => {
          if (item.external && hideFull) return null;
  
          const isSpecialItem = item.key === 'estimate' || item.key === 'setting';
  
          if (item.key === 'consultation') {
            const isActive = location.pathname === `/aiclient/${companyCode}/`;
            const iconSrc = getIconSrc(item.key, isDarkMode, isActive);
            return (
              <ButtonLike key={item.href} $isActive={isActive} onClick={handleConsultationClick}>
                <IconWrapper $isActive={isActive}>
                  <Icon src={iconSrc} width={80} height={60} fallbackIcon={item.fallbackIcon} />
                </IconWrapper>
              </ButtonLike>
            );
          }
  
          const isActive = item.href ? location.pathname === item.href : false;
          const iconSrc = getIconSrc(item.key, isDarkMode, item.external ? false : isActive);
  
          if (item.external) {
            // 현재 chatSessionId를 URL 파라미터로 전달
            const searchParams = new URLSearchParams(window.location.search);
            const sessionId = searchParams.get('sessionId') || localStorage.getItem('chatSessionId');
            const fullUrl = sessionId
              ? `/aiclient/${companyCode}/ai?sessionId=${sessionId}`
              : `/aiclient/${companyCode}/ai`;
            return (
              <ButtonLike
                key={idx}
                $isActive={false}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(fullUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                <IconWrapper $isActive={false}>
                  <Icon src={iconSrc} width={80} height={60} fallbackIcon={item.fallbackIcon} />
                </IconWrapper>
              </ButtonLike>
            );
          }
  
          // '나의견적' 또는 '설정' 버튼 처리
          if (isSpecialItem) {
            const handleItemClick = (e: React.MouseEvent) => {
              if (!isAuthenticated()) {
                e.preventDefault();
                setIsSocialLoginModalOpen(true);
              }
            };
  
            return (
              <NavItem key={item.href} to={item.href} $isActive={isActive} onClick={handleItemClick}>
                <IconWrapper $isActive={isActive}>
                  <Icon src={iconSrc} width={80} height={60} fallbackIcon={item.fallbackIcon} />
                </IconWrapper>
              </NavItem>
            );
          }
  
          return (
            <NavItem key={item.href} to={item.href} $isActive={isActive}>
              <IconWrapper $isActive={isActive}>
                <Icon src={iconSrc} width={80} height={60} fallbackIcon={item.fallbackIcon} />
              </IconWrapper>
            </NavItem>
          );
        })}
      </FooterContent>
  
      {/* 소셜 로그인 모달 컴포넌트 추가 */}
      <SocialLoginModal
        $isOpen={isSocialLoginModalOpen}
        onClose={() => setIsSocialLoginModalOpen(false)}
      />
      {/* <CountModal
        $isOpen={isSocialLoginModalOpen}
        onClose={() => setIsSocialLoginModalOpen(false)}
      /> */}
    </FooterWrapper>
  )
  
}

export default Footer
