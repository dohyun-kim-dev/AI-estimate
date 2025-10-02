'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import GenericListUI, {
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import styled from 'styled-components';
import { THEME_COLORS } from '@/styles/theme_colors';
import { AppColors } from '@/styles/colors';
import { toast, ToastContainer } from 'react-toastify';
import { devLog } from '@/lib/utils/devLogger';
import CmsPopup from '@/components/CmsPopup';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import SimpleGenericList from '@/components/CustomList/SimpleGenericList';
import ChatHistoryModal from '@/components/ChatHistoryModal';
import { getChatRoomList } from '@/lib/api/admin/adminApi';

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
  _id: string; // 채팅방 ID
  title: string; // 채팅방 제목
  isGuest: boolean;
  userInfo?: {
    _id: string;
    name: string;
    email: string;
    cellphone: string;
    profileImage?: string;
    isGuest?: boolean;
  };
  createAt: string;
  updateAt: string;
  // 표시용 필드들
  name: string;
  profileImageUrl: string;
  email: string;
  cellphone: string;
  chatSessionId: string;
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
  background-image: url(${({ $imageUrl }) => $imageUrl || '/ai-estimate/no-profile.png'});
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
  const [dateRange, setDateRange] = useState<{
    fromDate: string;
    toDate: string;
  } | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState(''); // 검색 키워드 상태 추가
  const [isChatHistoryModalOpen, setIsChatHistoryModalOpen] = useState(false); // 채팅 이력 모달 상태
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');

  const listRef = useRef<{ refetch: () => void }>(null);
dayjs.locale('ko'); 

  const handleRowClick = (item: ChatHistory) => {
    setSelectedChat(item);
    setIsChatHistoryModalOpen(true); // 채팅 이력 모달 열기
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const closeChatHistoryModal = () => {
    setIsChatHistoryModalOpen(false);
    setSelectedChat(null);
  };

  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    
    // 고객사 선택 시 즉시 데이터 다시 조회
    if (listRef.current) {
      listRef.current.refetch();
    }
  }, []);
//이런 느낌으로 api 연동
  // const fetchData = useCallback(
  //   async (params: FetchParams): Promise<FetchResult<User>> => {
  //     try {
  //       // 키워드가 전달되면 현재 키워드 업데이트 (빈 문자열 포함)
  //       let searchKeyword = '';
  //       if (params.keyword !== undefined) {
  //         setCurrentKeyword(params.keyword);
  //         searchKeyword = params.keyword;
  //       } else {
  //         searchKeyword = currentKeyword;
  //       }

  //       const fromDate = params.fromDate || dateRange?.fromDate || dayjs().subtract(3, 'month').format('YYYY-MM-DD');
  //       const toDate = params.toDate || dateRange?.toDate || dayjs().format('YYYY-MM-DD');
        
  //       devLog('🔍 [fetchData 호출]', { searchKeyword, fromDate, toDate, selectedCompanyCode });
        
  //       // API 호출
  //       const response = await getUserList({
  //         keyword: searchKeyword,
  //         fromDate: fromDate,
  //         toDate: toDate,
  //         companyCode: selectedCompanyCode || '',
  //       });
        
  //       devLog('✅ [fetchData 응답 받음]', response);
        
  //       // 응답 처리 (응답 구조에 맞게 수정)
  //       if (response && typeof response === 'object') {
  //         // 응답이 직접 API 응답 객체인 경우
  //         if ('statusCode' in response && response.statusCode === 200) {
  //           // 타입 단언으로 안전하게 처리
  //           const responseWithData = response as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
  //           const userData = responseWithData.data || [];
  //           const totalItems = responseWithData.metadata?.totalCnt || userData.length;
  //           const allItems = responseWithData.metadata?.allCnt || totalItems;
  //           return { data: userData, totalItems, allItems };
  //         } 
  //         // 응답이 배열로 감싸져 있는 경우 (callAdminApi 특성)
  //         else if (Array.isArray(response) && response[0]) {
  //           const firstItem = response[0];
  //           if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
  //             const responseData = firstItem.data;
  //             if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
  //               // 타입 단언으로 안전하게 처리
  //               const typedResponseData = responseData as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
  //               const userData = typedResponseData.data || [];
  //               const totalItems = typedResponseData.metadata?.totalCnt || userData.length;
  //               const allItems = typedResponseData.metadata?.allCnt || totalItems;
  //               return { data: userData, totalItems, allItems };
  //             }
  //           }
  //         }
  //       }
        
  //       console.error('유저 목록 응답 형식이 예상과 다릅니다:', response);
  //       return { data: [], totalItems: 0, allItems: 0 };
  //     } catch (error) {
  //       console.error('고객 회원 조회 오류:', error);
  //       return { data: [], totalItems: 0, allItems: 0 };
  //     }
  //   },
  //   [currentKeyword, selectedCompanyCode, dateRange]
  // );

  // 대화 상세 이력을 가져오는 함수
  const fetchChatDetails = useCallback(
    async (params: FetchParams): Promise<FetchResult<ChatDetail>> => {
      devLog('Fetching chat details for user:', selectedChat?._id);

      // 더미 대화 상세 데이터
      const mockChatDetails: ChatDetail[] = [
        {
          no: 1,
          timestamp: '2025-08-14T10:30:00Z',
          userMessage: '안녕하세요, AI에게 견적 문의드리고 싶습니다.',
          aiResponse: '안녕하세요! 견적 문의에 대해 도움드리겠습니다. 어떤 프로젝트에 대한 견적을 원하시나요?',
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
    [selectedChat?._id]
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

  // 실제 API 호출로 채팅방 목록 가져오기
  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<ChatHistory>> => {
      try {
        // 키워드가 전달되면 현재 키워드 업데이트 (빈 문자열 포함)
        let searchKeyword = '';
        if (params.keyword !== undefined) {
          setCurrentKeyword(params.keyword);
          searchKeyword = params.keyword;
        } else {
          searchKeyword = currentKeyword;
        }

        const fromDate = params.fromDate || dateRange?.fromDate || dayjs().subtract(3, 'month').format('YYYY-MM-DD');
        const toDate = params.toDate || dateRange?.toDate || dayjs().format('YYYY-MM-DD');
        
        devLog('🔍 [fetchData 호출]', { searchKeyword, fromDate, toDate });
        
        // API 호출
        const response = await getChatRoomList({
          keyword: searchKeyword,
          fromDate: fromDate,
          toDate: toDate,
          companyCode: selectedCompanyCode || 'heredot',
        });
        
        devLog('✅ [fetchData 응답 받음]', response);
        
        // 응답 처리 (userMng 페이지와 동일한 패턴 적용)
        let chatRooms: any[] = [];
        
        if (response && typeof response === 'object') {
          // 응답이 직접 API 응답 객체인 경우
          if ('statusCode' in response && response.statusCode === 200) {
            const responseWithData = response as { data?: any[]; statusCode: number };
            chatRooms = Array.isArray(responseWithData.data) ? responseWithData.data : [];
          } 
          // 응답이 배열로 감싸져 있는 경우 (callAdminApi 특성)
          else if (Array.isArray(response) && response[0]) {
            const firstItem = response[0];
            if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
              const responseData = firstItem.data;
              if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
                const typedResponseData = responseData as { data?: any[]; statusCode: number };
                if (typedResponseData.statusCode === 200) {
                  chatRooms = Array.isArray(typedResponseData.data) ? typedResponseData.data : [];
                }
              }
            }
          }
        }

        devLog('파싱된 채팅방 데이터:', chatRooms);

        // API 응답 데이터를 ChatHistory 타입으로 변환
        const transformedData: ChatHistory[] = chatRooms.map((room: any) => {
          const isGuest = room.userInfo?.isGuest === true || room.isGuest === true;
          let profileImageUrl = '/ai-estimate/no-profile.png'; // 기본값
          
          if (isGuest) {
            profileImageUrl = '/cms/guest.png';
          } else if (room.userInfo?.profileImage) {
            profileImageUrl = room.userInfo.profileImage;
          }
          
          return {
            no: room.no || 0,
            _id: room._id,
            title: room.title || '제목 없음',
            isGuest,
            userInfo: room.userInfo,
            createAt: room.createAt,
            updateAt: room.updateAt,
            // 표시용 필드들
            name: room.userInfo?.name || '게스트 사용자',
            profileImageUrl,
            email: room.userInfo?.email || '-',
            cellphone: room.userInfo?.cellphone || '-',
            chatSessionId: room._id, // 채팅방 ID를 세션 ID로 사용
          };
        });

        return {
          data: transformedData,
          totalItems: transformedData.length,
          allItems: transformedData.length,
        };
      } catch (error) {
        console.error('채팅방 목록 조회 오류:', error);
        return { data: [], totalItems: 0, allItems: 0 };
      }
    },
    [currentKeyword, selectedCompanyCode, dateRange]
  );

  // ✅ AI 대화 이력에 맞는 컬럼 정의
  const columns: ColumnDefinition<ChatHistory>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no', width: 60, sortable: true },
      {
        header: '채팅방 생성일시',
        accessor: 'createAt',
        sortable: true,
        width: 180,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD (ddd) HH:mm ') : '-'),
      },
      {
        header: '프로필',
        accessor: 'profileImageUrl',
        width: 60,
        formatter: (value, row) => {
          let imageUrl = '/ai-estimate/no-profile.png'; // 기본값
          
          if (row.userInfo?.isGuest === true || row.isGuest === true) {
            imageUrl = '/cms/guest.png';
          } else if (row.userInfo?.profileImage) {
            imageUrl = row.userInfo.profileImage;
          } else if (row.profileImageUrl) {
            imageUrl = row.profileImageUrl;
          }
          
          return (
            <ProfileWrapper>
              <ProfileHeader $imageUrl={imageUrl} />
            </ProfileWrapper>
          );
        },
      },
      { header: '이름', accessor: 'name',width:100, sortable: true },
      { header: '이메일', accessor: 'email', sortable: true },
      { header: '전화번호', accessor: 'cellphone', sortable: true },
      { header: '채팅방제목', accessor: 'title', sortable: true },
      { 
        header: '채팅방ID', 
        accessor: 'chatSessionId', 
        sortable: true,
        formatter: (value) => (
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
            {value || '-'}
          </span>
        )
      },
      { header: '국가', accessor: 'nation',width:100, formatter: (value) => '대한민국' },
      
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
        onCompanySelect={handleCompanySelect}
        dateRangeOptions={['3개월', '6개월', '1년', '지정']}
        onDateChange={(fromDate, toDate) => {
          devLog('📅 고객 회원관리 - 날짜 변경:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onInitialDateSet={(fromDate, toDate) => {
          devLog('📅 고객 회원관리 - 초기 날짜 설정:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onSearchChange={(keyword) => {
          devLog('🔍 고객 회원관리 - 검색어 변경:', keyword);
          setCurrentKeyword(keyword);
        }}
      />

      {/* 채팅 이력 모달 */}
      <ChatHistoryModal
        isOpen={isChatHistoryModalOpen}
        onClose={closeChatHistoryModal}
        chatSessionId={selectedChat?.chatSessionId || ''}
        userName={selectedChat?.name}
      />
    </>
  );
};

export default AiChatHistoryPage;