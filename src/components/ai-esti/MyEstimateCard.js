"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
const CardWrapper = styled.div `
  background-color: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
  padding: 20px;
`;
const Header = styled.div `

`;
const Flex = styled.div `
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 32px 0;
`;
const SubText = styled.p `
  font-size: 12px;
  color: ${({ theme }) => theme.subtleText};
  margin: 0 0 12px 0;
`;
const Title = styled.h2 `
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.4;
  max-height: calc(1.4em * 2); /* 2줄까지만 표시 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 최대 줄 수 */
  -webkit-box-orient: vertical;
  word-break: break-word; /* 긴 단어도 줄바꿈 처리 */
`;
const Right = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Price = styled.p `
  font-size: 20px;
font-style: normal;
font-weight: 700;
line-height: normal;
letter-spacing: 0.4px;
  margin: 0 0 8px 0;
  
  span {
    font-size: 0.7em;
    font-weight: normal;
    color: ${({ theme }) => theme.subtleText};
    margin-left: 8px;
  }
`;
const Period = styled.p `
  font-size: 16px;
font-style: normal;
font-weight: 700;
line-height: normal;
letter-spacing: 0.32px;
  color: ${({ theme }) => theme.text};
  margin: 0 0 24px 0;

  .p {
  font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: normal;
letter-spacing: 0.24px;
color: ${({ theme }) => theme.subtleText};
}
`;
const ActionButtons = styled.div `

  display: flex;
  gap: 10px;
  padding-top: 4px;
  margin: 4px;
`;
const Line = styled.div `
  border-left: 1px solid ${({ theme }) => theme.border};
  `;
const ActionButton = styled.button `
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme }) => theme.cardButton};
  color: ${({ theme, primary }) => (primary ? (theme.body) : theme.text)};
  font-family: Roboto;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 160%; 
  letter-spacing: 0.28px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;
const ShareInput = styled.div `
  display: flex;
  gap: 8px;
  margin-top: 8px;

  input {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
    padding: 0 12px;
  }

  button {
    height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    background: #2E2E48;
    color: white;
    font-size: 14px;
font-style: normal;
font-weight: 400;
line-height: 160%;
letter-spacing: 0.32px;
  }
`;
const MyEstimateCard = ({ estimate }) => {
    const [openShare, setOpenShare] = useState(false);
    const { success } = useToast();
    const { isDarkMode } = useThemeStore();
    // estimated_period가 '30주'와 같은 문자열일 경우를 가정하고 숫자만 추출합니다.
    const weekValue = parseInt(estimate.estimated_period);
    // 1개월의 평균 주 수 (30.41일 / 7일)를 사용하여 개월 수를 계산하고 올림 처리합니다.
    const weeksPerMonth = 4.345;
    const monthValue = Math.ceil(weekValue / weeksPerMonth);
    // 최종적으로 보여줄 기간 문자열을 생성합니다.
    const displayPeriod = `(약 ${monthValue}개월)`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href + `?estimate=${encodeURIComponent(estimate.project_name)}` : '';
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            success('링크가 복사되었습니다.');
        }
        catch {
            // ignore
        }
    };
    return (_jsxs(CardWrapper, { children: [_jsxs(Header, { children: [_jsx(SubText, { children: estimate.created_at || '2025-08-23' }), _jsxs(Flex, { children: [_jsx(Title, { children: estimate.project_name }), _jsx(Right, {})] }), _jsxs(ActionButtons, { children: [_jsx(ActionButton, { children: "\uACAC\uC801 \uACF5\uC720\uD558\uAE30" }), _jsx(ActionButton, { children: "\uACAC\uC801 PDF \uBC1B\uAE30" })] })] }), _jsxs(Modal, { open: openShare, title: "\uACAC\uC801\uC11C \uACF5\uC720", onClose: () => setOpenShare(false), width: 520, children: [_jsx("div", { style: { color: '#A1A1AA', fontSize: 14, marginBottom: 32 }, children: "\uACF5\uC720\uBC1B\uC740 \uC0AC\uC6A9\uC790\uB294 \uACAC\uC801 \uB0B4\uC6A9\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsxs(ShareInput, { children: [_jsx("input", { readOnly: true, value: shareUrl, placeholder: "https://aigocorp.com/id..." }), _jsx("button", { onClick: handleCopy, children: "\uB9C1\uD06C\uBCF5\uC0AC" })] })] })] }));
};
export default MyEstimateCard;
