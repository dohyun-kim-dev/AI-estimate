// src/app/cms/userData/proposal/page.tsx
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from 'react';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import dayjs from 'dayjs';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import ActionButton from '@/components/ActionButton';
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
const DownloadButton = styled(ActionButton) `
  width: 80px;
  height: 30px;
  background-color: #51815a;
  color: white;
  border: none;
  font-size: 12px;
  &:hover:not(:disabled) {
    background-color: #3e6b47;
  }
`;
const ProposalDownloadPage = () => {
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
    const handleDownloadFile = (filePath) => {
        console.log(`Downloading file from: ${filePath}`);
        alert(`파일 다운로드: ${filePath}`);
    };
    const fetchData = useCallback(async (params) => {
        console.log('Mock Data fetching for ProposalDownload...', params);
        const dummyProfileUrls = [
            'https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8',
        ];
        const mockData = [
            {
                no: 1, user: '이민지', profileImageUrl: dummyProfileUrls[0], userId: 'lmj_user', email: 'lmj@example.com', downloadDate: '2025-08-14T10:00:00Z', projectName: '신규 쇼핑몰 개발', functionTitle: '회원가입 기능', filePath: '/files/proposal1.pdf',
            },
            {
                no: 2, user: '홍길동', profileImageUrl: dummyProfileUrls[1], userId: 'gildong', email: 'gildong@heredotcorp.com', downloadDate: '2025-08-13T15:30:00Z', projectName: '고객 관리 시스템', functionTitle: '데이터 분석 모듈', filePath: '/files/proposal2.docx',
            },
            // ...
        ];
        const filteredByDate = mockData.filter(item => {
            const itemDate = dayjs(item.downloadDate);
            const fromDate = params.fromDate ? dayjs(params.fromDate) : null;
            const toDate = params.toDate ? dayjs(params.toDate) : null;
            if (fromDate && itemDate.isBefore(fromDate, 'day'))
                return false;
            if (toDate && itemDate.isAfter(toDate, 'day'))
                return false;
            return true;
        });
        const filteredData = params.keyword
            ? filteredByDate.filter(item => item.user.includes(params.keyword) ||
                item.userId.includes(params.keyword) ||
                item.email.includes(params.keyword) ||
                item.projectName.includes(params.keyword))
            : filteredByDate;
        return { data: filteredData, totalItems: filteredData.length, allItems: mockData.length };
    }, []);
    const columns = useMemo(() => [
        { header: 'No', accessor: 'no', sortable: true },
        { header: '유저', accessor: 'user', sortable: true },
        {
            header: '프로필',
            accessor: 'profileImageUrl',
            formatter: (value, row) => (_jsx(ProfileWrapper, { children: _jsx(ProfileHeader, { "$imageUrl": row.profileImageUrl }) })),
        },
        { header: '아이디', accessor: 'userId', sortable: true },
        { header: '이메일', accessor: 'email', sortable: true },
        { header: '날짜', accessor: 'downloadDate', sortable: true, formatter: (value) => dayjs(value).format('YYYY-MM-DD') },
        { header: '프로젝트', accessor: 'projectName' },
        { header: '기능제목', accessor: 'functionTitle' },
        {
            header: '파일다운로드',
            accessor: 'filePath',
            formatter: (value) => (_jsx(DownloadButton, { onClick: () => handleDownloadFile(value), children: "\uB2E4\uC6B4\uB85C\uB4DC" })),
        },
    ], []);
    return (_jsxs(_Fragment, { children: [_jsx(CmsResponsiveContainer, { ref: listRef, title: "\uACAC\uC801 \uB2E4\uC6B4\uB85C\uB4DC \uD604\uD669", excelFileName: "ProposalDownloads", columns: columns, fetchData: fetchData, enableSearch: true, enableDateFilter: true, searchPlaceholder: "\uC720\uC800, \uC544\uC774\uB514, \uC774\uBA54\uC77C, \uD504\uB85C\uC81D\uD2B8\uBA85 \uAC80\uC0C9", onRowClick: handleRowClick, themeMode: "light" }), _jsx(CmsPopup, { title: "\uB2E4\uC6B4\uB85C\uB4DC \uC0C1\uC138", isOpen: isPopupOpen, onClose: closePopup })] }));
};
export default ProposalDownloadPage;
