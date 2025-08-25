// src/app/ai-estimate/components/EstimateActionButtons.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import { IoChevronForward } from 'react-icons/io5';
import Icon from './Icon';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/ToastProvider';
import TextField from '@/components/common/TextField';
const ButtonsContainer = styled.div `
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 1024px) {
    margin-top: 0;
  }
`;
const ActionButton = styled.button `
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  @media (min-width: 1024px) {
    padding: 24px;
    min-height: 120px;
    flex-direction: column;
  }

  &:hover {
    background-color: ${({ theme }) => theme.pick};
  }
`;
const LeftContent = styled.div `
  display: flex;
  align-items: center;
  gap: 16px;
`;
const IconWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;
const Flex = styled.div `
 display:flex;
 align-items:center;
 gap:10px;
`;
const TextContent = styled.div `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;
const Title = styled.div `
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};

  @media (min-width: 1024px) {
    font-size: 20px;
  }
`;
const Description = styled.div `
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  opacity: 0.8;
  width: 100%;
  line-height: 1.4;
  white-space: pre-line;
  text-align: left;
  margin-top: 4px;

  @media (min-width: 1024px) {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 50px;
  }
`;
const ChevronIcon = styled(IoChevronForward) `
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);

  @media (min-width: 1024px) {
    display: none;
  }
`;
const ActionButtonBottom = styled.div `
  display: none;
  
  @media (min-width: 1024px) {
  width:100%;
  margin-top:30px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    background-color: ${({ theme }) => theme.accent};
    color: white;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  }
`;
const Form = styled.form `
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1024px) {
    width: 85%;
    margin-left: auto;
    margin-right: auto;
  }
`;
const Disclaimer = styled.p `
  margin-top: 4px;
  font-size: 12px;
  color: #666666;
`;
const SubmitButton = styled.button `
  height: 44px;
  border-radius: 8px;
  background: #2E2E48;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  width: 80%;
  align-self: center;
`;
const EstimateActionButtons = ({ onConsult, onAiEstimate, onAiOptimize }) => {
    const [openConsult, setOpenConsult] = useState(false);
    const { success } = useToast();
    const handleSubmit = (e) => {
        e.preventDefault();
        setOpenConsult(false);
        success('문의가 접수되었습니다.');
    };
    return (_jsxs(ButtonsContainer, { children: [_jsxs(ActionButton, { onClick: () => { setOpenConsult(true); onConsult?.(); }, children: [_jsx(LeftContent, { children: _jsxs(TextContent, { children: [_jsxs(Flex, { children: [_jsx(IconWrapper, { children: _jsx(Icon, { src: "/ai-estimate/docs.png", width: 24, height: 24 }) }), _jsx(Title, { children: "\uC5EC\uAE30\uB2F7\uC5D0\uAC8C \uBB38\uC758\uD558\uAE30" })] }), _jsxs(Description, { children: ["\uB300\uD45C\uB2D8\uC758 \uC608\uC0B0\uC5D0 \uB9DE\uCD98 \uAE30\uB2A5\uB4E4\uC744 \uACAC\uC801\uC73C\uB85C ", _jsx("br", {}), "\uC790\uC138\uD788 \uBC1B\uC544\uBCF4\uC138\uC694 ~ \uB4F1\uB4F1"] })] }) }), _jsx(ChevronIcon, { size: 20 }), _jsx(ActionButtonBottom, { children: "\uBB38\uC758\uD558\uAE30" })] }), _jsxs(ActionButton, { onClick: onAiEstimate, children: [_jsx(LeftContent, { children: _jsxs(TextContent, { children: [_jsxs(Flex, { children: [_jsx(IconWrapper, { children: _jsx(Icon, { src: "/ai-estimate/trending_down.png", width: 24, height: 24 }) }), _jsx(Title, { children: "AI \uC608\uC0B0 \uC904\uC774\uAE30" })] }), _jsxs(Description, { children: ["\uAE30\uB2A5\uC744 \uC870\uC18C\uD654 \uD558\uC5EC \uC804\uB7B5\uAE30\uC900 ", _jsx("br", {}), "\uC2A4\uB9C8\uD2B8\uD558\uAC8C \uC904\uC784"] })] }) }), _jsx(ChevronIcon, { size: 20 }), _jsx(ActionButtonBottom, { children: "AI \uC608\uC0B0 \uC904\uC774\uAE30" })] }), _jsxs(ActionButton, { onClick: onAiOptimize, children: [_jsx(LeftContent, { children: _jsxs(TextContent, { children: [_jsxs(Flex, { children: [_jsx(IconWrapper, { children: _jsx(Icon, { src: "/ai-estimate/awesome.png", width: 24, height: 24 }) }), _jsx(Title, { children: "AI \uB9DE\uCDA4 \uCD94\uCC9C" })] }), _jsxs(Description, { children: ["AI\uAC00 \uBB38\uC81C\uB41C \uD544\uC218 \uAE30\uB2A5\uB4E4\uC744 \uBE60\uB974\uAC8C \uC81C\uC548,", _jsx("br", {}), " \uC0AC\uC5C5\uC131\uC7A5\uC5D0 \uD575\uC2EC\uAE30\uB2A5\uB4E4 \uCD94\uCC9C"] })] }) }), _jsx(ChevronIcon, { size: 20 }), _jsx(ActionButtonBottom, { children: "AI \uB9DE\uCDA4\uCD94\uCC9C" })] }), _jsxs(Modal, { open: openConsult, title: "\uD544\uC218 \uC815\uBCF4 \uC785\uB825", centerTitle: true, onClose: () => setOpenConsult(false), width: 520, children: [_jsx("div", { style: { fontSize: 14, textAlign: 'center' }, children: "\uC815\uD655\uD55C \uC0C1\uB2F4\uC744 \uC704\uD574 \uD544\uC218 \uC815\uBCF4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694" }), _jsxs(Form, { onSubmit: handleSubmit, children: [_jsx(TextField, { id: "name", label: "\uC774\uB984", placeholder: "\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", required: true }), _jsx(TextField, { id: "email", label: "\uC774\uBA54\uC77C", type: "email", placeholder: "\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", required: true }), _jsx(TextField, { id: "phone", label: "\uC804\uD654\uBC88\uD638", placeholder: "\uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694", required: true }), _jsx(Disclaimer, { children: "\uBB38\uC758 \uC2DC \uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1\u00B7\uC774\uC6A9\uC5D0 \uB3D9\uC758\uD55C \uAC83\uC73C\uB85C \uAC04\uC8FC\uB429\uB2C8\uB2E4." }), _jsx(SubmitButton, { type: "submit", children: "\uBB38\uC758 \uC811\uC218" })] })] })] }));
};
export default EstimateActionButtons;
