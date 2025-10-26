# 컴포넌트 가이드

## 📋 목차
1. [개요](#개요)
2. [AI 채팅 컴포넌트](#ai-채팅-컴포넌트)
3. [견적서 컴포넌트](#견적서-컴포넌트)
4. [공통 컴포넌트](#공통-컴포넌트)
5. [CMS 컴포넌트](#cms-컴포넌트)
6. [레이아웃 컴포넌트](#레이아웃-컴포넌트)

---

## 개요

### 컴포넌트 구조 원칙

1. **재사용성**: 공통 컴포넌트는 `src/components/common/`에 배치
2. **도메인 분리**: 기능별로 폴더 구분 (ai-esti, cms, etc.)
3. **Styled Components**: CSS-in-JS 방식 사용
4. **Props 타입**: TypeScript 인터페이스로 명시
5. **Zustand Store**: 전역 상태는 훅으로 접근

---

## AI 채팅 컴포넌트

### 1. ChatInput

**위치**: `src/components/ai-esti/ChatInput.tsx`

**용도**: 사용자 메시지 입력 및 파일 업로드

**Props**:
```typescript
interface ChatInputProps {
  onSubmit: (
    value: string, 
    options?: {
      displayMessage?: string;
      abortSignal?: AbortSignal;
    }
  ) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}
```

**사용 예시**:
```tsx
import ChatInput from '@/components/ai-esti/ChatInput';

function ChatPage() {
  const handleSubmit = async (value: string, options) => {
    await sendChat(value, uploadedImages, uploadedFiles, options);
  };

  return (
    <ChatInput
      onSubmit={handleSubmit}
      isLoading={isAiLoading}
      placeholder="프로젝트 내용을 입력하세요..."
      maxLength={5000}
    />
  );
}
```

**주요 기능**:
- 텍스트 입력 (Enter 전송, Shift+Enter 줄바꿈)
- 이미지 업로드 (드래그앤드롭, 클릭 업로드)
- 문서 업로드 (PDF, Word, Excel, etc.)
- 파일 미리보기 및 삭제
- 입력 중 자동 높이 조절

**내부 상태**:
```typescript
const [inputValue, setInputValue] = useState('');
const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
const [uploadedDocs, setUploadedDocs] = useState<FileData[]>([]);
```

---

### 2. AiMessageContent

**위치**: `src/components/ai-esti/AiMessageContent.tsx`

**용도**: AI 응답 메시지 렌더링 (마크다운, 견적서)

**Props**:
```typescript
interface AiMessageContentProps {
  content: string;
  isStreaming?: boolean;
}
```

**사용 예시**:
```tsx
import AiMessageContent from '@/components/ai-esti/AiMessageContent';

function ChatMessage({ message }) {
  return (
    <AiMessageContent 
      content={message.content}
      isStreaming={message.isStreaming}
    />
  );
}
```

**주요 기능**:
- 마크다운 렌더링 (ReactMarkdown)
- 견적서 데이터 추출 및 표시
- 코드 블록 하이라이팅
- 스트리밍 중 커서 표시

**견적서 추출 로직**:
```typescript
const extractEstimateData = (content: string): ProjectEstimate | null => {
  // 1. <script> 태그에서 JSON 추출
  const scriptMatch = content.match(
    /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
  );
  
  if (scriptMatch) {
    return JSON.parse(scriptMatch[1]);
  }
  
  // 2. 마크다운 코드블록에서 추출
  const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }
  
  return null;
};
```

---

### 3. ChatBox

**위치**: `src/components/ai-esti/ChatBox.tsx`

**용도**: 메시지 목록 표시 및 스크롤 관리

**Props**:
```typescript
interface ChatBoxProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
}
```

**사용 예시**:
```tsx
import ChatBox from '@/components/ai-esti/ChatBox';

function ChatPage() {
  const { messages } = useChatStore();

  return (
    <ChatBox 
      messages={messages}
      isLoading={isAiLoading}
      onRetry={handleRetry}
    />
  );
}
```

**주요 기능**:
- 자동 스크롤 (새 메시지 시)
- 메시지 역할별 스타일링 (user/assistant)
- 로딩 애니메이션
- 에러 메시지 재시도

**자동 스크롤 로직**:
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

---

## 견적서 컴포넌트

### 1. EstimateCard

**위치**: `src/components/ai-esti/EstimateCard.tsx`

**용도**: 견적서 요약 카드 (공유, 다운로드)

**Props**:
```typescript
interface EstimateCardProps {
  estimate: ProjectEstimate;
  sessionId?: string;
  onPeriodChange?: (period: number) => void;
}
```

**사용 예시**:
```tsx
import EstimateCard from '@/components/ai-esti/EstimateCard';

function EstimateDisplay({ estimate }) {
  const handlePeriodChange = (weeks: number) => {
    console.log(`기간 연장: ${weeks}주`);
  };

  return (
    <EstimateCard
      estimate={estimate}
      sessionId="chat_session_123"
      onPeriodChange={handlePeriodChange}
    />
  );
}
```

**주요 기능**:
1. **견적서 정보 표시**
   - 프로젝트명
   - 총 금액 (할인 적용)
   - 예상 기간
   - 할인 금액

2. **공유하기**
   ```typescript
   const handleShare = async () => {
     // 1. UUID 생성
     const uuid = await ensureUuid(estimate);
     
     // 2. 공유 URL 생성
     const shareUrl = `${origin}/${companyCode}/share?uuid=${uuid}`;
     
     // 3. 클립보드 복사
     await navigator.clipboard.writeText(shareUrl);
     
     showToast('링크가 복사되었습니다', 'success');
   };
   ```

3. **다운로드 (PDF)**
   ```typescript
   const handleDownload = async () => {
     // 비회원: 로그인 모달 표시
     if (!isAuthenticated()) {
       setIsSocialLoginModalOpen(true);
       return;
     }
     
     // 회원: PDF 미리보기 페이지 오픈
     const previewUrl = `/pdf-preview?company=${companyCode}&uuid=${uuid}`;
     window.open(previewUrl, '_blank');
   };
   ```

4. **기간 조정 슬라이더**
   - EstimateCard 내부에 PeriodSlider 포함
   - 할인율 실시간 계산

**할인 계산 로직**:
```typescript
const { totalDiscountedPrice, totalDiscountAmount } = useMemo(() => {
  if (projectPeriod === 0) {
    return { totalDiscountedPrice: basePrice, totalDiscountAmount: 0 };
  }
  
  let total = 0;
  let discountTotal = 0;
  
  estimate.categories.forEach(category => {
    category.sub_categories.forEach(subCategory => {
      subCategory.items.forEach(item => {
        if (!item.is_deleted) {
          const itemPrice = parseFloat(item.price);
          
          // 기획/디자인은 할인 제외
          if (isNonDiscountableItem(item)) {
            total += itemPrice;
          } else {
            // 할인 적용
            const discountInfo = calculateDiscountInfo(
              projectPeriod,
              itemPrice,
              discountSettings
            );
            total += itemPrice - discountInfo.amount;
            discountTotal += discountInfo.amount;
          }
        }
      });
    });
  });
  
  return { 
    totalDiscountedPrice: Math.floor(total), 
    totalDiscountAmount: Math.floor(discountTotal) 
  };
}, [estimate, projectPeriod, discountSettings]);
```

**기간 표시 로직**:
```typescript
// 기본 기간 (주)
const baseWeeks = parseInt(estimate.estimated_period) || 0;

// 연장 기간 (MONTH면 4배, WEEK면 그대로)
let extendedWeeks = 0;
if (projectPeriod > 0) {
  if (discountSettings.discountRate === 'MONTH') {
    extendedWeeks = projectPeriod * 4;  // 1개월 = 4주
  } else {
    extendedWeeks = projectPeriod;
  }
}

// 최종 기간
const finalWeekValue = baseWeeks + extendedWeeks;
const monthValue = Math.ceil(finalWeekValue / 4.345);
```

---

### 2. EstimateAccordion

**위치**: `src/components/ai-esti/EstimateAccordion.tsx`

**용도**: 견적서 상세 내역 (아코디언 형태)

**Props**:
```typescript
interface EstimateAccordionProps {
  estimate: ProjectEstimate;
  editable?: boolean;
  onEdit?: (updatedEstimate: ProjectEstimate) => void;
}
```

**사용 예시**:
```tsx
import EstimateAccordion from '@/components/ai-esti/EstimateAccordion';

function EstimateDetail({ estimate }) {
  const handleEdit = (updated: ProjectEstimate) => {
    console.log('견적서 수정:', updated);
  };

  return (
    <EstimateAccordion
      estimate={estimate}
      editable={true}
      onEdit={handleEdit}
    />
  );
}
```

**주요 기능**:
1. **카테고리별 그룹핑**
   - 대분류 (프론트엔드, 백엔드, etc.)
   - 중분류 (화면 개발, API 개발, etc.)
   - 항목별 상세 (항목명, 단가, 설명)

2. **항목 수정/삭제** (editable=true)
   ```typescript
   const handleItemDelete = (categoryIdx, subCategoryIdx, itemIdx) => {
     const updated = { ...estimate };
     updated.categories[categoryIdx]
       .sub_categories[subCategoryIdx]
       .items[itemIdx].is_deleted = true;
     
     onEdit?.(updated);
   };
   ```

3. **아코디언 토글**
   ```typescript
   const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
   
   const handleToggle = (categoryName: string) => {
     setExpanded(prev => ({
       ...prev,
       [categoryName]: !prev[categoryName]
     }));
   };
   ```

**구조 예시**:
```
📁 프론트엔드 개발                    3,000,000원
  ├─ 📂 화면 개발                    2,000,000원
  │   ├─ 일반 화면 (10페이지)          500,000원
  │   ├─ 복잡 화면 (5페이지)         1,000,000원
  │   └─ 관리자 화면 (5페이지)         500,000원
  └─ 📂 공통 컴포넌트                1,000,000원
      └─ 재사용 컴포넌트              1,000,000원
```

---

### 3. PeriodSlider

**위치**: `src/components/ai-esti/PeriodSlider.tsx`

**용도**: 프로젝트 기간 연장 슬라이더

**Props**:
```typescript
interface PeriodSliderProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}
```

**사용 예시**:
```tsx
import PeriodSlider from '@/components/ai-esti/PeriodSlider';

function EstimateCard() {
  const [projectPeriod, setProjectPeriod] = useState(0);

  return (
    <PeriodSlider
      value={projectPeriod}
      onChange={setProjectPeriod}
      disabled={false}
    />
  );
}
```

**주요 기능**:
1. **FIXED 모드** (연속 값)
   ```typescript
   const sliderConfig = {
     min: 0,
     max: 8,      // 0~8주
     step: 1,
     marks: {
       0: '0주',
       2: '2주',
       4: '4주',
       6: '6주',
       8: '8주'
     }
   };
   ```

2. **DYNAMIC 모드** (체크포인트만)
   ```typescript
   const checkpoints = [0, 1, 5, 8];  // 0, 1, 5, 8주만 선택 가능
   const sliderConfig = {
     min: 0,
     max: checkpoints.length - 1,  // 인덱스: 0~3
     step: 1,
     marks: {
       0: '0주',
       1: '1주',
       2: '5주',
       3: '8주'
     }
   };
   
   // 실제 값 변환
   const actualValue = checkpoints[sliderValue];
   ```

3. **MONTH 단위 변환**
   ```typescript
   const displayValue = useMemo(() => {
     if (discountSettings.discountRate === 'MONTH') {
       return value;  // 개월 그대로
     } else {
       return value;  // 주 그대로
     }
   }, [value, discountSettings]);
   
   const displayUnit = discountSettings.discountRate === 'MONTH' 
     ? '개월' 
     : '주';
   ```

**UI 구조**:
```tsx
<SliderContainer>
  <SliderLabel>프로젝트 기간 연장</SliderLabel>
  <Slider
    value={sliderValue}
    onChange={handleChange}
    min={config.min}
    max={config.max}
    step={config.step}
    marks={config.marks}
  />
  <SliderValue>{displayValue}{displayUnit}</SliderValue>
</SliderContainer>
```

---

## 공통 컴포넌트

### 1. CustomList

**위치**: `src/components/CustomList/index.tsx`

**용도**: 데이터 목록 표시 (페이지네이션, 검색, 필터)

**Props**:
```typescript
interface CustomListProps<T> {
  columns: ColumnDef<T>[];
  fetchData: (params: FetchParams) => Promise<FetchResult<T>>;
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selected: T[]) => void;
}
```

**사용 예시**:
```tsx
import CustomList from '@/components/CustomList';

function UserListPage() {
  const columns = [
    { header: '이름', accessor: 'name' },
    { header: '이메일', accessor: 'email' },
    { header: '가입일', accessor: 'createdAt', render: (date) => formatDate(date) }
  ];

  const fetchUsers = async (params) => {
    const response = await getUserList({
      page: params.page,
      limit: params.limit,
      search: params.search
    });
    
    return {
      data: response.data.users,
      total: response.data.total
    };
  };

  return (
    <CustomList
      columns={columns}
      fetchData={fetchUsers}
      searchable={true}
      onRowClick={(user) => console.log('클릭:', user)}
    />
  );
}
```

**주요 기능**:
- 페이지네이션 (자동)
- 검색 (실시간)
- 정렬 (컬럼 클릭)
- 선택 (체크박스)
- 커스텀 렌더러 (render prop)

---

### 2. Button

**위치**: `src/components/common/Button.tsx`

**용도**: 재사용 가능한 버튼 컴포넌트

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**사용 예시**:
```tsx
import Button from '@/components/common/Button';

function Actions() {
  return (
    <>
      <Button variant="primary" size="large">
        저장
      </Button>
      
      <Button 
        variant="outlined" 
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
      >
        다운로드
      </Button>
      
      <Button variant="danger" loading={isDeleting}>
        삭제
      </Button>
    </>
  );
}
```

---

### 3. Modal

**위치**: `src/components/common/Modal.tsx`

**용도**: 모달 다이얼로그

**Props**:
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  width?: string;
  height?: string;
  children: React.ReactNode;
}
```

**사용 예시**:
```tsx
import Modal from '@/components/common/Modal';

function EditUserModal({ user, open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="회원 정보 수정"
      width="600px"
      footer={
        <>
          <Button onClick={handleSave}>저장</Button>
          <Button variant="outlined" onClick={onClose}>취소</Button>
        </>
      }
    >
      <UserForm user={user} />
    </Modal>
  );
}
```

---

### 4. Toast / ToastProvider

**위치**: `src/components/common/ToastProvider.tsx`

**용도**: 토스트 알림 메시지

**사용 예시**:
```tsx
// 1. App.tsx에서 Provider 설정
import { ToastProvider } from '@/components/common/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <Router />
    </ToastProvider>
  );
}

// 2. 컴포넌트에서 사용
import { useToast } from '@/components/common/ToastProvider';

function SaveButton() {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast('저장되었습니다', 'success');
    } catch (error) {
      showToast('저장 실패', 'error');
    }
  };

  return <Button onClick={handleSave}>저장</Button>;
}
```

**토스트 타입**:
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

showToast(message: string, type: ToastType, duration?: number);
```

---

### 5. Spinner / ProfileSpinner

**위치**: 
- `src/components/common/Spinner.tsx`
- `src/components/common/ProfileSpinner.tsx`

**용도**: 로딩 애니메이션

**사용 예시**:
```tsx
import Spinner from '@/components/common/Spinner';
import ProfileSpinner from '@/components/common/ProfileSpinner';

function LoadingState() {
  const { isLoading } = useCompanyStore();

  if (isLoading) {
    return <ProfileSpinner />;  // 전체 화면 로딩
  }

  return (
    <DataContainer>
      {isFetching && <Spinner size="small" />}
      <DataList />
    </DataContainer>
  );
}
```

---

## CMS 컴포넌트

### 1. CompanyFormPopup

**위치**: `src/app/superAdmin/companyMng/CompanyFormPopup.tsx`

**용도**: 고객사 생성/수정 팝업

**Props**:
```typescript
interface CompanyFormPopupProps {
  open: boolean;
  onClose: () => void;
  selectedCustomer?: CompanyInfo | null;
  onSave: (data: CompanyFormData) => Promise<void>;
  onDelete?: (companyCode: string) => Promise<void>;
}
```

**사용 예시**:
```tsx
import CompanyFormPopup from './CompanyFormPopup';

function CompanyManagement() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleSave = async (data) => {
    if (selectedCompany) {
      await updateCompany(data);
    } else {
      await createCompany(data);
    }
    setIsPopupOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsPopupOpen(true)}>
        고객사 추가
      </Button>
      
      <CompanyFormPopup
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        selectedCustomer={selectedCompany}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
```

**주요 기능**:
1. 고객사 정보 입력
   - 회사명, 회사코드
   - 테마 (LIGHT/DARK)
   - 할인 설정 (FIXED/DYNAMIC)

2. 체크포인트 관리
   ```tsx
   const [checkpoints, setCheckpoints] = useState([
     { checkpoint: 1, discountRate: 1.25 }
   ]);
   
   const addCheckpoint = () => {
     setCheckpoints([...checkpoints, { checkpoint: 0, discountRate: 0 }]);
   };
   ```

3. 로고 업로드
4. 컬러 피커 (primaryColor, secondaryColor)
5. 삭제 버튼 (슈퍼어드민 전용)

---

### 2. DeleteConfirmModal

**위치**: `src/components/DeleteConfirmModal.tsx`

**용도**: 삭제 확인 모달

**Props**:
```typescript
interface DeleteConfirmModalProps {
  open: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  reverseButtons?: boolean;
}
```

**사용 예시**:
```tsx
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

function DeleteButton({ item }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = async () => {
    await deleteItem(item.id);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button 
        variant="danger"
        onClick={() => setIsModalOpen(true)}
      >
        삭제
      </Button>
      
      <DeleteConfirmModal
        open={isModalOpen}
        title="항목 삭제"
        content={`정말로 "${item.name}"을(를) 삭제하시겠습니까?`}
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
        reverseButtons={true}
      />
    </>
  );
}
```

---

## 레이아웃 컴포넌트

### 1. MainLayout

**위치**: `src/layout/MainLayout.tsx`

**용도**: 메인 레이아웃 (헤더, 사이드바, 푸터)

**Props**:
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
}
```

**사용 예시**:
```tsx
import MainLayout from '@/layout/MainLayout';

function DashboardPage() {
  return (
    <MainLayout showSidebar={true}>
      <DashboardContent />
    </MainLayout>
  );
}
```

---

### 2. CMSLayout

**위치**: `src/layout/CMSLayout.tsx`

**용도**: CMS 전용 레이아웃 (사이드 메뉴)

**특징**:
- 좌측 사이드 메뉴
- 상단 헤더 (로고, 사용자 정보)
- 하단 콘텐츠 영역

**메뉴 구조**:
```typescript
const menuItems = [
  {
    icon: <EstimateIcon />,
    label: '견적 관리',
    path: '/cms/estimate'
  },
  {
    icon: <UserIcon />,
    label: '회원 관리',
    path: '/cms/user'
  },
  {
    icon: <SettingIcon />,
    label: 'AI 설정',
    path: '/cms/aiSetting'
  }
];
```

---

## 스타일링 패턴

### Styled Components 사용법

```tsx
import styled from 'styled-components';

// 1. 기본 스타일
const Container = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.background};
`;

// 2. Props 기반 스타일
interface ButtonStyledProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'large';
}

const StyledButton = styled.button<ButtonStyledProps>`
  padding: ${({ size }) => size === 'small' ? '8px 16px' : '12px 24px'};
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.primary : theme.secondary
  };
`;

// 3. 조건부 스타일
const Card = styled.div<{ isActive?: boolean }>`
  border: 2px solid ${({ isActive, theme }) => 
    isActive ? theme.primary : theme.border
  };
  
  ${({ isActive }) => isActive && `
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `}
`;

// 4. 반응형
const ResponsiveContainer = styled.div`
  width: 100%;
  
  @media (min-width: 768px) {
    width: 50%;
  }
  
  @media (min-width: 1024px) {
    width: 33.33%;
  }
`;
```

---

## 컴포넌트 작성 가이드

### 1. 기본 템플릿

```tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction
}) => {
  const [state, setState] = useState('');

  useEffect(() => {
    // 초기화 로직
  }, []);

  const handleClick = () => {
    onAction?.();
  };

  return (
    <Container>
      <Title>{title}</Title>
      <Button onClick={handleClick}>액션</Button>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export default MyComponent;
```

---

### 2. 에러 처리

```tsx
import { useState } from 'react';
import { useToast } from '@/components/common/ToastProvider';

function MyComponent() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await someApiCall();
      
      showToast('성공했습니다', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return <Content />;
}
```

---

### 3. 성능 최적화

```tsx
import { useMemo, useCallback } from 'react';

function OptimizedComponent({ data }) {
  // 1. useMemo - 계산 결과 캐싱
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item)
    }));
  }, [data]);

  // 2. useCallback - 함수 참조 유지
  const handleClick = useCallback((id: string) => {
    console.log('클릭:', id);
  }, []);

  // 3. React.memo - 컴포넌트 메모이제이션
  const MemoizedChild = React.memo(ChildComponent);

  return (
    <div>
      {processedData.map(item => (
        <MemoizedChild 
          key={item.id}
          data={item}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}
```

---

## 참고 링크

- [Styled Components 공식 문서](https://styled-components.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-01-24
