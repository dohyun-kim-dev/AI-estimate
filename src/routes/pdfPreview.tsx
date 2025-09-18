
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fetchEstimateById } from '../lib/api/user/userApi';
import { previewPdfFromServerData, downloadPdfFromServerData } from '../hooks/pdfUtils';

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
  const [isMobile, setIsMobile] = useState(false);
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

  // 인앱 브라우저 감지 및 처리
  useEffect(() => {
    const getInAppBrowserInfo = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      return {
        isKakaoTalk: userAgent.includes('kakaotalk'),
        isNaverApp: userAgent.includes('naver'),
        isInstagram: userAgent.includes('instagram'),
        isFacebook: userAgent.includes('fbav') || userAgent.includes('fb_iab'),
        isLineApp: userAgent.includes('line'),
        isWebView: userAgent.includes('wv') || userAgent.includes('webview'),
        isIOS,
        isAndroid,
        isMobile: isIOS || isAndroid || /mobile/.test(userAgent)
      };
    };

    const handleInAppBrowser = (browserInfo: ReturnType<typeof getInAppBrowserInfo>) => {
      if (!pdfBlobUrl) return;

      const isInApp = browserInfo.isKakaoTalk || browserInfo.isNaverApp || 
                     browserInfo.isInstagram || browserInfo.isFacebook || 
                     browserInfo.isLineApp || browserInfo.isWebView;

      // iOS에서는 PDF가 잘 작동하므로 알림을 표시하지 않음
      if (!isInApp || browserInfo.isIOS) return;

      let message = 'PDF가 제대로 표시되지 않을 수 있습니다.';
      let actionText = '외부 브라우저로 열기';

      if (browserInfo.isKakaoTalk) {
        message = '카카오톡에서 PDF가 제대로 표시되지 않을 수 있습니다.';
        actionText = 'Chrome으로 열기'; // Android only
      } else if (browserInfo.isNaverApp) {
        message = '네이버 앱에서 PDF가 제대로 표시되지 않을 수 있습니다.';
      } else if (browserInfo.isInstagram || browserInfo.isFacebook) {
        message = 'SNS 앱에서 PDF가 제대로 표시되지 않을 수 있습니다.';
      }

      const confirmed = window.confirm(`${message} ${actionText}하시겠습니까?`);
      
      if (confirmed) {
        // 현재 페이지 URL을 외부 브라우저로 열기
        const currentUrl = window.location.href;
        
        // Android에서만 외부 브라우저 강제 열기
        try {
          // Chrome으로 열기 시도
          const chromeUrl = `googlechrome://${currentUrl.replace(/^https?:\/\//, '')}`;
          window.location.href = chromeUrl;
          
          setTimeout(() => {
            // Chrome이 없을 경우 기본 브라우저로
            window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=com.android.chrome;end`;
            
            setTimeout(() => {
              // 모든 방법이 실패할 경우 PDF 다운로드
              const link = document.createElement('a');
              link.href = pdfBlobUrl;
              link.download = `견적서_${uuid || 'estimate'}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }, 1000);
          }, 1000);
        } catch (e) {
          // 실패 시 PDF 다운로드
          const link = document.createElement('a');
          link.href = pdfBlobUrl;
          link.download = `견적서_${uuid || 'estimate'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    };

    const browserInfo = getInAppBrowserInfo();
    setIsMobile(browserInfo.isMobile);
    
    // PDF가 로드된 후 인앱 브라우저 처리
    if (pdfBlobUrl) {
      setTimeout(() => handleInAppBrowser(browserInfo), 1000);
    }
  }, [pdfBlobUrl]);

  
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
      setEstimateMeta(res.data); // 메타데이터 저장
      console.log("res값",res)
      console.log("res.data 타입:", typeof res.data)
      console.log("res.data.data 타입:", typeof res.data.data)
      // 2) 미리보기 PDF 생성 (응답의 data(HTML) 기반)
      const htmlContent = res.data.data || '';
      const { blobUrl,pdfBlob } = await previewPdfFromServerData(htmlContent);
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


  
  const handleDownload = async () => {
    if (!estimateMeta?.data) {
      console.error('다운로드할 데이터가 없습니다.');
      return;
    }
    
    try {
      // 서버 응답 데이터로 PDF 생성 후 바로 다운로드
      await downloadPdfFromServerData(
        estimateMeta.data, 
        estimateMeta.title || '견적서'
      );
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      // fallback: 기존 API 방식
      if (companyCode && uuid) {
        const downloadUrl = `${apiUrl}/users/company/estimate/${companyCode}/${uuid}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `견적서_${uuid}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };
  
  const getPDFViewerUrl = (blobUrl: string) => {
    if (isMobile) {
      // 모바일에서는 브라우저 내장 PDF 뷰어 사용 (blob URL 직접 사용)
      return blobUrl;
    }
    return blobUrl;
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
      <Header>
        <Title>견적서 미리보기</Title>
        <DownloadButton onClick={handleDownload}>
          다운로드
        </DownloadButton>
      </Header>
      
      {loading && <LoadingMessage>PDF를 불러오는 중...</LoadingMessage>}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!loading && !error && (
        <>
          {pdfBlobUrl && (
            <>
              {isMobile ? (
                <embed
                  src={pdfBlobUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              ) : (
                <PDFViewer
                  id="pdf-iframe"
                  src={getPDFViewerUrl(pdfBlobUrl)}
                  title="견적서 PDF"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              )}
            </>
          )}
        </>
      )}
    </PreviewContainer>
  );
};

export default PDFPreview;