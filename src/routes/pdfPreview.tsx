
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fetchEstimateById } from '../lib/api/user/userApi';
import { previewPdfFromServerData } from '../hooks/pdfUtils';

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


interface EstimateMeta {
  _id: string;
  chatSession: string;
  companyCode: string;
  createAt: string;
  data: string;
  title: string;
  user: string;
}

const PDFPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [estimateMeta, setEstimateMeta] = useState<EstimateMeta | null>(null);
  const companyCode = searchParams.get('company');
  let uuid = searchParams.get('uuid');
  // 변경: 하드코딩된 API URL을 Vite 환경 변수로 대체
  const apiUrl = import.meta.env.VITE_API_HOST || 'http://121.157.229.40:8535';

  // uuid에 안내문구 등 불필요한 문자열이 붙어있을 경우, uuid만 추출해서 리다이렉트
  React.useEffect(() => {
    if (!uuid) return;
    // uuid는 36자 UUID 형식 (하이픈 포함)
    const uuidMatch = uuid.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (uuidMatch && uuid !== uuidMatch[0]) {
      // 잘못된 uuid 파라미터라면, 올바른 uuid만 남기고 리다이렉트
      const params = new URLSearchParams(searchParams);
      params.set('uuid', uuidMatch[0]);
      window.location.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [uuid, searchParams]);

  
  useEffect(() => {
  if (!uuid) {
    setError('필수 파라미터가 누락되었습니다.');
    setLoading(false);
    return;
  }

  const run = async () => {
    try {
      // 1) JSON으로 가져오기
      const res = await fetchEstimateById(uuid);
      if (res?.statusCode !== 200 || !res?.data) {
        throw new Error('견적 데이터를 가져오지 못했습니다.');
      }

      // 서버가 내려준 원본(표시용)
      setEstimateMeta(res.data.data); // 필요 시 화면에 title, user 등 노출

      // 2) 미리보기 PDF 생성 (응답의 data(HTML) 기반)
      const { blobUrl,pdfBlob } = await previewPdfFromServerData(res.data.data);
      console.log('PDF blobUrl:', blobUrl);
      console.log('PDF pdfBlob:', pdfBlob);
      setPdfBlobUrl(blobUrl);

      setLoading(false);
    } catch (err) {
      console.error('견적 조회/미리보기 실패:', err);
      setError('PDF 미리보기를 생성할 수 없습니다.');
      setLoading(false);
    }
  };

  run();
}, [uuid]);


  
  const handleDownload = () => {
    if (companyCode && uuid) {
      const downloadUrl = `${apiUrl}/file/estimate/download/${companyCode}/${uuid}.pdf`;
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