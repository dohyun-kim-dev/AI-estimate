// src/app/ai-estimate/components/EstimateActionButtons.tsx
"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { IoChevronForward } from 'react-icons/io5';
import Icon from './Icon';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider'
import TextField from '@/components/common/TextField'

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 1024px) {
    margin-top: 0;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.surface1};
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
    margin-bottom: 50px;
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

const ActionButtonBottom = styled.div`
  display: none;
  
  @media (min-width: 1024px) {
  width:100%;
  margin-top:30px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    background-color: ${({ theme }) => theme.accent};
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
  onAiEstimate?: () => void;
  onAiOptimize?: () => void;
}

const EstimateActionButtons: React.FC<EstimateActionButtonsProps> = ({
  onConsult,
  onAiEstimate,
  onAiOptimize
}) => {
  const [openConsult, setOpenConsult] = useState(false)
  const { success } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpenConsult(false)
    success('문의가 접수되었습니다.')
  }

  return (
    <ButtonsContainer>
      <ActionButton onClick={() => { setOpenConsult(true); onConsult?.() }}>
        <LeftContent>
          <TextContent>
          <Flex>
          <IconWrapper>
            <Icon src="/ai-estimate/docs.png" width={24} height={24} />
          </IconWrapper><Title>여기닷에게 문의하기</Title>
          </Flex>

            <Description>대표님의 예산에 맞춘 기능들을 
            견적으로 <br></br>자세히 받아보세요 ~ 등등</Description>
                    </TextContent>
          </LeftContent>
          <ChevronIcon size={20} />
          <ActionButtonBottom>문의하기</ActionButtonBottom>
        </ActionButton>

        <ActionButton onClick={onAiEstimate}>
          <LeftContent>
            <TextContent>
            <Flex>
            <IconWrapper>
              <Icon src="/ai-estimate/trending_down.png" width={24} height={24} />
            </IconWrapper><Title>AI 예산 줄이기</Title>
            </Flex>

              <Description>기능을 조소화 하여 전략기준 <br></br>스마트하게 줄임</Description>
            </TextContent>
          </LeftContent>
          <ChevronIcon size={20} />
          <ActionButtonBottom>AI 예산 줄이기</ActionButtonBottom>
        </ActionButton>

        <ActionButton onClick={onAiOptimize}>
          <LeftContent>
            <TextContent>
            <Flex>
            <IconWrapper>
              <Icon src="/ai-estimate/awesome.png" width={24} height={24} />
            </IconWrapper><Title>AI 맞춤 추천</Title>
            </Flex>

              <Description>AI가 문제된 필수 기능들을 빠르게 제안,<br></br> 사업성장에 핵심기능들 추천</Description>
            </TextContent>
          </LeftContent>
          <ChevronIcon size={20} />
          <ActionButtonBottom>AI 맞춤추천</ActionButtonBottom>
        </ActionButton>

        <Modal open={openConsult} title="필수 정보 입력" centerTitle onClose={() => setOpenConsult(false)} width={520}>
          <div style={{ fontSize: 14, textAlign: 'center'}}>정확한 상담을 위해 필수 정보를 입력해주세요</div>
          <Form onSubmit={handleSubmit}>
            <TextField id="name" label="이름" placeholder="이름을 입력해주세요" required />
            <TextField id="email" label="이메일" type="email" placeholder="이메일을 입력해주세요" required />
            <TextField id="phone" label="전화번호" placeholder="전화번호를 입력해주세요" required />
            <Disclaimer>문의 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</Disclaimer>
            <SubmitButton type="submit">문의 접수</SubmitButton>
          </Form>
        </Modal>
    </ButtonsContainer>
  );
};

export default EstimateActionButtons;