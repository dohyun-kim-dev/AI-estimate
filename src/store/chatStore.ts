import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export interface ImageData {
  url: string;
  fileName: string;
  mimeType?: string;
  size?: number;
}

// 📄 문서 파일 데이터 타입 (PDF, TXT 등)
export interface FileData {
  url: string;
  fileName: string;
  mimeType: string;
  size?: number;
}

export type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
  images?: ImageData[]; // 이미지 배열 추가
  files?: FileData[]; // 📄 문서 파일 배열 추가
  isLoading?: boolean;
  messageId?: string;
  estimateId?: string;
  title?: string;
};



interface ChatState {
  messages: ChatMessage[];
  chatSessionId: string | null;
  isProcessing: boolean; // 추가: AI 처리 중 상태
  isCrawlingUrl: boolean; // 추가: URL 크롤링 중 상태
  addMessage: (m: ChatMessage) => void;
  updateLastMessage: (payload: Partial<Omit<ChatMessage, 'role'>>) => void; 
  updateMessageById: (messageId: string, payload: Partial<Omit<ChatMessage, 'role'>>) => void;
  setChatSessionId: (id: string | null) => void;
  setIsProcessing: (processing: boolean) => void; // 추가: 처리 상태 설정
  setIsCrawlingUrl: (crawling: boolean) => void; // 추가: URL 크롤링 상태 설정
  clear: () => void;
  removeLastAiLoadingMessage: () => void;
  clearAllLoadingMessages: () => void; // 추가: 모든 로딩 메시지 제거
  removeIncompleteEstimateMessages: () => void; // 추가: 불완전한 견적 메시지 제거
  removeLastUserAndAiMessage: () => void; // 추가: 마지막 사용자 메시지와 AI 메시지 제거
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        chatSessionId: null,
        isProcessing: false, // 추가: 초기값 false
        isCrawlingUrl: false, // 추가: URL 크롤링 초기값 false
        addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
        // 변경됨: 객체를 받아 마지막 메시지를 업데이트하도록 수정
        // Update the last AI message (searching from the end) with the provided payload.
        // Do NOT force isLoading to false here; preserve or use payload.isLoading if provided.
        updateLastMessage: (payload) => set((s) => {
          const messages = [...s.messages];
          // find last index of an 'ai' message; if none, fall back to last message
          let idx = -1;
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'ai') { idx = i; break; }
          }
          if (idx === -1 && messages.length > 0) idx = messages.length - 1;

          if (idx >= 0) {
            const lastMessage = messages[idx];
            const updatedMessage = {
              ...lastMessage,
              ...payload,
              // if payload explicitly sets isLoading, use it; otherwise keep existing value
              isLoading: typeof payload.isLoading === 'boolean' ? payload.isLoading : lastMessage.isLoading,
            } as typeof lastMessage;

            messages[idx] = updatedMessage;
            return { messages };
          }
          return s;
        }),
        clearAllLoadingMessages: () => set((state) => ({
          messages: state.messages.map(msg =>
            msg.isLoading ? { ...msg, isLoading: false } : msg
          ),
        })),
        removeIncompleteEstimateMessages: () => set((state) => ({
          messages: state.messages.filter(msg => {
            if (msg.role !== 'ai') return true;
            if (typeof msg.content !== 'string') return true;
            
            // 1. script 태그 형식 체크
            const scriptStartPattern = /<script[^>]*id="invoiceData"[^>]*>/;
            const hasScriptStart = scriptStartPattern.test(msg.content);
            const hasScriptEnd = msg.content.includes('</script>');
            if (hasScriptStart && !hasScriptEnd) return false; // 불완전한 script 태그
            
            // 2. 마크다운 코드 블록 형식 체크
            const markdownJsonPattern = /```json\s*\n/;
            const hasMarkdownStart = markdownJsonPattern.test(msg.content);
            const hasMarkdownEnd = msg.content.includes('\n```');
            if (hasMarkdownStart && !hasMarkdownEnd) return false; // 불완전한 마크다운 블록
            
            // 3. 직접 JSON 형식 체크 - uuid나 project_name이 있으면 JSON 시작으로 간주
            const jsonStartPattern = /[{"](?:.*"uuid"|.*"project_name")/;
            const hasJsonStart = jsonStartPattern.test(msg.content);
            const hasJsonEnd = msg.content.includes('}');
            if (hasJsonStart && !hasJsonEnd) return false; // 불완전한 JSON
            
            return true; // 완전한 메시지 또는 견적서가 아닌 메시지
          }),
        })),
        // 특정 messageId로 메시지를 찾아 업데이트합니다.
        updateMessageById: (messageId: string, payload: Partial<Omit<ChatMessage, 'role'>>) => set((s) => {
 const messages = s.messages.map((m) => {
            if (m.messageId === messageId) {
              return {
                ...m,
                ...payload,
                estimateId: m.estimateId ?? payload.estimateId,
                title: m.title ?? payload.title,
                isLoading: false,
              };
            }
            return m;
          });          return { messages };
        }),
        setChatSessionId: (id) => set({ chatSessionId: id }),
        setIsProcessing: (processing) => set({ isProcessing: processing }), // 추가: 처리 상태 설정
        setIsCrawlingUrl: (crawling) => set({ isCrawlingUrl: crawling }), // 추가: URL 크롤링 상태 설정
        clear: () => {
          const { setChatSessionId } = get();
          setChatSessionId(null); // 세션 ID 초기화
          set({ 
            messages: [], // 메시지 초기화
            isProcessing: false, // 처리 상태도 초기화
            isCrawlingUrl: false // URL 크롤링 상태도 초기화
          }); 
            sessionStorage.removeItem('ai-chat-storage'); // ⭐️ 스토리지도 직접 삭제
        },
        removeLastAiLoadingMessage: () => set((s) => {
          const messages = [...s.messages];
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'ai' && messages[i].isLoading) {
              messages.splice(i, 1);
              break;
            }
          }
          return { messages };
        }),
        removeLastUserAndAiMessage: () => set((s) => {
          const messages = [...s.messages];
          let removedCount = 0;
          
          // 뒤에서부터 탐색하여 마지막 AI 메시지 제거
          for (let i = messages.length - 1; i >= 0 && removedCount < 2; i--) {
            if (messages[i].role === 'ai') {
              messages.splice(i, 1);
              removedCount++;
              break;
            }
          }
          
          // 뒤에서부터 탐색하여 마지막 사용자 메시지 제거
          for (let i = messages.length - 1; i >= 0 && removedCount < 2; i--) {
            if (messages[i].role === 'user') {
              messages.splice(i, 1);
              removedCount++;
              break;
            }
          }
          
          return { messages };
        }),
      }),
      
      {
        name: 'ai-chat-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
