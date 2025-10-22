import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getOTPQRCode } from '@/lib/api/admin/adminApi';
import { useToast } from '@/components/common/ToastProvider';
import { devLog } from '@/lib/utils/devLogger';

interface OTPQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OTPQRModal: React.FC<OTPQRModalProps> = ({ isOpen, onClose }) => {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { show: showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchQRCode();
    }
    
    // 컴포넌트 언마운트 시 URL 해제
    return () => {
      if (qrCodeImage && qrCodeImage.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeImage);
      }
    };
  }, [isOpen]);

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      // QR 코드는 이미지 바이너리로 응답하므로 직접 fetch 사용
      const token = localStorage.getItem('admin_access_token');
      
      const response = await fetch('/api/company/cms/otp/qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('QR 코드를 불러오는데 실패했습니다.');
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
            <>
              <QRCodeImage src={qrCodeImage} alt="OTP QR Code" />
              <InfoText>
                Google Authenticator 또는 다른 OTP 앱으로<br />
                위 QR 코드를 스캔하세요.
              </InfoText>
            </>
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
  max-width: 450px;
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
