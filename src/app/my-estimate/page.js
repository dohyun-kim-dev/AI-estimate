import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styled from 'styled-components';
import { useEstimateStore } from '@/store/estimateStore';
import EstimateCard from '@/components/ai-esti/EstimateCard';
import { useNavigate } from "react-router-dom";
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
// 추가: 라이브 섹션
const LiveSection = styled.section `
  margin-top: 32px;
`;
const LiveTitle = styled.h3 `
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 12px;
`;
const VideoWrapper = styled.div `
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  background: #000;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;
export default function MyEstimatePage() {
    const navigate = useNavigate();
    const { projectEstimate } = useEstimateStore();
    return (_jsxs(Container, { children: [!projectEstimate ? (_jsxs(EmptyState, { children: [_jsx(Title, { children: "\uC800\uC7A5\uB41C \uACAC\uC801\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" }), _jsx(Desc, { children: "AI \uC0C1\uB2F4\uC73C\uB85C \uCCAB \uACAC\uC801\uC744 \uB9CC\uB4E4\uC5B4 \uBCF4\uC138\uC694." }), _jsx(CTAButton, { onClick: () => navigate('/ai-estimate'), children: "AI \uACAC\uC801 \uC2DC\uC791\uD558\uAE30" })] })) : (_jsxs(_Fragment, { children: [_jsx(Title, { children: "\uB098\uC758 \uCD5C\uC2E0 \uACAC\uC801" }), _jsx(EstimateCard, { estimate: projectEstimate })] })), _jsxs(LiveSection, { children: [_jsx(LiveTitle, { children: "\uC2E4\uC2DC\uAC04 \uB77C\uC774\uBE0C" }), _jsx(VideoWrapper, { children: _jsx("iframe", { src: "https://www.youtube.com/embed/GhleiSfZCOM?rel=0&modestbranding=1&playsinline=1&autoplay=0&mute=0", title: "YouTube live", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", referrerPolicy: "strict-origin-when-cross-origin", allowFullScreen: true }) })] })] }));
}
