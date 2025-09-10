"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import Icon from './Icon';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
import { generatePDF } from '@/hooks/pdfUtils';
import { useAuthStore } from '@/store/authStore';
import { v4 as uuidv4 } from 'uuid';
import { SocialLoginModal } from './SocialLoginModal';
import { useNavigate } from 'react-router-dom';
import { getDownloadEstimateUrlWithUserInfo, googleLoginInitial, googleLoginUpdate, uploadEstimatePdf } from '@/lib/api/user/userApi';
import { buildFullEstimateData } from '@/hooks/estimate';
import IssuerInfoModal, { IssuerInfo } from '@/components/ai-esti/IssuerInfoModal';

const CardWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
  padding: 20px 12px;
`;

const Header = styled.div`
  padding: 0px;
`;

const Flex = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 0 0 18px 0;
`;

const Title = styled.h2`
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
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

interface EstimateCardProps {
  estimate: ProjectEstimate;
  discountedPrice?: number;
  projectPeriod?: number;
}

const EstimateCard: React.FC<EstimateCardProps> = ({ estimate, discountedPrice, projectPeriod = 0}) => {
  const [openShare, setOpenShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false);
  const [socialLoginPurpose, setSocialLoginPurpose] = useState<'share' | 'download' | null>(null);

  // ✅ 새로 추가: 발행자 정보 입력 모달
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [pendingPurpose, setPendingPurpose] = useState<'share' | 'download' | null>(null);

  const { success, error } = useToast();
  const { isDarkMode } = useThemeStore();
  const { isAuthenticated, login, openAdditionalInfoModal } = useAuthStore();
  const navigate = useNavigate();

  const getCompanyCode = () => {
    const pathParts = window.location.pathname.split('/');
    const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
    return (companyCodeIndex > 0 && pathParts.length > companyCodeIndex)
      ? pathParts[companyCodeIndex]
      : 'heredot';
  };
  const companyCode = getCompanyCode();

  // 로그인 사용자 프리필용
  const [prefill, setPrefill] = useState<{name: string; email: string; cellphone: string}>({
    name: '', email: '', cellphone: ''
  });

  useEffect(() => {
    if (isAuthenticated()) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const user = authData.state?.user;
        if (user) {
          setPrefill({
            name: user.name || '',
            email: user.email || '',
            cellphone: user.cellphone || '',
          });
        }
      }
    }
  }, [isAuthenticated]);

  
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
      console.log("다운로드 카운트 실패 ")
      }
  
      if (!estimateObj._id) throw new Error('uuid 보장 실패');
      console.log("estimateObj._id:", estimateObj._id);
      return estimateObj._id as string;
    }
  


  const ensureUuidAndGetUrl = async () => {
    const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
    return `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
  };


  // 미리보기 새탭 오픈 (다운로드/공유 공용)
  const openPreviewTab = async () => {
    try {
      const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
      const previewUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
      window.open(previewUrl, '_blank');
      success('PDF 미리보기 페이지가 새 탭에서 열립니다.');
    } catch (err) {
      console.error('PDF 미리보기 오픈 중 오류:', err);
      error('PDF 미리보기 오픈에 실패했습니다.');
    }
  };

  // 다운로드: 로그인 사용자는 바로, 아니면 로그인모달 → 정보입력모달
  const handleGeneratePDF = async () => {
    if (isAuthenticated()) {
      await openPreviewTab();
      return;
    } else {
      setSocialLoginPurpose('download');
      setIsSocialLoginModalOpen(true);
      return;
    }
  };

  const handleShareClick = async () => {
    if (!estimate) {
      error('공유 가능한 견적서가 아닙니다.');
      return;
    }
    if (isAuthenticated()) {
      const newShareUrl = await ensureUuidAndGetUrl();
        setShareUrl(newShareUrl);
        setOpenShare(true);
    } else {
      setSocialLoginPurpose('share');
      setIsSocialLoginModalOpen(true);
    }
  };

  // 소셜 로그인 모달에서 기본 버튼 클릭 → 발행자 정보 입력 모달 오픈
  const handlePrimaryButtonClick = () => {
    setIsSocialLoginModalOpen(false);
    if (socialLoginPurpose === 'share' || socialLoginPurpose === 'download') {
      setPendingPurpose(socialLoginPurpose);
      setIsInfoModalOpen(true);
    }
  };

  // 발행자 정보 제출 후 분기 처리
  const handleIssuerInfoSubmit = async (info: IssuerInfo) => {
    try {
      // 게스트 UUID 보장
      let guestUuid = localStorage.getItem('guest-uuid');
      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guest-uuid', guestUuid);
      }

      const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');

      if (pendingPurpose === 'download') {
        const previewUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
        window.open(previewUrl, '_blank');
        success('PDF 미리보기 페이지가 새 탭에서 열립니다.');
      } else if (pendingPurpose === 'share') {
        const newShareUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
        setShareUrl(newShareUrl);
        setOpenShare(true);
        success('공유 링크가 생성되었습니다!');
      }
    } catch (err) {
      console.error('발행자 정보 처리 중 오류:', err);
      error('요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsInfoModalOpen(false);
      setPendingPurpose(null);
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = `주식회사 여기닷에서 발급된 견적서를 다운로드해보세요 !
 
${shareUrl}

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

  const handleSocialLoginSuccess = async (tokenResponse: any) => {
    try {
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }
      );
      const userInfo = await userInfoResponse.json();

      const initialResponse = await googleLoginInitial({ providerId: userInfo.sub });

      if (initialResponse.statusCode === 200) {
        if (initialResponse.data.isNew) {
          const updateResponse = await googleLoginUpdate({
            providerId: userInfo.sub,
            name: [userInfo.family_name, userInfo.given_name].filter(Boolean).join(''),
            email: userInfo.email,
            profileImage: userInfo.picture,
          });

          if (updateResponse.statusCode === 200) {
            await login(updateResponse.data);
            setIsSocialLoginModalOpen(false);
            openAdditionalInfoModal();
          } else {
            throw new Error(updateResponse.error?.message || '회원가입 중 오류가 발생했습니다.');
          }
        } else {
          await login(initialResponse.data);
          setIsSocialLoginModalOpen(false);
          success('로그인되었습니다!');

          // 로그인 후 목적대로 바로 진행
          if (socialLoginPurpose === 'download') {
            const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
            const previewUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
            window.open(previewUrl, '_blank');
          } else if (socialLoginPurpose === 'share') {
            await handleShareClick();
          }
        }
      } else {
        throw new Error(initialResponse.error?.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('Google 로그인 후 처리 에러:', err);
      error('로그인 후 처리 중 오류가 발생했습니다.');
      throw err;
    }
  };

  // 기간 안전 표시
  const estimatedPeriod = parseInt(estimate.estimated_period) || 0;
  const safeProjectPeriod = projectPeriod || 0;
  const weekValue = estimatedPeriod + safeProjectPeriod;
  const weeksPerMonth = 4.345;
  const monthValue = Math.ceil(weekValue / weeksPerMonth);
  const displayPeriod = `(약 ${monthValue}개월)`;

  return (
    <CardWrapper>
      <Header>
        <Flex>
          <Title>{estimate.project_name}</Title>
          <Right>
            <span style={{ display: 'flex', gap: '8px' }}>
              <Icon
                onClick={handleShareClick}
                src={isDarkMode ? '/ai-estimate/share2_dark.png' : '/ai-estimate/share2_light.png'}
                width={36}
                height={36}
              />
              <Icon
                onClick={handleGeneratePDF}
                src={isDarkMode ? '/ai-estimate/download_dark.png' : '/ai-estimate/download_light.png'}
                width={36}
                height={36}
              />
            </span>
          </Right>
        </Flex>
        <Price>
          KRW {new Intl.NumberFormat('ko-KR').format(discountedPrice || 0)}
          <span>(부가세 별도)</span>
        </Price>
        <Period>
          <span style={{ marginRight: '4px' }}>
            {(parseInt(estimate.estimated_period) || 0) + (projectPeriod || 0)}주
          </span>
          <span className="p">{displayPeriod}</span>
        </Period>
      </Header>

      {/* 공유 링크 표시 모달 (그대로 유지) */}
      <Modal open={openShare} title="견적서 공유" onClose={() => setOpenShare(false)} width={520}>
        <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>
          공유받은 사용자는 견적 내용을 확인할 수 있습니다.
        </div>
        <ShareInput>
          <input readOnly value={shareUrl} placeholder="https://aigocorp.com/id..." />
          <button onClick={handleCopy}>링크복사</button>
        </ShareInput>
      </Modal>

      {/* ✅ 발행자 정보 입력 모달 (다운로드/공유 공용) */}
      <IssuerInfoModal
        open={isInfoModalOpen}
        onClose={() => { setIsInfoModalOpen(false); setPendingPurpose(null); }}
        onSubmit={handleIssuerInfoSubmit}
        initial={prefill}   // 로그인 정보가 있으면 프리필
      />

      {/* 소셜 로그인 모달 (비회원 유도 → 기본버튼 클릭 시 IssuerInfoModal 오픈) */}
      <SocialLoginModal
        $isOpen={isSocialLoginModalOpen}
        onClose={() => setIsSocialLoginModalOpen(false)}
        purpose={socialLoginPurpose || 'share'}
        onPrimaryButtonClick={handlePrimaryButtonClick}
        onGoogleLoginSuccess={handleSocialLoginSuccess}
        onDownload={openPreviewTab}
        onShare={openPreviewTab}
      />
    </CardWrapper>
  );
};

export default EstimateCard;
