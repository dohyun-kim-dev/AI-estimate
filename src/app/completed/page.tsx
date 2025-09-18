import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { requestEstimateConsult } from '@/lib/api/user/userApi';

// 애니메이션 정의
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  animation: ${fadeIn} 0.5s ease-out;
`;

const IconImage = styled.img`
  width: 300px;
//   height: 120px;
//   margin-bottom: 32px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 600px) {
    width: 160px;
    // height: 64px;
    // margin-bottom: 17px;
  }
`;

const MainTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #22223b;
  text-align: center;
  margin-bottom: 18px;
  @media (max-width: 600px) {
    font-size: 1.06rem;
    margin-bottom: 9px;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #4a4e69;
  text-align: center;
  margin-bottom: 0;
  white-space: pre-line;
  @media (max-width: 600px) {
    font-size: 0.58rem;
  }
`;

const CompletedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sendConsultRequest = async () => {
      try {
        // URL 파라미터에서 필요한 정보 추출
        const estimateId = searchParams.get('estimateId');
        const title = searchParams.get('title');
        const chatSession = searchParams.get('chatSession');
        const userId = searchParams.get('userId');
        const userName = searchParams.get('userName');
        const userEmail = searchParams.get('userEmail');
        const userCellphone = searchParams.get('userCellphone');

        // 필수 파라미터 검증
        if (!estimateId || !title || !chatSession || !userId || !userName || !userEmail || !userCellphone) {
          throw new Error('필수 정보가 누락되었습니다.');
        }

        // API 호출
        const response = await requestEstimateConsult(
          estimateId,
          title,
          chatSession,
          {
            id: userId,
            name: userName,
            email: userEmail,
            cellphone: userCellphone,
          }
        );

        if (response.statusCode >= 200 && response.statusCode < 300) {
          setIsSuccess(true);
        } else {
          throw new Error(response.message || '상담 요청 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('상담 요청 실패:', error);
        setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    sendConsultRequest();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

//라우트 경로 파라미터 포함해서 보여줘
const routeParams = {
  estimateId: searchParams.get('estimateId'),
  title: searchParams.get('title'),
  chatSession: searchParams.get('chatSession'),
  userId: searchParams.get('userId'),
  userName: searchParams.get('userName'),
  userEmail: searchParams.get('userEmail'),
  userCellphone: searchParams.get('userCellphone'),
};

  if (isLoading) {
    return (
      <PageContainer>
        <MainTitle>상담 요청 처리 중...</MainTitle>
        <Description>잠시만 기다려주세요.</Description>
      </PageContainer>
    );
  }

  if (!isSuccess) {
    const displayError = errorMessage.includes('conflict') ? '이미 상담 요청했습니다.' : errorMessage;
    return (
      <PageContainer>
        <MainTitle>상담 요청 실패</MainTitle>
        <Description>{displayError}</Description>
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontWeight: 500,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            onClick={handleGoHome}
          >
            홈으로 돌아가기
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <IconImage src="/ai-estimate/completed.png" alt="상담 완료" />
      <MainTitle>상담 접수 완료</MainTitle>
      <Description>{window.innerWidth <= 600
        ? '공급사에서 영업일 기준\n1일내 연락 드리겠습니다'
        : '공급사에서 영업일 기준 1일내 연락 드리겠습니다'}</Description>
    </PageContainer>
  );
};

export default CompletedPage;
