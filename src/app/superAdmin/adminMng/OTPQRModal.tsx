import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getOTPQRCode, getOTPUrl } from '@/lib/api/admin/adminApi';
import { useToast } from '@/components/common/ToastProvider';
import { devLog } from '@/lib/utils/devLogger';

interface OTPQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyCode?: string; // 통합 관리자용 고객사 코드
}

const OTPQRModal: React.FC<OTPQRModalProps> = ({ isOpen, onClose, companyCode }) => {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [otpUrl, setOtpUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { show: showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchQRCode();
      fetchOTPUrl(); // OTP URL 조회 추가
    }
    
    // 컴포넌트 언마운트 시 URL 해제
    return () => {
      if (qrCodeImage && qrCodeImage.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeImage);
      }
    };
  }, [isOpen, companyCode]); // companyCode 의존성 추가

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      // URL에 cms가 포함되어 있는지 확인
      const isCmsUrl = window.location.pathname.includes('/cms/');
      
      // QR 코드는 이미지 바이너리로 응답하므로 직접 fetch 사용
      const token = localStorage.getItem('admin_access_token');
      
      // CMS URL인 경우 기존 API, 통합 관리자인 경우 companyCode 파라미터 전달
      const apiUrl = isCmsUrl 
        ? '/api/company/cms/otp/qr'
        : `/api/cms/company/otp/qr?companyCode=${companyCode || ''}`;
      
      devLog('OTP QR Code API 호출:', { isCmsUrl, apiUrl, companyCode });

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // JSON 응답일 수 있으므로 먼저 파싱 시도
        try {
          const errorData = await response.json();
          devLog('OTP QR Code API 에러 응답:', errorData);
          
          // 커스텀 메시지가 있으면 그것을 사용
          const errorMessage = errorData?.error?.customMessage || errorData?.message || 'QR 코드를 불러오는데 실패했습니다.';
          
          // "회사 코드가 필요합니다." 메시지를 더 친절하게 변경
          if (errorMessage.includes('회사 코드') || errorMessage.includes('companyCode')) {
            showToast('먼저 고객사를 선택해주세요.', 'error');
          } else {
            showToast(errorMessage, 'error');
          }
          
          setIsLoading(false);
          return;
        } catch (jsonError) {
          // JSON 파싱 실패 시 기본 에러 메시지
          devLog('OTP QR Code API 응답 파싱 오류:', jsonError);
          throw new Error('QR 코드를 불러오는데 실패했습니다.');
        }
      }

      // 이미지 blob을 받아서 URL로 변환
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      devLog('OTP QR Code image URL:', imageUrl);
      setQrCodeImage(imageUrl);
      
    } catch (error) {
      console.error('QR Code fetch error:', error);
      showToast('QR 코드를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (otpUrl) {
      navigator.clipboard.writeText(otpUrl)
        .then(() => {
          showToast('URL이 복사되었습니다.', 'success');
        })
        .catch(() => {
          showToast('복사에 실패했습니다.', 'error');
        });
    }
  };

  const fetchOTPUrl = async () => {
    try {
      const response = await getOTPUrl(companyCode);
      
      devLog('OTP URL API 응답:', response);

      // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
      const actualResponse = Array.isArray(response) ? response[0] : response;
      const apiResponse = (actualResponse as any)?.data;

      if (apiResponse && apiResponse.statusCode === 200 && apiResponse.data?.url) {
        setOtpUrl(apiResponse.data.url);
        devLog('OTP URL 설정됨:', apiResponse.data.url);
      } else {
        devLog('OTP URL 응답에 url이 없음:', apiResponse);
      }
    } catch (error) {
      console.error('OTP URL fetch error:', error);
      // URL 조회 실패는 조용히 처리 (QR 코드는 여전히 표시)
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderTitle>OTP QR 코드</HeaderTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {isLoading ? (
            <LoadingText>QR 코드를 생성하는 중...</LoadingText>
          ) : qrCodeImage ? (
            <ContentWrapper>
              <LeftSection>
                <QRCodeImage src={qrCodeImage} alt="OTP QR Code" />
                <InfoText>
                  Google Authenticator 또는 다른 OTP 앱으로<br />
                  위 QR 코드를 스캔하세요.
                </InfoText>
              </LeftSection>
              {otpUrl && (
                <RightSection>
                  <UrlContainer>
                    <UrlLabel>OTP URL</UrlLabel>
                    <UrlBox>{otpUrl}</UrlBox>
                    <CopyButton onClick={handleCopyUrl}>복사</CopyButton>
                  </UrlContainer>
                </RightSection>
              )}
            </ContentWrapper>
          ) : (
            <ErrorText>QR 코드를 표시할 수 없습니다.</ErrorText>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
};

export default OTPQRModal;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 0px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: #2C2E3C;
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const ModalBody = styled.div`
  background: white;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 40px;
  width: 100%;
  align-items: flex-start;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RightSection = styled.div`
  flex: 1;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UrlContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #f8f8f8;
`;

const UrlLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const UrlBox = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #666;
  word-break: break-all;
  margin-bottom: 12px;
  font-family: monospace;
  line-height: 1.5;
`;

const CopyButton = styled.button`
  width: 100%;
  background: #2C2E3C;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1a1c28;
  }

  &:active {
    background: #0f1015;
  }
`;

const QRCodeImage = styled.img`
  width: 250px;
  height: 250px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
`;

const InfoText = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 16px;
  text-align: center;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 16px;
  text-align: center;
`;
