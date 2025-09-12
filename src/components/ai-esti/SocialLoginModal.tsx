import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, useMemo, ReactNode } from 'react';
// 인앱 브라우저 감지 함수
function isInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor;
  // 카카오, 네이버, 페이스북, 인스타그램 등 주요 인앱 브라우저 패턴
  return /KAKAOTALK|NAVER|FBAN|FBAV|Instagram|Daum|Line|KAKAO/i.test(ua);
}
import { EstimateConfirmModal } from './EstimateConfirmModal';
import IssuerInfoModal, { IssuerInfo } from './IssuerInfoModal';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/common/ToastProvider';
import { googleLoginInitial, googleLoginUpdate, companyRegister } from '@/lib/api/user/userApi';
import { useGoogleLogin } from '@react-oauth/google';
import { useModalStore } from '@store/modalStore';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  color: ${AppColors.onSurface};
  padding: 60px 0 40px 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 450px;
  // height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  margin: 12px;
`;

const RightPanel = styled.div`
  flex: 1;
  background-color: white;
  padding: 0px 20px ;
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

const Highlight = styled.span`
  color: #2D50FF;
  // font-weight: bold;
`;


const MainSloganText = styled.h3`
  ${AppTextStyles.title1}
  font-size: 24px;
  font-weight: bold;
  color: ${AppColors.onSurface};
  margin-bottom: 20px;
  white-space: pre-line;
  line-height: 1.5;
`;

const SubSloganText = styled.h3`
  ${AppTextStyles.title1}
  font-size: 18px;
  font-weight: 500;
  color: ${AppColors.onSurfaceVariant};
  margin-bottom: 30px;
  white-space: pre-line;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 320px;

`;

const PrimaryButton = styled.button`
  // background-color: #2E2E48;
  // color: white;
  // border: none;
  // border-radius: 8px;
  // padding: 12px 24px;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;

`;


const PrimaryText = styled.span`
  font-size: 12px;
  color: #A9A9A9;
    border-bottom: 1px solid #A9A9A9;

`;

const SecondaryButton = styled.button`
  background-color: #2D50FF;
  color: #FFFFFF;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: background-color 0.2s;
  font-weight: 600;
  width: 100%;
  margin-bottom: 10px;

`;


const StyledCloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 0px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${AppColors.onSurfaceVariant};

  .MuiSvgIcon-root {
    font-size: 20px;
  }

  &:hover {
    color: ${AppColors.onSurface};
  }
`;

interface SocialLoginModalProps {
  $isOpen: boolean;
  onClose: () => void;
  purpose?: 'contact' | 'download' | 'share' | 'limitReached' | 'limitExceeded' | 'shareChat' | 'default';
  onGoogleLoginSuccess?: (userData?: any) => void;  
  onPrimaryButtonClick?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = (props) => {
  const {
    $isOpen,
    onClose,
    purpose,
    onGoogleLoginSuccess = () => {},
    onPrimaryButtonClick,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [openShareChatModal, openShareModal] = useModalStore((s) => [s.openShareChatModal, s.openShareModal]);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  // IssuerInfoModal의 purpose를 별도로 저장
  const [infoModalPurpose, setInfoModalPurpose] = useState<SocialLoginModalProps['purpose']>('default');
  const { login, setUser, persistUser, openAdditionalInfoModal, openEstimateModal } = useAuthStore();
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
        
        // API 에러 처리
        if (initialResponse.statusCode !== 200) {
          const errorMessage = initialResponse.error?.customMessage || initialResponse.error?.message || '로그인에 실패했습니다.';
          throw new Error(errorMessage);
        }
        
        console.log('isNew', initialResponse.data.isNew, initialResponse.data.cellphone);

        if (initialResponse.statusCode === 200) {
          console.log('isNew', initialResponse.data.isNew, initialResponse.data.cellphone);

          
          if (initialResponse.data.isNew || !initialResponse.data.cellphone || initialResponse.data.cellphone === '') {
            // 신규 사용자: 추가 정보 업데이트
            console.log('신규 사용자: 추가 정보 업데이트 시도');
            const userName = `${userInfo.family_name || ''}${userInfo.given_name || ''}`.trim();
            const updateResponse = await googleLoginUpdate({
              providerId: userInfo.sub,
              name: userName,
              email: userInfo.email,
              profileImage: userInfo.picture,
              cellphone: ''  // 추가 정보 모달에서 입력 받을 예정
            });
            
            // API 에러 처리
            if (updateResponse.statusCode !== 200) {
              const errorMessage = updateResponse.error?.customMessage || updateResponse.error?.message || '회원가입 중 오류가 발생했습니다.';
              throw new Error(errorMessage);
            }
            
            // 메모리상에만 사용자 정보 세팅 (아직 로컬 퍼시스트는 하지 않음)
            // setUser(updateResponse.data);

            // 신규 사용자는 추가 정보 모달에서 정보를 입력한 뒤에
            // 고객사 등록 및 로컬 퍼시스트를 수행하도록 처리합니다.
            onClose();
            openAdditionalInfoModal();  // 신규 사용자는 무조건 추가 정보 모달
          } else {
            // 기존 사용자: 로그인 처리
            const userData = initialResponse.data;
            // 메모리상에 사용자 정보 세팅 (퍼시스트는 조건에 따라 수행)
            // setUser(userData);
            // 1. cellphone 체크
            const trimmedCellphone = userData.cellphone ? userData.cellphone.trim() : null;
            const needsAdditionalInfo = !trimmedCellphone || trimmedCellphone.length === 0 || userData.isNew === true;
            console.log('cellphone check:', { cellphone: userData.cellphone, needsAdditionalInfo, isNew: userData.isNew,});

            // 2. 현재 company code 체크
            const pathParts = window.location.pathname.split('/');
            const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
            const currentCompanyCode = (companyCodeIndex > 0 && pathParts.length > companyCodeIndex)
              ? pathParts[companyCodeIndex]
              : 'heredot';

            const userServices = userData.usingService || [];
            const needsCompanyRegistration = !userServices.includes(currentCompanyCode);
            console.log('company check:', { currentCompanyCode, userServices, needsCompanyRegistration });

            if (needsCompanyRegistration) {
              try {
                // 고객사 등록 API 호출
                const registerResponse = await companyRegister();
                console.log('고객사 등록 응답:', registerResponse);
                
                // API 에러 처리
                if (registerResponse.statusCode !== 200) {
                  const errorMessage = registerResponse.error?.customMessage || registerResponse.error?.message || '고객사 등록에 실패했습니다.';
                  console.error('고객사 등록 실패:', errorMessage);
                  // 고객사 등록 실패해도 로그인 프로세스는 계속 진행
                } else {
                  console.log(`고객사 등록 완료: ${currentCompanyCode}`);
                }
              } catch (error) {
                console.error('고객사 등록 API 호출 실패:', error);
                // 고객사 등록 실패해도 로그인 프로세스는 계속 진행
              }
            }

            // 추가 정보가 필요한 경우(휴대폰 없음 등) -> 추가정보 모달 오픈
            if (needsAdditionalInfo) {
              console.log('신규 사용자: 추가 정보 모달 열기 시도');
              console.log('openAdditionalInfoModal 호출 전 상태:', useAuthStore.getState().isAdditionalInfoModalOpen);
              onClose();
              // 구글 사용자 정보를 함께 전달
              openAdditionalInfoModal({
                providerId: userInfo.sub,
                profileImage: userInfo.picture,
                email: userInfo.email,
                name: `${userInfo.family_name}${userInfo.given_name}`
              });
              console.log('openAdditionalInfoModal 호출 후 상태:', useAuthStore.getState().isAdditionalInfoModalOpen);
              console.log('신규 사용자: 추가 정보 모달 열기 완료');
            } else {
              // 추가 정보가 필요 없는 경우
              success('로그인되었습니다!');
              // 조건 만족 시(신규아님 && 휴대폰 존재) 로컬 퍼시스트 수행
              try {
                persistUser(userData);
              } catch (err) {
                console.warn('로컬 퍼시스트 중 오류:', err);
              }
                console.log('onGoogleLoginSuccess =', onGoogleLoginSuccess);
                console.log('purpose =', purpose);
                if(purpose==='share'){
                  props.onShare && props.onShare();
                } 
                if(purpose === 'download'){
                  props.onDownload && props.onDownload();
                }
                if (purpose === 'shareChat') {
                  openShareChatModal();
                }
              if (purpose === 'limitExceeded') {
                openEstimateModal();
              }
              onClose();
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
  
  //  useEffect(() => {
  //   const shouldShowModal = localStorage.getItem('showEstimateModal');
  //   if (shouldShowModal === 'true') {
  //     // 모달 상태를 true로 설정
  //     setShowEstimateModal(true);
      
  //     // ✅ localStorage에서 값 삭제 (중요!)
  //     localStorage.removeItem('showEstimateModal');
  //   }
  // }, []); // 컴

  const contents = useMemo(() => {
    switch (purpose) {
      case 'contact':
        return {
           title: (<>로그인 후 모든 기능​<br />
            <Highlight>무제한 이용​</Highlight> 혜택받기​</>),
          subtitle: `해당 기능을 사용하기 위해서​\n발행자 정보가 필요합니다​`,
          primaryButtonText: '가입없이 이용하기',
          secondaryButtonText: '가입하고 혜택 받기',
          secondaryButtonSubText: '',
        };
      case 'download':
        return {
          title: (<>로그인 후 모든 기능​<br />
            <Highlight>무제한 이용​</Highlight> 혜택받기​</>),
          subtitle: `해당 기능을 사용하기 위해서​\n발행자 정보가 필요합니다​`,
          primaryButtonText: '가입없이 이용하기',
          secondaryButtonText: '가입하고 혜택 받기',
          secondaryButtonSubText: '',
        };
      case 'share':
        return {
          title: (<>로그인 후 모든 기능​<br />
            <Highlight>무제한 이용​</Highlight> 혜택받기​</>),
          subtitle: `해당 기능을 사용하기 위해서​\n발행자 정보가 필요합니다​`,
          primaryButtonText: '가입없이 이용하기',
          secondaryButtonText: '가입하고 혜택 받기',
          secondaryButtonSubText: '',
        };
      case 'limitReached':
        return {
          title:(<>로그인 후 견적 질문​<br/>
           <Highlight> 무제한 이용 ​</Highlight>혜택받기
          </>),
          subtitle: `AIGO 비회원 질문을​ \n모두 사용 하셨네요​`,
          primaryButtonText: '10회 추가 후 더 사용하기',
          secondaryButtonText: '가입하고 혜택 받기',
          secondaryButtonSubText: '',
        };
      case 'limitExceeded':
        return {
           title:(<>로그인 후 견적 질문​<br/>
           <Highlight> 무제한 이용 ​</Highlight>혜택받기
          </>),
          subtitle: `AIGO 비회원 질문을​ \n모두 사용 하셨네요​`,
          primaryButtonText: '가입없이 여기닷에게 무료 상담 받기',
          secondaryButtonText: '가입하고 혜택 받기',
          secondaryButtonSubText: '',
        };
        case 'shareChat': // ✅ 새로운 케이스 추가
        return {
          title: (<>로그인 후 모든 기능​<br />
            <Highlight>무제한 이용​</Highlight> 혜택받기​</>),
          subtitle: `해당 기능을 사용하기 위해서​\n발행자 정보가 필요합니다​`,
          primaryButtonText: '가입없이 이용하기',
          secondaryButtonText: '가입하고 혜택 받기',
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

  if (!$isOpen && !isInfoModalOpen) {
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
            <MainSloganText>{contents.title}</MainSloganText>
            <SubSloganText>{contents.subtitle}</SubSloganText>
            <ButtonGroup>
              <SecondaryButton
                onClick={() => {
                  if (isInAppBrowser()) {
                    if (window.confirm('현재 앱 내 브라우저에서는 소셜 로그인이 원활하지 않을 수 있습니다.\n\n[확인]을 누르면 우저로 새창이 열립니다.')) {
                      const url = window.location.href;
                      const intentUrl = `intent://${url.replace('https://', '')}#Intent;scheme=https;package=com.android.chrome;end`;
                      window.location.href = intentUrl;
                    }
                  } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
                    if (window.confirm('현재 iOS 기기에서는 새 창에서 소셜 로그인이 진행됩니다. 로그인 후 다시 돌아와 주세요.')) {
                      handleGoogleLogin();
                    }
                  } else {
                    handleGoogleLogin();
                  }
                }}
                disabled={isLoading}
              >
                <span> {contents.secondaryButtonText}</span>
              </SecondaryButton>
              {contents.primaryButtonText && (
                <PrimaryButton
                  onClick={() => {
                    if (purpose === 'limitReached') {
                      onPrimaryButtonClick && onPrimaryButtonClick();
                    } else {
                      // IssuerInfoModal을 열 때 현재 purpose를 infoModalPurpose로 저장
                      setInfoModalPurpose(purpose);
                      onClose();
                      setIsInfoModalOpen(true);
                    }
                  }}
                  disabled={isLoading}
                >
                  <PrimaryText>{contents.primaryButtonText}</PrimaryText>
                </PrimaryButton>
              )}
            </ButtonGroup>
            {loginError && (
              <p style={{ color: 'red', marginTop: '20px', fontSize: '14px' }}>
                {loginError}
              </p>
            )}
          </RightPanel>
        </ModalContent>
      </ModalOverlay>
      <IssuerInfoModal
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSubmit={async (info: IssuerInfo) => {
          // infoModalPurpose를 기준으로 분기 처리
          if (infoModalPurpose === 'contact') {
            console.log('[IssuerInfoModal submit] purpose: contact', info);
          } else if (infoModalPurpose === 'download') {
            console.log('[IssuerInfoModal submit] purpose: download', info);
            props.onDownload && props.onDownload();
          } else if (infoModalPurpose === 'share') {
            console.log('[IssuerInfoModal submit] purpose: share', info);
            props.onShare && props.onShare();
          } else if (infoModalPurpose === 'limitReached') {
            console.log('[IssuerInfoModal submit] purpose: limitReached', info);
          } else if (infoModalPurpose === 'limitExceeded') {
            console.log('[IssuerInfoModal submit] purpose: limitExceeded', info);
            // ai-chat-storage에서 가장 최근 estimateId 추출
            try {
              const chatStorage = sessionStorage.getItem('ai-chat-storage');
              if (chatStorage) {
                const parsed = JSON.parse(chatStorage);
                const messages = parsed?.state?.messages || [];
                // 뒤에서부터 estimateId 있는 메시지 찾기
                let lastEstimateId = null;
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i]?.estimateId) {
                    lastEstimateId = messages[i].estimateId;
                    break;
                  }
                }
                if (lastEstimateId) {
                  // requestEstimateConsult 호출
                  const user = {
                    id: '', // 비회원이므로 id는 빈값
                    name: info.name,
                    cellphone: info.cellphone,
                    email: info.email,
                  };
                  
                  try {
                    const { requestEstimateConsult } = await import('@/lib/api/user/userApi');
                    const consultResponse = await requestEstimateConsult(lastEstimateId, '', '', user);
                    
                    // API 에러 처리
                    if (consultResponse.statusCode !== 200) {
                      const errorMessage = consultResponse.error?.customMessage || consultResponse.error?.message || '상담 요청에 실패했습니다.';
                      console.error('상담 요청 실패:', errorMessage);
                      showError('상담 요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
                    } else {
                      success('상담 요청이 완료되었습니다!');
                    }
                  } catch (error) {
                    console.error('상담 요청 처리 중 오류:', error);
                    showError('상담 요청 처리 중 오류가 발생했습니다.');
                  }
                }
              }
            } catch (e) {
              console.error('limitExceeded 상담 요청 처리 오류:', e);
            }
          } else if (infoModalPurpose === 'shareChat') {
            console.log('[IssuerInfoModal submit] purpose: shareChat', infoModalPurpose, info);
            openShareChatModal();
          } else if (infoModalPurpose === 'default') {
            console.log('[IssuerInfoModal submit] purpose: default', info);
          } else {
            console.log('[IssuerInfoModal submit] purpose: unknown', infoModalPurpose, info);
          }
          setIsInfoModalOpen(false);
        }}
      />
    </>
  );
};