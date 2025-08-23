import styled from 'styled-components'
import { useThemeStore } from '@/store/themeStore'

interface HeaderProps {
  compact?: boolean
}

const HeaderWrapper = styled.header<{ compact?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ compact }) => (compact ? '60px' : '72px')};
  background-color: ${({ theme }) => theme.body};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  z-index: 100;
`

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Logo = styled.div`
  cursor: pointer;
  img {
    height: 32px;
  }
`

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const ThemeToggle = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.surface2};
  }
`

export const Header: React.FC<HeaderProps> = ({ compact }) => {
  const { isDarkMode, toggleTheme } = useThemeStore()

  return (
    <HeaderWrapper compact={compact}>
      <HeaderContent>
        <Logo>
          <img
            src={isDarkMode ? '/main/logo_dark.png' : '/main/logo_light.png'}
            alt="Logo"
          />
        </Logo>
        <ProfileSection>
          <ThemeToggle onClick={toggleTheme}>
            <img
              src={isDarkMode ? '/main/dark_mode.png' : '/main/light_mode.png'}
              alt="Theme toggle"
              width={24}
              height={24}
            />
          </ThemeToggle>
        </ProfileSection>
      </HeaderContent>
    </HeaderWrapper>
  )
}

export default Header
