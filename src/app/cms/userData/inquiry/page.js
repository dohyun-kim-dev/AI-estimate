'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from 'react';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import dayjs from 'dayjs';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import ActionButton from '@/components/ActionButton';
import { THEME_COLORS } from '@/styles/theme_colors';
const ProfileWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;
const ProfileHeader = styled.div `
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-image: url(${({ $imageUrl }) => $imageUrl || '/default-profile.png'});
  border: 1px solid #ccc;
  flex-shrink: 0;
`;
// ✅ 버튼 스타일 추가
const DetailActionButton = styled(ActionButton) `
  background-color: ${THEME_COLORS.light.primary};
  color: #fff;
  width: 100px;
  height: 30px;
  font-size: 12px;
  margin-right: 5px;
  &:hover:not(:disabled) {
    background-color: #1e3a5f;
  }
`;
const DownloadPdfButton = styled(ActionButton) `
  background-color: #214A72;
  color: #fff;
  width: 100px;
  height: 30px;
  font-size: 12px;
  margin-right: 5px;
  &:hover:not(:disabled) {
    background-color: #1a395c;
  }
`;
const DownloadXlsxButton = styled(ActionButton) `
  background-color: #4D7A55;
  color: #fff;
  width: 100px;
  height: 30px;
  font-size: 12px;
  &:hover:not(:disabled) {
    background-color: #3f6545;
  }
`;
const InquiryPage = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const listRef = useRef(null);
    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsPopupOpen(true);
    };
    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedItem(null);
    };
    // ✅ 버튼 클릭 핸들러 추가
    const handleChatHistoryClick = (path) => {
        alert(`대화 이력 페이지로 이동: ${path}`);
    };
    const handleDownloadPdf = (path) => {
        alert(`견적 PDF 파일 다운로드: ${path}`);
    };
    const handleDownloadXlsx = (path) => {
        alert(`견적 XLSX 파일 다운로드: ${path}`);
    };
    const fetchData = useCallback(async (params) => {
        console.log('Mock Data fetching for Inquiry...', params);
        const dummyProfileUrls = [
            'https://i.pravatar.cc/150?img=9', 'https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=11',
        ];
        // ✅ 목 데이터에 새로운 필드 추가
        const mockData = [
            {
                no: 1, inquiryDate: '2025-08-14T11:00:00Z', name: '이하나', userId: 'lhn_user', profileImageUrl: dummyProfileUrls[0], cellphone: '01011112222', functionTitle: '로그인 페이지 문의',
                functionContent: '로그인 페이지의 UX/UI 개선을 위한 문의입니다.',
                status: '처리중',
                memo: '담당자 배정 후 처리 예정',
                chatHistoryPath: '/chat/1',
                proposalPdfPath: '/proposal/1.pdf',
                proposalXlsxPath: '/proposal/1.xlsx',
            },
            {
                no: 2, inquiryDate: '2025-08-13T16:00:00Z', name: '김태호', userId: 'kth_user', profileImageUrl: dummyProfileUrls[1], cellphone: '01033334444', functionTitle: '회원가입 절차 문의',
                functionContent: '소셜 로그인 연동 가능 여부를 알고 싶습니다.',
                status: '완료',
                memo: '견적 전달 완료',
                chatHistoryPath: '/chat/2',
                proposalPdfPath: '/proposal/2.pdf',
                proposalXlsxPath: '/proposal/2.xlsx',
            },
            {
                no: 3, inquiryDate: '2025-08-12T09:00:00Z', name: '박서연', userId: 'psy_user', profileImageUrl: dummyProfileUrls[2], cellphone: '01055556666', functionTitle: '상품 등록 페이지 관련',
                functionContent: '대량 상품 등록 기능 문의',
                status: '문의',
                memo: '영업팀 전달',
                chatHistoryPath: '/chat/3',
                proposalPdfPath: '/proposal/3.pdf',
                proposalXlsxPath: '/proposal/3.xlsx',
            },
        ];
        const filteredByDate = mockData.filter(item => {
            const itemDate = dayjs(item.inquiryDate);
            const fromDate = params.fromDate ? dayjs(params.fromDate) : null;
            const toDate = params.toDate ? dayjs(params.toDate) : null;
            if (fromDate && itemDate.isBefore(fromDate, 'day'))
                return false;
            if (toDate && itemDate.isAfter(toDate, 'day'))
                return false;
            return true;
        });
        const filteredData = params.keyword
            ? filteredByDate.filter(item => item.name.includes(params.keyword) ||
                item.userId.includes(params.keyword) ||
                item.cellphone.includes(params.keyword) ||
                item.functionTitle.includes(params.keyword))
            : filteredByDate;
        return { data: filteredData, totalItems: filteredData.length, allItems: mockData.length };
    }, []);
    const columns = useMemo(() => [
        { header: 'No', accessor: 'no', sortable: true },
        { header: '문의 일시', accessor: 'inquiryDate', sortable: true, formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') },
        { header: '이름', accessor: 'name', sortable: true },
        { header: '아이디', accessor: 'userId', sortable: true },
        {
            header: '프로필',
            accessor: 'profileImageUrl',
            formatter: (value, row) => (_jsx(ProfileWrapper, { children: _jsx(ProfileHeader, { "$imageUrl": row.profileImageUrl }) })),
        },
        { header: '전화번호', accessor: 'cellphone', sortable: true },
        { header: '기능제목', accessor: 'functionTitle' },
        // ✅ 추가된 컬럼들
        { header: '기능 내용', accessor: 'functionContent', formatter: (value) => value.substring(0, 20) + (value.length > 20 ? '...' : '') },
        { header: '처리 상태', accessor: 'status' },
        { header: '메모', accessor: 'memo' },
        // ✅ 추가된 버튼 컬럼
        {
            header: '대화 이력 보기',
            accessor: 'chatHistoryPath',
            formatter: (value, row) => (_jsx("div", { children: _jsx(DetailActionButton, { onClick: () => handleChatHistoryClick(row.chatHistoryPath), children: "\uB300\uD654 \uC774\uB825 \uBCF4\uAE30" }) })),
        },
        {
            header: '견적 PDF 다운',
            accessor: 'chatHistoryPath2',
            formatter: (value, row) => (_jsx("div", { children: _jsx(DownloadPdfButton, { onClick: () => handleDownloadPdf(row.proposalPdfPath), children: "PDF \uB2E4\uC6B4\uB85C\uB4DC" }) })),
        }, {
            header: '견적 xlx 다운',
            accessor: 'chatHistoryPath3',
            formatter: (value, row) => (_jsx("div", { children: _jsx(DownloadXlsxButton, { onClick: () => handleDownloadXlsx(row.proposalXlsxPath), children: "\uC5D1\uC140 \uB2E4\uC6B4\uB85C\uB4DC" }) })),
        },
    ], []);
    return (_jsxs(_Fragment, { children: [_jsx(CmsResponsiveContainer, { ref: listRef, title: "\uACAC\uC801 \uBB38\uC758 \uAD00\uB9AC", excelFileName: "Inquiries", columns: columns, fetchData: fetchData, enableSearch: true, enableDateFilter: true, searchPlaceholder: "\uC774\uB984, \uC544\uC774\uB514, \uC804\uD654\uBC88\uD638, \uAE30\uB2A5\uC81C\uBAA9 \uAC80\uC0C9", onRowClick: handleRowClick, themeMode: "light" }), _jsx(CmsPopup, { title: "\uBB38\uC758 \uC0C1\uC138", isOpen: isPopupOpen, onClose: closePopup, children: selectedItem ? (_jsxs("div", { children: [_jsx("h3", { children: selectedItem.functionTitle }), _jsxs("p", { children: ["\uC774\uB984: ", selectedItem.name] }), _jsxs("p", { children: ["\uBB38\uC758 \uB0B4\uC6A9: ", selectedItem.functionContent] }), _jsxs("p", { children: ["\uCC98\uB9AC \uC0C1\uD0DC: ", selectedItem.status] }), _jsxs("p", { children: ["\uBA54\uBAA8: ", selectedItem.memo] })] })) : null })] }));
};
export default InquiryPage;
