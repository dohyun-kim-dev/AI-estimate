import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const PreviewContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
`;

const Header = styled.div`
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const DownloadButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #0056b3;
  }
`;

const PDFViewer = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
  background: white;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #666;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #d32f2f;
`;

const PDFPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  
  const companyCode = searchParams.get('company');
  const uuid = searchParams.get('uuid');
  
  useEffect(() => {
    if (!companyCode || !uuid) {
      setError('필수 파라미터가 누락되었습니다.');
      setLoading(false);
      return;
    }
    
    const fetchPDF = async () => {
      try {
        // 실제 서버 API URL 사용
        const apiUrl = 'http://121.157.229.40:8535';
        const pdfUrl = `${apiUrl}/api/file/estimate/download/${companyCode}/${uuid}.pdf`;
        
        console.log('PDF URL:', pdfUrl);
        
        // PDF을 blob으로 가져오기
        const response = await fetch(pdfUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        console.log('PDF blob URL 생성됨:', blobUrl);
        setPdfBlobUrl(blobUrl);
        setLoading(false);
        
      } catch (err) {
        console.error('PDF 가져오기 실패:', err);
        setError('PDF를 불러올 수 없습니다. 서버에서 파일을 찾을 수 없거나 네트워크 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    fetchPDF();
  }, [companyCode, uuid]);
  
  const handleDownload = () => {
    if (companyCode && uuid) {
      const apiUrl = 'http://121.157.229.40:8535';
      const downloadUrl = `${apiUrl}/api/file/estimate/download/${companyCode}/${uuid}.pdf`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `견적서_${uuid}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleIframeLoad = () => {
    console.log('PDF iframe 로드 완료');
  };
  
  const handleIframeError = () => {
    console.log('PDF iframe 로드 실패');
    setError('PDF를 표시할 수 없습니다.');
  };
  
  // 컴포넌트 언마운트 시 blob URL 정리
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);
  
  if (error) {
    return (
      <PreviewContainer>
        <Header>
          <Title>견적서 미리보기</Title>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
      </PreviewContainer>
    );
  }
  
  return (
    <PreviewContainer>
      {/* <Header>
        <Title>견적서 미리보기</Title>
        <DownloadButton onClick={handleDownload}>
          다운로드
        </DownloadButton>
      </Header> */}
      
      {loading && <LoadingMessage>PDF를 불러오는 중...</LoadingMessage>}
      
      {pdfBlobUrl && (
        <PDFViewer
          id="pdf-iframe"
          src={pdfBlobUrl}
          title="견적서 PDF"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}
    </PreviewContainer>
  );
};

export default PDFPreview;
