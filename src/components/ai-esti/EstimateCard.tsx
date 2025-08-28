"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import Icon from './Icon';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PrintableInvoice } from './PrintableInvoice';

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

interface EstimateCardProps {
  estimate: ProjectEstimate;
}

const EstimateCard: React.FC<EstimateCardProps> = ({ estimate }) => {
  const [openShare, setOpenShare] = useState(false)
  const { success } = useToast()
  const { isDarkMode } = useThemeStore()

  const generatePDF = async () => {
    try {
      // 임시 컨테이너 생성
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // PrintableInvoice 렌더링
      const root = document.createElement('div');
      root.style.width = '780px';
      root.style.backgroundColor = 'white';
      tempDiv.appendChild(root);

      // React 컴포넌트를 DOM에 렌더링
      const { createRoot } = await import('react-dom/client');
      const reactRoot = createRoot(root);
      reactRoot.render(<PrintableInvoice estimate={estimate} />);

      // 렌더링이 완료될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));

      // HTML을 캔버스로 변환
      const canvas = await html2canvas(root, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        backgroundColor: null
      });

      // PDF 생성
      const imgWidth = 210; // A4 가로 크기 (mm)
      const pageHeight = 297; // A4 세로 크기 (mm)
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const pdf = new jsPDF('p', 'mm');

      // 여러 페이지로 나누기
      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // 첫 페이지 추가 (JPEG 압축 사용)
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 남은 높이가 있으면 추가 페이지 생성
      while (heightLeft >= 0) {
        position = -(pageHeight * pageNumber);
        pdf.addPage();
        pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageNumber++;
      }

      // PDF를 Blob으로 생성
      const pdfBlob = pdf.output('blob');
      
      // Blob URL 생성
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // 새 창에서 PDF 열기
      window.open(blobUrl, '_blank');
      
      // React root 정리
      reactRoot.unmount();
      
      // 메모리 누수 방지를 위해 일정 시간 후 Blob URL 해제
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000); // 1분 후 해제
      
      // 임시 요소들 제거
      document.body.removeChild(tempDiv);
      success('PDF가 생성되었습니다.');
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
    }
  };

  // estimated_period가 '30주'와 같은 문자열일 경우를 가정하고 숫자만 추출합니다.
  const weekValue = parseInt(estimate.estimated_period);

  // 1개월의 평균 주 수 (30.41일 / 7일)를 사용하여 개월 수를 계산하고 올림 처리합니다.
  const weeksPerMonth = 4.345;
  const monthValue = Math.ceil(weekValue / weeksPerMonth);

  // 최종적으로 보여줄 기간 문자열을 생성합니다.
  const displayPeriod = `(약 ${monthValue}개월)`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href + `?estimate=${encodeURIComponent(estimate.project_name)}` : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      success('링크가 복사되었습니다.')
    } catch {
      // ignore
    }
  }

  return (
    <CardWrapper>
      <Header>
        <Flex>
        <Title>{estimate.project_name}</Title>
        <Right>
        <span style={{ display: 'flex', gap: '8px' }}>
        <Icon
    onClick={() => setOpenShare(true)}
    // ⭐️ isDarkMode 상태에 따라 이미지 경로를 변경
    src={isDarkMode ? '/ai-estimate/share2_dark.png' : '/ai-estimate/share2_light.png'}
    width={36}
    height={36}
  />
          <Icon 
            onClick={generatePDF}
            src={isDarkMode ? '/ai-estimate/download_dark.png' : '/ai-estimate/download_light.png'} 
            width={36} 
            height={36} 
          />
        </span>
        </Right>

        </Flex>
        <Price>
          KRW {estimate.total_price}
          <span>(부가세 별도)</span>
        </Price>
        {/* 계산된 displayPeriod를 Period 컴포넌트에 적용 */}
        <Period>
          <span style={{marginRight: '4px'}}>{estimate.estimated_period}</span>
          <span className="p">{displayPeriod}</span>
        </Period>
        {/* <ActionButtons>
          <ActionButton>AI 예산 줄이기</ActionButton>
          <Line></Line>
          <ActionButton>AI 맞춤 추천</ActionButton>
        </ActionButtons> */}
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

export default EstimateCard;
