import React from 'react';
import styled from 'styled-components';
import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import { calculateEstimatedPeriod } from '@/utils/estimateCalculator';
import { devLog } from '@/utils/devLogger'

// 사업자번호 포맷팅 함수 (000-00-00000)
const formatBusinessNumber = (businessNumber: string) => {
  if (!businessNumber) return '';
  
  // 모든 '-' 제거하고 숫자만 추출
  const numbers = businessNumber.replace(/[^0-9]/g, '');
  
  // 10자리가 아니면 원본 반환
  if (numbers.length !== 10) return businessNumber;
  
  // 000-00-00000 형식으로 포맷팅
  return `${numbers.substring(0, 3)}-${numbers.substring(3, 5)}-${numbers.substring(5, 10)}`;
};

// 셀폰 번호 포맷팅 함수 (010-0000-0000 또는 01-0000-0000)
const formatCellphone = (cellphone: string) => {
  if (!cellphone) return '';
  
  // 모든 '-' 제거하고 숫자만 추출
  const numbers = cellphone.replace(/[^0-9]/g, '');
  
  if (numbers.length === 11) {
    // 11자리: 010-0000-0000
    return `${numbers.substring(0, 3)}-${numbers.substring(3, 7)}-${numbers.substring(7, 11)}`;
  } else if (numbers.length === 10) {
    // 10자리: 02-0000-0000
    return `${numbers.substring(0, 2)}-${numbers.substring(2, 6)}-${numbers.substring(6, 10)}`;
  }
  
  // 다른 길이면 원본 반환
  return cellphone;
};

const PrintableInvoiceWrapper = styled.div`
  width: 780px;
  padding: 40px;
  background-color: white;
  color: black;
  font-family: 'Pretendard', sans-serif;
  box-sizing: border-box;
  font-size: 11pt;
  
  @media print {
    @page {
      margin: 30mm 15mm; /* 상하 여백 더 증가 */
    }
  }
`;

interface PrintableInvoiceProps {
  estimate: ProjectEstimate;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ estimate }) => {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const currentDate = formatDate(new Date());
  const user = useAuthStore((state) => state.user);
  const { companyInfo } = useCompanyStore(); // 회사정보에서 etc 배열 가져오기

  // companyStore에서 동적 회사 정보 가져오기
  const companyName = companyInfo?.name || '주식회사 여기닷';
  const representativeName = companyInfo?.name 
    ? `${companyInfo.name} ${companyInfo.cellphone ? '82+' + formatCellphone(companyInfo.cellphone) : ''}`
    : '강태원 82+031-8039-7981';
  const companyAddress = companyInfo?.address && companyInfo?.detailAddress
    ? `${companyInfo.address} ,${companyInfo.detailAddress}`
    : '경기도 성남시 수정구 대학판교로 815, 7호 (시흥동, 판교창조경제밸리)';
  const companyRegistrationNumber = companyInfo?.businessNumber 
    ? formatBusinessNumber(companyInfo.businessNumber)
    : '289-86-03278';
  const industryType = companyInfo?.businessCategory && companyInfo?.businessType
    ? `${companyInfo.businessCategory}, ${companyInfo.businessType}`
    : '응용소프트웨어 개발 및 공급업, 서비스업';
//세션스토리지 guestInfo 안에 name과 email 뽑기
  const guestInfo = sessionStorage.getItem('guestInfo');
  let guestName = '';
  let guestEmail = '';
  let guestCellphone = '';  
  if (guestInfo) {
    try {
      const parsedInfo = JSON.parse(guestInfo);
      guestName = parsedInfo.name || '비회원';
      guestEmail = parsedInfo.email || '비회원';
      guestCellphone = parsedInfo.cellphone || '';
    } catch (error) {
      console.error('Failed to parse guestInfo from sessionStorage:', error);
    }
  }

  // 정확한 개발 기간 계산
  const periodCalculation = calculateEstimatedPeriod(estimate);
  
  // 각 카테고리의 모든 아이템을 플랫하게 만들기 (is_deleted가 false인 항목만)
  const allItems = estimate.categories.flatMap((category) =>
    category.sub_categories.flatMap((subCategory) =>
      subCategory.items
        .filter(item => !item.is_deleted) // is_deleted가 true인 항목 제외
        .map(item => ({
          ...item,
          category: category.category_name,
          subCategory: subCategory.sub_category_name
        }))
    )
  );

  devLog('All items length:', allItems.length);
  devLog('All items:', allItems);

  // 총 금액 계산 (is_deleted가 false인 항목만)
  const totalPrice = allItems.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
    devLog('Item price:', item.price, 'Parsed price:', price);
    return sum + price;
  }, 0);

  devLog('Total price calculated:', totalPrice);
  devLog('All items:', allItems);

  // 부가세 포함 금액 계산 (10% 부가세)
  const vatIncludedPrice = Math.round(totalPrice * 1.1);

  const baseCellStyle = {
    padding: '8px 12px',
    border: '1px solid #BFBFBF',
    fontSize: '9pt',
    lineHeight: '1.3',
  };

  const headerCellStyle = {
    ...baseCellStyle,
    backgroundColor: '#F2F2F2',
    fontWeight: 'bold',
    textAlign: 'center' as const,
  };

  const valueCellStyle = {
    ...baseCellStyle,
    textAlign: 'left' as const,
  };

  const stampContainerStyle = {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
  };

  const stampImageStyle = {
    position: 'absolute' as const,
    right: '20px',
    bottom: '20px',
    width: '60px',
    height: '60px',
  };

  return (
    <PrintableInvoiceWrapper id="printable-invoice-content">
      <div style={{ fontSize: '20pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
        견적서
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <tbody>
          <tr>
            <td style={{ ...headerCellStyle, width: '15%' }}>견적 발행일</td>
            <td style={{ ...valueCellStyle, width: '25%' }}>{currentDate}</td>
            <td style={{ ...headerCellStyle, width: '15%' }}>상호명</td>
            <td style={{ ...valueCellStyle, width: '30%' }}>{companyName}</td>
            <td style={{ 
              width: '15%', 
              border: '1px solid #BFBFBF',
              borderStyle: 'double',
              background: 'white',
              position: 'relative'
            }} rowSpan={5}>
              <div style={{
                position: 'absolute',
                right: '20px',
                bottom: '60px',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // marginLeft: '10px'
              }}>
                <img 
                  src="/ai-estimate/stamp.png" 
                  alt="직인" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }} 
                />
              </div>
            </td>
          </tr>
          <tr>
            <td style={headerCellStyle}>고객명</td>
            <td style={valueCellStyle}>{user?.name || '비회원'}</td>
            <td style={headerCellStyle}>대표자명</td>
            <td style={valueCellStyle}>{representativeName}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>메일주소</td>
            <td style={valueCellStyle}>{user?.email || '비회원'}</td>
            <td style={headerCellStyle}>사업자번호</td>
            <td style={valueCellStyle}>{companyRegistrationNumber}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>견적명</td>
            <td style={valueCellStyle}>{estimate.project_name}</td>
            <td style={headerCellStyle}>업종·업태</td>
            <td style={valueCellStyle}>{industryType}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>총 금액 <br/>(VAT포함)</td>
            <td style={valueCellStyle}>KRW {vatIncludedPrice.toLocaleString()}</td>
            <td style={headerCellStyle}>주소</td>
            <td style={valueCellStyle}>{companyAddress}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '15px', marginTop: '40px' }}>
        견적 상세
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', pageBreakInside: 'avoid' }}>
        <thead style={{ display: 'table-header-group' }}>
          <tr>
            <th style={{ ...headerCellStyle, width: '15%' }}>구분</th>
            <th style={{ ...headerCellStyle, width: '20%' }}>메뉴</th>
            <th style={{ ...headerCellStyle, width: '20%' }}>항목</th>
            <th style={{ ...headerCellStyle, width: '30%' }}>세부내용</th>
            <th style={{ ...headerCellStyle, width: '15%' }}>금액</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            // 연속된 같은 카테고리와 서브카테고리 찾기
            let currentRowSpan = { category: 0, subCategory: 0 };
            let lastCategory = '';
            let lastSubCategory = '';

            return (
              <>
                {allItems.map((item, index) => {
                  const showCategory = item.category !== lastCategory;
                  const showSubCategory = item.subCategory !== lastSubCategory || showCategory;

                  // 다음 항목들 중 같은 카테고리/서브카테고리 개수 계산
                  if (showCategory) {
                    currentRowSpan.category = allItems.slice(index).filter(i => i.category === item.category).length;
                    lastCategory = item.category;
                  }
                  if (showSubCategory) {
                    currentRowSpan.subCategory = allItems.slice(index).filter(i => 
                      i.subCategory === item.subCategory && 
                      i.category === item.category
                    ).length;
                    lastSubCategory = item.subCategory;
                  }

                  return (
                    <tr 
                      key={`${item.category}-${item.subCategory}-${index}`}
                      style={{ pageBreakInside: 'avoid' }}
                    >
                      {showCategory && (
                        <td style={{ 
                          ...valueCellStyle, 
                          textAlign: 'center',
                          pageBreakInside: 'avoid'
                        }} rowSpan={currentRowSpan.category}>
                          {item.category.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7A3\s]/g, '').trim()}
                        </td>
                      )}
                      {showSubCategory && (
                        <td style={{ 
                          ...valueCellStyle, 
                          textAlign: 'center',
                          pageBreakInside: 'avoid',
                          breakAfter: 'auto',
                          breakBefore: 'auto',
                          paddingTop: '4px',
                          paddingBottom: '4px'
                        }} rowSpan={currentRowSpan.subCategory}>
                          {item.subCategory}
                        </td>
                      )}
                      <td style={{ 
                        ...valueCellStyle, 
                        textAlign: 'center',
                        paddingTop: '4px',
                        paddingBottom: '4px'
                      }}>{item.name}</td>
                      <td style={{ 
                        ...valueCellStyle,
                        paddingTop: '4px',
                        paddingBottom: '4px'
                      }}>{item.description}</td>
                      <td style={{ 
                        ...valueCellStyle, 
                        textAlign: 'right',
                        paddingTop: '4px',
                        paddingBottom: '4px'
                      }}>{item.price}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={4} style={{ ...headerCellStyle, textAlign: 'right' }}>
                    <strong>합계 (부가세 별도)</strong>
                  </td>
                  <td style={{ ...valueCellStyle, textAlign: 'right' }}>
                    <strong>{totalPrice.toLocaleString()}</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ ...headerCellStyle, textAlign: 'right' }}>
                    <strong>부가세 포함</strong>
                  </td>
                  <td style={{ ...valueCellStyle, textAlign: 'right' }}>
                    <strong>{vatIncludedPrice.toLocaleString()}</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ ...headerCellStyle, textAlign: 'right' }}>개발 기간</td>
                  <td style={{ ...valueCellStyle, textAlign: 'right' }}>{periodCalculation.estimatedPeriodText}</td>
                </tr>
              </>
            );
          })()}
        </tbody>
      </table>

      <div style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '15px', marginTop: '40px' }}>
        비고사항
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
        <tbody>
          <tr>
            <td style={{ ...valueCellStyle, padding: '12px' }}>
              {companyInfo?.etc && companyInfo.etc.length > 0 ? (
                companyInfo.etc.map((item, index) => (
                  <React.Fragment key={index}>
                    {item}
                    {index < companyInfo.etc.length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                <>
                  • 검수기간 : 개발 완료 익일부터 2주(이후 요청 별도 협의 필요)​<br />
                  • 하자보수: 검수 종료일 익일부터 6개월 (기획과 디자인 변경 별도 협의 필요)<br />
                  • 크로스 플랫폼: 윈도우10 이상 및 맥 운영체제 / 갤럭시 및 아이폰 출시 5년 이하 기기<br />
                  • 자사 보유 기술스택: (앱)hybridapp, Flutter, webview, (웹)Flutter, react.js, (백)express.js, node.js, Python <br />   
                  &nbsp;&nbsp;&nbsp;(서버) 네이버 클라우드, 카페24클라우드, AWS등​
                    DB: Mysql , Postgre , 몽고DB등<br /><br />
                  * 견적서는 작성일로부터 일주일간 유효합니다.<br />
                  * 도메인/서버비용/개발자 계정/알림 수단/유료API 등에 따라 발생하는 비용은 별도입니다.<br />
                  * AI 견적은 실제 계약 시 금액과 일부 상이할 수 있으며, 보다 정확한 견적은 담당자와의 최종 협의를 통해 확정됩니다.
                </>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </PrintableInvoiceWrapper>
  );
};
