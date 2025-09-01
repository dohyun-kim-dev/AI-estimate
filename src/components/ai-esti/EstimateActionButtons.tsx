"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoChevronForward } from 'react-icons/io5';
import Icon from './Icon';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider'
import TextField from '@/components/common/TextField'
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { requestEstimateConsult } from '@/lib/api/user/userApi';

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
 display:flex;
 align-items:center;
 gap:10px;
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
  width:100%;
  margin-top:30px;
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

const Form = styled.form`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1024px) {
    width: 85%;
    margin-left: auto;
    margin-right: auto;
  }
`;

const Disclaimer = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: #666666;
`;

const SubmitButton = styled.button`
  height: 44px;
  border-radius: 8px;
  background: #2E2E48;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  width: 80%;
  align-self: center;
`;

interface EstimateActionButtonsProps {
  onConsult?: () => void;
  onSubmit?: () => void;
}

const EstimateActionButtons: React.FC<EstimateActionButtonsProps> = ({
  onConsult,
  onSubmit,
}) => {
  const [openConsult, setOpenConsult] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const { success, error } = useToast();
  const { isAuthenticated } = useAuthStore();
  const { messages, chatSessionId } = useChatStore();

  const handleConsultClick = async () => {
    onConsult?.();
    if (isAuthenticated()) {
      // 회원인 경우 바로 API 호출
      await handleSubmit();
    } else {
      // 비회원인 경우 모달 표시
      setOpenConsult(true);
    }
  };

  // 회원일 경우 로컬스토리지에서 정보 불러오기
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // 최종 견적서 데이터 추출
    const lastMessage = messages[messages.length - 1];
    const match = lastMessage?.content?.match(/<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/);
    const estimateData = match ? JSON.parse(match[1]) : null;

    if (!estimateData) {
      error('견적서 정보를 찾을 수 없습니다.');
      setOpenConsult(false);
      return;
    }
    
    // 필수 정보 확인
    const userId = isAuthenticated() ? localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.user?._id : null : localStorage.getItem('guest-uuid');
    const userEmail = isAuthenticated() ? email : e?.target.email?.value;
    const userName = isAuthenticated() ? name : e?.target.name?.value;
    const userPhone = isAuthenticated() ? phone : e?.target.phone?.value;

    if (!userId || !userName || !userEmail || !userPhone || !chatSessionId) {
      error('필수 정보가 누락되었습니다. 다시 시도해 주세요.');
      setOpenConsult(false);
      return;
    }

    const title = estimateData.project_name || '새로운 견적서';
    const estimateFile = `${estimateData.uuid}.pdf`;
    const user = {
      id: userId,
      name: userName,
      cellphone: userPhone,
      email: userEmail
    };

    try {
      const response = await requestEstimateConsult(title, estimateFile, chatSessionId, user);
      if (response.statusCode === 200) {
        success('여기닷에게 상담 요청이 접수되었습니다. 영업일 기준 1일 이내 연락드리겠습니다.');
      } else {
        error(response.error?.customMessage || '상담 요청에 실패했습니다.');
      }
    } catch (e) {
      console.error('상담 요청 API 호출 오류:', e);
      error('상담 요청 중 오류가 발생했습니다.');
    } finally {
      setOpenConsult(false);
    }
  };

  return (
    <ButtonsContainer>
      <ActionButton onClick={handleConsultClick} $isPrimary>
        <LeftContent>
          <TextContent>
            <Flex>
              <IconWrapper>
                <Icon src="/ai-estimate/docs.png" width={24} height={24} />
              </IconWrapper>
              <Title>여기닷에게 상담하기</Title>
            </Flex>
            <Description>해당 견적이 마음에 든다면, <br/>공급사와 최종 견적 상담을 진행해 보세요</Description>
          </TextContent>
        </LeftContent>
        <ChevronIcon size={20} />
        <ActionButtonBottom>상담 요청 하기</ActionButtonBottom>
      </ActionButton>

      <ActionButton onClick={() => onSubmit("AI 예산 줄이기")}>
        <LeftContent>
          <TextContent>
            <Flex>
              <IconWrapper>
                <Icon src="/ai-estimate/trending_down.png" width={24} height={24} />
              </IconWrapper>
              <Title>AI 예산 줄이기</Title>
            </Flex>
            <Description>기능을 간소화 하여 견적가를 <br/>스마트하게 절감</Description>
          </TextContent>
        </LeftContent>
        <ChevronIcon size={20} />
        <ActionButtonBottom $isSecondary>AI 예산 줄이기</ActionButtonBottom>
      </ActionButton>

      <ActionButton onClick={() => onSubmit("AI 맞춤 추천")}>
        <LeftContent>
          <TextContent>
            <Flex>
              <IconWrapper>
                <Icon src="/ai-estimate/awesome.png" width={24} height={24} />
              </IconWrapper>
              <Title>AI 맞춤 추천</Title>
            </Flex>
            <Description>AI가 분석한 필수 기능을 <br/>빠르게 확인</Description>
          </TextContent>
        </LeftContent>
        <ChevronIcon size={20} />
        <ActionButtonBottom $isSecondary>AI 맞춤추천</ActionButtonBottom>
      </ActionButton>

      <Modal open={openConsult} title="필수 정보 입력" centerTitle onClose={() => setOpenConsult(false)} width={520}>
        <div style={{ fontSize: 14, textAlign: 'center'}}>정확한 상담을 위해 필수 정보를 입력해주세요</div>
        <Form onSubmit={handleSubmit}>
          <TextField id="name" label="이름" placeholder="이름을 입력해주세요" required />
          <TextField id="email" label="이메일" type="email" placeholder="이메일을 입력해주세요" required />
          <TextField id="phone" label="전화번호" placeholder="전화번호를 입력해주세요" required maxLength={11} required />
          <Disclaimer>문의 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</Disclaimer>
          <SubmitButton type="submit">문의 접수</SubmitButton>
        </Form>
      </Modal>
    </ButtonsContainer>
  );
};

export default EstimateActionButtons;