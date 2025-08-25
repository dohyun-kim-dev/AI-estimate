import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";
import MyEstimateCard from '../../../components/ai-esti/MyEstimateCard';
const Container = styled.div `
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
`;
const EmptyState = styled.div `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 16px;
  color: ${({ theme }) => theme.subtleText};
`;
const Title = styled.h1 `
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 12px 0 4px;
`;
const Desc = styled.p `
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
`;
const CTAButton = styled.button `
  margin-top: 12px;
  background-color: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.surface2};
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`;
// 그룹 타이틀
const GroupTitle = styled.h2 `
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 32px 0 16px;
`;
const mockEstimates = [
    {
        project_name: "AI 기반 쇼핑몰 자동화 시스템",
        created_at: new Date().toISOString().slice(0, 10), // 오늘
        estimated_period: "30주",
        total_price: 120000000,
    },
    {
        project_name: "모바일 헬스케어 플랫폼",
        created_at: new Date().toISOString().slice(0, 10), // 오늘
        estimated_period: "20주",
        total_price: 80000000,
    },
    {
        project_name: "기업용 ERP 통합 솔루션",
        created_at: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // 어제
        estimated_period: "40주",
        total_price: 200000000,
    },
    {
        project_name: "온라인 교육 AI 챗봇",
        created_at: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), // 7일 전
        estimated_period: "15주",
        total_price: 50000000,
    },
    {
        project_name: "스마트 물류 관리 시스템",
        created_at: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), // 7일 전
        estimated_period: "25주",
        total_price: 95000000,
    },
];
export default function MyEstimatePage() {
    const navigate = useNavigate();
    // const { estimates } = useEstimateStore(); // 여러 견적을 저장한다고 가정
    const estimates = mockEstimates;
    if (!estimates || estimates.length === 0) {
        return (_jsx(Container, { children: _jsxs(EmptyState, { children: [_jsx(Title, { children: "\uC800\uC7A5\uB41C \uACAC\uC801\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" }), _jsx(Desc, { children: "AI \uC0C1\uB2F4\uC73C\uB85C \uCCAB \uACAC\uC801\uC744 \uB9CC\uB4E4\uC5B4 \uBCF4\uC138\uC694." }), _jsx(CTAButton, { onClick: () => navigate('/ai-estimate'), children: "AI \uACAC\uC801 \uC2DC\uC791\uD558\uAE30" })] }) }));
    }
    // 날짜 비교용
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const todayEstimates = estimates.filter(e => e.created_at === today);
    const yesterdayEstimates = estimates.filter(e => e.created_at === yesterday);
    const weekEstimates = estimates.filter(e => e.created_at <= weekAgo);
    return (_jsxs(Container, { children: [todayEstimates.length > 0 && (_jsxs(_Fragment, { children: [_jsx(GroupTitle, { children: "\uC624\uB298" }), todayEstimates.map((estimate, idx) => (_jsx(MyEstimateCard, { estimate: estimate }, `today-${idx}`)))] })), yesterdayEstimates.length > 0 && (_jsxs(_Fragment, { children: [_jsx(GroupTitle, { children: "\uC5B4\uC81C" }), yesterdayEstimates.map((estimate, idx) => (_jsx(MyEstimateCard, { estimate: estimate }, `yesterday-${idx}`)))] })), weekEstimates.length > 0 && (_jsxs(_Fragment, { children: [_jsx(GroupTitle, { children: "\uC77C\uC8FC\uC77C \uC804" }), weekEstimates.map((estimate, idx) => (_jsx(MyEstimateCard, { estimate: estimate }, `week-${idx}`)))] }))] }));
}
