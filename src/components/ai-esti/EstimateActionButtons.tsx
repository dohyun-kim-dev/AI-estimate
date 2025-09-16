"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { IoChevronForward } from 'react-icons/io5';
import Icon from './Icon';
import { useToast } from '@/components/common/ToastProvider'
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { requestEstimateConsult } from '@/lib/api/user/userApi';
import { useLocation } from 'react-router-dom';
import IssuerInfoModal, { IssuerInfo } from '@/components/ai-esti/IssuerInfoModal';
import { SocialLoginModal } from '@/components/ai-esti/SocialLoginModal';

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  @media (min-width: 1024px) {
    margin-top: 0;
  }
`;

const ActionButton = styled.button<{ $isPrimary?: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 12px;
  background-color: ${({ theme, $isPrimary }) => $isPrimary ? theme.primaryButton : theme.surface2};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  @media (min-width: 1024px) {
    padding: 24px;
    min-height: 120px;
    flex-direction: column;
  }

  &:hover {
    background-color: ${({ theme }) => theme.pick};
  }
`;

const LeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};

  @media (min-width: 1024px) {
    font-size: 20px;
  }
`;

const Description = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  opacity: 0.8;
  width: 100%;
  line-height: 1.4;
  white-space: pre-line;
  text-align: left;
  margin-top: 4px;

  @media (min-width: 1024px) {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
`;

const ChevronIcon = styled(IoChevronForward)`
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);

  @media (min-width: 1024px) {
    display: none;
  }
`;

const ActionButtonBottom = styled.div<{ $isSecondary?: boolean }>`
  display: none;
  
  @media (min-width: 1024px) {
    width: 100%;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    background-color: ${({ theme, $isSecondary }) => 
      $isSecondary 
        ? (theme.body === '#FFFFFF' ? '#2E2E48' : '#668EC0') 
        : theme.buttonBottom
    };
    color: white;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.2s ease;

    &:hover { 
      opacity: 0.9;
    }
  }
`;

interface EstimateActionButtonsProps {
  onConsult?: () => void;
  onSubmit?: (action: "AI 예산 줄이기" | "AI 맞춤 추천") => void;
}

const EstimateActionButtons: React.FC<EstimateActionButtonsProps> = ({
  onConsult,
  onSubmit,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false); // ✅ 추가: 소셜 로그인 모달 상태
  const [socialLoginPurpose, setSocialLoginPurpose] = useState<'consult' | null>(null); // ✅ 추가: 목적 상태
  const [name, setName] = useState('');   // 로그인 사용자 프리필 용
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { success, error } = useToast();
  const { isAuthenticated } = useAuthStore();
  const { messages } = useChatStore();
  const location = useLocation();

  // 세션 ID를 로컬스토리지에서 가져오는 함수 (useChatActions.ts와 동일한 로직)
  const getEffectiveSessionId = (): string | null => {
    // URL 파라미터에서 sessionId 확인
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('sessionId');
    if (urlSessionId) return urlSessionId;

    // useChatStore의 chatSessionId 확인
    const storeSessionId = useChatStore.getState().chatSessionId;
    if (storeSessionId) return storeSessionId;

    // localStorage에서 확인
    const localSessionId = localStorage.getItem('chatSessionId');
    if (localSessionId) return localSessionId;

    // sessionStorage에서 확인 (최후 수단)
    const sessionSessionId = sessionStorage.getItem('chatSessionId');
    if (sessionSessionId) return sessionSessionId;

    return null;
  };

  // 공유 페이지 여부
  const isSharePage = useMemo(() => {
    const url = `${location.pathname}${location.search}${location.hash}`.toLowerCase();
    return url.includes('share');
  }, [location]);

  // 로그인 시 로컬스토리지에서 사용자 정보 프리필
  useEffect(() => {
    if (isAuthenticated()) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const user = authData.state?.user;
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.cellphone || '');
        }
      }
    }
  }, [isAuthenticated]);

  // 상담 버튼 클릭
  const handleConsultClick = async () => {
    onConsult?.();
    if (isAuthenticated()) {
      // 회원은 바로 API 호출
      await handleSubmit();
    } else {
      // ✅ 수정: 비회원일 때 소셜 로그인 모달 띄움
      setSocialLoginPurpose('consult');
      setIsSocialLoginModalOpen(true);
    }
  };

  // 소셜 로그인 모달에서 기본 버튼 클릭 → 발행자 정보 입력 모달 오픈
  const handlePrimaryButtonClick = () => {
    setIsSocialLoginModalOpen(false);
    setIsInfoModalOpen(true);
  };

  // 소셜 로그인 성공 시 바로 문의 API 호출
  const handleSocialLoginSuccess = async () => {
    setIsSocialLoginModalOpen(false);
    await handleSubmit(); // ✅ 소셜 로그인 성공 시 바로 문의 API 호출
  };

  // 상담 요청 공통 처리: 로그인/비로그인 모두 지원
  const handleSubmit = async (info?: IssuerInfo) => {
    // 최종 견적서 데이터 추출
    const lastMessage = messages[messages.length - 1];
    const match = lastMessage?.content?.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    const estimateData = match ? JSON.parse(match[1]) : null;

    if (!estimateData) {
      error('견적서 정보를 찾을 수 없습니다.');
      setIsInfoModalOpen(false);
      return;
    }

    // 필수 정보 구성
    const authed = isAuthenticated();
    const userId = authed
      ? (localStorage.getItem('auth-storage')
          ? JSON.parse(localStorage.getItem('auth-storage') as string).state?.user?._id
          : null)
      : localStorage.getItem('guest-uuid');

    const userName  = authed ? name  : info?.name;
    const userEmail = authed ? email : info?.email;
    const userPhone = authed ? phone : info?.cellphone;
    const chatSessionId = getEffectiveSessionId();

    if (!userId || !userName || !userEmail || !userPhone || !chatSessionId) {
      console.log("userId,userName,userEmail,userPhone,chatSessionId", { userId, userName, userEmail, userPhone, chatSessionId });
      error('필수 정보가 누락되었습니다. 다시 시도해 주세요.');
      setIsInfoModalOpen(false);
      return;
    }

    const title = estimateData.project_name || '새로운 견적서';
    // 서버에서 pdf 생성 규칙이 uuid.pdf라면 다음과 같이 사용
    const estimateFile = `${estimateData.uuid}.pdf`;
    const user = {
      id: userId,
      name: userName,
      cellphone: userPhone,
      email: userEmail,
    };

    try {
      const response = await requestEstimateConsult(estimateData.uuid, title, chatSessionId, user);
      if (response.statusCode === 200) {
        success('정상 접수 되었습니다');
      } else {
        error(response.error?.customMessage || '상담 요청에 실패했습니다.');
      }
    } catch (e) {
      console.error('상담 요청 API 호출 오류:', e);
      error('상담 요청 중 오류가 발생했습니다.');
    } finally {
      setIsInfoModalOpen(false);
    }
  };

  return (
    <ButtonsContainer>
{!isSharePage && (
  <>
      <ActionButton onClick={handleConsultClick} $isPrimary>
        <LeftContent>
          <TextContent>
            <Flex>
              <IconWrapper>
                <Icon src="/ai-estimate/docs.png" width={24} height={24} />
              </IconWrapper>
              <Title>여기닷에게 상담하기</Title>
            </Flex>
            <Description>
              해당 견적이 마음에 든다면, <br/>공급사와 최종 견적 상담을 <br/>진행해 보세요
            </Description>
          </TextContent>
        </LeftContent>
        <ChevronIcon size={20} />
        <ActionButtonBottom>상담 요청 하기</ActionButtonBottom>
      </ActionButton>
     
          <ActionButton onClick={() => onSubmit?.("AI 예산 줄이기")}>
            <LeftContent>
              <TextContent>
                <Flex>
                  <IconWrapper>
                    <Icon src="/ai-estimate/trending_down.png" width={24} height={24} />
                  </IconWrapper>
                  <Title>AI 예산 줄이기</Title>
                </Flex>
                <Description>
                  기능을 간소화 하여 견적가를 <br/>스마트하게 절감
                </Description>
              </TextContent>
            </LeftContent>
            <ChevronIcon size={20} />
            <ActionButtonBottom $isSecondary>AI 예산 줄이기</ActionButtonBottom>
          </ActionButton>

          <ActionButton onClick={() => onSubmit?.("AI 맞춤 추천")}>
            <LeftContent>
              <TextContent>
                <Flex>
                  <IconWrapper>
                    <Icon src="/ai-estimate/awesome.png" width={24} height={24} />
                  </IconWrapper>
                  <Title>AI 맞춤 추천</Title>
                </Flex>
                <Description>
                  AI가 분석한 필수 기능을 <br/>빠르게 확인
                </Description>
              </TextContent>
            </LeftContent>
            <ChevronIcon size={20} />
            <ActionButtonBottom $isSecondary>AI 맞춤추천</ActionButtonBottom>
          </ActionButton>
        </> 
      )}

      {/* ✅ 비회원일 때 띄우는 발행자 정보 입력 모달 */}
      <IssuerInfoModal
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSubmit={(info) => handleSubmit(info)}
      />

      {/* ✅ 추가: 소셜 로그인 모달 */}
      <SocialLoginModal
        $isOpen={isSocialLoginModalOpen}
        onClose={() => setIsSocialLoginModalOpen(false)}
        purpose={socialLoginPurpose || 'consult'}
        onPrimaryButtonClick={handlePrimaryButtonClick}
        onGoogleLoginSuccess={handleSocialLoginSuccess}
        onIssuerInfoSubmit={handleSubmit}
      />
    </ButtonsContainer>
  );
};

export default EstimateActionButtons;
