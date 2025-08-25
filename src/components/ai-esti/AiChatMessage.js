'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled, { css } from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import React, { useMemo, useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { aiChatDictionary } from '@/lib/i18n/aiChat';
import useAiFlowStore from '@/store/aiFlowStore';
import { useTranslation } from 'react-i18next';
import { getStepData } from '@/app/ai/components/StepData';
import { devLog } from '@/lib/utils/devLogger';
// 통화 변환 기능 추가
// 각 국가 코드별 환율 정보 (2023년 기준)
const exchangeRates = {
    USD: 1350, // 1 USD = 1,350 KRW
    JPY: 9, // 1 JPY = 9 KRW
    CNY: 190, // 1 CNY = 190 KRW
    EUR: 1450, // 1 EUR = 1,450 KRW
    GBP: 1700, // 1 GBP = 1,700 KRW
};
// 국가 코드별 통화 기호
const currencySymbols = {
    KR: '₩',
    US: '$',
    JP: '¥',
    CN: '¥',
    GB: '£',
    EU: '€',
    default: '$',
};
// 국가 코드를 통화 코드로 변환
const getCountryCurrency = (countryCode) => {
    if (!countryCode)
        return 'USD';
    switch (countryCode) {
        case 'KR':
            return 'KRW';
        case 'US':
            return 'USD';
        case 'JP':
            return 'JPY';
        case 'CN':
            return 'CNY';
        case 'GB':
            return 'GBP';
        // EU 국가들
        case 'DE':
        case 'FR':
        case 'IT':
        case 'ES':
        case 'NL':
        case 'BE':
        case 'AT':
        case 'FI':
        case 'PT':
        case 'IE':
        case 'GR':
        case 'SK':
        case 'SI':
        case 'LU':
        case 'LV':
        case 'LT':
        case 'EE':
        case 'CY':
        case 'MT':
            return 'EUR';
        default:
            return 'USD'; // 기본값은 USD
    }
};
// 통화 심볼 가져오기
const getCurrencySymbol = (countryCode) => {
    if (!countryCode)
        return currencySymbols.default;
    const code = countryCode;
    return currencySymbols[code] || currencySymbols.default;
};
// 금액 포맷 함수 - 통화 변환 및 표시 기능 추가
const formatAmount = (amount, countryCode, forceDetailed = false) => {
    // 금액이 숫자가 아닌 경우 (예: "별도 문의") 그대로 반환
    if (typeof amount !== 'number') {
        return amount;
    }
    // forceDetailed가 true이거나 한국이 아닌 경우 (그리고 amount가 숫자일 때)
    if (forceDetailed || countryCode !== 'KR') {
        const localCurrency = getCountryCurrency(countryCode);
        const localSymbol = getCurrencySymbol(countryCode);
        // 항상 KRW를 기준으로 다른 통화와 함께 표시
        // 만약 사용자가 KR이 아니면, 해당 국가 통화와 KRW를 함께 표시
        // 만약 사용자가 KR이지만 forceDetailed가 true이면, USD와 KRW를 함께 표시
        let displaySymbol = currencySymbols.US;
        let convertedAmountForDisplay = Math.round(amount / (exchangeRates['USD'] || 1350)); // KRW -> USD
        if (countryCode !== 'KR') {
            // 한국이 아닌 경우, 해당 국가 통화로 표시
            displaySymbol = localSymbol;
            if (exchangeRates[localCurrency]) {
                convertedAmountForDisplay = Math.round(amount / exchangeRates[localCurrency]);
            }
            else if (localCurrency === 'KRW') {
                // 혹시 getCountryCurrency가 KRW를 반환하는 경우
                displaySymbol = currencySymbols.US;
                convertedAmountForDisplay = Math.round(amount / (exchangeRates['USD'] || 1350));
            }
        }
        // 한국 사용자이고 forceDetailed=true인 경우, USD (₩...) 형식으로 표시
        // 그 외 국가 사용자는 LocalCurrency (₩...) 형식으로 표시
        return `${displaySymbol}${convertedAmountForDisplay.toLocaleString()} (₩${amount.toLocaleString()})`;
    }
    // 한국이면서 forceDetailed가 false인 경우 원화만 표시
    return `${amount.toLocaleString()} 원`;
};
// 테이블 스타일 정의 - 견적서에 사용되는 공통 테이블 스타일
const TableStyles = css `
  width: 100%;
  border: none;
  border-spacing: 0;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  table-layout: fixed;
  word-wrap: break-word;

  th,
  td {
    border: none;
    padding: 5px 8px;
    vertical-align: middle;
    border: none;
  }

  tr:first-child th,
  tr:first-child td {
    border: none;
  }
  tr:last-child td {
    border: none;
  }
  th:first-child,
  td:first-child {
    border: none;
  }
  th:last-child,
  td:last-child {
    border: none;
  }

  thead {
    background-color: #1e1e2d;
    th {
      color: ${AppColors.onBackground};
      text-align: left;
      font-weight: 400;
      padding: 10px 8px;

      &:nth-child(1) {
        width: 18%;
      }
      &:nth-child(2) {
        width: 20%;
      }
      &:nth-child(3) {
        width: 32%;
      }
      &:nth-child(4) {
        width: 15%;
        min-width: 95px;
        text-align: center;
      }
      &:nth-child(5) {
        width: 20%;
      }
      &:nth-child(6) {
        width: 15%;
        text-align: center;
      }
    }
  }

  tbody {
    tr {
      background-color: #111119;
      &:nth-child(even) {
        background-color: #1e1e2d;
      }
    }
    td {
      color: ${AppColors.onBackground};
      &:nth-child(4) {
        text-align: right;
      }
    }

    tr:last-child {
      background-color: transparent;
      border-top: 1px solid ${AppColors.aiBorder};
      td {
        border-bottom: none;
      }
      td:first-child {
        font-weight: bold;
      }
      td:nth-child(4) {
        font-weight: bold;
        text-align: right;
        padding-right: 8px;
      }
    }

    td:last-child {
      text-align: center;
    }
  }
`;
// 마크다운 컨테이너 스타일 - AI 메시지 내 마크다운 포맷팅을 위한 컨테이너
const StyledMarkdownContainer = styled.div `
  table {
    ${TableStyles}
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid ${AppColors.aiBorder};
    font-weight: 300;

    td button {
      background-color: ${AppColors.onBackgroundGray};
      color: #ffffff;
      border: none;
      padding: 0.3rem 0.9rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background-color 0.2s;

      &:hover {
        background-color: ${AppColors.primary};
      }
    }
  }
  //에이닷 텍스트 크기
  p {
    margin-bottom: 0.5rem;
    font-weight: 300;
  }

  strong {
    font-weight: 400;
  }
`;
// 메시지 래퍼 스타일 - 메시지 전체를 감싸는 컨테이너
const MessageWrapper = styled.div `
  display: flex;
  width: 100%;
  margin-bottom: 1rem;

  // 발신자에 따라 정렬 방향 설정 (사용자: 오른쪽, AI: 왼쪽)
  justify-content: ${(props) => props.$sender === 'user' ? 'flex-end' : 'flex-start'};
`;
// 메시지 박스 스타일 - 실제 메시지 내용을 담는 말풍선
const MessageBox = styled.div `
  max-width: 100%;
  padding: 0.3rem 0.3rem;
  border-radius: 24px;
  ${AppTextStyles.body1}
  line-height: 1.7;
  letter-spacing: normal;

  ${(props) => props.$sender === 'user'
    ? css `
          background-color: ${AppColors.primary};
          color: ${AppColors.onPrimary};
          border-bottom-right-radius: 0px;
          white-space: pre-wrap;
          padding: 0.25rem 1.25rem 0.5rem 1.25rem; // 사용자 메시지 패딩 (위아래 동일하게 조정)
        `
    : css `
          background-color: ${AppColors.background};
          color: ${AppColors.onBackground};
        `};
`;
// 프로필 이미지 스타일 - AI 프로필 이미지
const ProfileImage = styled.img `
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
`;
// AI 프로필 헤더 (이미지와 이름을 감싸는 컨테이너)
const AiProfileHeader = styled.div `
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;
// 프로필 이름 스타일 - AI 이름 표시
const ProfileName = styled.p `
  font-size: 20px;
  color: ${AppColors.onBackground};
  font-weight: bold;
  margin: 0;
`;
// 버튼 스타일 - 마크다운 내부에서 사용되는 버튼
const StyledActionButton = styled.button `
  background-color: ${AppColors.onBackgroundGray};
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${AppColors.primary};
  }
`;
// 견적서 컨테이너 스타일 - 견적서 전체를 감싸는 컨테이너
const StyledInvoiceContainer = styled.div `
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid ${AppColors.aiBorder};
  border-radius: 8px;
  background-color: #1c1c25;
  color: ${AppColors.onBackground};
  font-size: 0.9rem;
  max-width: 100%; // 컨테이너가 최대 너비를 사용하도록 설정
  margin-right: 0; // 오른쪽 마진 제거
`;
// 견적서 프로젝트 제목 스타일
const InvoiceProjectTitle = styled.h3 `
  font-size: 1.3em;
  color: ${AppColors.onBackground};
  margin-bottom: 1em;
`;
// 견적서 테이블 스타일
const InvoiceTable = styled.table `
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th,
  td {
    border-bottom: 1px solid ${AppColors.aiBorder};

    height: 4em;
    text-align: left;
    vertical-align: top;
  }

  th {
    padding: 1em 1em;
    font-weight: 600;
    background-color: #2a2a3a;
    color: ${AppColors.onPrimary};
    white-space: nowrap;
    &:nth-child(3) {
      // "세부 내용" 헤더
      text-align: center;
    }
  }

  td {
    padding: 2em 1em;
    font-weight: 300;
  }

  // 각 열의 너비 및 스타일 지정
  .col-category {
    width: 18%;
    text-align: center;
    font-weight: 500;
  }
  .col-menu {
    width: 18%;
    text-align: center;
    font-weight: 500;
  }
  .col-feature {
    width: 25%;
    text-align: center;
    font-weight: 500;
  }
  .col-description {
    width: 32%;
    font-size: 0.9em;
    line-height: 1.5;
    vertical-align: middle;
  }
  .col-amount {
    width: 15%;
    text-align: center;
    white-space: nowrap;
  }
  .col-actions {
    width: 10%;
    text-align: center;
  }

  // 마지막 행(합계) 스타일
  tbody tr:last-child td {
    border-bottom: none;
    font-weight: bold;
  }

  .total-label {
    text-align: right;
    padding-right: 1em;
  }
`;
// 액션 버튼 스타일 - 견적서 내 항목 삭제/취소 버튼
const ActionButton = styled.button `
  background-color: ${AppColors.onBackgroundGray};
  width: 100px;
  color: #ffffff;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;

  @media (max-width: 750px) {
    min-width: 70px;
    width: 70px;
  }

  &:hover {
    background-color: ${AppColors.primary};
  }
`;
// 모바일 견적서 전체 컨테이너
const MobileInvoiceContainer = styled.div `
  margin-top: 1rem;
`;
// 모바일 견적서 카드 아이템 스타일
const MobileInvoiceCardItem = styled.div `
  background-color: #1e1e2d;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  color: ${AppColors.onBackground};

  .item-row {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.75rem;
    font-size: 0.9em;

    .label {
      font-weight: 500;
      color: ${AppColors.onSurfaceVariant};
      margin-bottom: 0.25rem;
    }
    .value {
      text-align: left;
      word-break: break-word;
    }
    .deleted {
      text-decoration: line-through;
      color: ${AppColors.disabled};
    }
  }

  .description-value {
    text-align: left;
    margin-bottom: 0.5rem;
    font-size: 0.9em;
    line-height: 1.5;
    word-break: break-word;
    p {
      margin-bottom: 0.3em !important;
      font-size: 1em !important;
      font-weight: 300 !important;
      line-height: 1.4 !important;
    }
    em {
      font-size: 0.9em !important;
      color: ${AppColors.onSurfaceVariant} !important;
    }
  }

  .actions-row {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
`;
// PrintableInvoice를 위한 스타일 컴포넌트들
const PrintableInvoiceWrapper = styled.div `
  width: 780px;
  padding: 40px;
  background-color: white;
  color: black;
  font-family: 'Pretendard', sans-serif;
  box-sizing: border-box;
  font-size: 11pt;

  h3 {
    font-size: 1.5em;
    color: #333333;
    margin-bottom: 1.2em;
    text-align: center;
  }

  .quotation-title {
    font-size: 2em; /* 이미지와 유사한 크기로 조정 */
    font-weight: bold;
    text-align: center;
    margin-bottom: 1.5em; /* 테이블과의 간격 조정 */
    color: black;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-size: 9pt; /* PDF용 폰트 크기 */

    th,
    td {
      border: 1px solid #cccccc;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
    }

    th {
      background-color: #f0f0f0;
      font-weight: bold;
      color: #333333;
      white-space: nowrap;
    }

    .col-category {
      width: 18%;
      text-align: center;
    }
    .col-feature {
      width: 22%;
      text-align: center;
    }
    .col-description {
      width: 35%;
      font-size: 8.5pt;
      line-height: 1.4;
      div p {
        margin: 0 0 5px 0;
        line-height: 1.4;
      }
      div em {
        font-style: italic;
        font-size: 0.95em;
        color: #555;
      }
    }
    .col-amount {
      width: 25%;
      text-align: right;
      white-space: nowrap;
    }

    tbody tr:last-child td {
      /* border-bottom: none; */ /* 마지막 줄 하단 테두리 유지 또는 필요시 제거 */
    }
    .total-label {
      text-align: right;
      font-weight: bold;
      padding-right: 1em;
    }
    .total-amount strong {
      font-weight: bold;
    }
  }
`;
// PDF용 금액 포맷 함수 (기존 formatAmount와 유사하나, hook 의존성 없이 사용)
const formatAmountForPdf = (amount) => {
    if (typeof amount === 'number') {
        return amount.toLocaleString(); // 숫자면 포맷팅하여 반환
    }
    return amount; // 문자열이면 (예: "별도 문의") 그대로 반환
};
export const PrintableInvoice = ({ invoiceData, invoiceDetailsForPdf, t, countryCode, lang, }) => {
    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };
    const currentDate = formatDate(new Date());
    const user = useAuthStore((state) => state.user);
    const userName = user?.name;
    const userPhone = user?.cellphone;
    const userEmail = user?.email;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipientName = invoiceData.project || t.recipientName || '역경매 플랫폼 개발';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyName = t.companyName || '주식회사 여기닷';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const representativeName = t.representativeName || '강태원 82+031-8039-7981';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyAddress = `${t.companyAddressStreet ||
        '경기도 성남시 수정구 대학판교로 815, 777호'} (${t.companyAddressDetail || '시흥동, 판교창조경제밸리'})`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyRegistrationNumber = t.companyRegistrationNumber || '289-86-03278';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quoteItemName = invoiceData.project || t.defaultQuoteName || 'IoT 앱';
    const totalAmountWithVatForPdf = formatAmountForPdf(Math.round((invoiceDetailsForPdf.currentTotal || 0) * 1.1), countryCode);
    const specialNotes = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: t.remarksTitle || '비고란',
        items: [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${t.inspectionPeriod || '검수기간'}: ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.inspectionPeriodValue ||
                '개발 완료일 익일부터 1개월 (이후 요청 별도 협의 필요)'}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${t.warrantyPeriod || '하자보수'}: ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.warrantyPeriodValue ||
                '검수 종료일 익일부터 6개월 (기획과 디자인 변경 별도 협의 필요)'}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${t.techStack || '자사 보유 기술스택'}: ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.techStackValue &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                typeof t.techStackValue === 'object'
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    t.techStackValue.app +
                        ', ' +
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        t.techStackValue.web +
                        ', ' +
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        t.techStackValue.server +
                        ', ' +
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        t.techStackValue.db
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    typeof t.techStackValue === 'string'
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            t.techStackValue
                        : '(앱)hybridapp, Flutter, webview, (웹)react.js, express.js, node.js, java spring boot, python (서버) 네이버 클라우드, 카페24클라우드, AWS등 DB: Mysql, Postgre, 몽고DB등'}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${t.crossPlatform || '크로스 플랫폼 및 브라우징'}: ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.crossPlatformValue ||
                '윈도우10 이상 및 맥 운영체제 / 갤럭시 및 아이폰 출시 5년 이하 기기 / 사파리, 크롬, 엣지 (이외의 브라우저는 대응하지 않음)'}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.legalNotice1 ||
                `* 당 견적서는 단순 견적서가 아닌, 기능 기획이 포함된 (주)여기닷의 무형지식재산으로 견적서를 전달받은 사람이 견적을 조회하는 용도 외에 다른 용도로 사용할 수 없으며, 타인에게 당 견적서의 전체 또는 일부 내용을 구두나 파일 등으로 전달한 경우, 당사에서 주장하는 모든 민형사상의 책임과 배상에 대하여 동의하는 것으로 간주함. 만약 동의하지 않을 경우, 당 견적서는 조회 없이 파기해야 함*`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.validityNotice || `* 견적서는 작성일로부터 일주일간 유효함*`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.additionalCostsNotice ||
                `* 도메인(URL및SSL등)/서버비용/AOS 및 IOS 개발자 계정/알림 수단/유료API 등에 따라 발생하는 비용은 별도이며, 견적서에 포함되지 않은 기능은 추가 비용이 발생함*`,
        ],
        footerNotice: 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t.aiDisclaimer ||
            'AI 견적은 실제 계약 시 금액과 일부 상이할 수 있으며, 보다 정확한 견적은 담당자와의 최종 협의를 통해 확정됩니다.',
    };
    const stampImagePath = '/ai/stamp.png';
    // 국제화 키 (임시값, aiChat.ts에 추가 필요)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotationTitle = t.quotationTitle || '견적서';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quoteDateLabel = t.quoteDateLabel || '견적 발행일';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientNameLabel = t.clientNameLabel || '고객명';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientEmailLabel = t.clientEmailLabel || '메일주소';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quoteNameLabel = t.quoteNameLabel || '견적명';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalAmountLabel = t.totalAmountLabel || '총 금액 (VAT포함)';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supplierNameLabel = t.supplierNameLabel || '상호명';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supplierCeoLabel = t.supplierCeoLabel || '대표명';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supplierBizNumLabel = t.supplierBizNumLabel || '사업자번호';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supplierIndustryLabel = t.supplierIndustryLabel || '업종·업태';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supplierAddressLabel = t.supplierAddressLabel || '주소';
    const industryType = '응용소프트웨어 개발 및 공급업, 서비스업';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const basicSurveyTitle = t.basicSurveyTitle || '기초 조사';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const basicSurveyContentPlaceholder = t.basicSurveyContentPlaceholder ||
        '기초 조사 내용이 여기에 표시됩니다.';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quoteDetailsTitle = t.quoteDetailsTitle || '견적 상세';
    const baseCellStyle = {
        padding: '6px 8px',
        border: '1px solid #BFBFBF',
        fontSize: '9pt',
        verticalAlign: 'middle',
        height: '30px',
    };
    const headerCellStyle = {
        ...baseCellStyle,
        backgroundColor: '#F2F2F2',
        fontWeight: 'bold',
        textAlign: 'center',
    };
    const valueCellStyle = {
        ...baseCellStyle,
        textAlign: 'left',
    };
    const clientValueCellStyle = {
        ...valueCellStyle,
    };
    const stampContainerStyle = {
        position: 'relative',
        backgroundColor: '#ffffff',
        background: 'white',
        padding: 0,
        margin: 0,
        width: '100%',
        height: '100%',
    };
    const stampImageStyle = {
        position: 'absolute',
        right: '20px',
        bottom: '40px',
        width: '60px',
        height: '60px',
    };
    const { t: translate } = useTranslation();
    const selections = useAiFlowStore((state) => state.selections);
    const stepData = getStepData(t);
    const selectionStrings = Object.entries(selections)
        .map(([stepId, selectedIds]) => {
        const step = stepData.find((s) => s.id === stepId);
        if (!step)
            return '';
        const labels = selectedIds
            .map((id) => step.options.find((opt) => opt.id === id)?.label)
            .filter((label) => !!label);
        return labels.join(', ');
    })
        .filter(Boolean) // 빈 항목 제거
        .join(' / ');
    return (_jsxs(PrintableInvoiceWrapper, { id: "printable-invoice-content", children: [_jsx("div", { className: "quotation-title", style: {
                    fontSize: '20pt',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '20px',
                }, children: quotationTitle }), _jsx("table", { style: {
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '15px',
                }, children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { style: { ...headerCellStyle, width: '15%' }, children: quoteDateLabel }), _jsx("td", { style: { ...valueCellStyle, width: '25%' }, children: currentDate }), _jsx("td", { style: { ...headerCellStyle, width: '15%' }, children: supplierNameLabel }), _jsx("td", { style: { ...valueCellStyle, width: '30%' }, children: companyName }), _jsx("td", { style: {
                                        ...headerCellStyle,
                                        width: '15%',
                                        borderLeft: 'none',
                                        background: 'white',
                                    }, rowSpan: 5, children: _jsx("div", { style: stampContainerStyle, children: _jsx("img", { src: stampImagePath, alt: "\uC9C1\uC778", style: stampImageStyle }) }) })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: clientNameLabel }), _jsxs("td", { style: clientValueCellStyle, children: [userName || 'guest', " ", userPhone ? ' 82+' : '', " ", userPhone || ''] }), _jsx("td", { style: headerCellStyle, children: supplierCeoLabel }), _jsx("td", { style: valueCellStyle, children: representativeName })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: clientEmailLabel }), _jsx("td", { style: valueCellStyle, children: userEmail || 'guest' }), _jsx("td", { style: headerCellStyle, children: supplierBizNumLabel }), _jsx("td", { style: valueCellStyle, children: companyRegistrationNumber })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: quoteNameLabel }), _jsx("td", { style: clientValueCellStyle, children: quoteItemName }), _jsx("td", { style: headerCellStyle, children: supplierIndustryLabel }), _jsx("td", { style: valueCellStyle, children: industryType })] }), _jsxs("tr", { children: [_jsx("td", { style: { ...headerCellStyle }, children: totalAmountLabel }), _jsx("td", { style: { ...valueCellStyle }, children: totalAmountWithVatForPdf }), _jsx("td", { style: headerCellStyle, children: supplierAddressLabel }), _jsx("td", { style: valueCellStyle, children: companyAddress })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: basicSurveyTitle }), _jsxs("td", { style: { ...valueCellStyle }, colSpan: 4, children: [selectionStrings, " "] })] })] }) }), _jsx("div", { style: {
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    marginTop: '50px',
                }, children: quoteDetailsTitle }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', marginTop: '0rem' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { ...headerCellStyle, width: '15%' }, children: t.tableHeaders.category }), _jsx("th", { style: { ...headerCellStyle, width: '20%' }, children: t.tableHeaders.menu }), _jsx("th", { style: { ...headerCellStyle, width: '20%' }, children: t.tableHeaders.item }), _jsx("th", { style: { ...headerCellStyle, width: '30%' }, children: t.tableHeaders.detail }), _jsx("th", { style: { ...headerCellStyle, width: '15%' }, children: t.tableHeaders.amount })] }) }), _jsxs("tbody", { children: [invoiceData.invoiceGroup?.map((group) => {
                                const visibleItems = group.items.filter((item) => {
                                    const currentItemDetails = invoiceDetailsForPdf.items.find((ci) => ci.id === item.id);
                                    return !(currentItemDetails && currentItemDetails.isDeleted);
                                });
                                if (visibleItems.length === 0)
                                    return null;
                                return visibleItems.map((item, visibleItemIndex) => (_jsxs("tr", { children: [visibleItemIndex === 0 && (_jsx("td", { style: { ...valueCellStyle, textAlign: 'center' }, rowSpan: visibleItems.length || 1, children: group.category })), _jsxs("td", { style: { ...valueCellStyle, textAlign: 'center' }, children: [' ', item.menu] }), _jsx("td", { style: { ...valueCellStyle, textAlign: 'center' }, children: item.feature }), _jsxs("td", { style: valueCellStyle, children: [_jsx("div", { dangerouslySetInnerHTML: {
                                                        __html: item.description?.replace(/\n|\r\n|\r/g, '<br />') ||
                                                            '',
                                                    } }), item.note &&
                                                    !/^[A-Z]{3}\s[\d,.]+\s\(₩[\d,.]+\)$/.test(item.note) && (_jsx("p", { style: {
                                                        fontSize: '0.8em',
                                                        color: '#555',
                                                        marginTop: '5px',
                                                    }, children: _jsxs("em", { children: [t.estimateInfo.note, ": ", item.note] }) }))] }), _jsx("td", { style: { ...valueCellStyle, textAlign: 'right' }, children: item.note &&
                                                /^[A-Z]{3}\s[\d,.]+\s\(₩[\d,.]+\)$/.test(item.note)
                                                ? item.note
                                                : formatAmountForPdf(item.amount) })] }, `pdf-item-${item.id}`)));
                            }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, style: { ...headerCellStyle, textAlign: 'right' }, children: _jsx("strong", { children: t.estimateInfo.totalSum }) }), _jsx("td", { style: {
                                            ...valueCellStyle,
                                            textAlign: 'right',
                                        }, children: _jsx("strong", { children: formatAmountForPdf(Math.round(invoiceDetailsForPdf.currentTotal || 0)) }) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, style: { ...headerCellStyle, textAlign: 'right' }, children: _jsx("strong", { children: t.estimateInfo.vatIncluded }) }), _jsx("td", { style: {
                                            ...valueCellStyle,
                                            textAlign: 'right',
                                        }, children: _jsx("strong", { children: formatAmountForPdf(Math.round((invoiceDetailsForPdf.currentTotal || 0) * 1.1)) }) })] }), invoiceDetailsForPdf.currentTotalDuration > 0 && (_jsxs("tr", { children: [_jsx("td", { colSpan: 4, style: { ...headerCellStyle, textAlign: 'right' }, children: t.estimateInfo.totalDuration }), _jsx("td", { style: { ...valueCellStyle, textAlign: 'right' }, children: typeof invoiceDetailsForPdf.currentTotalDuration === 'number'
                                            ? `${Math.ceil(invoiceDetailsForPdf.currentTotalDuration / 5)} ${t.estimateInfo.week} (${lang === 'ko' ? '약 ' : ''}${Math.ceil(invoiceDetailsForPdf.currentTotalDuration / 20)} ${t.estimateInfo.monthUnit})`
                                            : `${invoiceDetailsForPdf.currentTotalDuration} ${t.estimateInfo.day}` })] }))] })] }), _jsx("div", { style: {
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    marginTop: '50px',
                    textAlign: 'left',
                }, children: specialNotes.title }), _jsx("table", { style: {
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '0px',
                    fontSize: '8pt',
                    borderTop: '1px solid #E0E0E0', // 위쪽 보더 (선택)
                    borderBottom: '1px solid #E0E0E0', // 전체 테이블 아래 보더
                }, children: _jsx("tbody", { children: specialNotes.items.map((note, index) => (_jsx("tr", { children: _jsx("td", { style: {
                                borderTop: '1px solid #E0E0E0', // 각 줄 위에 보더
                                borderBottom: index === specialNotes.items.length - 1
                                    ? '1px solid #E0E0E0' // 마지막 줄에도 보더
                                    : 'none',
                                lineHeight: '1.4',
                                textAlign: note.startsWith('*') ? 'center' : 'left',
                                fontSize: note.startsWith('*') ? '7.5pt' : '8pt',
                                color: note.startsWith('*') ? '#555555' : '#333333',
                                padding: '6px 8px',
                            }, children: note }) }, `note-${index}`))) }) }), _jsx("p", { style: {
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '8pt',
                    color: '#555555',
                }, children: specialNotes.footerNotice })] }));
};
/**
 * AiChatMessage 컴포넌트 함수
 */
export function AiChatMessage({ sender, text, imageUrl, fileType, onActionClick, invoiceData, calculatedTotalAmount, calculatedTotalDuration, calculatedTotalPages, currentItems, lang, }) {
    const isAiMessage = sender === 'ai';
    const t = aiChatDictionary[lang] ||
        aiChatDictionary.ko;
    const user = useAuthStore((state) => state.user);
    const countryCode = user?.countryCode || 'KR';
    const [isMobileView, setIsMobileView] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 750);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const formatAmountWithCurrency = useMemo(() => (amount, currencyCode = 'KRW') => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        const currencySymbols = {
            KRW: '₩',
            USD: '$',
            EUR: '€',
            JPY: '¥',
        };
        const symbol = currencySymbols[currencyCode] || '';
        return `${symbol}${numericAmount.toLocaleString('en-US')}`;
    }, []);
    const customComponents = {
        button: ({ node, ...props }) => {
            let action;
            let featureId;
            let buttonText = 'Button';
            // 노드 데이터에서 액션 정보 추출
            if (node && node.properties) {
                action = node.properties['data-action'];
                featureId = node.properties['data-feature-id'];
            }
            if (node &&
                node.children &&
                node.children.length > 0 &&
                node.children[0].value) {
                buttonText = node.children[0].value || 'Button';
            }
            // 액션이 있는 경우 클릭 핸들러 연결
            if (action) {
                return (_jsx(StyledActionButton, { onClick: () => {
                        if (action && onActionClick) {
                            onActionClick(action, featureId ? { featureId } : undefined);
                        }
                        else if (featureId && onActionClick) {
                            onActionClick('delete_feature', { featureId });
                        }
                    }, ...props, children: buttonText }));
            }
            return _jsx(StyledActionButton, { ...props, children: buttonText });
        },
    };
    return (_jsx(MessageWrapper, { "$sender": sender, children: _jsxs(MessageBox, { "$sender": sender, children: [isAiMessage && (_jsxs(AiProfileHeader, { children: [_jsx(ProfileImage, { src: "/ai/pretty.png", alt: "AI \uD504\uB85C\uD544" }), _jsx(ProfileName, { children: t.profileName })] })), _jsx(StyledMarkdownContainer, { children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeRaw], components: customComponents, children: text }) }), isAiMessage && invoiceData && (_jsxs(StyledInvoiceContainer, { children: [_jsx("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '1rem',
                            }, children: _jsx("div", { children: _jsx(InvoiceProjectTitle, { children: invoiceData.project || t.invoiceTitle }) }) }), isMobileView ? (_jsxs(MobileInvoiceContainer, { children: [invoiceData.invoiceGroup?.map((group) => group.items?.map((item, itemIndex) => {
                                    const currentItemStatus = currentItems?.find((ci) => ci.id === item.id);
                                    const isActuallyDeleted = currentItemStatus
                                        ? currentItemStatus.isDeleted
                                        : false;
                                    return (_jsxs(MobileInvoiceCardItem, { children: [_jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", children: t.tableHeaders.category }), _jsx("span", { className: `value ${isActuallyDeleted ? 'deleted' : ''}`, children: group.category })] }), _jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", children: t.tableHeaders.menu }), _jsx("span", { className: `value ${isActuallyDeleted ? 'deleted' : ''}`, children: item.menu })] }), _jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", children: t.tableHeaders.item }), _jsx("span", { className: `value ${isActuallyDeleted ? 'deleted' : ''}`, children: item.feature })] }), _jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", children: t.tableHeaders.detail }), _jsxs("div", { className: `description-value value ${isActuallyDeleted ? 'deleted' : ''}`, children: [_jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeRaw], children: item.description }), item.note &&
                                                                !/^[A-Z]{3}\s[\d,.]+\s\(₩[\d,.]+\)$/.test(item.note) && (_jsx("p", { style: {
                                                                    fontSize: '0.9em',
                                                                    color: AppColors.onSurfaceVariant,
                                                                    marginTop: '0.3em',
                                                                }, children: _jsxs("em", { children: [t.estimateInfo.note, ": ", item.note] }) }))] })] }), _jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", children: t.tableHeaders.amount }), _jsx("span", { className: `value ${isActuallyDeleted ? 'deleted' : ''}`, children: item.note &&
                                                            /^[A-Z]{3}\s[\d,.]+\s\(₩[\d,.]+\)$/.test(item.note)
                                                            ? item.note
                                                            : formatAmountWithCurrency(item.amount, true) })] }), _jsx("div", { className: "actions-row", children: _jsx(ActionButton, { onClick: () => onActionClick('delete_feature_json', {
                                                        featureId: item.id,
                                                    }), children: isActuallyDeleted
                                                        ? t.buttons.cancel
                                                        : t.buttons.delete }) })] }, item.id || `mobile-item-${itemIndex}`));
                                })), _jsxs(MobileInvoiceCardItem, { style: { marginTop: '2rem', backgroundColor: '#2a2a3a' }, children: [_jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", style: { fontWeight: 'bold' }, children: t.estimateInfo.totalSum }), _jsx("span", { className: "value", style: { fontWeight: 'bold' }, children: invoiceData.total?.totalConvertedDisplay &&
                                                        typeof invoiceData.total.totalConvertedDisplay ===
                                                            'string'
                                                        ? formatAmountWithCurrency(Math.round((calculatedTotalAmount ||
                                                            invoiceData.total?.amount ||
                                                            0) * 1), true)
                                                        : calculatedTotalAmount !== undefined
                                                            ? formatAmountWithCurrency(Math.round(calculatedTotalAmount * 1), true)
                                                            : formatAmountWithCurrency(Math.round((invoiceData.total?.amount || 0) * 1), true) })] }), _jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", style: { fontWeight: 'bold' }, children: t.estimateInfo.vatIncluded }), _jsx("span", { className: "value", style: { fontWeight: 'bold' }, children: invoiceData.total?.totalConvertedDisplay &&
                                                        typeof invoiceData.total.totalConvertedDisplay ===
                                                            'string'
                                                        ? formatAmountWithCurrency(Math.round((calculatedTotalAmount ||
                                                            invoiceData.total?.amount ||
                                                            0) * 1.1), true)
                                                        : calculatedTotalAmount !== undefined
                                                            ? formatAmountWithCurrency(Math.round(calculatedTotalAmount * 1.1), true)
                                                            : formatAmountWithCurrency(Math.round((invoiceData.total?.amount || 0) * 1.1), true) })] }), calculatedTotalDuration !== undefined && (_jsxs("div", { className: "item-row", children: [_jsx("span", { className: "label", children: t.estimateInfo.totalDuration }), _jsx("span", { className: "value", children: typeof calculatedTotalDuration === 'number'
                                                        ? `${Math.ceil(calculatedTotalDuration / 5)} ${t.estimateInfo.week} (${lang === 'ko' ? '약 ' : ''}${Math.ceil(calculatedTotalDuration / 20)} ${t.estimateInfo.monthUnit})`
                                                        : `${calculatedTotalDuration} ${t.estimateInfo.day}` })] }))] })] })) : (_jsxs(InvoiceTable, { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "col-category", children: t.tableHeaders.category }), _jsx("th", { className: "col-menu", children: t.tableHeaders.menu }), _jsx("th", { className: "col-feature", children: t.tableHeaders.item }), _jsx("th", { className: "col-description", children: t.tableHeaders.detail }), _jsx("th", { className: "col-amount", children: t.tableHeaders.amount }), _jsx("th", { className: "col-actions", children: t.tableHeaders.management })] }) }), _jsxs("tbody", { children: [invoiceData.invoiceGroup?.map((group) => (_jsx(React.Fragment, { children: group.items?.map((item, itemIndex) => {
                                                const currentItemStatus = currentItems?.find((ci) => ci.id === item.id);
                                                const isActuallyDeleted = currentItemStatus
                                                    ? currentItemStatus.isDeleted
                                                    : false;
                                                return (_jsxs("tr", { children: [itemIndex === 0 ? (_jsx("td", { className: "col-category", rowSpan: group.items.length || 1, style: {
                                                                textDecoration: isActuallyDeleted
                                                                    ? 'line-through'
                                                                    : 'none',
                                                                color: isActuallyDeleted
                                                                    ? AppColors.disabled
                                                                    : AppColors.onBackground,
                                                            }, children: group.category })) : null, _jsx("td", { className: "col-menu", style: {
                                                                textDecoration: isActuallyDeleted
                                                                    ? 'line-through'
                                                                    : 'none',
                                                                color: isActuallyDeleted
                                                                    ? AppColors.disabled
                                                                    : AppColors.onBackground,
                                                                textAlign: 'center',
                                                            }, children: item.menu }), _jsx("td", { className: "col-feature", style: {
                                                                textDecoration: isActuallyDeleted
                                                                    ? 'line-through'
                                                                    : 'none',
                                                                color: isActuallyDeleted
                                                                    ? AppColors.disabled
                                                                    : AppColors.onBackground,
                                                            }, children: item.feature }), _jsxs("td", { className: "col-description", style: {
                                                                textDecoration: isActuallyDeleted
                                                                    ? 'line-through'
                                                                    : 'none',
                                                                color: isActuallyDeleted
                                                                    ? AppColors.disabled
                                                                    : AppColors.onBackground,
                                                            }, children: [item.description, item.note &&
                                                                    !/^[A-Z]{3}\s[\d,.]+\s\(₩[\d,.]+\)$/.test(item.note) && (_jsx("p", { style: {
                                                                        fontSize: '0.9em',
                                                                        color: AppColors.onSurfaceVariant,
                                                                        marginTop: '0.3em',
                                                                    }, children: _jsxs("em", { children: [t.estimateInfo.note, ": ", item.note] }) }))] }), _jsx("td", { className: "col-amount", style: {
                                                                textDecoration: isActuallyDeleted
                                                                    ? 'line-through'
                                                                    : 'none',
                                                                color: isActuallyDeleted
                                                                    ? AppColors.disabled
                                                                    : AppColors.onBackground,
                                                            }, children: formatAmountWithCurrency(item.amount, true) }), _jsx("td", { className: "col-actions", children: _jsx(ActionButton, { onClick: () => onActionClick('delete_feature_json', {
                                                                    featureId: item.id,
                                                                }), children: isActuallyDeleted
                                                                    ? t.buttons.cancel
                                                                    : t.buttons.delete }) })] }, item.id || `feature-${itemIndex}`));
                                            }) }, `group-${group.category}`))), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "total-label", children: _jsx("strong", { children: t.estimateInfo.totalSum }) }), _jsx("td", { className: "col-amount", children: _jsx("strong", { children: calculatedTotalAmount !== undefined
                                                            ? formatAmountWithCurrency(calculatedTotalAmount, countryCode)
                                                            : formatAmountWithCurrency(invoiceData.total?.amount || 0, countryCode) }) }), _jsx("td", {})] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "total-label", children: _jsx("strong", { children: t.estimateInfo.vatIncluded }) }), _jsx("td", { className: "col-amount", children: _jsx("strong", { children: formatAmountWithCurrency(Math.round((calculatedTotalAmount ??
                                                            (invoiceData.total?.amount || 0)) * 1.1), countryCode) }) }), _jsx("td", {})] }), calculatedTotalDuration !== undefined && (_jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "total-label", children: t.estimateInfo.totalDuration }), _jsx("td", { className: "col-amount", children: typeof calculatedTotalDuration === 'number'
                                                        ? `${Math.ceil(calculatedTotalDuration / 5)} ${t.estimateInfo.week} (${lang === 'ko' ? '약 ' : ''}${Math.ceil(calculatedTotalDuration / 20)} ${t.estimateInfo.monthUnit})`
                                                        : `${calculatedTotalDuration} ${t.estimateInfo.day}` }), _jsx("td", {})] }))] })] })), _jsxs("div", { style: {
                                marginTop: '0',
                                paddingTop: '1rem',
                                borderTop: `1px solid ${AppColors.aiBorder}`,
                            }, children: [_jsx("h4", { style: { marginBottom: '0.75rem', fontSize: '1em' }, children: t.discount.title }), _jsx("p", { style: { marginBottom: '0.5rem', fontSize: '0.9em' }, children: t.discount.description }), _jsx("ul", { style: {
                                        listStyle: 'none',
                                        paddingLeft: 0,
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }, children: t.discount.options.map((optionText, index) => {
                                        let action = '';
                                        if (index === 0) {
                                            //   action = 'discount_extend_8w_20p';
                                            // } else if (index === 1) {
                                            action = 'discount_remove_features_budget';
                                        }
                                        else if (index === 1) {
                                            action = 'discount_ai_suggestion';
                                        }
                                        let mainText = optionText;
                                        let subText = '';
                                        if (index === 2 &&
                                            optionText.includes('(') &&
                                            optionText.includes(')')) {
                                            const match = optionText.match(/(.*)\\s*\\((.*)\\)/);
                                            if (match) {
                                                mainText = match[1].trim();
                                                subText = `(${match[2].trim()})`;
                                            }
                                        }
                                        return (_jsxs("li", { style: {
                                                marginBottom: '0.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }, children: [index === 2 && subText ? (_jsxs("span", { style: { display: 'flex', flexDirection: 'column' }, children: [_jsx("span", { children: mainText }), _jsx("span", { style: {
                                                                fontSize: '0.9em',
                                                                color: AppColors.onSurfaceVariant,
                                                            }, children: subText })] })) : (_jsx("span", { children: optionText })), _jsx(ActionButton, { onClick: () => {
                                                        devLog(`[AiChatMessage] ActionButton clicked. Action: ${action}, Index: ${index}`);
                                                        onActionClick(action);
                                                    }, style: { marginLeft: '0.5rem' }, children: t.discount.optionsButtonTexts[index] ||
                                                        t.buttons.select })] }, index));
                                    }) })] }), _jsxs("div", { children: [_jsxs("h4", { style: { marginBottom: '0.75rem', fontSize: '1em' }, children: [t.pdf.title, ' '] }), _jsx(ActionButton, { onClick: () => onActionClick('download_pdf'), style: {
                                        backgroundColor: '#2E7D32',
                                        width: '150px',
                                    }, children: t.buttons.downloadPdf })] })] })), imageUrl && fileType && fileType.startsWith('image/') && (_jsx("div", { style: {
                        marginTop: '10px',
                        textAlign: sender === 'user' ? 'right' : 'left',
                    }, children: _jsx("img", { src: imageUrl, alt: "\uCCA8\uBD80 \uC774\uBBF8\uC9C0", style: {
                            maxWidth: '300px',
                            maxHeight: '300px',
                            borderRadius: '8px',
                        } }) }))] }) }));
}
