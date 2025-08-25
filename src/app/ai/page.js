import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import useAI from '@/hooks/useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import BottomInput from '@/components/ai-esti/BottomInput';
import AiResponseMessage from '@/components/ai-esti/AiResponseMessage';
import PromptSelector from '@/components/ai-esti/PromptSelector';
import { promptTemplates, combinePrompts } from '@/ai/promptTemplates';
import EstimateCard from '@/components/ai-esti/EstimateCard';
import EstimateAccordion from '@/components/ai-esti/EstimateAccordion';
import DetailModal from '@/components/ai-esti/DetailModal';
import EstimateActionButtons from '@/components/ai-esti/EstimateActionButtons';
import PeriodSlider from '@/components/ai-esti/PeriodSlider';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
const Container = styled.div `
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
`;
const ChatBox = styled.div `
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 8px;
  padding: 12px;
  min-height: 320px;

`;
const UserMessage = styled.div `
  align-self: flex-end;
  background: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 80%;
  white-space: pre-wrap;
`;
const StyledAiMessage = styled(AiResponseMessage) `
  padding: 0;
  max-width: ${({ isFullWidth }) => (isFullWidth ? '100%' : '80%')}; // 👈 prop에 따라 동적 스타일 적용
  align-self: flex-start;
`;
const Controls = styled.div `
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;
const Select = styled.select `
  height: 36px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 0 8px;
`;
const Button = styled.button `
  height: 44px;
  padding: 0 16px;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  border-radius: 8px;
  font-weight: 600;
`;
const EstimateContainer = styled.div `
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;
const TopSection = styled.div `
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
`;
const MainContent = styled.div `
  flex: 1;
  min-width: 320px;
  width: 100%;
  padding-bottom: 20px;

  @media (min-width: 1024px) {
    width: 560px;
  }
`;
const SideContent = styled.div `
  width: 100%;

  @media (min-width: 1024px) {
    width: 320px;
    position: sticky;
    top: 120px;
  }
`;
const DetailsToggle = styled.div `
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 160%; 
  letter-spacing: 0.28px;
  color: ${({ theme }) => theme.subtleText};
  cursor: pointer;
  margin: -20px 0 20px;
`;
const DetailsToggleIcon = styled.div `
  margin-top: 4px;
  margin-left: 10px;
`;
const AnimatedContainer = styled.div `
  display: grid;
  grid-template-rows: ${({ $isvisible }) => ($isvisible ? '1fr' : '0fr')};
  transition: grid-template-rows 0.5s ease-in-out;
  overflow: hidden;

  > * {
    min-height: 0;
  }
`;
// JSON 응답에서 견적서 데이터 추출
const extractEstimateData = (content) => {
    try {
        const match = content.match(/<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/);
        if (!match)
            return null;
        const jsonStr = match[1];
        const data = JSON.parse(jsonStr);
        // 데이터 구조 검증
        if (!data || typeof data !== 'object' || !Array.isArray(data.categories)) {
            console.error('Invalid estimate data structure:', data);
            return null;
        }
        return data;
    }
    catch (error) {
        console.error('Failed to parse estimate data:', error);
        return null;
    }
};
// AI 응답 메시지 렌더링 컴포넌트
const AiMessageContent = ({ content }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [projectPeriod, setProjectPeriod] = useState(20); // 기본값
    const estimateData = extractEstimateData(content);
    const handleItemClick = (item) => {
        setSelectedItem(item);
    };
    const handleCloseModal = () => {
        setSelectedItem(null);
    };
    if (estimateData && estimateData.categories) {
        return (_jsxs(EstimateContainer, { children: [content.split('<script')[0].trim() && (_jsx("div", { style: { marginBottom: '16px' }, children: content.split('<script')[0].trim() })), _jsxs(TopSection, { children: [_jsxs(MainContent, { children: [_jsx(EstimateCard, { estimate: estimateData }), _jsxs(DetailsToggle, { onClick: () => setIsDetailsVisible(!isDetailsVisible), children: ["\uC0C1\uC138\uACAC\uC801 \uBCF4\uAE30 ", isDetailsVisible ?
                                            _jsx(DetailsToggleIcon, { children: _jsx(IoChevronUp, { size: 24 }) }) :
                                            _jsx(DetailsToggleIcon, { children: _jsx(IoChevronDown, { size: 24 }) })] }), _jsx(PeriodSlider, { value: projectPeriod, onChange: setProjectPeriod }), _jsx(AnimatedContainer, { "$isvisible": isDetailsVisible, children: _jsx(EstimateAccordion, { data: estimateData, onItemClick: handleItemClick }) })] }), _jsx(SideContent, { children: _jsx(EstimateActionButtons, { onConsult: () => console.log('문의하기'), onAiEstimate: () => console.log('AI 예산 줄이기'), onAiOptimize: () => console.log('AI 맞춤 추천') }) })] }), selectedItem && (_jsx(DetailModal, { item: selectedItem, onClose: handleCloseModal }))] }));
    }
    if (estimateData && estimateData.categories) {
        // 견적서 UI 렌더링
    }
    else if (content.includes('<script')) {
        // JSON 파싱 중일 때 로딩 상태 표시
        return _jsx("div", { children: "\uACAC\uC801\uC11C\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..." });
    }
    return _jsx("div", { children: content });
};
export default function AiChatPage() {
    const { modelName, setModelName, generate, sendChat, resetChat, testModel } = useAI('gemini-2.5-flash-lite');
    const { success, error } = useToast();
    const messages = useChatStore((s) => s.messages);
    const addMessage = useChatStore((s) => s.addMessage);
    const clear = useChatStore((s) => s.clear);
    const [selectedPromptId, setSelectedPromptId] = useState('default');
    const [isProcessing, setIsProcessing] = useState(false);
    const updateLastMessage = useChatStore((s) => s.updateLastMessage);
    const isEstimateMessage = (content) => {
        return content.includes('<script type="application/json" id="invoiceData">');
    };
    const handleSubmit = async (input) => {
        if (!input.trim() || isProcessing)
            return;
        setIsProcessing(true);
        addMessage({ role: 'user', content: input });
        addMessage({ role: 'ai', content: '', isLoading: true });
        try {
            const combinedPrompt = combinePrompts(selectedPromptId, input);
            const reply = await sendChat(combinedPrompt);
            updateLastMessage(reply); // 마지막 메시지를 응답으로 업데이트
        }
        finally {
            setIsProcessing(false);
        }
    };
    const onTestModel = async () => {
        const r = await testModel();
        if (r.ok)
            success(`[${modelName}] OK: ${r.message}`);
        else
            error(`[${modelName}] ERROR: ${r.message}`);
    };
    const handleModelChange = (e) => {
        setModelName(e.target.value);
    };
    return (_jsxs(Container, { children: [_jsx("h1", { style: { fontSize: 18, fontWeight: 700, marginBottom: 12 }, children: "AI \uB300\uD654" }), _jsxs(Controls, { children: [_jsxs(Select, { value: modelName, onChange: handleModelChange, children: [_jsx("option", { value: "gemini-2.5-flash", children: "gemini-2.5-flash" }), _jsx("option", { value: "gemini-2.5-flash-lite", children: "gemini-2.5-flash-lite" }), _jsx("option", { value: "gemini-2.0-flash", children: "gemini-2.0-flash" })] }), _jsx(Button, { type: "button", onClick: onTestModel, children: "\uBAA8\uB378 \uD14C\uC2A4\uD2B8" }), _jsx(Button, { type: "button", onClick: resetChat, style: { background: '#374151' }, children: "\uCC44\uD305 \uC138\uC158 \uCD08\uAE30\uD654" }), _jsx(Button, { type: "button", onClick: clear, style: { background: '#6b7280' }, children: "\uBA54\uC2DC\uC9C0 \uBE44\uC6B0\uAE30" }), _jsx(PromptSelector, { templates: promptTemplates, selectedId: selectedPromptId, onSelect: setSelectedPromptId })] }), _jsx(ChatBox, { children: messages.map((m, idx) => (m.role === 'user' ? (_jsx(UserMessage, { children: m.content }, idx)) : (_jsx(StyledAiMessage, { content: _jsx(AiMessageContent, { content: m.content }), profileImage: "/ai-estimate/pretty.png", name: "AI \uC5D0\uC774\uC804\uD2B8", isFullWidth: isEstimateMessage(m.content) }, idx)))) }), _jsx(BottomInput, { placeholder: "\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694", onSubmit: handleSubmit })] }));
}
