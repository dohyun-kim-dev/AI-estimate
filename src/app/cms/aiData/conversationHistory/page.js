'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { ToastContainer } from 'react-toastify';
import CmsPopup from '@/components/CmsPopup';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
// --- 스타일 컴포넌트 (PromptPage에서 재사용 가능) ---
const PopupFooter = styled.div `
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
`;
const ProfileWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content:center;
  gap: 8px;

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
const AiChatHistoryPage = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const listRef = useRef(null);
    const handleRowClick = (item) => {
        setSelectedChat(item);
        setIsPopupOpen(true);
    };
    const closePopup = () => {
        setIsPopupOpen(false);
    };
    // ✅ 목 데이터로 동작하는 fetchData 함수
    const fetchData = useCallback(async (params) => {
        console.log('Fetching AI Chat History with params:', params);
        // 더미 프로필 이미지 URL
        const dummyProfileUrls = [
            'https://i.pravatar.cc/150?img=1',
            'https://i.pravatar.cc/150?img=2',
            'https://i.pravatar.cc/150?img=3',
            'https://i.pravatar.cc/150?img=4',
            'https://i.pravatar.cc/150?img=5',
        ];
        const mockData = [
            {
                no: 1,
                id: 'user123',
                name: '김철수',
                profileImageUrl: dummyProfileUrls[0],
                adminId: 'kimcs',
                email: 'kimcs@example.com',
                cellphone: '01012345678',
                chatCount: 15,
                lastChatTime: '2025-08-14T10:30:00Z',
            },
            {
                no: 2,
                id: 'user456',
                name: '박영희',
                profileImageUrl: dummyProfileUrls[1],
                adminId: 'pyh_22',
                email: 'pyh@example.com',
                cellphone: '01098765432',
                chatCount: 8,
                lastChatTime: '2025-08-13T14:45:00Z',
            },
            {
                no: 3,
                id: 'user789',
                name: '이민호',
                profileImageUrl: dummyProfileUrls[2],
                adminId: 'lmh_user',
                email: 'lmh@example.com',
                cellphone: '01055554444',
                chatCount: 22,
                lastChatTime: '2025-08-14T09:00:00Z',
            },
            // 여기에 더 많은 목 데이터를 추가할 수 있습니다.
        ];
        // 날짜 필터링
        const filteredByDate = mockData.filter(item => {
            const itemDate = dayjs(item.lastChatTime);
            const fromDate = params.fromDate ? dayjs(params.fromDate) : null;
            const toDate = params.toDate ? dayjs(params.toDate) : null;
            if (fromDate && itemDate.isBefore(fromDate, 'day'))
                return false;
            if (toDate && itemDate.isAfter(toDate, 'day'))
                return false;
            return true;
        });
        // 키워드 필터링
        const filteredData = params.keyword
            ? filteredByDate.filter(item => item.name.includes(params.keyword) ||
                item.adminId.includes(params.keyword) ||
                item.email.includes(params.keyword) ||
                item.cellphone.includes(params.keyword))
            : filteredByDate;
        return {
            data: filteredData,
            totalItems: filteredData.length,
            allItems: mockData.length,
        };
    }, []);
    // ✅ AI 대화 이력에 맞는 컬럼 정의
    const columns = useMemo(() => [
        { header: 'No', accessor: 'no', sortable: true },
        {
            header: '프로필',
            accessor: 'profileImageUrl',
            formatter: (value, row) => (_jsx(ProfileWrapper, { children: _jsx(ProfileHeader, { "$imageUrl": row.profileImageUrl }) })),
        },
        { header: '이름', accessor: 'name', sortable: true },
        { header: '아이디', accessor: 'adminId', sortable: true },
        { header: '이메일', accessor: 'email', sortable: true },
        { header: '전화번호', accessor: 'cellphone', sortable: true },
        // { header: '대화수', accessor: 'chatCount', sortable: true },
        // {
        //   header: '최근 대화',
        //   accessor: 'lastChatTime',
        //   sortable: true,
        //   formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
        // },
    ], []);
    return (_jsxs(_Fragment, { children: [_jsx(ToastContainer, { position: "top-center", autoClose: 3000, newestOnTop: false, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true, theme: "light", style: { zIndex: 10000 } }), _jsx(CmsResponsiveContainer, { ref: listRef, title: "AI \uB300\uD654 \uC774\uB825 \uAD00\uB9AC", excelFileName: "AIChatHistory", columns: columns, fetchData: fetchData, enableSearch: true, enableDateFilter: true, searchPlaceholder: "\uC774\uB984, \uC544\uC774\uB514, \uC774\uBA54\uC77C, \uC804\uD654\uBC88\uD638 \uAC80\uC0C9", onRowClick: handleRowClick, themeMode: "light" }), _jsx(CmsPopup, { title: "AI \uB300\uD654 \uC774\uB825 \uC0C1\uC138", isOpen: isPopupOpen, onClose: closePopup, children: _jsx("div", { children: selectedChat ? (_jsxs("div", { children: [_jsxs("h3", { children: [selectedChat.name, "\uB2D8\uC758 \uB300\uD654 \uC774\uB825"] }), _jsxs("p", { children: ["\uCD5C\uADFC \uB300\uD654 \uC2DC\uAC04: ", dayjs(selectedChat.lastChatTime).format('YYYY-MM-DD HH:mm')] }), _jsxs("p", { children: ["\uCD1D \uB300\uD654 \uD69F\uC218: ", selectedChat.chatCount] })] })) : (_jsx("p", { children: "\uC120\uD0DD\uB41C \uB300\uD654 \uC774\uB825\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) }) })] }));
};
export default AiChatHistoryPage;
