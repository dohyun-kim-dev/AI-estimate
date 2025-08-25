// src/app/ai-estimate/components/AiConsultantHeader.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styled from 'styled-components';
const HeaderWrapper = styled.div `
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;

  white-space: pre-line;
`;
const ProfileImage = styled.img `
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;
const Info = styled.div `
  h2 {
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 160%; /* 28.8px */
    margin: 0 0 5px 0;
    color: ${({ theme }) => theme.text};
  }
  p {
    font-size: 0.9em;
    color: ${({ theme }) => theme.subtleText};
    margin: 0;
  }
`;
const Description = styled.p `
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; 
  color: ${({ theme }) => theme.text};
  margin: 0;
`;
const AiConsultantHeader = () => {
    return (_jsxs(_Fragment, { children: [_jsxs(HeaderWrapper, { children: [_jsx(ProfileImage, { src: "/ai-estimate/pretty.png", alt: "AI Consultant" }), _jsx(Info, { children: _jsx("h2", { children: "AI \uCEE8\uC124\uD134\uD2B8" }) })] }), _jsxs(Description, { children: ["AI \uAC00 \uCD94\uC815\uD55C \uACAC\uC801\uC785\uB2C8\uB2E4.", _jsx("br", {}), "\uC2E4\uC81C \uAC1C\uBC1C \uD658\uACBD\uC774\uB098 \uC694\uAD6C \uC870\uAC74\uC5D0 \uB530\uB77C \uCC28\uC774\uAC00 \uC788\uC744 \uC218 \uC788\uC5B4\uC694. \uC9C0\uAE08 \uC804\uBB38\uAC00\uC640 \uC9C1\uC811 \uD655\uC778\uD558\uACE0 \uB354 \uC815\uD655\uD55C \uACAC\uC801\uC744 \uBC1B\uC544\uBCF4\uC138\uC694."] })] }));
};
export default AiConsultantHeader;
