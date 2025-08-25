// src/app/ai-estimate/components/EstimateSheet.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import EstimateAccordion from './EstimateAccordion';
const SheetWrapper = styled.div `
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;
const Header = styled.div `
  background-color: ${({ theme }) => theme.surface2};
  padding: 25px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;
const ProjectName = styled.h1 `
  font-size: 1.8em;
  color: ${({ theme }) => theme.text};
  margin-bottom: 15px;
  font-weight: 700;
`;
const PriceInfo = styled.div `
  display: flex;
  justify-content: space-around;
  font-size: 1.1em;
  color: ${({ theme }) => theme.subtleText};
  gap: 20px;
`;
const EstimateSheet = ({ data }) => {
    return (_jsxs(SheetWrapper, { children: [_jsxs(Header, { children: [_jsx(ProjectName, { children: data.project_name }), _jsxs(PriceInfo, { children: [_jsxs("span", { children: [_jsx("strong", { children: "\uCD1D \uD569\uACC4:" }), " ", data.total_price, "\uC6D0"] }), _jsxs("span", { children: [_jsx("strong", { children: "\uBD80\uAC00\uC138 \uD3EC\uD568:" }), " ", data.vat_included_price, "\uC6D0"] }), _jsxs("span", { children: [_jsx("strong", { children: "\uC608\uC0C1 \uAE30\uAC04:" }), " ", data.estimated_period] })] })] }), _jsx(EstimateAccordion, { data: data })] }));
};
export default EstimateSheet;
