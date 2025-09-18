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

// 스타일드 컴포넌트 정의
const PageContainer = styled.div<{ $bgTheme: 'loading' | 'success' | 'error' }>`
    width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.$bgTheme) {
      case 'loading':
        return 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)';
      case 'success':
        return 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
      case 'error':
        return 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 100%)';
      default:
        return 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)';
    }
  }};
  animation: ${fadeIn} 0.5s ease-out;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  max-width: 28rem;
  width: 100%;
  margin: 0 1rem;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const CenterContent = styled.div`
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 2px solid #e5e7eb;
  border-bottom-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: ${spin} 1s linear infinite;
`;

const IconContainer = styled.div<{ $bgColor: string; $iconColor: string }>`
  width: 4rem;
  height: 4rem;
  background-color: ${props => props.$bgColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    width: 2rem;
    height: 2rem;
    color: ${props => props.$iconColor};
  }
`;

const MainTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const LoadingTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const DescriptionContainer = styled.div`
  margin-bottom: 2rem;
  
  p {
    color: #6b7280;
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }
`;

const InfoBox = styled.div`
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  
  p {
    font-size: 0.875rem;
    color: #1e40af;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PrimaryButton = styled.button`
  width: 100%;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #1d4ed8;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const ErrorButton = styled(PrimaryButton)`
  background-color: #dc2626;
  
  &:hover {
    background-color: #b91c1c;
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
      <PageContainer $bgTheme="loading">
        <ContentCard>
          <CenterContent>
            <LoadingSpinner />
            <LoadingTitle>
              상담 요청 처리 중...
            </LoadingTitle>
            <Description>
              잠시만 기다려주세요.
            </Description>
          </CenterContent>
        </ContentCard>
      </PageContainer>
    );
  }

  if (!isSuccess) {
    return (
      <PageContainer $bgTheme="error">
        <ContentCard>
          <CenterContent>
            <IconContainer $bgColor="#fef2f2" $iconColor="#dc2626">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconContainer>
            <MainTitle>
              상담 요청 실패
            </MainTitle>
            <Description>
              {errorMessage}
            </Description>
            <ButtonContainer>
              <ErrorButton onClick={handleGoHome}>
                홈으로 돌아가기
              </ErrorButton>
            </ButtonContainer>
          </CenterContent>
        </ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer $bgTheme="success">
      <ContentCard>
        <CenterContent>
          {/* 체크 아이콘 */}
          <IconContainer $bgColor="#f0fdf4" $iconColor="#16a34a">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </IconContainer>
          
          {/* 메인 메시지 */}
          <MainTitle>
            견적 문의가 완료되었습니다
          </MainTitle>
          
          {/* 설명 */}
          <DescriptionContainer>
            <p>
              상담 요청이 성공적으로 전송되었습니다.
            </p>
            <p>
              담당자가 빠른 시일 내에 연락드릴 예정입니다.
            </p>
            <InfoBox>
              <p>
                📞 문의사항이 있으시면 언제든지 연락주세요!
              </p>
            </InfoBox>
          </DescriptionContainer>

          {/* 액션 버튼 */}
          <ButtonContainer>
            <PrimaryButton onClick={handleGoHome}>
              홈으로 돌아가기
            </PrimaryButton>
            <SecondaryButton onClick={() => window.close()}>
              창 닫기
            </SecondaryButton>
          </ButtonContainer>
        </CenterContent>
      </ContentCard>
    </PageContainer>
  );
};

export default CompletedPage;
