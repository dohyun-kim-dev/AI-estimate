'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { toast, ToastContainer } from 'react-toastify';
import { AppColors } from '@/styles/colors';
const FormContainer = styled.div `
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 16px;
`;
const PopupFooter = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
`;
const FooterButton = styled.button `
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
`;
const CancelButton = styled(FooterButton) `
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};
`;
const SaveButton = styled(FooterButton) `
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
`;
const MOCK_CUSTOMERS = [
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
const CustomerMngPage = () => {
    const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
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
    const [pwdError, setPwdError] = useState(null);
    const [confirmPwdError, setConfirmPwdError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const listRef = useRef(null);
    const resetForm = useCallback((initial) => {
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
    }, []);
    const handleAddClick = () => {
        resetForm();
        setIsPopupOpen(true);
    };
    const handleRowClick = (customer) => {
        resetForm(customer);
        setIsPopupOpen(true);
    };
    const handleSave = () => {
        if (selectedCustomer) {
            // 수정
            setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, name, ceo, businessNo, adminId, email, cellphone, address, description } : c)));
            toast.success('고객사 정보가 수정되었습니다.');
        }
        else {
            // 신규
            const newCustomer = {
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
    const columns = useMemo(() => [
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
    ], []);
    return (_jsxs(_Fragment, { children: [_jsx(ToastContainer, { position: "top-center", autoClose: 3000, theme: "light", style: { zIndex: 10000 } }), _jsx(CmsResponsiveContainer, { title: "\uACE0\uAC1D\uC0AC \uAD00\uB9AC", data: customers, columns: columns, fetchData: () => Promise.resolve({ data: customers, totalItems: customers.length, allItems: customers.length }), onRowClick: handleRowClick, onAdd: handleAddClick, addButtonLabel: "\uACE0\uAC1D\uC0AC \uB4F1\uB85D", themeMode: "light", compactFieldCount: 4, defaultViewMode: "detail", enableDateFilter: true }), _jsx(CmsPopup, { title: "\uACE0\uAC1D\uC0AC \uB4F1\uB85D/\uC218\uC815", isOpen: isPopupOpen, onClose: () => setIsPopupOpen(false), showRequiredMark: true, bottomFloating: _jsxs(PopupFooter, { children: [_jsx("div", {}), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx(SaveButton, { onClick: handleSave, children: "\uC800\uC7A5" }), _jsx(CancelButton, { onClick: () => setIsPopupOpen(false), children: "\uB2EB\uAE30" })] })] }), children: _jsxs(FormContainer, { children: [_jsx(TextField, { radius: "0", value: customerId, label: "* \uACE0\uAC1D\uC0AC ID", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setCustomerId(e.target.value), placeholder: "\uACE0\uAC1D\uC0AC \uACE0\uC720 ID\uB97C \uC785\uB825\uD558\uC138\uC694", readOnly: !!selectedCustomer }), !selectedCustomer && (_jsxs(_Fragment, { children: [_jsx(TextField, { radius: "0", value: password, showSuffixIcon: true, label: "* \uBE44\uBC00\uBC88\uD638", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setPassword(e.target.value), placeholder: "\uC601\uBB38 + \uC22B\uC790 + \uD2B9\uC218\uBB38\uC790 1\uAC1C \uD3EC\uD568 8\uC790\uB9AC \uC774\uC0C1", isPasswordField: true, errorMessage: pwdError ?? undefined }), _jsx(TextField, { radius: "0", value: confirmPassword, showSuffixIcon: true, label: "* \uBE44\uBC00\uBC88\uD638 \uD655\uC778", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setConfirmPassword(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uB2E4\uC2DC \uC785\uB825\uD558\uC138\uC694", isPasswordField: true, errorMessage: confirmPwdError ?? undefined })] })), _jsx(TextField, { radius: "0", value: name, label: "* \uACE0\uAC1D\uC0AC\uBA85", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setName(e.target.value), placeholder: "\uACE0\uAC1D\uC0AC\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694" }), _jsx(TextField, { radius: "0", value: ceo, label: "\uB300\uD45C\uBA85", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setCeo(e.target.value), placeholder: "\uB300\uD45C\uC790\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694" }), _jsx(TextField, { radius: "0", value: businessNo, label: "\uC0AC\uC5C5\uC790\uBC88\uD638", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setBusinessNo(e.target.value), placeholder: "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694 (\uC608: 123-45-67890)" }), _jsx(TextField, { radius: "0", value: email, label: "\uC774\uBA54\uC77C", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setEmail(e.target.value), placeholder: "\uC774\uBA54\uC77C \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD558\uC138\uC694" }), _jsx(TextField, { radius: "0", value: cellphone, label: "\uC5F0\uB77D\uCC98", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => {
                                const input = e.target.value;
                                if (/^\d*$/.test(input))
                                    setCellphone(input);
                            }, placeholder: "- \uC5C6\uC774 \uC22B\uC790\uB9CC \uC785\uB825" }), _jsx(TextField, { radius: "0", value: address, label: "\uC8FC\uC18C", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setAddress(e.target.value), placeholder: "\uB3C4\uB85C\uBA85/\uC0C1\uC138\uC8FC\uC18C \uC785\uB825" }), _jsx(TextField, { radius: "0", value: description, label: "\uBE44\uACE0", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setDescription(e.target.value), placeholder: "\uAE30\uD0C0 \uCC38\uACE0 \uC0AC\uD56D \uC785\uB825", multiline: true, minLines: 3 })] }) })] }));
};
export default CustomerMngPage;
