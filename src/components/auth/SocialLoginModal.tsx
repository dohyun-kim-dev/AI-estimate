import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/store/authStore'
import { googleLoginInitial, googleLoginUpdate } from '@/lib/api/auth'
import CloseIcon from '@mui/icons-material/Close'

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background-color: white;
  color: ${({ theme }) => theme.text};
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 450px;
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`

const RightPanel = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.body};
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.text};
  text-align: center;
`

const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin-bottom: 8px;
  margin-left: 4px;
`

const GradientTitleText = styled.h2`
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(to right, #63a4ff, #8e54e9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-top: 0;
  margin-bottom: 16px;
  line-height: 1.2;
`

const MainSloganText = styled.h3`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 40px;
  white-space: pre-line;
  line-height: 1.3;
`

const GoogleLoginButton = styled.button`
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 320px;

  &:hover {
    background-color: ${({ theme }) => theme.surface2};
  }

  img {
    width: 20px;
    height: 20px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const StyledCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.subtleText};

  .MuiSvgIcon-root {
    font-size: 28px;
  }

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`

interface SocialLoginModalProps {
  $isOpen: boolean
  onClose: () => void
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  $isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login, openAdditionalInfoModal } = useAuthStore()

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      setLoginError(null)
      try {
        // 1. 구글에서 사용자 정보 가져오기
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        )
        const userInfo = await userInfoResponse.json()

        // 2. providerId로 첫 번째 로그인 시도
        const initialResponse = await googleLoginInitial({
          providerId: userInfo.sub,
        })

        if (initialResponse.statusCode === 200) {
          if (initialResponse.data.isNew) {
            // 3. 신규 사용자면 추가 정보와 함께 다시 요청
            const updateResponse = await googleLoginUpdate({
              providerId: userInfo.sub,
              name: `${userInfo.family_name}${userInfo.given_name}`,
              email: userInfo.email,
              profileImage: userInfo.picture,
            })

            if (updateResponse.statusCode === 200) {
              await login(updateResponse.data)
              onClose() // 먼저 소셜 로그인 모달을 닫고
              openAdditionalInfoModal() // 그 다음 추가 정보 모달을 엽니다
            } else {
              setLoginError(
                updateResponse.error?.message || '회원가입 중 오류가 발생했습니다.'
              )
            }
          } else {
            // 4. 기존 사용자면 바로 로그인 처리
            await login(initialResponse.data)
            onClose()
            toast.success('로그인되었습니다!')
          }
        } else {
          setLoginError(initialResponse.error?.message || '로그인에 실패했습니다.')
        }
      } catch (error) {
        console.error('Google 로그인 에러:', error)
        setLoginError('로그인 처리 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    onError: (error) => {
      console.error('Google 로그인 에러:', error)
      setLoginError('Google 로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    },
  })

  useEffect(() => {
    if (!$isOpen) {
      setIsLoading(false)
      setLoginError(null)
    }
  }, [$isOpen])

  if (!$isOpen) {
    return null
  }

  return (
    <ModalOverlay
      $isOpen={$isOpen}
      onClick={() => {
        if (isLoading) return
        onClose()
      }}
    >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledCloseButton onClick={onClose} disabled={isLoading}>
          <CloseIcon />
        </StyledCloseButton>
        <RightPanel>
          <PageSubtitle>복잡한 견적, AI로 간단하게.</PageSubtitle>
          <GradientTitleText>AI 견적서</GradientTitleText>
          <MainSloganText>간편 구글 로그인으로 즐겨보세요</MainSloganText>

          <GoogleLoginButton onClick={() => handleGoogleLogin()} disabled={isLoading}>
            <img src="/ai-estimate/google.png" alt="Google_logo" />
            <span> Google 계정으로 로그인</span>
          </GoogleLoginButton>

          {loginError && (
            <p style={{ color: 'red', marginTop: '20px', fontSize: '14px' }}>
              {loginError}
            </p>
          )}
        </RightPanel>
      </ModalContent>
    </ModalOverlay>
  )
}

export default SocialLoginModal
