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
import TextField from '@/components/common/TextField';
import { SocialLoginModal } from './SocialLoginModal';
import { useNavigate } from 'react-router-dom';
import { googleLoginInitial, googleLoginUpdate, uploadEstimatePdf } from '@/lib/api/user/userApi';
import { buildFullEstimateData } from '@/hooks/estimate';

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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 4px;
`;

const Line = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border};
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme, primary }) => (primary ? theme.accent : 'transparent')};
  color: ${({ theme, primary }) => (primary ? theme.body : theme.accent)};
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
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

const Form = styled.form`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  height: 44px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  padding: 0 12px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
`;

const SubmitButton = styled.button`
  height: 44px;
  border-radius: 8px;
  background: #2E2E48;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  border: none;
  cursor: pointer;
  margin-top: 16px;

  &:hover {
    opacity: 0.9;
  }
`;

const Disclaimer = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: #666666;
`;

interface EstimateCardProps {
  estimate: ProjectEstimate;
  discountedPrice: number;
  projectPeriod: number;
}

const EstimateCard: React.FC<EstimateCardProps> = ({ estimate, discountedPrice, projectPeriod = 0 }) => {
  const [openShare, setOpenShare] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);
  const [openShareInput, setOpenShareInput] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', cellphone: '' });
  const [shareUrl, setShareUrl] = useState('');
  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false);
  const [socialLoginPurpose, setSocialLoginPurpose] = useState<'share' | 'download' | null>(null);

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

  // 회원일 경우 로컬스토리지에서 정보 불러오기
  useEffect(() => {
    if (isAuthenticated()) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const user = authData.state?.user;
        if (user) {
          setUserInfo({
            name: user.name || '',
            email: user.email || '',
            cellphone: user.cellphone || '',
          });
        }
      }
    }
  }, [isAuthenticated]);

  /** uuid 없을 때 1회 서버 저장해서 uuid 보장 (옵션 A: 클라에서 이미 uuid를 박아둔 상태여야 함) */
  async function ensureUuidOnce(estimateObj: any, title: string) {
    if (estimateObj?.uuid) return estimateObj.uuid;

    const chatSessionId = localStorage.getItem('chatSessionId') || '';
    if (!chatSessionId) throw new Error('세션 ID가 없습니다.');

    let userId = '';
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      userId = authData?.state?.user?.id || authData?.state?.user?._id || '';
    }
    if (!userId) {
      userId = localStorage.getItem('guest-uuid') || '';
    }
    if (!userId) throw new Error('사용자 ID가 없습니다.');

    const dataStr = buildFullEstimateData(estimateObj);
    const res = await uploadEstimatePdf(chatSessionId, title || '견적서', userId, dataStr);
    if (res?.statusCode !== 200) throw new Error(res?.error?.message || '견적 저장 실패');

    if (!estimateObj.uuid) throw new Error('uuid 보장 실패'); // 옵션 A면 여기 도달 시 반드시 존재
    return estimateObj.uuid as string;
  }

  const handleGeneratePDF = async () => {
    try {
      // 로그인 사용자: uuid 보장 후 미리보기 페이지 이동
      if (isAuthenticated()) {
        if (estimate) {
          const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
          const previewUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
          window.open(previewUrl, '_blank');
          success('PDF 미리보기 페이지가 새 탭에서 열립니다.');
          return;
        }
      } else {
        // 비회원은 로그인 유도
        setSocialLoginPurpose('download');
        setIsSocialLoginModalOpen(true);
        return;
      }

      // 로그인 안 했거나, 별도 미리보기 Blob 생성 루트 (선택적)
      const result = await generatePDF(estimate, { forPreview: true });
      if (result && 'blobUrl' in result && result.blobUrl) {
        window.open(result.blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(result.blobUrl), 60000);
        success('PDF가 새 탭에서 열립니다.');
      }
    } catch (err) {
      console.error('PDF 생성/열기 중 오류:', err);
      error('PDF 생성에 실패했습니다.');
    }
  };

  const handlePrimaryButtonClick = () => {
    setIsSocialLoginModalOpen(false);
    if (socialLoginPurpose === 'share') {
      setOpenShareInput(true); // 공유 전 정보 입력 모달
    } else if (socialLoginPurpose === 'download') {
      setOpenDownload(true); // 다운로드 전 정보 입력 모달
    }
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { name, email, cellphone } = userInfo;
      if (!name || !email || !cellphone) {
        error('필수 정보를 모두 입력해주세요.');
        return;
      }

      // 게스트 UUID 보장
      let guestUuid = localStorage.getItem('guest-uuid');
      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guest-uuid', guestUuid);
      }

      // 업로드 보장 → 미리보기 이동
      const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');

      setOpenDownload(false);
      const previewUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
      window.open(previewUrl, '_blank');
      success('PDF 미리보기 페이지가 새 탭에서 열립니다.');
      setUserInfo({ name: '', email: '', cellphone: '' });
    } catch (err) {
      console.error('PDF 다운로드 준비 중 오류:', err);
      error('PDF 다운로드에 실패했습니다.');
    }
  };

  const handleShareClick = async () => {
    try {
      if (!estimate) {
        error('공유 가능한 견적서가 아닙니다.');
        return;
      }
      // 로그인 사용자면 업로드 보장 후 링크 생성
      if (isAuthenticated()) {
        const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
        setOpenShare(true);
        const newShareUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
        setShareUrl(newShareUrl);
      } else {
        setSocialLoginPurpose('share');
        setIsSocialLoginModalOpen(true);
      }
    } catch (e) {
      console.error(e);
      error('공유 준비 중 오류가 발생했습니다.');
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { name, email, cellphone } = userInfo;
      if (!name || !email || !cellphone) {
        error('필수 정보를 모두 입력해주세요.');
        return;
      }

      // 게스트 UUID 보장
      let guestUuid = localStorage.getItem('guest-uuid');
      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guest-uuid', guestUuid);
      }

      // 옵션 A면 이미 estimate.uuid가 있어야 함 (없으면 ensureUuidOnce로 확보)
      const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name || '견적서');
      const newShareUrl = `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;

      setShareUrl(newShareUrl);
      setOpenShareInput(false);
      setOpenShare(true);
      setUserInfo({ name: '', email: '', cellphone: '' });
      success('공유 링크가 생성되었습니다!');
    } catch (err) {
      console.error('공유 URL 생성 중 오류:', err);
      error('공유 URL 생성에 실패했습니다.');
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

  // 기간 표시 계산 안전 처리
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

      <Modal open={openShare} title="견적서 공유" onClose={() => setOpenShare(false)} width={520}>
        <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>
          공유받은 사용자는 견적 내용을 확인할 수 있습니다.
        </div>
        <ShareInput>
          <input readOnly value={shareUrl} placeholder="https://aigocorp.com/id..." />
          <button onClick={handleCopy}>링크복사</button>
        </ShareInput>
      </Modal>

      <Modal open={openDownload} title="필수 정보 입력" onClose={() => setOpenDownload(false)} width={520}>
        <div style={{ fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
          소중한 당신의 프로젝트, 견적서를 통해 지금 바로 확인해 보세요.
        </div>
        <Form onSubmit={handleDownloadSubmit}>
          <TextField
            id="name"
            label="이름"
            placeholder="이름을 입력해주세요"
            required
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
          />
          <TextField
            id="email"
            label="이메일"
            type="email"
            placeholder="이메일을 입력해주세요"
            required
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          />
          <TextField
            id="phone"
            label="전화번호"
            placeholder="전화번호를 입력해주세요"
            required
            maxLength={11}
            value={userInfo.cellphone}
            pattern="[0-9]{10,11}"
            type="tel"
            onChange={(e) => setUserInfo({ ...userInfo, cellphone: e.target.value })}
          />
          <Disclaimer>문의 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</Disclaimer>
          <SubmitButton type="submit">PDF 미리보기</SubmitButton>
        </Form>
      </Modal>

      <Modal open={openShareInput} title="필수 정보 입력" onClose={() => setOpenShareInput(false)} width={520}>
        <div style={{ fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
          견적서 공유를 위해 필수 정보를 입력해주세요.
        </div>
        <Form onSubmit={handleShareSubmit}>
          <TextField
            id="name"
            label="이름"
            placeholder="이름을 입력해주세요"
            required
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
          />
          <TextField
            id="email"
            label="이메일"
            type="email"
            placeholder="이메일을 입력해주세요"
            required
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          />
          <TextField
            id="phone"
            label="전화번호"
            placeholder="전화번호를 입력해주세요"
            required
            maxLength={11}
            value={userInfo.cellphone}
            pattern="[0-9]{10,11}"
            type="tel"
            onChange={(e) => setUserInfo({ ...userInfo, cellphone: e.target.value })}
          />
          <Disclaimer>문의 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</Disclaimer>
          <SubmitButton type="submit">공유 링크 생성</SubmitButton>
        </Form>
      </Modal>

      <SocialLoginModal
        $isOpen={isSocialLoginModalOpen}
        onClose={() => setIsSocialLoginModalOpen(false)}
        purpose={socialLoginPurpose || 'share'}
        onPrimaryButtonClick={handlePrimaryButtonClick}
        onGoogleLoginSuccess={handleSocialLoginSuccess}
      />
    </CardWrapper>
  );
};

export default EstimateCard;
