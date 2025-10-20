import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useEstimateStore } from '@/store/estimateStore'
import { useNavigate } from "react-router-dom";
import MyEstimateCard from '../../../components/ai-esti/MyEstimateCard'
import { getEstimateHistory, getDownloadEstimateUrlWithUserInfo, EstimateHistory } from '@/lib/api/user/userApi';

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  margin-bottom: 100px;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.body};
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 16px;
  color: ${({ theme }) => theme.subtleText};
`

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 12px 0 4px;
`

const Desc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
`

const CTAButton = styled.button`
  margin-top: 12px;
  background-color: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.surface2};
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`

// 그룹 타이틀
const GroupTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin: 32px 0 12px;
`
// const mockEstimates: ProjectEstimate[] = [
//   {
//     project_name: "AI 기반 쇼핑몰 자동화 시스템",
//     created_at: new Date().toISOString().slice(0, 10), // 오늘
//     estimated_period: "30주",
//     total_price: 120000000,
//   },
//   {
//     project_name: "모바일 헬스케어 플랫폼",
//     created_at: new Date().toISOString().slice(0, 10), // 오늘
//     estimated_period: "20주",
//     total_price: 80000000,
//   },
//   {
//     project_name: "기업용 ERP 통합 솔루션",
//     created_at: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // 어제
//     estimated_period: "40주",
//     total_price: 200000000,
//   },
//   {
//     project_name: "온라인 교육 AI 챗봇",
//     created_at: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), // 7일 전
//     estimated_period: "15주",
//     total_price: 50000000,
//   },
//   {
//     project_name: "스마트 물류 관리 시스템",
//     created_at: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), // 7일 전
//     estimated_period: "25주",
//     total_price: 95000000,
//   },
// ];


export default function MyEstimatePage() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<EstimateHistory[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  const getCompanyCode = () => {
    // URL에서 회사 코드 추출
    const pathParts = window.location.pathname.split('/');
    const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
    return (companyCodeIndex > 0 && pathParts.length > companyCodeIndex)
      ? pathParts[companyCodeIndex]
      : '';
  };
  const companyCode = getCompanyCode();

  const fetchEstimates = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await getEstimateHistory(offset);
      
      if (response.data && response.data.length > 0) {
        setEstimates(prev => [...prev, ...response.data]);
        setOffset(prev => prev + response.data.length);
        if (response.data.length < 30) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('견적서 목록을 가져오는 데 실패했습니다:', e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 페이지 진입 시 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);
    fetchEstimates();
  }, []); // 빈 의존성 배열을 사용하여 컴포넌트가 처음 마운트될 때만 실행

  // ⭐️ 2. 무한 스크롤 로직을 위한 useEffect는 그대로 유지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchEstimates();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.disconnect();
      }
    };
  }, [hasMore, loading, offset]);

  useEffect(() => {
    // Intersection Observer를 사용하여 무한 스크롤 구현
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchEstimates();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.disconnect();
      }
    };
  }, [hasMore, loading, offset]);

  // 날짜별 그룹화 로직
  const groupedEstimates = estimates.reduce((acc, estimate) => {
  // createAt이 없는 경우 오늘 날짜로 처리
  let date;
  try {
    if (estimate.createAt && typeof estimate.createAt === 'string') {
      date = estimate.createAt.split(' ')[0];
    } else {
      // createAt이 없으면 오늘 날짜 사용
      date = new Date().toISOString().slice(0, 10);
    }
  } catch (error) {
    // split 에러 등이 발생하면 오늘 날짜 사용
    console.warn('createAt 파싱 오류:', error, estimate);
    date = new Date().toISOString().slice(0, 10);
  }
  
  if (!acc[date]) {
    acc[date] = [];
  }
  acc[date].push(estimate);
  return acc;
}, {} as Record<string, EstimateHistory[]>);

  const sortedDates = Object.keys(groupedEstimates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getDisplayTitle = (date: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    
    if (date === today) return '오늘';
    if (date === yesterday) return '어제';
    
    // 일주일 전 그룹화는 이전에 구현된 로직보다 유동적으로 변경
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const estimateDate = new Date(date);
    if (estimateDate >= oneWeekAgo) {
      return '일주일 전';
    }
    
    return date;
  };
  
  if (estimates.length === 0 && !loading) {
    return (
      <Container>
        <EmptyState>
          <Title>저장된 견적이 없습니다</Title>
          <Desc>AI 상담으로 첫 견적을 만들어 보세요.</Desc>
          <CTAButton onClick={() => navigate(`/aiclient/${companyCode}/ai`)}>AI 견적 시작하기</CTAButton>
        </EmptyState>
      </Container>
    )
  }

return (
<Container>
    {sortedDates.map(date => (
      <React.Fragment key={date}>
        <GroupTitle>{getDisplayTitle(date)}</GroupTitle>
        {groupedEstimates[date].map((estimate, index) => {
          // 사용자 ID를 포함한 다운로드 URL 생성
          const authStorage = localStorage.getItem('auth-storage');
          const authData = authStorage ? JSON.parse(authStorage) : null;
          const user = authData?.state?.user;
          const userId = user ? user._id : localStorage.getItem('guest-uuid');

          const downloadUrl = `${window.location.origin}${getDownloadEstimateUrlWithUserInfo(
            companyCode,
            estimate.file || '',
          )}`;

          // createAt 안전 처리 - 오늘 날짜를 기본값으로 사용
          let createdDate;
          try {
            if (estimate.createAt && typeof estimate.createAt === 'string') {
              createdDate = estimate.createAt.split(' ')[0];
            } else {
              createdDate = new Date().toISOString().slice(0, 10);
            }
          } catch (error) {
            console.warn('createAt 파싱 오류:', error, estimate);
            createdDate = new Date().toISOString().slice(0, 10);
          }

          return (
            <MyEstimateCard
              key={`${estimate._id || index}-${index}`} 
              estimate={{
                _id: estimate._id || `temp-${index}`,
                project_name: estimate.title || '제목 없음',
                created_at: createdDate,
                file: estimate.file || '',
              }}
              downloadUrl={downloadUrl}
            />
          );
        })}
      </React.Fragment>
    ))}
    <div ref={observerTarget}></div>
    {loading && <p>불러오는 중...</p>}
  </Container>
);
}