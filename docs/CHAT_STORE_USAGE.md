# 📚 ChatStore 사용 가이드

## 🎯 개요

`chatStore`는 Zustand로 관리되는 **순수 메모리 기반 상태 관리 스토어**입니다.
- ✅ `sessionStorage`/`localStorage` **의존성 제거**
- ✅ 메모리 상태만으로 채팅 데이터 관리
- ✅ 컴포넌트 어디서든 `useChatStore()` 훅으로 쉽게 접근

---

## 🔧 설정

### 1. chatStore.ts 구조
```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  images?: ImageData[];
  files?: FileData[];
  isLoading?: boolean;
  messageId?: string;
  estimateId?: string;
  title?: string;
}

interface ChatState {
  messages: ChatMessage[];
  chatSessionId: string | null;
  isProcessing: boolean;
  isCrawlingUrl: boolean;
  addMessage: (m: ChatMessage) => void;
  updateLastMessage: (payload: Partial<Omit<ChatMessage, 'role'>>) => void; 
  updateMessageById: (messageId: string, payload: Partial<Omit<ChatMessage, 'role'>>) => void;
  setChatSessionId: (id: string | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setIsCrawlingUrl: (crawling: boolean) => void;
  clear: () => void;
  removeLastAiLoadingMessage: () => void;
  clearAllLoadingMessages: () => void;
  removeIncompleteEstimateMessages: () => void;
  removeLastUserAndAiMessage: () => void;
}

// ✅ persist 미들웨어 제거 - 순수 메모리 상태로만 관리
export const useChatStore = create<ChatState>()(
  devtools((set, get) => ({
    messages: [],
    chatSessionId: null,
    isProcessing: false,
    isCrawlingUrl: false,
    // ... 나머지 액션들
  }))
);
```

---

## 📖 사용법

### ✅ 올바른 사용법

#### 1. 기본 조회
```typescript
import { useChatStore } from '@/store/chatStore';

function MyComponent() {
  // ✅ 훅으로 상태 조회
  const { messages, chatSessionId } = useChatStore();
  
  // messages 배열 사용
  const lastMessage = messages[messages.length - 1];
  
  return <div>{lastMessage?.content}</div>;
}
```

#### 2. 특정 메시지 찾기
```typescript
import { useChatStore } from '@/store/chatStore';

function findMessageByEstimateId(estimateId: string) {
  const messages = useChatStore.getState().messages;
  
  return messages.find(msg => 
    msg.estimateId === estimateId ||
    msg.content.includes(`"uuid":"${estimateId}"`)
  );
}
```

#### 3. 메시지 추가
```typescript
import { useChatStore } from '@/store/chatStore';

function MyComponent() {
  const addMessage = useChatStore(s => s.addMessage);
  
  const handleSend = () => {
    addMessage({
      role: 'user',
      content: '안녕하세요',
      messageId: crypto.randomUUID()
    });
  };
  
  return <button onClick={handleSend}>전송</button>;
}
```

#### 4. chatSessionId 사용
```typescript
import { useChatStore } from '@/store/chatStore';

function MyComponent() {
  const { chatSessionId, setChatSessionId } = useChatStore();
  
  useEffect(() => {
    if (!chatSessionId) {
      // 새 세션 ID 생성
      const newId = crypto.randomUUID();
      setChatSessionId(newId);
    }
  }, [chatSessionId, setChatSessionId]);
  
  return <div>Session: {chatSessionId}</div>;
}
```

---

### ❌ 피해야 할 패턴

#### 1. sessionStorage/localStorage 직접 접근 (구버전)
```typescript
// ❌ 나쁜 예
const raw = sessionStorage.getItem('ai-chat-storage');
const data = JSON.parse(raw);
const messages = data.state.messages;

// ✅ 좋은 예
const messages = useChatStore(s => s.messages);
```

#### 2. chatSessionId를 스토리지에서 읽기 (구버전)
```typescript
// ❌ 나쁜 예
const sessionId = localStorage.getItem('chatSessionId') || 
                  sessionStorage.getItem('chatSessionId');

// ✅ 좋은 예
const chatSessionId = useChatStore(s => s.chatSessionId);
```

---

## 🔄 마이그레이션 가이드

### Before (구버전)
```typescript
// 1. 스토리지에서 메시지 읽기
const raw = sessionStorage.getItem('ai-chat-storage');
if (raw) {
  const { state } = JSON.parse(raw);
  const messages = state.messages;
  const found = messages.find(m => m.estimateId === targetId);
}

// 2. chatSessionId 읽기
const chatSessionId = localStorage.getItem('chatSessionId');

// 3. 메시지 추가 후 스토리지 저장
const newMessages = [...messages, newMessage];
sessionStorage.setItem('ai-chat-storage', JSON.stringify({
  state: { messages: newMessages }
}));
```

### After (신버전)
```typescript
import { useChatStore } from '@/store/chatStore';

// 1. 메모리 상태에서 메시지 읽기
const messages = useChatStore.getState().messages;
const found = messages.find(m => m.estimateId === targetId);

// 2. chatSessionId 읽기
const chatSessionId = useChatStore.getState().chatSessionId;

// 3. 메시지 추가 (자동으로 상태 업데이트)
useChatStore.getState().addMessage(newMessage);
```

---

## 🎨 실전 예제

### 예제 1: EstimateAccordion에서 메시지 찾기
```typescript
import { useChatStore } from '@/store/chatStore';

function EstimateAccordion({ estimateId }: { estimateId: string }) {
  // ✅ 훅으로 메시지 조회
  const messages = useChatStore(s => s.messages);
  
  // estimateId로 메시지 찾기
  const foundMessage = messages.find(msg => {
    if (msg.estimateId === estimateId) return true;
    
    // content에서 JSON 추출하여 uuid 확인
    try {
      const scriptMatch = msg.content.match(/<script[^>]*id="invoiceData"[^>]*>([\s\S]*?)<\/script>/);
      if (scriptMatch?.[1]) {
        const jsonData = JSON.parse(scriptMatch[1]);
        return jsonData.uuid === estimateId;
      }
    } catch {}
    
    return false;
  });
  
  return <div>{foundMessage?.content}</div>;
}
```

### 예제 2: 비동기 작업 후 메시지 업데이트
```typescript
import { useChatStore } from '@/store/chatStore';

async function handleSaveEstimate(estimate: any) {
  const { addMessage, updateLastMessage, chatSessionId } = useChatStore.getState();
  
  // 로딩 메시지 추가
  const messageId = crypto.randomUUID();
  addMessage({
    role: 'ai',
    content: '견적서를 생성하는 중입니다...',
    isLoading: true,
    messageId
  });
  
  try {
    // API 호출
    const result = await uploadEstimate(estimate);
    
    // 성공 메시지로 업데이트
    updateLastMessage({
      content: `견적서가 생성되었습니다!`,
      isLoading: false,
      estimateId: result.uuid
    });
  } catch (error) {
    // 에러 메시지로 업데이트
    updateLastMessage({
      content: '견적서 생성에 실패했습니다.',
      isLoading: false
    });
  }
}
```

### 예제 3: Layout에서 공유 URL 생성
```typescript
import { useChatStore } from '@/store/chatStore';

function AILayout() {
  const { messages, chatSessionId } = useChatStore();
  
  const handleShare = async () => {
    // 마지막 견적 메시지 찾기
    const lastEstimate = [...messages].reverse().find(msg => 
      msg.role === 'ai' && msg.estimateId
    );
    
    if (!lastEstimate?.estimateId) {
      console.warn('공유할 견적서가 없습니다');
      return;
    }
    
    // 공유 URL 생성
    const shareUrl = `${window.location.origin}/aiclient/${companyCode}/share?sessionId=${chatSessionId}&estimateId=${lastEstimate.estimateId}`;
    
    // 클립보드 복사
    await navigator.clipboard.writeText(shareUrl);
    alert('공유 링크가 복사되었습니다!');
  };
  
  return <button onClick={handleShare}>공유하기</button>;
}
```

---

## 🚨 주의사항

### 1. 페이지 새로고침 시 데이터 유실
- ⚠️ **메모리 상태만 사용하므로** 새로고침 시 `messages`와 `chatSessionId` 모두 초기화됨
- ✅ **해결 방법**: URL의 `sessionId` 파라미터로 서버에서 채팅 기록 복원
  
  ```typescript
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('sessionId');
    
    if (sessionIdFromUrl) {
      // 서버에서 채팅 기록 가져와서 복원
      fetchChatHistory(sessionIdFromUrl).then(history => {
        history.messages.forEach(msg => addMessage(msg));
        setChatSessionId(sessionIdFromUrl);
      });
    }
  }, []);
  ```

### 2. 컴포넌트 간 상태 공유
- ✅ `useChatStore()`는 전역 상태이므로 모든 컴포넌트에서 **동일한 데이터** 접근
- ⚠️ 한 곳에서 `addMessage()`하면 **모든 구독 컴포넌트** 자동 리렌더링

### 3. 성능 최적화
```typescript
// ❌ 매번 전체 messages 배열 구독 (불필요한 리렌더링)
const { messages } = useChatStore();

// ✅ 필요한 값만 선택적으로 구독
const lastMessage = useChatStore(s => s.messages[s.messages.length - 1]);
const messageCount = useChatStore(s => s.messages.length);
```

---

## 📌 요약

| 항목 | 구버전 (스토리지) | 신버전 (메모리) |
|------|------------------|-----------------|
| **데이터 저장** | sessionStorage | Zustand 메모리 |
| **접근 방법** | `JSON.parse(sessionStorage.getItem(...))` | `useChatStore()` |
| **chatSessionId** | `localStorage.getItem('chatSessionId')` | `useChatStore(s => s.chatSessionId)` |
| **새로고침 시** | 데이터 유지 | **데이터 초기화** (URL로 복원 필요) |
| **컴포넌트 간 공유** | 수동 동기화 필요 | 자동 동기화 |

---

## 🔗 관련 파일

- `src/store/chatStore.ts` - 메인 스토어 정의
- `src/hooks/useChatActions.ts` - 채팅 액션 훅
- `src/hooks/useAI.ts` - AI 응답 처리
- `src/app/ai/layout.tsx` - 레이아웃 (공유 등)
- `src/components/ai-esti/EstimateAccordion.tsx` - 견적 상세
- `src/components/ai-esti/EstimateCard.tsx` - 견적 카드
- `src/components/ai-esti/MyEstimateCard.tsx` - 내 견적

---

## 💡 FAQ

### Q1. 새로고침하면 채팅 기록이 사라지나요?
**A**: 네, 메모리 상태이므로 사라집니다. URL의 `sessionId`로 서버에서 복원하세요.

### Q2. 다른 탭에서도 공유되나요?
**A**: 아니요, 각 탭은 독립적인 메모리 상태를 가집니다. 

### Q3. 기존 코드를 어떻게 마이그레이션하나요?
**A**: 
1. `sessionStorage.getItem('ai-chat-storage')` → `useChatStore(s => s.messages)`
2. `localStorage.getItem('chatSessionId')` → `useChatStore(s => s.chatSessionId)`
3. 스토리지 수동 저장 코드 제거 (자동 관리됨)

---

**작성일**: 2025-01-20  
**작성자**: AI Assistant  
**버전**: 1.0.0
