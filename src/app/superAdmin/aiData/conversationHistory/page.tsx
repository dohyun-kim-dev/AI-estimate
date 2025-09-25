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
import SimpleGenericList from '@/components/CustomList/SimpleGenericList';

// 아이콘 컴포넌트들
const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#AAAAAA"/>
    <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#AAAAAA"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="#AAAAAA"/>
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#AAAAAA"/>
  </svg>
);

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

// 회원 정보 섹션 스타일들
const Title = styled.h2`
  padding: 20px;
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 0px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 50px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  color: #000;
  font-size: 16px;
  flex-grow: 1;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
`;

const DetailIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #AAAAAA;
`;

const NameText = styled.div`
  font-size: 14px;
`;

// 팝업 레이아웃
const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(80vh - 100px);
  min-height: 600px;
`;

const ListSection = styled.div`
  flex: 1;
  margin-top: 20px;
  overflow: hidden;
`;

// 닫기 버튼 스타일
const CloseButton = styled.button`
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  background-color: #ffffff;
  color: #2D2E3C;
  border: 1px solid #2D2E3C;
  margin-top: 20px;
  align-self: flex-end;
  
  &:hover {
    opacity: 0.8;
  }
`;

// 대화 이력 상세 데이터 타입
type ChatDetail = {
  no: number;
  timestamp: string;
  userMessage: string;
  aiResponse: string;
  chatType: string;
};

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

  // 대화 상세 이력을 가져오는 함수
  const fetchChatDetails = useCallback(
    async (params: FetchParams): Promise<FetchResult<ChatDetail>> => {
      console.log('Fetching chat details for user:', selectedChat?.id);

      // 더미 대화 상세 데이터
      const mockChatDetails: ChatDetail[] = [
        {
          no: 1,
          timestamp: '2025-08-14T10:30:00Z',
          userMessage: '안녕하세요, AI에게 견적 문의드리고 싶습니다.',
          aiResponse: '안녕하세요! 견적 문의에 대해 도와드리겠습니다. 어떤 프로젝트에 대한 견적을 원하시나요?',
          chatType: '일반 문의'
        },
        {
          no: 2,
          timestamp: '2025-08-14T10:32:00Z',
          userMessage: '웹사이트 개발 견적을 알고 싶어요.',
          aiResponse: '웹사이트 개발 견적을 도와드리겠습니다. 어떤 종류의 웹사이트를 원하시는지 더 자세히 알려주세요.',
          chatType: '견적 문의'
        },
        {
          no: 3,
          timestamp: '2025-08-14T10:35:00Z',
          userMessage: '쇼핑몰 사이트입니다.',
          aiResponse: '쇼핑몰 사이트 개발 견적을 계산해드리겠습니다. 필요한 기능들을 선택해주세요: 상품 관리, 주문 관리, 결제 시스템 등이 있습니다.',
          chatType: '견적 문의'
        }
      ];

      return {
        data: mockChatDetails,
        totalItems: mockChatDetails.length,
        allItems: mockChatDetails.length,
      };
    },
    [selectedChat?.id]
  );

  // 대화 상세 이력 컬럼 정의
  const chatDetailColumns: ColumnDefinition<ChatDetail>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no', sortable: true },
      {
        header: '시간',
        accessor: 'timestamp',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('HH:mm:ss') : '-'),
      },
      { header: '타입', accessor: 'chatType', sortable: true },
      { 
        header: '사용자 메시지', 
        accessor: 'userMessage', 
        sortable: false,
        formatter: (value) => {
          const text = value || '';
          return text.length > 30 ? `${text.substring(0, 30)}...` : text;
        }
      },
      { 
        header: 'AI 응답', 
        accessor: 'aiResponse', 
        sortable: false,
        formatter: (value) => {
          const text = value || '';
          return text.length > 50 ? `${text.substring(0, 50)}...` : text;
        }
      },
    ],
    []
  );

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
        data={[]}
        columns={columns}
        fetchData={fetchData}
        enableCompanySearch={true}
        enableDateFilter={true}
        onRowClick={handleRowClick}
        themeMode="light"
      />

      {/* 대화 이력 상세 팝업 */}
      <CmsPopup
        title="AI 대화 이력 상세"
        isOpen={isPopupOpen}
        onClose={closePopup}
        isWide
        backgroundColor="#FFF"
      >
        <PopupContent>
          <Title>회원 정보</Title>
          
          <UserInfoSection>
            <ProfileImage src={selectedChat?.profileImageUrl || "/ai-estimate/no_profile.png"} alt="Profile" />
            <UserDetails>
              <DetailItem>
                <DetailIcon><PersonIcon /></DetailIcon>
                <NameText>{selectedChat?.name || '-'}</NameText>
              </DetailItem>
              <DetailItem>
                <DetailIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 14 11" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.332031 0.166992V10.8337H13.6653V0.166992H0.332031ZM6.21744 8.16699V2.63184H7.74869C8.39973 2.63184 8.92056 2.69434 9.31119 2.81934C9.8216 2.9834 10.2122 3.28809 10.4831 3.7334C10.7539 4.17611 10.8893 4.7321 10.8893 5.40137C10.8893 6.08887 10.7539 6.65006 10.4831 7.08496C10.1445 7.63444 9.62108 7.96777 8.91275 8.08496C8.58723 8.13965 8.17056 8.16699 7.66275 8.16699H6.21744ZM7.46353 7.19043H7.70181C8.26952 7.19043 8.69009 7.09798 8.96353 6.91309C9.20311 6.75423 9.37629 6.50814 9.48306 6.1748C9.56119 5.92743 9.60025 5.66441 9.60025 5.38574C9.60025 5.08628 9.55468 4.80894 9.46353 4.55371C9.37239 4.29852 9.24739 4.0993 9.08853 3.95605C8.93749 3.82064 8.76561 3.72949 8.57291 3.68262C8.3802 3.63314 8.08983 3.6084 7.70181 3.6084H7.46353V7.19043ZM3.65494 2.63184V8.16699H4.90103V2.63184H3.65494Z" fill="#AAAAAA"/>
                  </svg>
                </DetailIcon>
                <span>ID: {selectedChat?.adminId || '-'}</span>
              </DetailItem>
              <DetailItem>
                <DetailIcon><PhoneIcon /></DetailIcon>
                <span>{selectedChat?.cellphone || '-'}</span>
              </DetailItem>
              <DetailItem>
                <DetailIcon><EmailIcon /></DetailIcon>
                <span>{selectedChat?.email || '-'}</span>
              </DetailItem>
            </UserDetails>
          </UserInfoSection>

          <ListSection>
            <SimpleGenericList
              title="대화 이력"
              columns={chatDetailColumns}
              fetchData={fetchChatDetails}
              themeMode="light"
              fixedLayout={true}
              initialState={{
                sortKey: 'no',
                sortOrder: 'desc'
              }}
            />
          </ListSection>

          <CloseButton onClick={closePopup}>
            닫기
          </CloseButton>
        </PopupContent>
      </CmsPopup>
    </>
  );
};

export default AiChatHistoryPage;