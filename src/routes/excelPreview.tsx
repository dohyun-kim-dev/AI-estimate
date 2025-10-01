import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fetchEstimateById } from '../lib/api/user/userApi';
import { extractInvoiceJSON } from '../hooks/estimate';
import * as XLSX from 'xlsx';

const PreviewContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  justify-content: center;
  align-items: center;
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #666;
  gap: 16px;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #d32f2f;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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

const ExcelPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('데이터를 가져오는 중...');
  
  const uuid = searchParams.get('uuid');

  useEffect(() => {
    if (!uuid) {
      setError('필수 파라미터가 누락되었습니다.');
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        setStatus('견적 데이터를 가져오는 중...');
        
        // 1) 견적 데이터 가져오기
        const res = await fetchEstimateById(uuid);
        if (res?.statusCode !== 200 || !res?.data) {
          throw new Error('견적 데이터를 가져오지 못했습니다.');
        }

        setStatus('견적 데이터를 분석하는 중...');
        
        // 2) HTML에서 JSON 데이터 추출
        const htmlContent = res.data.data || '';
        const estimateJson = extractInvoiceJSON(htmlContent);
        
        if (!estimateJson) {
          throw new Error('견적서 데이터를 찾을 수 없습니다.');
        }

        setStatus('엑셀 파일을 생성하는 중...');
        
        // 3) 엑셀 생성 및 다운로드
        await generateExcelFromEstimate(estimateJson, res.data.title || '견적서');
        
        setStatus('다운로드 완료!');
        
        // 다운로드 완료 후 잠시 후 페이지 닫기 또는 이전 페이지로
        setTimeout(() => {
          try {
            window.close();
          } catch {
            window.history.back();
          }
        }, 2000);
        
        setLoading(false);
      } catch (err) {
        console.error('엑셀 생성 실패:', err);
        setError('엑셀 파일을 생성할 수 없습니다: ' + (err as Error).message);
        setLoading(false);
      }
    };

    run();
  }, [uuid]);

  // 엑셀 생성 함수
  const generateExcelFromEstimate = async (estimate: any, title: string) => {
    const workbook = XLSX.utils.book_new();

    // 1. 요약 시트 생성
    const summaryData = [
      ['견적서 정보'],
      ['프로젝트명', estimate.project_name || ''],
      ['고객명', estimate.customer?.name || ''],
      ['고객 이메일', estimate.customer?.email || ''],
      ['고객 전화번호', estimate.customer?.phone || ''],
      ['프로젝트 기간', estimate.project_duration || ''],
      ['개발 방법론', estimate.development_methodology || ''],
      ['기술 스택', Array.isArray(estimate.tech_stack) ? estimate.tech_stack.join(', ') : (estimate.tech_stack || '')],
      [''],
      ['비용 요약'],
      ['총 개발비', formatCurrency(estimate.total_cost)],
      ['부가세', formatCurrency(estimate.vat)],
      ['총 금액', formatCurrency(estimate.total_amount)],
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    
    // 컬럼 너비 설정
    summaryWS['!cols'] = [
      { width: 15 }, // A열
      { width: 30 }  // B열
    ];

    XLSX.utils.book_append_sheet(workbook, summaryWS, '견적 요약');

    // 2. 상세 기능 시트 생성
    const detailData = [
      ['카테고리', '하위 카테고리', '기능명', '설명', '개발 시간(시간)', '단가', '비용', '상태']
    ];

    estimate.categories?.forEach((category: any) => {
      category.sub_categories?.forEach((subCategory: any) => {
        subCategory.items?.forEach((item: any) => {
          if (!item.is_deleted) { // 삭제되지 않은 항목만
            detailData.push([
              category.name || '',
              subCategory.name || '',
              item.name || '',
              item.description || '',
              item.hours || 0,
              formatCurrency(item.rate || 0),
              formatCurrency(item.cost || 0),
              item.is_deleted ? '삭제됨' : '포함'
            ]);
          }
        });
      });
    });

    const detailWS = XLSX.utils.aoa_to_sheet(detailData);
    
    // 컬럼 너비 설정
    detailWS['!cols'] = [
      { width: 15 }, // 카테고리
      { width: 20 }, // 하위 카테고리
      { width: 25 }, // 기능명
      { width: 40 }, // 설명
      { width: 12 }, // 개발 시간
      { width: 15 }, // 단가
      { width: 15 }, // 비용
      { width: 10 }  // 상태
    ];

    XLSX.utils.book_append_sheet(workbook, detailWS, '상세 기능');

    // 3. 추가 정보 시트 (있는 경우)
    if (estimate.assumptions || estimate.notes || estimate.terms) {
      const additionalData = [
        ['추가 정보'],
        [''],
      ];

      if (estimate.assumptions) {
        additionalData.push(['가정사항']);
        additionalData.push([estimate.assumptions]);
        additionalData.push(['']);
      }

      if (estimate.notes) {
        additionalData.push(['참고사항']);
        additionalData.push([estimate.notes]);
        additionalData.push(['']);
      }

      if (estimate.terms) {
        additionalData.push(['계약 조건']);
        additionalData.push([estimate.terms]);
      }

      const additionalWS = XLSX.utils.aoa_to_sheet(additionalData);
      additionalWS['!cols'] = [{ width: 80 }];
      
      XLSX.utils.book_append_sheet(workbook, additionalWS, '추가 정보');
    }

    // 현재 날짜를 파일명에 포함
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const filename = `${title}_${dateStr}.xlsx`;

    // 엑셀 파일 다운로드
    XLSX.writeFile(workbook, filename);
  };

  // 통화 포맷팅 함수
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0';
    return num.toLocaleString('ko-KR') ;
  };

  if (error) {
    return (
      <PreviewContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer>
      <LoadingMessage>
        <Spinner />
        <div>{status}</div>
        {loading && <div>잠시만 기다려 주세요...</div>}
      </LoadingMessage>
    </PreviewContainer>
  );
};

export default ExcelPreview;