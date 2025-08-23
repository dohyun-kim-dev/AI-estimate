'use client'

import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
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
  z-index: 100;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.surface1};
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      openLoginModal()
    }
    // TODO: 로그인된 경우 프로필 메뉴 표시
  }

  return (
    <HeaderWrapper>
      <HeaderContent>
        <Logo>
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
                <ProfileName>{user.name}</ProfileName>
                <ProfileImage>
                  <img src={user.profileImage || '/main/profile.png'} alt="프로필" />
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