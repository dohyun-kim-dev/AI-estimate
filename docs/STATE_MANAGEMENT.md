# 상태 관리 가이드 (Zustand Store)

## 📋 목차
1. [개요](#개요)
2. [Store 구조](#store-구조)
3. [chatStore - 채팅 상태 관리](#chatstore---채팅-상태-관리)
4. [authStore - 인증 상태 관리](#authstore---인증-상태-관리)
5. [companyStore - 회사 정보 관리](#companystore---회사-정보-관리)
6. [themeStore - 테마 관리](#themestore---테마-관리)
7. [usageStore - 사용량 관리](#usagestore---사용량-관리)
8. [Store 사용 패턴](#store-사용-패턴)
9. [디버깅](#디버깅)

---

## 개요

### Zustand란?

- **경량 상태 관리 라이브러리** (Redux보다 간단)
- **보일러플레이트 최소화** (액션, 리듀서 불필요)
- **타입스크립트 완벽 지원**
- **React 훅 기반 API**

### 프로젝트에서 사용하는 이유

1. **전역 상태 관리 필요**
   - 채팅 메시지, 세션 정보
   - 사용자 인증 상태
   - 회사 정보 (프롬프트, 단가표, 할인 설정)

2. **컴포넌트 간 데이터 공유**
   - ChatInput ↔ ChatBox ↔ EstimateCard
   - AuthContext 대신 authStore

3. **로컬스토리지 연동**
   - persist 미들웨어로 자동 저장/복원

---

## Store 구조

### 전체 Store 목록

```
src/store/
├── chatStore.ts          # 채팅 상태 (가장 중요)
├── authStore.ts          # 인증 상태
├── companyStore.ts       # 회사 정보
├── themeStore.ts         # 테마 설정
└── usageStore.ts         # AI 사용량
```

### Store 생성 기본 패턴

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyStore {
  // 상태
  count: number;
  
  // 액션
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      count: 0,
      
      // 액션 구현
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'my-store',  // 로컬스토리지 키
    }
  )
);
```

---

## chatStore - 채팅 상태 관리

**위치**: `src/store/chatStore.ts`

### 전체 코드

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage } from '@/types/chat';
import { getChatSessionMessages, createChatSession } from '@/lib/api/user/userApi';
import { useAuthStore } from './authStore';

interface ChatStore {
  // 상태
  messages: ChatMessage[];
  chatSessionId: string | null;
  isCrawlingUrl: boolean;
  tempSessionId: string | null;  // 비회원 임시 세션
  
  // 액션
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  deleteMessage: (messageId: string) => void;
  clear: () => void;
  
  // 세션 관리
  setChatSessionId: (sessionId: string | null) => void;
  loadLatestChatSession: () => Promise<void>;
  loadSessionMessages: (sessionId: string) => Promise<ChatMessage[]>;
  getEffectiveSessionId: () => string | null;
  
  // URL 크롤링
  setIsCrawlingUrl: (isCrawling: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      messages: [],
      chatSessionId: null,
      isCrawlingUrl: false,
      tempSessionId: null,
      
      // 메시지 추가
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      
      // 마지막 메시지 업데이트 (스트리밍)
      updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          messages[messages.length - 1] = {
            ...lastMessage,
            content,
          };
        }
        return { messages };
      }),
      
      // 메시지 삭제
      deleteMessage: (messageId) => set((state) => ({
        messages: state.messages.filter(m => m._id !== messageId)
      })),
      
      // 전체 초기화
      clear: () => set({
        messages: [],
        chatSessionId: null,
        isCrawlingUrl: false,
      }),
      
      // 세션 ID 설정
      setChatSessionId: (sessionId) => set({ chatSessionId: sessionId }),
      
      // 최신 채팅 세션 로드 (회원 전용)
      loadLatestChatSession: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const companyCode = getCompanyCodeFromUrl();
          const response = await getLatestChatSession(user._id, companyCode);
          
          if (response.data.session) {
            const sessionId = response.data.session._id;
            set({ chatSessionId: sessionId });
            
            // 메시지 로드
            const messagesResponse = await getChatSessionMessages(sessionId);
            set({ messages: messagesResponse.data.messages });
          }
        } catch (error) {
          console.error('최신 세션 로드 실패:', error);
        }
      },
      
      // 특정 세션 메시지 로드
      loadSessionMessages: async (sessionId) => {
        try {
          const response = await getChatSessionMessages(sessionId);
          const messages = response.data.messages;
          
          set({ 
            messages, 
            chatSessionId: sessionId 
          });
          
          return messages;
        } catch (error) {
          console.error('세션 메시지 로드 실패:', error);
          return [];
        }
      },
      
      // 유효한 세션 ID 반환 (회원 세션 > 임시 세션)
      getEffectiveSessionId: () => {
        const state = get();
        return state.chatSessionId || state.tempSessionId;
      },
      
      // URL 크롤링 상태
      setIsCrawlingUrl: (isCrawling) => set({ isCrawlingUrl: isCrawling }),
    }),
    {
      name: 'chat-store',
      partialPersist: true,  // messages만 저장 (세션 ID는 제외)
    }
  )
);
```

### 사용 예시

#### 1. 메시지 추가

```tsx
import { useChatStore } from '@/store/chatStore';

function ChatInput() {
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSubmit = async (text: string) => {
    // 사용자 메시지 추가
    addMessage({
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    });
    
    // AI에게 전송
    await sendChat(text);
  };
}
```

#### 2. 스트리밍 응답 업데이트

```tsx
import { useChatStore } from '@/store/chatStore';

function useAI() {
  const { addMessage, updateLastMessage } = useChatStore();

  const sendChat = async (message: string) => {
    // AI 응답 메시지 추가 (빈 내용)
    addMessage({
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    });
    
    // 스트리밍 처리
    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk.text();
      updateLastMessage(fullText);  // 실시간 업데이트
    }
  };
}
```

#### 3. 세션 로드

```tsx
import { useChatStore } from '@/store/chatStore';

function ChatPage() {
  const { loadLatestChatSession, loadSessionMessages } = useChatStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
      // URL에 세션 ID가 있으면 해당 세션 로드
      loadSessionMessages(sessionId);
    } else if (isAuthenticated()) {
      // 로그인 사용자는 최신 세션 로드
      loadLatestChatSession();
    }
  }, []);
}
```

#### 4. Store 외부에서 접근

```tsx
// 컴포넌트 외부에서도 사용 가능
import { useChatStore } from '@/store/chatStore';

export async function saveMessageToBackend() {
  const currentMessages = useChatStore.getState().messages;
  const sessionId = useChatStore.getState().getEffectiveSessionId();
  
  await api.saveMessages(sessionId, currentMessages);
}
```

---

## authStore - 인증 상태 관리

**위치**: `src/store/authStore.ts`

### 전체 코드

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { getUserInfo } from '@/lib/api/user/userApi';

interface AuthStore {
  // 상태
  user: User | null;
  token: string | null;
  adminToken: string | null;
  
  // 액션
  login: (userData: User, token: string) => void;
  adminLogin: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  fetchAndUpdateUserInfo: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      adminToken: null,
      
      // 회원 로그인
      login: (userData, token) => {
        localStorage.setItem('token', token);
        set({ user: userData, token });
      },
      
      // 관리자 로그인
      adminLogin: (userData, token) => {
        localStorage.setItem('admin_access_token', token);
        set({ user: userData, adminToken: token });
      },
      
      // 로그아웃
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_access_token');
        set({ user: null, token: null, adminToken: null });
      },
      
      // 인증 상태 확인
      isAuthenticated: () => {
        const state = get();
        return !!(state.user && (state.token || state.adminToken));
      },
      
      // 관리자 여부 확인
      isAdmin: () => {
        const state = get();
        return !!state.adminToken;
      },
      
      // 사용자 정보 갱신
      fetchAndUpdateUserInfo: async () => {
        try {
          const response = await getUserInfo();
          set({ user: response.data });
        } catch (error) {
          console.error('사용자 정보 갱신 실패:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
```

### 사용 예시

#### 1. 로그인

```tsx
import { useAuthStore } from '@/store/authStore';
import { googleLoginInitial, googleLoginUpdate } from '@/lib/api/user/userApi';

function LoginPage() {
  const { login } = useAuthStore();

  const handleGoogleLogin = async (googleUser) => {
    // 1. 초기화
    const initialResponse = await googleLoginInitial({
      providerId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      companyCode: 'company001'
    });
    
    if (initialResponse.data.needsUpdate) {
      // 2. 추가 정보 입력
      const updateResponse = await googleLoginUpdate({
        tempToken: initialResponse.data.tempToken,
        name: '홍길동',
        phone: '010-1234-5678',
        email: googleUser.email
      });
      
      // 3. 로그인 처리
      login(updateResponse.data.user, updateResponse.data.accessToken);
    } else {
      // 기존 사용자
      login(initialResponse.data.user, initialResponse.data.accessToken);
    }
  };
}
```

#### 2. 인증 확인

```tsx
import { useAuthStore } from '@/store/authStore';

function ProtectedComponent() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <h1>환영합니다, {user?.name}님!</h1>
    </div>
  );
}
```

#### 3. 라우트 가드

```tsx
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

---

## companyStore - 회사 정보 관리

**위치**: `src/store/companyStore.ts`

### 전체 코드

```typescript
import { create } from 'zustand';
import { CompanyInfo } from '@/types/company';

interface CompanyStore {
  // 상태
  companyInfo: CompanyInfo | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setCompanyInfo: (info: CompanyInfo) => void;
  clearCompanyInfo: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  companyInfo: null,
  isLoading: false,
  error: null,
  
  setCompanyInfo: (info) => set({ 
    companyInfo: info, 
    isLoading: false,
    error: null 
  }),
  
  clearCompanyInfo: () => set({ 
    companyInfo: null,
    isLoading: false,
    error: null 
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ 
    error, 
    isLoading: false 
  }),
}));
```

### 사용 예시

#### 1. 회사 정보 로드

```tsx
import { useCompanyStore } from '@/store/companyStore';
import { getCompanyInfo } from '@/lib/api/admin/adminApi';

function useCompanyInfo() {
  const { setCompanyInfo, setLoading, setError } = useCompanyStore();

  const fetchCompanyInfo = async (companyCode: string) => {
    try {
      setLoading(true);
      const response = await getCompanyInfo(companyCode);
      setCompanyInfo(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  return { fetchCompanyInfo };
}
```

#### 2. 컴포넌트에서 사용

```tsx
import { useCompanyStore } from '@/store/companyStore';

function EstimateCard() {
  const { companyInfo, isLoading } = useCompanyStore();

  if (isLoading) {
    return <Spinner />;
  }

  if (!companyInfo) {
    return <Error message="회사 정보를 불러올 수 없습니다" />;
  }

  const discountSettings = {
    rateRule: companyInfo.rateRule,
    discountRate: companyInfo.discountRate,
    checkpointList: companyInfo.checkpointList
  };

  return <Card discountSettings={discountSettings} />;
}
```

---

## themeStore - 테마 관리

**위치**: `src/store/themeStore.ts`

### 전체 코드

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      
      toggleTheme: () => set((state) => ({ 
        isDarkMode: !state.isDarkMode 
      })),
      
      setTheme: (isDark) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'theme-store',
    }
  )
);
```

### 사용 예시

```tsx
import { useThemeStore } from '@/store/themeStore';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '@/styles/theme';

function App() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Header>
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '🌙' : '☀️'}
        </ThemeToggle>
      </Header>
      <MainContent />
    </ThemeProvider>
  );
}
```

---

## usageStore - 사용량 관리

**위치**: `src/store/usageStore.ts`

### 전체 코드

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UsageStore {
  // 상태
  totalTokensUsed: number;
  totalMessagesCount: number;
  dailyUsage: { [date: string]: number };
  
  // 액션
  incrementTokens: (tokens: number) => void;
  incrementMessages: () => void;
  resetDaily: () => void;
  getUsageStats: () => UsageStats;
}

interface UsageStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      totalTokensUsed: 0,
      totalMessagesCount: 0,
      dailyUsage: {},
      
      incrementTokens: (tokens) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        return {
          totalTokensUsed: state.totalTokensUsed + tokens,
          dailyUsage: {
            ...state.dailyUsage,
            [today]: (state.dailyUsage[today] || 0) + tokens,
          },
        };
      }),
      
      incrementMessages: () => set((state) => ({
        totalMessagesCount: state.totalMessagesCount + 1,
      })),
      
      resetDaily: () => set({ dailyUsage: {} }),
      
      getUsageStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // 오늘 사용량
        const todayUsage = state.dailyUsage[today] || 0;
        
        // 이번 주 사용량
        const weekUsage = Object.entries(state.dailyUsage)
          .filter(([date]) => isThisWeek(date))
          .reduce((sum, [, usage]) => sum + usage, 0);
        
        // 이번 달 사용량
        const monthUsage = Object.entries(state.dailyUsage)
          .filter(([date]) => isThisMonth(date))
          .reduce((sum, [, usage]) => sum + usage, 0);
        
        return {
          today: todayUsage,
          thisWeek: weekUsage,
          thisMonth: monthUsage,
        };
      },
    }),
    {
      name: 'usage-store',
    }
  )
);
```

---

## Store 사용 패턴

### 1. 선택적 구독 (성능 최적화)

```tsx
// ❌ 나쁜 예 - 전체 Store 구독
function MyComponent() {
  const store = useChatStore();  // 모든 변경에 리렌더링
  
  return <div>{store.messages.length}</div>;
}

// ✅ 좋은 예 - 필요한 값만 구독
function MyComponent() {
  const messageCount = useChatStore((state) => state.messages.length);
  
  return <div>{messageCount}</div>;
}
```

### 2. 여러 값 구독

```tsx
// ✅ 방법 1: 객체로 반환
function MyComponent() {
  const { messages, addMessage } = useChatStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
  }));
}

// ✅ 방법 2: 개별 구독
function MyComponent() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
}
```

### 3. 비동기 액션

```tsx
// Store 정의
interface MyStore {
  data: Data[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

export const useMyStore = create<MyStore>((set) => ({
  data: [],
  isLoading: false,
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getData();
      set({ data: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

// 컴포넌트에서 사용
function MyComponent() {
  const { data, isLoading, fetchData } = useMyStore();

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <Spinner />;
  return <List data={data} />;
}
```

### 4. Store 간 통신

```tsx
// chatStore에서 authStore 사용
import { useAuthStore } from './authStore';

export const useChatStore = create<ChatStore>((set, get) => ({
  loadLatestSession: async () => {
    const user = useAuthStore.getState().user;  // 다른 Store 접근
    if (!user) return;
    
    // 세션 로드 로직
  },
}));
```

### 5. 컴포넌트 외부에서 사용

```tsx
// utils.ts
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export function saveCurrentState() {
  const messages = useChatStore.getState().messages;
  const user = useAuthStore.getState().user;
  
  return {
    messages,
    userId: user?._id,
  };
}
```

---

## 디버깅

### 1. Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware';

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Store 구현
      }),
      { name: 'chat-store' }
    ),
    { name: 'ChatStore' }  // DevTools에서 보이는 이름
  )
);
```

**Redux DevTools 확장 프로그램 설치 필요**

### 2. 로깅 미들웨어

```typescript
import { StateCreator } from 'zustand';

const logMiddleware = (config: StateCreator<any>) => (set, get, api) =>
  config(
    (args) => {
      console.log('이전 상태:', get());
      set(args);
      console.log('다음 상태:', get());
    },
    get,
    api
  );

export const useChatStore = create<ChatStore>()(
  logMiddleware(
    persist(
      (set, get) => ({
        // Store 구현
      }),
      { name: 'chat-store' }
    )
  )
);
```

### 3. 상태 확인

```tsx
function DebugPanel() {
  const chatState = useChatStore();
  const authState = useAuthStore();

  return (
    <pre>
      <h3>Chat Store</h3>
      {JSON.stringify(chatState, null, 2)}
      
      <h3>Auth Store</h3>
      {JSON.stringify(authState, null, 2)}
    </pre>
  );
}
```

---

## 베스트 프랙티스

### 1. Store 분리 기준

```
✅ 좋은 분리:
- authStore: 사용자 인증 상태
- chatStore: 채팅 메시지
- companyStore: 회사 정보

❌ 나쁜 분리:
- globalStore: 모든 것을 하나에
```

### 2. 액션 네이밍

```typescript
// ✅ 좋은 네이밍
addMessage()
updateLastMessage()
loadSessionMessages()
setCompanyInfo()

// ❌ 나쁜 네이밍
doSomething()
handleClick()
update()
```

### 3. 초기값 설정

```typescript
// ✅ 명시적 초기값
export const useMyStore = create<MyStore>((set) => ({
  data: [],        // 빈 배열
  count: 0,        // 0
  isLoading: false,  // false
  error: null,     // null
}));

// ❌ undefined 초기값
export const useMyStore = create<MyStore>((set) => ({
  data: undefined,  // 타입 에러 가능성
}));
```

### 4. 불변성 유지

```typescript
// ✅ 불변성 유지
addMessage: (message) => set((state) => ({
  messages: [...state.messages, message]  // 새 배열 생성
}));

// ❌ 직접 수정 (React가 감지 못함)
addMessage: (message) => set((state) => {
  state.messages.push(message);  // 원본 수정
  return { messages: state.messages };
});
```

---

## 마이그레이션 가이드

### Context API → Zustand

```tsx
// Before: Context API
const ChatContext = createContext();

function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  
  const addMessage = (msg) => {
    setMessages([...messages, msg]);
  };
  
  return (
    <ChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

function MyComponent() {
  const { messages } = useContext(ChatContext);
  return <div>{messages.length}</div>;
}

// After: Zustand
export const useChatStore = create((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),
}));

function MyComponent() {
  const messages = useChatStore((state) => state.messages);
  return <div>{messages.length}</div>;
}
```

---

## 참고 링크

- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand vs Redux](https://blog.logrocket.com/zustand-vs-redux/)

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-01-24
