"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import Icon from './Icon';
import { useModalStore } from '@/store/modalStore';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { getDownloadEstimateUrlWithUserInfo } from '@/lib/api/user/userApi';
import { buildFullEstimateData } from '@/hooks/estimate';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../common/Modal';
import { es } from 'date-fns/locale';

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
    _id:string;
    project_name: string;
    created_at: string;
    file: string; // uuid 대신 file로 변경
  };
  downloadUrl: string;
}


const MyEstimateCard: React.FC<MyEstimateCardProps> = ({ estimate, downloadUrl }) => {
  const { openShareModal } = useModalStore();
  const { success, error } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [shareUrl, setShareUrl] = useState('');
  const [openShare, setOpenShare] = useState(false);

  const getCompanyCode = () => {
    const pathParts = window.location.pathname.split('/');
    const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
    return (companyCodeIndex > 0 && pathParts.length > companyCodeIndex)
      ? pathParts[companyCodeIndex]
      : 'heredot';
  };
  const companyCode = getCompanyCode();

  async function ensureUuidOnce(estimateObj: any, title: string) {
    if (estimateObj?.uuid) return estimateObj.uuid;

    // 유저 정보 추출
    let userId = '';
    let name = '';
    let email = '';
    let cellphone = '';
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      userId = authData?.state?.user?.id || authData?.state?.user?._id || '';
      name = authData?.state?.user?.name || '';
      email = authData?.state?.user?.email || '';
      cellphone = authData?.state?.user?.cellphone || '';
    }
    if (!userId) {
      userId = localStorage.getItem('guest-uuid') || '';
    }
    if (!userId) throw new Error('사용자 ID가 없습니다.');


    // getDownloadEstimateUrlWithUserInfo는 URL만 반환하므로, 실제로 호출을 발생시켜야 함
    const url = getDownloadEstimateUrlWithUserInfo(
      companyCode,
      estimateObj._id,
      { id: userId, name, email, cellphone }
    );
    try {
      await fetch(url, { method: 'GET' });

      console.log("다운로드 카운트 성공")
    } catch (e) {
      // 실패해도 무시 (카운트/내역 목적)
      console.log("다운로드 카운트 실패 ")
    }

    if (!estimateObj._id) throw new Error('uuid 보장 실패');
    if (estimate._id) {
      console.log("estimate._id:", estimate._id);
    }
    return estimate._id as string;
  }


  const ensureUuidAndGetUrl = async () => {
    const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
    return `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
  };


 const openPreviewTab = async () => {
    try {
      const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
      const previewUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
      window.open(previewUrl, '_blank');
      console.log("estimate:", ensuredUuid);
      success('PDF 미리보기 페이지가 새 탭에서 열립니다.');
    } catch (err) {
      console.error('PDF 미리보기 오픈 중 오류:', err);
      console.log("estimate:", estimate);
      error('PDF 미리보기 오픈에 실패했습니다.');
    }
  };

  const handleShareClick = async () => {
    // 공유는 새탭을 열지 않고 링크만 생성
    console.log("공유 클릭 estimate:", estimate);
    const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
    const newShareUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
    setShareUrl(newShareUrl);
    setOpenShare(true);
  };

  const handleDownload = async () => {
    await openPreviewTab();
  };


  const handleCopy = async () => {
    try {
      const textToCopy = `${shareUrl}


⏫위 링크 클릭 시 에이고가 발급한 견적서로 이동합니다

🏢공급사명 : 주식회사 여기닷
 
📞전화문의 : 031-111-1234
 
※ 위 견적서는 공급사 공식 홈페이지에서도 조회할 수 있습니다
 
🌐공급사 홈페이지
https://heredotcorp.com
`;
      await navigator.clipboard.writeText(textToCopy);
      success('링크가 복사되었습니다.');
      setOpenShare(false);
    } catch {
      error('링크 복사에 실패했습니다.');
    }
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
  {/* 공유 모달은 전역 상태로 관리 (App에서 렌더) */}


  <Modal open={openShare} title="견적서 공유" onClose={() => setOpenShare(false)} width={520}>
          <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>
            공유받은 사용자는 견적 내용을 확인할 수 있습니다.
          </div>
          <ShareInput>
            <input readOnly value={shareUrl} placeholder="https://aigocorp.com/id..." />
            <button onClick={handleCopy}>링크복사</button>
          </ShareInput>
        </Modal>
    </CardWrapper>
  );
};

export default MyEstimateCard;