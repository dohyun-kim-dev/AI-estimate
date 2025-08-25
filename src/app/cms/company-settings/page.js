'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import TextField from '@/components/common/TextField';
// Mock Data (실제로는 API를 통해 받아올 데이터)
const initialCompanyInfo = {
    id: 'AG-001',
    createdTime: '2023-01-15',
    lastLoginTime: '2024-08-18 10:30',
    name: 'AIGO Corp.',
    logo: 'https://placehold.co/80x80/EFEFEF/969696?text=LOGO',
    ceo: '김아이고',
    businessNo: '123-45-67890',
    adminId: 'admin_aigo',
    email: 'contact@aigo.co.kr',
    cellphone: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
    description: 'AI 솔루션 개발 및 제공'
};
const SettingsContainer = styled.div `
  max-width: 1050px;
  margin: 0 auto;
  padding: 84px 24px 24px 24px;
`;
const Card = styled.div `
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;
const Heading = styled.h2 `
  color:black;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;
const Subtitle = styled.p `
  font-size: 16px;
  color:black;
  margin-bottom: 24px;
`;
const InfoGrid = styled.div `
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const LogoImage = styled.img `
  width: 80px;
  height: auto;
  object-fit: contain;
`;
export default function CompanyInfoSettingsPage() {
    const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyInfo(prev => ({ ...prev, [name]: value }));
    };
    return (_jsxs(SettingsContainer, { children: [_jsx(Heading, { children: "\uD68C\uC0AC\uC815\uBCF4" }), _jsx(Subtitle, { children: "\uB4F1\uB85D\uB41C \uD68C\uC0AC\uC815\uBCF4\uB97C \uD655\uC778\uD558\uACE0 \uAD00\uB9AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsx(Card, { children: _jsxs(InfoGrid, { children: [_jsx(TextField, { label: "No", name: "id", value: companyInfo.id, onChange: handleChange, disabled: true }), _jsx(TextField, { label: "\uAC00\uC785\uC77C", name: "createdTime", value: companyInfo.createdTime, onChange: handleChange, disabled: true }), _jsx(TextField, { label: "\uCD5C\uADFC\uC811\uC18D", name: "lastLoginTime", value: companyInfo.lastLoginTime, onChange: handleChange, disabled: true }), _jsx(TextField, { label: "\uACE0\uAC1D\uC0AC\uBA85", name: "name", value: companyInfo.name, onChange: handleChange }), _jsx(TextField, { label: "\uB85C\uACE0", name: "logo", value: companyInfo.logo, onChange: handleChange, placeholder: "\uB85C\uACE0 URL" }), _jsx(TextField, { label: "\uB300\uD45C\uBA85", name: "ceo", value: companyInfo.ceo, onChange: handleChange }), _jsx(TextField, { label: "\uC0AC\uC5C5\uC790\uBC88\uD638", name: "businessNo", value: companyInfo.businessNo, onChange: handleChange }), _jsx(TextField, { label: "\uC544\uC774\uB514", name: "adminId", value: companyInfo.adminId, onChange: handleChange, disabled: true }), _jsx(TextField, { label: "\uC774\uBA54\uC77C", name: "email", value: companyInfo.email, onChange: handleChange }), _jsx(TextField, { label: "\uC804\uD654\uBC88\uD638", name: "cellphone", value: companyInfo.cellphone, onChange: handleChange }), _jsx(TextField, { label: "\uC8FC\uC18C", name: "address", value: companyInfo.address, onChange: handleChange }), _jsx(TextField, { label: "\uBE44\uACE0", name: "description", value: companyInfo.description, onChange: handleChange })] }) })] }));
}
;
