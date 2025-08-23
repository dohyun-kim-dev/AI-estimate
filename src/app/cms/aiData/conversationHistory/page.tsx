'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import GenericListUI, {
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { THEME_COLORS } from '@/styles/theme_colors';
import { AppColors } from '@/styles/colors';
import { toast, ToastContainer } from 'react-toastify';
import { devLog } from '@/lib/utils/devLogger';
import CmsPopup from '@/components/CmsPopup';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';

// AI 대화 이력 데이터 타입 정의
type ChatHistory = {
  no: number;
  id: string;
  name: string;
  profileImageUrl: string;
  adminId: string;
  email: string;
  cellphone: string;
  chatCount: number;
  lastChatTime: string;
};

// --- 스타일 컴포넌트 (PromptPage에서 재사용 가능) ---

const PopupFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
`;

const ProfileWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content:center;
  gap: 8px;

   @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const ProfileHeader = styled.div<{ $imageUrl: string | null }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-image: url(${({ $imageUrl }) => $imageUrl || '/default-profile.png'});
  border: 1px solid #ccc;
  flex-shrink: 0;
`;

const AiChatHistoryPage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Partial<ChatHistory> | null>(null);

  const listRef = useRef<{ refetch: () => void }>(null);

  const handleRowClick = (item: ChatHistory) => {
    setSelectedChat(item);
    setIsPopupOpen(true);
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // ✅ 목 데이터로 동작하는 fetchData 함수
  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<ChatHistory>> => {
      console.log('Fetching AI Chat History with params:', params);

      // 더미 프로필 이미지 URL
      const dummyProfileUrls = [
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3',
        'https://i.pravatar.cc/150?img=4',
        'https://i.pravatar.cc/150?img=5',
      ];

      const mockData: ChatHistory[] = [
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
        
        if (fromDate && itemDate.isBefore(fromDate, 'day')) return false;
        if (toDate && itemDate.isAfter(toDate, 'day')) return false;
        
        return true;
      });

      // 키워드 필터링
      const filteredData = params.keyword
        ? filteredByDate.filter(item =>
            item.name.includes(params.keyword as string) ||
            item.adminId.includes(params.keyword as string) ||
            item.email.includes(params.keyword as string) ||
            item.cellphone.includes(params.keyword as string)
          )
        : filteredByDate;

      return {
        data: filteredData,
        totalItems: filteredData.length,
        allItems: mockData.length,
      };
    },
    []
  );

  // ✅ AI 대화 이력에 맞는 컬럼 정의
  const columns: ColumnDefinition<ChatHistory>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no', sortable: true },
      {
        header: '프로필',
        accessor: 'profileImageUrl',
        formatter: (value, row) => (
          <ProfileWrapper>
            <ProfileHeader $imageUrl={row.profileImageUrl} />
          </ProfileWrapper>
        ),
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
    ],
    []
  );

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 10000 }}
      ></ToastContainer>
      
      <CmsResponsiveContainer<ChatHistory>
        ref={listRef}
        title="AI 대화 이력 관리"
        excelFileName="AIChatHistory"
        columns={columns}
        fetchData={fetchData}
        enableSearch
        enableDateFilter
        searchPlaceholder="이름, 아이디, 이메일, 전화번호 검색"
        onRowClick={handleRowClick}
        themeMode="light"
      />

      {/* 대화 이력 상세 팝업 (임시) */}
      <CmsPopup
        title="AI 대화 이력 상세"
        isOpen={isPopupOpen}
        onClose={closePopup}
      >
        <div>
          {selectedChat ? (
            <div>
              <h3>{selectedChat.name}님의 대화 이력</h3>
              <p>최근 대화 시간: {dayjs(selectedChat.lastChatTime).format('YYYY-MM-DD HH:mm')}</p>
              <p>총 대화 횟수: {selectedChat.chatCount}</p>
              {/* 여기에 실제 대화 내역을 표시하는 컴포넌트를 추가할 수 있습니다. */}
            </div>
          ) : (
            <p>선택된 대화 이력이 없습니다.</p>
          )}
        </div>
      </CmsPopup>
    </>
  );
};

export default AiChatHistoryPage;