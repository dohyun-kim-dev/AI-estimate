import React, { useState } from 'react' 
import styled from 'styled-components'
import Icon from '@/components/ai-esti/Icon'
import { IoChevronForward } from 'react-icons/io5'
import LanguageSelector from '@/components/common/LanguageSelector'
import { useAuthStore } from '@/store/authStore'
import { useNavigate, useParams } from "react-router-dom";
import TermsModal from '@/components/ai-esti/TermsModal'     
import { EditProfileModal } from '@/components/ai-esti/EditProfileModal'

const Container = styled.div`
  // min-height: 100vh;
  background-color: ${({ theme }) => theme.body};
  padding: 20px 16px;
`

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  margin-bottom: 24px;
  cursor: pointer;
`

const ProfileImage = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
`

const ProfileInfo = styled.div`
  flex: 1;
`

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ProfileName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 4px;
`

const ProfileEmail = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
`

const ChevronIcon = styled(IoChevronForward)`
  color: ${({ theme }) => theme.subtleText};
  width: 24px;
  height: 24px;
`

const Section = styled.div`
  margin: 40px 0;
`

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
`

const MenuItemContainer = styled.div`
  border-radius: 4px;
  padding:4px;
    background-color: ${({ theme }) => theme.surface3};
`

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.surface3};
  // border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.surface2};
  }
`

const MenuText = styled.span`
  flex: 1;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
`

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // 👈 모달 상태 추가
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false); // 👈 프로필 수정 모달 상태 추가
  const { companyCode } = useParams();  

  const handleLogout = () => {
    logout()
    navigate(`/aiclient/${companyCode}/ai`)
  }

  const handleViewTerms = () => {
    console.log("check")
    setIsModalOpen(true); // 👈 모달 열기 함수
  };

  const handleEditProfile = () => {
    setIsEditProfileModalOpen(true); // 👈 프로필 수정 모달 열기 함수
  };

  return (
    <Container>
      <ProfileSection onClick={handleEditProfile}>
       <ProfileImage>
                  <img 
                    src={user?.profileImage ? user.profileImage.replace('s96-c', 's400-c') : '/main/profile.png'} 
                    alt="프로필" 
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    style={{width: '60px', height: '60px'}}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/main/profile.png';
                    }}
                  />
                </ProfileImage>
        
        <ProfileInfo>
          <Flex>
          <ProfileName>{user?.name || '사용자'}</ProfileName>
          <div style={{width: '24px', height: '24px', display: 'flex', marginBottom: '2px'}}>
          <ChevronIcon />          
          </div>
          </Flex>

          <ProfileEmail>{user?.email || ''}</ProfileEmail>
        </ProfileInfo>
      </ProfileSection>

      {/* <Section>
        <SectionTitle>다국어 설정 (Language)</SectionTitle>
        <LanguageSelector withLabel={false} />
      </Section> */}

      <Section>
        <SectionTitle>고객 서비스</SectionTitle>
        <MenuItemContainer>
        <MenuItem onClick={handleViewTerms}>
          <MenuText>이용약관</MenuText>
          <ChevronIcon />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <MenuText>로그아웃</MenuText>
          <ChevronIcon />
        </MenuItem>
        </MenuItemContainer>
      </Section>
      
      {/* 👈 TermsModal 컴포넌트 렌더링 */}
      <TermsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      {/* 👈 EditProfileModal 컴포넌트 렌더링 */}
      <EditProfileModal 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setIsEditProfileModalOpen(false)} 
      />
    </Container>
  )
}