import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link, useLocation,useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import Icon, { IconName } from '@/components/ai-esti/Icon'

interface FooterProps { compact?: boolean }

const FooterWrapper = styled.footer<{ $compact?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: ${({ theme }) => theme.body};
  border-top: 1px solid ${({ theme }) => theme.border};
  z-index: 100;
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
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
  const { isDarkMode } = useThemeStore()
  const navigate = useNavigate()  
  // 부모 창의 뷰포트 폭(Widget에서 전달)을 기반으로 임베드 모바일 여부 판정
  const [parentWidth, setParentWidth] = useState<number | null>(null)
  const [isEmbed, setIsEmbed] = useState(false)
  
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

  const hideFull = isEmbed && parentWidth !== null && parentWidth <= 520

  const navItems: { key: ItemKey; href?: string; fallbackIcon: IconName; text: string; external?: boolean }[] = [
    { key: 'consultation', href: '/', fallbackIcon: 'chat', text: '견적상담' },
    { key: 'estimate', href: '/my-estimate', fallbackIcon: 'document', text: '나의견적' },
    { key: 'setting', href: '/settings', fallbackIcon: 'settings', text: '설정' },
    { key: 'full', fallbackIcon: 'expand', text: '전체화면', external: true },
  ]

  const handleConsultationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault() // Link 컴포넌트의 기본 동작 방지

    if (location.pathname === '/') {
      // 현재 경로가 '/'일 때만 스크롤을 맨 위로 부드럽게 올림
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // 다른 경로에 있을 때는 '/'로 이동
      navigate('/')
    }
  }

  return (
    <FooterWrapper $compact={compact}>
      <FooterContent>
        {navItems.map((item, idx) => {
          // 임베드 + 부모 모바일이면 전체화면 메뉴 숨김
          if (item.external && hideFull) return null

          // '견적상담' 아이템을 별도로 처리
          if (item.key === 'consultation') {
            const isActive = location.pathname === item.href
            const iconSrc = getIconSrc(item.key, isDarkMode, isActive)
            return (
              <ButtonLike key={item.href} $isActive={isActive} onClick={handleConsultationClick}>
                <IconWrapper $isActive={isActive}>
                  <Icon src={iconSrc} width={80} height={60} fallbackIcon={item.fallbackIcon} />
                </IconWrapper>
                {/* <NavText>{item.text}</NavText> */}
              </ButtonLike>
            )
          }
          const isActive = item.href ? location.pathname === item.href : false
          const iconSrc = getIconSrc(item.key, isDarkMode, item.external ? false : isActive)

          if (item.external) {
            return (
              <ButtonLike
                key={idx}
                $isActive={false}
                onClick={(e) => {
                  e.preventDefault()
                  window.open('/ai-estimate', '_blank', 'noopener,noreferrer')
                }}
              >
                <IconWrapper $isActive={false}>
                  <Icon src={iconSrc} width={80} height={60} fallbackIcon={item.fallbackIcon} />
                </IconWrapper>
                {/* <NavText>{item.text}</NavText> */}
              </ButtonLike>
            )
          }

          return (
            <NavItem key={item.href} to={item.href!} $isActive={isActive}>
              <IconWrapper $isActive={isActive}>
                <Icon src={iconSrc} width={80} height={60} fallbackIcon={item.fallbackIcon} />
              </IconWrapper>
              {/* <NavText>{item.text}</NavText> */}
            </NavItem>
          )
        })}
      </FooterContent>
    </FooterWrapper>
  )
}

export default Footer