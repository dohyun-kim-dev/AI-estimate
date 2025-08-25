"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled, { keyframes } from 'styled-components';
const MessageWrapper = styled.div `
  display: flex;
  gap: 15px;
  padding: 12px 0;
  max-width: 800px;
`;
const ProfileImage = styled.img `
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;

  ${props => props['data-is-loading'] && `
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid transparent;
      border-top-color: #3498db; // 로딩 바 색상
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
      z-index: -1;
    }
  `}
`;
const ContentWrapper = styled.div `
  flex: 1;
`;
const Header = styled.div `
  display:flex;
  gap: 8px;
  margin-bottom: 4px;

  h2 {
    font-size: 18px;
    font-weight: 500;
    line-height: 160%;
    margin: 4px 0 4px 0;
    color: ${({ theme }) => theme.text};
  }
`;
const MessageContent = styled.div `
  font-size: 14px;
  line-height: 160%;
  color: ${({ theme }) => theme.text};
  white-space: pre-wrap;
  
  p {
    margin: 0;
  }
`;
const AiResponseMessage = ({ profileImage = "/ai-estimate/pretty.png", name = "AI 컨설턴트", content, className, isLoading = false }) => {
    const spin = keyframes `
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
`;
    return (_jsx(MessageWrapper, { className: className, children: _jsxs(ContentWrapper, { children: [_jsxs(Header, { children: [_jsx(ProfileImage, { src: profileImage, alt: name, "data-is-loading": isLoading }), _jsx("h2", { children: name })] }), _jsx(MessageContent, { children: typeof content === 'string' ? _jsx("p", { children: content }) : content })] }) }));
};
export default AiResponseMessage;
