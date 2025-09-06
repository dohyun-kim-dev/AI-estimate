import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom' // ✅ 추가

import { useThemeStore } from '@/store/themeStore'
import { useModalStore } from '@/store/modalStore'
import { useAuthStore } from '@/store/authStore'
import Icon from '@/components/ai-esti/Icon'


const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: ${({ theme }) => theme.body};
  z-index: 1000;
`

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`

const Logo = styled.div`
  cursor: pointer;
`

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const ThemeToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`

const ProfileImage = styled.div`
  width: 36px;
  height: 36px;
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
`

const ProfileName = styled.span`
  font-size: 16px;
  font-weight: 500;
`

interface HeaderProps {
  compact?: boolean;
}

const Header = ({ compact }: HeaderProps) => {
  const { isDarkMode, toggleTheme } = useThemeStore()
  const { openLoginModal } = useModalStore()
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate() // ✅ 추가
  const { companyCode } = useParams() // URL에서 companyCode를 가져옵니다.

  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      openLoginModal()
    }
  } 

  return (
    <HeaderWrapper>
      <HeaderContent>
        <Logo onClick={() => navigate('/')}> {/* ✅ 클릭 시 홈으로 이동 */}
          <Icon 
            src={isDarkMode ? '/main/logo_dark.png' : '/main/logo_light.png'} 
            height={32} 
            fallbackIcon="logo"
          />
        </Logo>
        <ProfileSection>
          <ThemeToggle onClick={toggleTheme}>
            <Icon 
              src={isDarkMode ? '/main/dark_mode.png' : '/main/light_mode.png'} 
              width={36} 
              height={36}
              fallbackIcon={isDarkMode ? 'moon' : 'sun'}
            />
          </ThemeToggle>
          <Profile onClick={handleProfileClick}>
            {isAuthenticated() && user ? (
              <>
                {/* <ProfileName>{user.name}</ProfileName> */}
                <ProfileImage>
                  <img 
                    src={user?.profileImage ? user.profileImage.replace('s96-c', 's400-c') : '/main/profile.png'} 
                    alt="프로필" 
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    style={{width: '36px', height: '36px'}}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/main/profile.png';
                    }}
                  />
                </ProfileImage>
              </>
            ) : (
              <ProfileName>로그인</ProfileName>
            )}
          </Profile>
        </ProfileSection>
      </HeaderContent>
    </HeaderWrapper>
  )
}

export default Header
