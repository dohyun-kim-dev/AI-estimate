
import React, { useState } from 'react' 
import styled from 'styled-components'
import { IoChevronForward } from 'react-icons/io5'
import LanguageSelector from '@/components/common/LanguageSelector'
import { useNavigate } from "react-router-dom";
import TermsModal from '@/components/ai-esti/TermsModal'     
import { useAuthStore } from '@/store/authStore'
import { devLog } from '@/utils/devLogger'

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

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.surface3};
  border-radius: 4px;
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
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const [imageLoaded, setImageLoaded] = useState(false); // 이미지 로드 상태
  const [useDefaultImage, setUseDefaultImage] = useState(false); // 기본 이미지 사용 여부

  // 프로필 이미지 URL 생성 함수
  const getProfileImageUrl = (profileImage: string | undefined) => {
    if (!profileImage || useDefaultImage) return '/ai-estimate/no_profile.png';
    
    // 이미 http로 시작하는 외부 URL인 경우 (Google 프로필 등)
    if (profileImage.startsWith('http')) {
      return profileImage.replace('s96-c', 's400-c');
    }
    
    // 정적 파일인 경우
    if (profileImage.startsWith('/ai-estimate/') || profileImage.startsWith('/cms/')) {
      return profileImage;
    }
    
    // 서버 파일인 경우 환경별 경로 처리
    const isDev = import.meta.env.VITE_ENV_NAME === 'dev';
    return isDev ? `/api/file/${profileImage}` : `/file/${profileImage}`;
  };

  // 이미지 로드 에러 핸들러
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    
    // 이미 기본 이미지인 경우 중단
    if (target.src.includes('no_profile.png')) {
      return;
    }
    
    // 한 번 실패하면 바로 기본 이미지로 변경
    devLog('프로필 이미지 로드 실패, 기본 이미지 사용');
    setUseDefaultImage(true);
    setImageLoaded(true);
  };

  // 이미지 로드 성공 핸들러
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleLogout = async () => {
    logout()
    navigate('/')
  }

  const handleViewTerms = () => {
    devLog("check")
    setIsModalOpen(true);
  };

  return (
    <Container>
      <ProfileSection>
        <ProfileImage>
          <img 
            src={imageLoaded ? getProfileImageUrl(user?.profileImage) : '/ai-estimate/no_profile.png'} 
            alt="프로필" 
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
          {!imageLoaded && (
            <img 
              src="/ai-estimate/no_profile.png" 
              alt="프로필" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </ProfileImage>
        <ProfileInfo>
          <Flex>
          <ProfileName>{user?.name || '사용자'}</ProfileName>
          <div style={{width: '24px', height: '24px', display: 'flex', marginBottom: '8px'}}>
          {/* <ChevronIcon />           */}
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
        <MenuItem onClick={handleViewTerms}> 
          <MenuText>이용약관</MenuText>
          <ChevronIcon />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <MenuText>로그아웃</MenuText>
          <ChevronIcon />
        </MenuItem>
      </Section>
      
      {/* 👈 TermsModal 컴포넌트 렌더링 */}
      <TermsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Container>
  )
}