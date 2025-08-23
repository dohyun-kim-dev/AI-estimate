'use client';

import React, { useState, useEffect } from 'react';
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

const SettingsContainer = styled.div`
  max-width: 1050px;
  margin: 0 auto;
  padding: 84px 24px 24px 24px;
`;

const Card = styled.div`
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Heading = styled.h2`
  color:black;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color:black;
  margin-bottom: 24px;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const LogoImage = styled.img`
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

  return (
      <SettingsContainer>
        <Heading>회사정보</Heading>
        <Subtitle>등록된 회사정보를 확인하고 관리할 수 있습니다.</Subtitle>
        <Card>
          <InfoGrid>
            <TextField
              label="No"
              name="id"
              value={companyInfo.id}
              onChange={handleChange}
              disabled
            />
            <TextField
              label="가입일"
              name="createdTime"
              value={companyInfo.createdTime}
              onChange={handleChange}
              disabled
            />
            <TextField
              label="최근접속"
              name="lastLoginTime"
              value={companyInfo.lastLoginTime}
              onChange={handleChange}
              disabled
            />
            <TextField
              label="고객사명"
              name="name"
              value={companyInfo.name}
              onChange={handleChange}
            />
            <TextField
              label="로고"
              name="logo"
              value={companyInfo.logo}
              onChange={handleChange}
              placeholder="로고 URL"
            />
            <TextField
              label="대표명"
              name="ceo"
              value={companyInfo.ceo}
              onChange={handleChange}
            />
            <TextField
              label="사업자번호"
              name="businessNo"
              value={companyInfo.businessNo}
              onChange={handleChange}
            />
            <TextField
              label="아이디"
              name="adminId"
              value={companyInfo.adminId}
              onChange={handleChange}
              disabled
            />
            <TextField
              label="이메일"
              name="email"
              value={companyInfo.email}
              onChange={handleChange}
            />
            <TextField
              label="전화번호"
              name="cellphone"
              value={companyInfo.cellphone}
              onChange={handleChange}
            />
            <TextField
              label="주소"
              name="address"
              value={companyInfo.address}
              onChange={handleChange}
            />
            <TextField
              label="비고"
              name="description"
              value={companyInfo.description}
              onChange={handleChange}
            />
          </InfoGrid>
        </Card>
      </SettingsContainer>
  );
};
