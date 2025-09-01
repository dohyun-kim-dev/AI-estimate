"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import Icon from './Icon';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
import { generatePDF } from '@/hooks/pdfUtils';
import { getDownloadEstimateUrl, getDownloadEstimateUrlWithUserInfo } from '@/lib/api/user/userApi';
import { useAuthStore } from '@/store/authStore';
import { v4 as uuidv4 } from 'uuid';
import TextField from '@/components/common/TextField';


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
  padding 20px 12px;
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
  color: ${({ theme, primary }) => (primary ? (theme.body) : theme.accent)};
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
}

const EstimateCard: React.FC<EstimateCardProps> = ({ estimate }) => {
  const [openShare, setOpenShare] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);
  const [openShareInput, setOpenShareInput] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', cellphone: '' });
  const [shareUrl, setShareUrl] = useState('');
  const { success, error } = useToast();
  const { isDarkMode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

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

  const handleGeneratePDF = async () => {
    try {
      if (estimate.uuid) {
        if (isAuthenticated()) {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const authData = JSON.parse(authStorage);
            const userData = authData.state?.user;
            
            if (userData) {
              const downloadUrl = getDownloadEstimateUrlWithUserInfo(
                companyCode,
                estimate.uuid,
                {
                  id: userData._id,
                  name: userData.name,
                  email: userData.email,
                  cellphone: userData.cellphone || ''
                }
              );
              window.open(downloadUrl, '_blank');
              success('PDF가 새 탭에서 열립니다.');
              return;
            }
          }
        } else {
          setOpenDownload(true);
          return;
        }
      }

      const result = await generatePDF(estimate, { forPreview: true });
      
      if (result && 'blobUrl' in result && result.blobUrl) {
        window.open(result.blobUrl, '_blank');
        
        setTimeout(() => {
          URL.revokeObjectURL(result.blobUrl);
        }, 60000); 
        
        success('PDF가 새 탭에서 열립니다.');
      }
    } catch (err) {
      console.error('PDF 생성 중 오류:', err);
      error('PDF 생성에 실패했습니다.');
    }
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let guestUuid = localStorage.getItem('guest-uuid');
      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guest-uuid', guestUuid);
        console.log('새로운 비회원 UUID 생성:', guestUuid);
      }

      const downloadUrl = getDownloadEstimateUrlWithUserInfo(
        companyCode,
        estimate.uuid,
        {
          id: guestUuid,
          name: userInfo.name,
          email: userInfo.email,
          cellphone: userInfo.cellphone
        }
      );
      
      window.open(downloadUrl, '_blank');
      success('PDF가 새 탭에서 열립니다.');
      setOpenDownload(false);
      setUserInfo({ name: '', email: '', cellphone: '' });
    } catch (err) {
      console.error('PDF 다운로드 중 오류:', err);
      error('PDF 다운로드에 실패했습니다.');
    }
  };
  
  const handleShareClick = () => {
    // uuid가 있어야 공유 가능
    if (!estimate.uuid) {
      error('공유 가능한 견적서가 아닙니다.');
      return;
    }

    if (isAuthenticated()) {
      // 회원인 경우 바로 공유 URL 생성 모달 표시
      setOpenShare(true);
      const authStorage = localStorage.getItem('auth-storage');
      const authData = authStorage ? JSON.parse(authStorage) : null;
      const user = authData?.state?.user;

      if (user) {
        const newShareUrl = getDownloadEstimateUrlWithUserInfo(
          companyCode,
          estimate.uuid,
          {
            id: user._id,
            name: user.name,
            email: user.email,
            cellphone: user.cellphone || ''
          }
        );
        setShareUrl(newShareUrl);
      }
    } else {
      // 비회원인 경우 필수 정보 입력 모달 표시
      setOpenShareInput(true);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let guestUuid = localStorage.getItem('guest-uuid');
      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guest-uuid', guestUuid);
      }

      const newShareUrl = getDownloadEstimateUrlWithUserInfo(
        companyCode,
        estimate.uuid,
        {
          id: guestUuid,
          name: userInfo.name,
          email: userInfo.email,
          cellphone: userInfo.cellphone
        }
      );
      
      setShareUrl(newShareUrl);
      setOpenShareInput(false);
      setOpenShare(true);
      setUserInfo({ name: '', email: '', cellphone: '' });
    } catch (err) {
      console.error('공유 URL 생성 중 오류:', err);
      error('공유 URL 생성에 실패했습니다.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      success('링크가 복사되었습니다.')
      setOpenShare(false)
    } catch {
      error('링크 복사에 실패했습니다.');
    }
  }

  const weekValue = parseInt(estimate.estimated_period);
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
        KRW {new Intl.NumberFormat('ko-KR').format(estimate.total_price)}
        <span>(부가세 별도)</span>
        </Price>
        <Period>
          <span style={{marginRight: '4px'}}>{estimate.estimated_period}</span>
          <span className="p">{displayPeriod}</span>
        </Period>
      </Header>

      <Modal open={openShare} title="견적서 공유" onClose={() => setOpenShare(false)} width={520}>
        <div style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 32 }}>공유받은 사용자는 견적 내용을 확인할 수 있습니다.</div>
        <ShareInput>
          <input readOnly value={shareUrl} placeholder="https://aigocorp.com/id..." />
          <button onClick={handleCopy} >링크복사</button>
        </ShareInput>
      </Modal>

      <Modal open={openDownload} title="필수 정보 입력" onClose={() => setOpenDownload(false)} width={520}>
        <div style={{ fontSize: 14, textAlign: 'center', marginBottom: 32 }}>소중한 당신의 프로젝트, 견적서를 통해 지금 바로 확인해 보세요.</div>
        <Form onSubmit={handleDownloadSubmit}>
          <TextField id="name" label="이름" placeholder="이름을 입력해주세요" required value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} />
          <TextField id="email" label="이메일" type="email" placeholder="이메일을 입력해주세요" required value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} />
          <TextField id="phone" label="전화번호" placeholder="전화번호를 입력해주세요" required maxLength={11} value={userInfo.cellphone} onChange={(e) => setUserInfo({...userInfo, cellphone: e.target.value})} />
          <Disclaimer>문의 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</Disclaimer>
          <SubmitButton type="submit">PDF 다운로드</SubmitButton>
        </Form>
      </Modal>

      {/* 공유 전 필수 정보 입력 모달 */}
      <Modal open={openShareInput} title="필수 정보 입력" onClose={() => setOpenShareInput(false)} width={520}>
        <div style={{ fontSize: 14, textAlign: 'center', marginBottom: 32 }}>견적서 공유를 위해 필수 정보를 입력해주세요.</div>
        <Form onSubmit={handleShareSubmit}>
          <TextField id="name" label="이름" placeholder="이름을 입력해주세요" required value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} />
          <TextField id="email" label="이메일" type="email" placeholder="이메일을 입력해주세요" required value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} />
          <TextField id="phone" label="전화번호" placeholder="전화번호를 입력해주세요" required maxLength={11} value={userInfo.cellphone} onChange={(e) => setUserInfo({...userInfo, cellphone: e.target.value})} />
          <Disclaimer>문의 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.</Disclaimer>
          <SubmitButton type="submit">공유 링크 생성</SubmitButton>
        </Form>
      </Modal>

    </CardWrapper>
  );
};

export default EstimateCard;
