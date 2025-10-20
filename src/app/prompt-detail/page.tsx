'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { getAIPromptHistory } from '@/lib/api/admin/adminApi';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

type PromptHistory = {
  _id: string;
  name: string;
  description: string;
  content: string;
  promptId: string;
  createAt: string;
  createByName?: string;
};

const PromptDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [promptData, setPromptData] = useState<PromptHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const promptId = searchParams.get('promptId');
  const companyCode = searchParams.get('companyCode');
  const historyId = searchParams.get('historyId');

  useEffect(() => {
    const fetchPromptData = async () => {
      if (!promptId || !companyCode) {
        setError('필수 파라미터가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAIPromptHistory({
          id: promptId,
          companyCode: companyCode
        });

        console.log('프롬프트 히스토리 API 응답:', response);

        let historyData = [];
        
        // 응답 처리 - API 응답 형식에 맞게 수정
        if (response && typeof response === 'object' && 'statusCode' in response && response.statusCode === 200) {
          historyData = (response as any).data || [];
        } else if (Array.isArray(response) && response[0]) {
          const responseData = response[0];
          if (responseData && typeof responseData === 'object' && 'data' in responseData) {
            const innerData = responseData.data;
            if (innerData && typeof innerData === 'object' && 'statusCode' in innerData && innerData.statusCode === 200) {
              historyData = (innerData as any).data || [];
            }
          }
        }

        console.log('파싱된 히스토리 데이터:', historyData);

        if (historyData.length > 0) {
          // historyId가 있으면 해당 히스토리를 찾고, 없으면 첫 번째 항목 사용
          const targetHistory = historyId 
            ? historyData.find((item: PromptHistory) => item._id === historyId)
            : historyData[0];
            
          console.log('선택된 타겟 히스토리:', targetHistory);
            
          if (targetHistory) {
            setPromptData(targetHistory);
          } else {
            setError('해당 프롬프트 히스토리를 찾을 수 없습니다.');
          }
        } else {
          setError('프롬프트 데이터가 없습니다.');
        }
      } catch (err) {
        console.error('프롬프트 데이터 조회 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPromptData();
  }, [promptId, companyCode, historyId]);

  if (loading) {
    return (
      <Container>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!promptData) {
    return (
      <Container>
        <ErrorMessage>프롬프트 데이터를 찾을 수 없습니다.</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{promptData.name}</Title>
        <SubInfo>
          <InfoItem>
            <Label>수정일시:</Label>
            <Value>{dayjs(promptData.createAt).format('YYYY년 MM월 DD일 HH:mm:ss')}</Value>
          </InfoItem>
          <InfoItem>
            <Label>작성자:</Label>
            <Value>{promptData.createByName || '곧 추가 예정'}</Value>
          </InfoItem>
        </SubInfo>
        <Description>{promptData.description}</Description>
      </Header>
      
      <ContentSection>
        <ContentTitle>프롬프트 내용</ContentTitle>
        <ContentBox>{promptData.content}</ContentBox>
      </ContentSection>
    </Container>
  );
};

export default PromptDetailPage;

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 18px;
  color: #e74c3c;
  text-align: center;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 20px 0;
`;

const SubInfo = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  font-weight: 600;
  color: #7f8c8d;
  font-size: 14px;
`;

const Value = styled.span`
  color: #2c3e50;
  font-size: 14px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #5a6c7d;
  line-height: 1.6;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ContentTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
`;

const ContentBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 400px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
`;
