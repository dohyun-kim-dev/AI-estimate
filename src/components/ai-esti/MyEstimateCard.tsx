"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import Icon from './Icon';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { getDownloadEstimateUrlWithUserInfo } from '@/lib/api/user/userApi';
import { v4 as uuidv4 } from 'uuid';

const CardWrapper = styled.div`
  background-color: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  overflow: hidden;
  margin: 12px 0;
  padding: 20px;
`;

const Header = styled.div`

`;

  const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 20px 0;
`;

const SubText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin: 0 0 8px 0;
`;
const Title = styled.h2`
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 1.4;
  max-height: calc(1.4em * 2); /* 2줄까지만 표시 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 최대 줄 수 */
  -webkit-box-orient: vertical;
  word-break: break-word; /* 긴 단어도 줄바꿈 처리 */
`;


const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Price = styled.p`
  font-size: 20px;
font-style: normal;
font-weight: 700;
line-height: normal;
letter-spacing: 0.4px;
  margin: 0 0 8px 0;
  
  span {
    font-size: 0.7em;
    font-weight: normal;
    color: ${({ theme }) => theme.subtleText};
    margin-left: 8px;
  }
`;

const Period = styled.p`
  font-size: 16px;
font-style: normal;
font-weight: 700;
line-height: normal;
letter-spacing: 0.32px;
  color: ${({ theme }) => theme.text};
  margin: 0 0 24px 0;

  .p {
  font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: normal;
letter-spacing: 0.24px;
color: ${({ theme }) => theme.subtleText};
}
`;

const ActionButtons = styled.div`

  display: flex;
  gap: 10px;
  padding-top: 0px;
`;

const Line = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border};
  `;

const ActionButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  height: 36px;
  border: none;
  background-color: ${({ theme }) => theme.cardButton };
  color: ${({ theme, primary }) => (primary ? (theme.body) : theme.text)};
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; 
  letter-spacing: 0.28px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const ShareInput = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;

  input {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
    padding: 0 12px;
  }

  button {
    height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    background: #2E2E48;
    color: white;
    font-size: 14px;
font-style: normal;
font-weight: 400;
line-height: 160%;
letter-spacing: 0.32px;
  }
`;

interface MyEstimateCardProps {
  estimate: {
    project_name: string;
    created_at: string;
    file: string; // uuid 대신 file로 변경
  };
  downloadUrl: string;
}

const MyEstimateCard: React.FC<MyEstimateCardProps> = ({ estimate, downloadUrl }) => {
  const [openShare, setOpenShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { success, error } = useToast();
  const { isAuthenticated } = useAuthStore();

  const getCompanyCode = () => {
    const pathParts = window.location.pathname.split('/');
    const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
    return (companyCodeIndex > 0 && pathParts.length > companyCodeIndex)
      ? pathParts[companyCodeIndex]
      : 'heredot';
  };

  const companyCode = getCompanyCode();


const handleShareClick = () => {
  setOpenShare(true);

  const fileUuid = estimate.file.split('.')[0];
  
  if (isAuthenticated()) {
    const authStorage = localStorage.getItem('auth-storage');
    const authData = authStorage ? JSON.parse(authStorage) : null;
    const user = authData?.state?.user;

    if (user) {
      // 회원인 경우: 사용자 id만 포함하여 URL 생성
      const newShareUrl = `${window.location.origin}${getDownloadEstimateUrlWithUserInfo(
        companyCode,
        fileUuid,
        {
          id: user._id,
          name: '',
          email: '',
          cellphone: ''
        }
      )}`;
      setShareUrl(newShareUrl);
    } else {
      error('사용자 정보를 찾을 수 없습니다.');
    }
  } else {
    // 비회원인 경우: 기존 로직 유지
    let guestUuid = localStorage.getItem('guest-uuid');
    if (!guestUuid) {
      guestUuid = uuidv4();
      localStorage.setItem('guest-uuid', guestUuid);
    }
    const newShareUrl = `${window.location.origin}/api/file/estimate/download/${companyCode}/${fileUuid}.pdf?id=${guestUuid}`;
    setShareUrl(newShareUrl);
  }
};

  const handleCopy = async () => {
    try {
      if (shareUrl) {
        const additionalInfo = `${shareUrl}
본 링크는 에이고(AIGO - AI 견적서)에서 
발급된 링크입니다.

회사명 : 주식회사 여기닷

전화문의 : 031-111-1234

링크주소 : https://heredotcorp.com/ai`;
        await navigator.clipboard.writeText(additionalInfo);
        success('링크가 복사되었습니다.');
        setOpenShare(false);
      }
    } catch {
      error('링크 복사에 실패했습니다.');
    }
  };
  
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <CardWrapper>
      <Header>
        <SubText>{estimate.created_at}</SubText>
        <Flex>
          <Title>{estimate.project_name}</Title>
        </Flex>
        <ActionButtons>
          <ActionButton onClick={handleShareClick}>견적 공유하기</ActionButton>
          <ActionButton onClick={handleDownload}>견적 PDF 받기</ActionButton>
        </ActionButtons>
      </Header>
      <Modal open={openShare} title="견적서 공유" onClose={() => setOpenShare(false)} width={520}>
        <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>공유받은 사용자는 견적 내용을 확인할 수 있습니다.</div>
        <ShareInput>
          <input readOnly value={shareUrl} placeholder="https://aigocorp.com/id..." />
          <button onClick={handleCopy}>링크복사</button>
        </ShareInput>
      </Modal>
    </CardWrapper>
  );
};

export default MyEstimateCard;