// 파일: @components/common/SocialLoginModal.tsx (새 파일)
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, useMemo, ReactNode } from 'react';
import { EstimateConfirmModal } from './EstimateConfirmModal';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/common/ToastProvider';
import { googleLoginInitial, googleLoginUpdate } from '@/lib/api/user/userApi';
import { useGoogleLogin } from '@react-oauth/google';

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
`;

const ModalContent = styled.div`
  background-color: white;
  color: ${AppColors.onSurface};
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 450px;
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  margin: 12px;
`;

const RightPanel = styled.div`
  flex: 1;
  background-color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${AppColors.onSurface};
  text-align: center;
`;

const PageSubtitle = styled.p`
  ${AppTextStyles.body2}
  font-size: 14px;
  color: ${AppColors.onSurfaceVariant};
  margin-bottom: 8px;
  margin-left: 4px;
`;

const GradientTitleText = styled.h2`
  ${AppTextStyles.headline2}
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(90deg, #0314CF 33.86%, #AFB2D4 74.02%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-top: 0;
  margin-bottom: 20px;
  line-height: 1.2;
`;

const MainSloganText = styled.h3`
  ${AppTextStyles.title1}
  font-size: 24px;
  font-weight: bold;
  color: ${AppColors.onSurface};
  margin-bottom: 20px;
  white-space: pre-line;
  line-height: 2;
`;

const SubSloganText = styled.h3`
  ${AppTextStyles.title1}
  font-size: 13px;
  font-weight: 500;
  color: ${AppColors.onSurfaceVariant};
  margin-bottom: 50px;
  white-space: pre-line;
  line-height: 2;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 320px;

`;

const PrimaryButton = styled.button`
  background-color: #2E2E48;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;

  &:hover {
    background-color: #4B4B6F;
  }

  &:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background-color: white;
  color: #3c4043;
  border: 1px solid #dadce0;
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

  &:hover {
    background-color: #f8f9fa;
  }

  &:disabled {
    background-color: #f1f3f4;
    color: #bdc1c6;
    cursor: not-allowed;
    border-color: #f1f3f4;
  }
`;

const StyledCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${AppColors.onSurfaceVariant};

  .MuiSvgIcon-root {
    font-size: 28px;
  }

  &:hover {
    color: ${AppColors.onSurface};
  }
`;

interface SocialLoginModalProps {
  $isOpen: boolean;
  onClose: () => void;
  purpose: 'contact' | 'download' | 'share' | 'limitReached' | 'limitExceeded';
  onGoogleLoginSuccess: (tokenResponse: any) => void;
  onPrimaryButtonClick: () => void;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  $isOpen,
  onClose,
  purpose,
  onGoogleLoginSuccess,
  onPrimaryButtonClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [showEstimateModal, setShowEstimateModal] = useState(false);

  const { login, openAdditionalInfoModal } = useAuthStore();
  const { success, error: showError } = useToast();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // 구글 유저 정보 가져오기
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await userInfoResponse.json();

        // 초기 로그인 시도
        const initialResponse = await googleLoginInitial({ providerId: userInfo.sub });

        if (initialResponse.statusCode === 200) {
          if (initialResponse.data.isNew) {
            // 신규 사용자: 추가 정보 업데이트
            const updateResponse = await googleLoginUpdate({
              providerId: userInfo.sub,
              name: `${userInfo.family_name}${userInfo.given_name}`,
              email: userInfo.email,
              profileImage: userInfo.picture,
              cellphone: ''  // 추가 정보 모달에서 입력 받을 예정
            });
            
            if (updateResponse.statusCode === 200) {
              await login(updateResponse.data);
              onClose();
              openAdditionalInfoModal();
            } else {
              throw new Error(updateResponse.error?.message || '회원가입 중 오류가 발생했습니다.');
            }
          } else {
            // 기존 사용자: 바로 로그인
            await login(initialResponse.data);
            onClose();
            success('로그인되었습니다!');
            
            // 3초 후 견적 모달 표시 (필요한 경우)
            if (purpose === 'limitExceeded') {
              setTimeout(() => {
                setShowEstimateModal(true);
              }, 3000);
            }
          }
        } else {
          throw new Error(initialResponse.error?.message || '로그인에 실패했습니다.');
        }

      } catch (error: any) {
        console.error('Google 로그인 에러:', error);
        setLoginError(error.message || '로그인 처리 중 오류가 발생했습니다.');
        showError('로그인 처리 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google 로그인 에러:', error);
      setLoginError('Google 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!$isOpen) {
      setIsLoading(false);
      setLoginError(null);
    }
  }, [$isOpen]);
  
  const contents = useMemo(() => {
    switch (purpose) {
      case 'contact':
        return {
          title: `여기닷에게 문의하기`,
          subtitle: `추가로 궁금한 내용이 있다면\n‘여기닷’에게 견적요청을 남겨주세요\n전문 컨설턴트가 빠르게 도와드립니다.`,
          primaryButtonText: '정보 입력 후 견적 요청하기',
          secondaryButtonText: '구글 계정으로 로그인',
          secondaryButtonSubText: '(로그인 후 무제한 다운로드)',
        };
      case 'download':
        return {
          title: `견적 받기 전에 잠깐!`,
          subtitle: `견적을 다운로드하려면 발행자 정보 확인이 필요합니다\n정보 입력 또는 로그인 후 이용 가능합니다`,
          primaryButtonText: '정보 입력 후 다운로드',
          secondaryButtonText: '구글 계정으로 로그인',
          secondaryButtonSubText: '(로그인 후 무제한 다운로드)',
        };
      case 'share':
        return {
          title: `공유 전에 잠깐!`,
          subtitle: `견적을 공유하려면 발행자 정보 확인이 필요합니다\n정보 입력 또는 로그인 후 이용 가능합니다`,
          primaryButtonText: '정보 입력 후 공유',
          secondaryButtonText: '구글 계정으로 로그인',
          secondaryButtonSubText: '(로그인 후 무제한 공유)',
        };
      case 'limitReached':
        return {
          title: `오늘의 질문 횟수가 모두 소진되었어요`,
          subtitle: `오늘의 질문을 모두 쓰셨어요!\n아쉬우실까 봐 10회를 더 드렸습니다\n로그인하면 더 많은 횟수로 다양하게 즐겨보실 수 있어요`,
          primaryButtonText: '10회 추가이용',
          secondaryButtonText: '로그인하기',
          secondaryButtonSubText: '',
        };
      case 'limitExceeded':
        return {
          title: `질문 횟수가 모두 소진되었어요`,
          subtitle: `견적이 조금 부족하다고 느껴지셨나요?\n로그인 시 더 많은 질문 횟수로 이용할 수 있어요`,
          // primaryButtonText: '정보 입력 후 견적 요청하기',
          secondaryButtonText: '3초 ! SNS 로그인하기',
          secondaryButtonSubText: '',
        };
      default:
        return {
          title: `간편 구글 로그인으로\n견적을 받아보세요`,
          // subtitle: `추가로 궁금한 내용이 있다면\n‘여기닷’에게 견적요청을 남겨주세요\n전문 컨설턴트가 빠르게 도와드립니다.`,
          // primaryButtonText: '정보 입력 후 견적 요청하기',
          secondaryButtonText: '구글 계정으로 로그인',
          secondaryButtonSubText: '(로그인 후 무제한 다운로드)',
        };
    }
  }, [purpose]);

  if (!$isOpen) {
    return null;
  }

  return (
    <>
      <ModalOverlay
        $isOpen={$isOpen}
        onClick={() => {
          if (isLoading) return;
          onClose();
        }}
      >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledCloseButton onClick={onClose} disabled={isLoading}>
          <CloseIcon />
        </StyledCloseButton>
        <RightPanel>
          <PageSubtitle>복잡한 견적, AI로 간단하게.</PageSubtitle>
          <GradientTitleText>AIGO</GradientTitleText>
          <MainSloganText>{contents.title}</MainSloganText>
          <SubSloganText>{contents.subtitle}</SubSloganText>
          <ButtonGroup>
            {contents.primaryButtonText && (
              <PrimaryButton
                onClick={onPrimaryButtonClick}
                disabled={isLoading}
              >
                {contents.primaryButtonText}
              </PrimaryButton>
            )}
            <SecondaryButton
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
            >
              <img src="/ai-estimate/google.png" alt="Google_logo" style={{ width: '32px', height: '32px' }}/>
              <span> {contents.secondaryButtonText}</span>
            </SecondaryButton>
          </ButtonGroup>

          {loginError && (
            <p style={{ color: 'red', marginTop: '20px', fontSize: '14px' }}>
              {loginError}
            </p>
          )}
        </RightPanel>
      </ModalContent>
    </ModalOverlay>
    <EstimateConfirmModal
      isOpen={showEstimateModal}
      onClose={() => setShowEstimateModal(false)}
      onConfirm={() => {
        setShowEstimateModal(false);
        onPrimaryButtonClick();
      }}
    />
    </>
  );
};