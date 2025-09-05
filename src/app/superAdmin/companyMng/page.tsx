'use client';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { toast, ToastContainer } from 'react-toastify';
import { AppColors } from '@/styles/colors';
import ActionButton from '@/components/ActionButton';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 16px;
`;

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
`;

const FooterButton = styled.button`
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
`;

const CancelButton = styled(FooterButton)`
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};
`;

const SaveButton = styled(FooterButton)`
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
`;

type Customer = {
  id: string;
  name: string;
  ceo: string;
  businessNo: string;
  adminId: string;
  email: string;
  cellphone: string;
  address: string;
  description: string;
  createdTime: string | null;
  lastLoginTime: string | null;
};

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: '엠브이픽',
    ceo: '김브이',
    businessNo: '123-45-67890',
    adminId: 'mvpic_admin',
    email: 'contact@mvpic.com',
    cellphone: '010-1234-5678',
    address: '서울특별시 강남구',
    description: '주요 고객사',
    createdTime: '2025-01-10',
    lastLoginTime: '2025-08-17',
  },
  {
    id: '2',
    name: 'KT 지사',
    ceo: '김철수',
    businessNo: '987-65-43210',
    adminId: 'kt_branch',
    email: 'kt@kt.com',
    cellphone: '010-8765-4321',
    address: '서울특별시 종로구',
    description: '지사 고객사',
    createdTime: '2025-02-20',
    lastLoginTime: '2025-08-16',
  },
  {
    id: '3',
    name: '여기닷',
    ceo: '김여기',
    businessNo: '456-78-90123',
    adminId: 'yeogidot_admin',
    email: 'hello@yeogidot.com',
    cellphone: '010-2345-6789',
    address: '경기도 성남시',
    description: '신규 고객사',
    createdTime: '2025-03-15',
    lastLoginTime: '2025-08-15',
  },
];

const CustomerMngPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [name, setName] = useState('');
  const [ceo, setCeo] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [adminId, setAdminId] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [confirmPwdError, setConfirmPwdError] = useState<string | null>(null);
 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const listRef = useRef<{ refetch: () => void }>(null);

  const resetForm = useCallback(
    (initial?: Partial<Customer>) => {
      setSelectedCustomer(initial ?? null);
      setCustomerId(initial?.id ?? '');
      setName(initial?.name ?? '');
      setCeo(initial?.ceo ?? '');
      setBusinessNo(initial?.businessNo ?? '');
      setAdminId(initial?.adminId ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      setAddress(initial?.address ?? '');
      setDescription(initial?.description ?? '');
    },
    []
  );

  const handleAddClick = () => {
    resetForm();
    setIsPopupOpen(true);
  };

  const handleRowClick = (customer: Customer) => {
    resetForm(customer);
    setIsPopupOpen(true);
  };

  const handleSave = () => {
    if (selectedCustomer) {
      // 수정
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, name, ceo, businessNo, adminId, email, cellphone, address, description } : c))
      );
      toast.success('고객사 정보가 수정되었습니다.');
    } else {
      // 신규
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name,
        ceo,
        businessNo,
        adminId,
        email,
        cellphone,
        address,
        description,
        createdTime: new Date().toISOString(),
        lastLoginTime: null,
      };
      setCustomers((prev) => [...prev, newCustomer]);
      toast.success('고객사가 등록되었습니다.');
    }
    setIsPopupOpen(false);
  };

  const columns = useMemo(
    () => [
      { header: 'No', accessor: 'id' },
      { header: '가입일', accessor: 'createdTime' },
      { header: '최근접속', accessor: 'lastLoginTime' },
      { header: '고객사명', accessor: 'name' },
      { header: '로고', accessor: 'logo' },
      { header: '대표명', accessor: 'ceo' },
      { header: '사업자번호', accessor: 'businessNo' },
      { header: '아이디', accessor: 'adminId' },
      { header: '이메일', accessor: 'email' },
      { header: '전화번호', accessor: 'cellphone' },
      { header: '주소', accessor: 'address' },
      { header: '비고', accessor: 'description' },
    ],
    []
  );

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme="light" style={{ zIndex: 10000 }} />

      <CmsResponsiveContainer<Customer>
        title="고객사 관리"
        data={customers}
        columns={columns}
        fetchData={() => Promise.resolve({ data: customers, totalItems: customers.length, allItems: customers.length })}
        onRowClick={handleRowClick}
        onAdd={handleAddClick}
        addButtonLabel="고객사 등록"
        themeMode="light"
        compactFieldCount={4}
        defaultViewMode="detail"
        enableDateFilter
      />

      <CmsPopup
        title="고객사 등록/수정"
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        showRequiredMark
        bottomFloating={
          <PopupFooter>
            <div />
            <div style={{ display: 'flex', gap: '12px' }}>
              <SaveButton onClick={handleSave}>저장</SaveButton>
              <CancelButton onClick={() => setIsPopupOpen(false)}>닫기</CancelButton>
            </div>
          </PopupFooter>
        }
      >
        <FormContainer>
  <TextField
    radius="0"
    value={customerId}
    label="* 고객사 ID"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setCustomerId(e.target.value)}
    placeholder="고객사 고유 ID를 입력하세요"
    readOnly={!!selectedCustomer}
  />

  {/* 신규 등록 시: 비밀번호/비밀번호 확인 */}
  {!selectedCustomer && (
    <>
      <TextField
        radius="0"
        value={password}
        showSuffixIcon
        label="* 비밀번호"
        $labelPosition="horizontal"
        labelColor="white"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="영문 + 숫자 + 특수문자 1개 포함 8자리 이상"
        isPasswordField
        errorMessage={pwdError ?? undefined}
      />

      <TextField
        radius="0"
        value={confirmPassword}
        showSuffixIcon
        label="* 비밀번호 확인"
        $labelPosition="horizontal"
        labelColor="white"
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="비밀번호를 다시 입력하세요"
        isPasswordField
        errorMessage={confirmPwdError ?? undefined}
      />
    </>
  )}

  <TextField
    radius="0"
    value={name}
    label="* 고객사명"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setName(e.target.value)}
    placeholder="고객사명을 입력하세요"
  />
  <TextField
    radius="0"
    value={ceo}
    label="대표명"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setCeo(e.target.value)}
    placeholder="대표자명을 입력하세요"
  />
  <TextField
    radius="0"
    value={businessNo}
    label="사업자번호"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setBusinessNo(e.target.value)}
    placeholder="사업자등록번호를 입력하세요 (예: 123-45-67890)"
  />
  {/* <TextField
    radius="0"
    value={adminId}
    label="아이디"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setAdminId(e.target.value)}
    placeholder="고객사 관리자 아이디를 입력하세요"
  /> */}
  <TextField
    radius="0"
    value={email}
    label="이메일"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setEmail(e.target.value)}
    placeholder="이메일 형식으로 입력하세요"
  />
  <TextField
    radius="0"
    value={cellphone}
    label="연락처"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => {
      const input = e.target.value;
      if (/^\d*$/.test(input)) setCellphone(input);
    }}
    placeholder="- 없이 숫자만 입력"
  />
  <TextField
    radius="0"
    value={address}
    label="주소"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setAddress(e.target.value)}
    placeholder="도로명/상세주소 입력"
  />
  <TextField
    radius="0"
    value={description}
    label="비고"
    $labelPosition="horizontal"
    labelColor="white"
    onChange={(e) => setDescription(e.target.value)}
    placeholder="기타 참고 사항 입력"
    multiline
    minLines={3}
  />
</FormContainer>

      </CmsPopup>
    </>
  );
};

export default CustomerMngPage;
