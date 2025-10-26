import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getChatSessions } from '@/lib/api/user/userApi'
import { devLog } from '@/utils/devLogger';

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
  getEffectiveSessionId: () => string | null; // 추가: 유효한 세션 ID 가져오기
  getChatSessionId: () => Promise<string | null>; // 추가: 세션 ID 가져오기 (없으면 API 호출)
  setIsProcessing: (processing: boolean) => void; // 추가: 처리 상태 설정
  setIsCrawlingUrl: (crawling: boolean) => void; // 추가: URL 크롤링 상태 설정
  loadLatestChatSession: (force?: boolean) => Promise<void>; // 추가: 최근 채팅 세션 로드 (force: 강제 로드)
  loadSessionMessages: (sessionId: string) => Promise<ChatMessage[]>; // 추가: 세션 메시지 로드 및 반환
  clear: () => void;
  removeLastAiLoadingMessage: () => void;
  clearAllLoadingMessages: () => void; // 추가: 모든 로딩 메시지 제거
  removeIncompleteEstimateMessages: () => void; // 추가: 불완전한 견적 메시지 제거
  removeLastUserAndAiMessage: () => void; // 추가: 마지막 사용자 메시지와 AI 메시지 제거
}

// ✅ persist 미들웨어 제거 - 순수 메모리 상태로만 관리
export const useChatStore = create<ChatState>()(
  devtools(
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
        getEffectiveSessionId: () => {
          // 1. URL 파라미터
          try {
            const searchParams = new URLSearchParams(window.location.search);
            const urlSessionId = searchParams.get('sessionId');
            if (urlSessionId) return urlSessionId;
          } catch {}
          
          // 2. Zustand 스토어 (현재 상태)
          const currentSessionId = get().chatSessionId;
          if (currentSessionId) return currentSessionId;
          
          // 3. 없으면 null 반환
          return null;
        },
        getChatSessionId: async () => {
          // 1. URL 파라미터 확인
          try {
            const searchParams = new URLSearchParams(window.location.search);
            const urlSessionId = searchParams.get('sessionId');
            if (urlSessionId) {
              // URL에 있으면 스토어에도 저장
              set({ chatSessionId: urlSessionId });
              return urlSessionId;
            }
          } catch {}
          
          // 2. Zustand 스토어 상태 확인
          const currentSessionId = get().chatSessionId;
          if (currentSessionId) {
            return currentSessionId;
          }
          
          // 3. 둘 다 없으면 API 호출하여 최신 세션 가져오기
          try {
            // 🔥 user 파라미터 생성: 회원이면 _id, 비회원이면 guest-uuid
            const { useAuthStore } = await import('@/store/authStore');
            const authUser = useAuthStore.getState().user;
            const userId = authUser?._id || localStorage.getItem('guest-uuid') || '';
            
            const response: any = await getChatSessions(userId);
            
            if (response.statusCode !== 200 || !response.data) {
              devLog('⚠️ 채팅 세션 로드 실패:', response.message);
              return null;
            }
            
            const sessions = response.data;
            
            if (!sessions || sessions.length === 0) {
              devLog('⚠️ 사용 가능한 채팅 세션이 없습니다.');
              return null;
            }

            // updateAt 기준으로 정렬하여 가장 최근 세션 찾기
            const sortedSessions = [...sessions].sort((a: any, b: any) => {
              const dateA = new Date(a.updateAt || a.createAt).getTime();
              const dateB = new Date(b.updateAt || b.createAt).getTime();
              return dateB - dateA;
            });
            
            const latestSession = sortedSessions[0];
            if (latestSession && latestSession._id) {
              set({ chatSessionId: latestSession._id });
              devLog('✅ 최신 챗세션 로드:', latestSession._id);
              return latestSession._id;
            }
            
            return null;
          } catch (error) {
            console.error('❌ 채팅 세션 로드 실패:', error);
            return null;
          }
        },
        setIsProcessing: (processing) => set({ isProcessing: processing }), // 추가: 처리 상태 설정
        setIsCrawlingUrl: (crawling) => set({ isCrawlingUrl: crawling }), // 추가: URL 크롤링 상태 설정
        loadSessionMessages: async (sessionId: string) => {
          try {
            // getChatSessionMessages API 호출
            const { getChatSessionMessages } = await import('@/lib/api/user/userApi');
            const messagesResponse = await getChatSessionMessages(sessionId) as any;
            
            if (!messagesResponse || messagesResponse.statusCode !== 200 || !messagesResponse.data) {
              devLog('⚠️ 채팅 메시지 로드 실패:', messagesResponse?.message);
              return [];
            }
            
            // 파일 URL 생성 함수
            const getFileUrl = (fileName: string) => {
              if (process.env.NODE_ENV === 'development') {
                return `/api/file/${fileName}`;
              }
              const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
              return `${apiHost}/file/${fileName}`;
            };
            
            // 메시지 파싱
            const chatMessages: ChatMessage[] = messagesResponse.data.map((msg: any) => {
              let images: ImageData[] = [];
              let files: FileData[] = [];
              
              // fileMetadata가 있으면 우선 사용 (한글 파일명 보존)
              if (msg.content.fileMetadata && Array.isArray(msg.content.fileMetadata)) {
                msg.content.fileMetadata.forEach((metadata: any) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(metadata.serverFileName);
                  
                  if (isImage) {
                    images.push({
                      url: getFileUrl(metadata.serverFileName),
                      fileName: metadata.originalFileName || metadata.serverFileName,
                      mimeType: metadata.mimeType || `image/${metadata.serverFileName.split('.').pop()?.toLowerCase() || 'png'}`
                    });
                  } else {
                    files.push({
                      url: getFileUrl(metadata.serverFileName),
                      fileName: metadata.originalFileName || metadata.serverFileName,
                      mimeType: metadata.mimeType,
                      size: metadata.size
                    });
                  }
                });
              } 
              // fileMetadata가 없으면 기존 files 배열 사용 (하위 호환성)
              else if (msg.content.files && Array.isArray(msg.content.files)) {
                msg.content.files.forEach((fileName: string) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
                  
                  if (isImage) {
                    images.push({
                      url: getFileUrl(fileName),
                      fileName: fileName,
                      mimeType: `image/${fileName.split('.').pop()?.toLowerCase() || 'png'}`
                    });
                  } else {
                    files.push({
                      url: getFileUrl(fileName),
                      fileName: fileName,
                      mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
                      size: undefined
                    });
                  }
                });
              }
              
              return {
                role: msg.role === 'USER' ? 'user' as const : 'ai' as const,
                content: msg.content.value || msg.content.content || '',
                images: images.length > 0 ? images : undefined,
                files: files.length > 0 ? files : undefined,
                messageId: msg._id,
                title: msg.title,
                estimateId: msg.content?.estimateId
              };
            });
            
            devLog('✅ 채팅 메시지 로드 완료:', chatMessages.length, '개');
            return chatMessages;
            
          } catch (error) {
            console.error('❌ 채팅 메시지 로드 실패:', error);
            return [];
          }
        },
        loadLatestChatSession: async (force = false) => {
          // force가 true가 아니고 이미 chatSessionId가 있으면 API 호출하지 않음
          if (!force && get().chatSessionId) {
            return;
          }

          try {
            // 🔥 user 파라미터 생성: 회원이면 _id, 비회원이면 guest-uuid
            const { useAuthStore } = await import('@/store/authStore');
            const authUser = useAuthStore.getState().user;
            const userId = authUser?._id || localStorage.getItem('guest-uuid') || '';
            
            const response: any = await getChatSessions(userId);
            
            // ✅ API 응답 구조 확인: { statusCode, message, data, ... }
            if (response.statusCode !== 200 || !response.data) {
              devLog('⚠️ 채팅 세션 로드 실패:', response.message);
              return;
            }
            
            const sessions = response.data;
            
            // 세션이 없으면 아무것도 하지 않음
            if (!sessions || sessions.length === 0) {
              devLog('⚠️ 사용 가능한 채팅 세션이 없습니다.');
              return;
            }

            // ✅ updateAt 기준으로 정렬하여 가장 최근 세션 찾기
            const sortedSessions = [...sessions].sort((a: any, b: any) => {
              const dateA = new Date(a.updateAt || a.createAt).getTime();
              const dateB = new Date(b.updateAt || b.createAt).getTime();
              return dateB - dateA; // 내림차순 (최신 순)
            });
            
            const latestSession = sortedSessions[0];
            if (latestSession && latestSession._id) {
              set({ chatSessionId: latestSession._id });
              devLog('✅ 최신 챗세션 로드:', latestSession._id, latestSession.title);
            }
          } catch (error) {
            console.error('❌ 최근 채팅 세션 로드 실패:', error);
            // 에러 발생 시에도 앱은 계속 동작하도록 함
          }
        },
        clear: () => {
          // ⚠️ 세션 ID는 유지 (새 채팅 시작 시에만 null로 설정)
          set({ 
            messages: [], // 메시지 초기화
            isProcessing: false, // 처리 상태도 초기화
            isCrawlingUrl: false // URL 크롤링 상태도 초기화
          }); 
          // ✅ 스토리지 제거 로직 삭제 (메모리만 사용)
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
      })
  )
);
