import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';

/**
 * chatSessionId를 관리하는 커스텀 훅
 * - store에서 chatSessionId를 가져옴
 * - store에 값이 없으면 자동으로 getChatSessions API를 호출하여 최근 세션을 로드
 * 
 * @returns chatSessionId (string | null)
 */
export function useChatSession() {
  const chatSessionId = useChatStore((state) => state.chatSessionId);
  const loadLatestChatSession = useChatStore((state) => state.loadLatestChatSession);

  useEffect(() => {
    // chatSessionId가 없으면 최근 세션을 로드
    if (!chatSessionId) {
      loadLatestChatSession();
    }
  }, [chatSessionId, loadLatestChatSession]);

  return chatSessionId;
}
