import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getChatMessages } from '@/lib/api/admin/adminApi';
import ShareAiResponseMessage from '@/components/ai-esti/ShareAiResponseMessage';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessionId: string;
  userName?: string;
  chatTitle?: string;
  aiProfile?: string;
  companyCode?: string; // ✅ 추가: companyCode prop
  aiName?: string;
}

interface ChatMessage {
  _id: string;
  session: string;
  role: 'USER' | 'AI';
  content: {
    type?: string;
    value?: string;
    content?: string;
    file?: string;
  };
  createAt: string;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.body || 'white'};
  color: ${({ theme }) => theme.text || 'black'};
  border-radius: 8px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  width: 800px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border || '#eee'};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.text || '#666'};
  
  &:hover {
    color: ${({ theme }) => theme.accent || '#000'};
  }
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 12px;
`;

const UserMessage = styled.div`
  align-self: flex-end;
  background: ${({ theme }) => theme.surface1 || '#f5f5f5'};
  color: ${({ theme }) => theme.text || 'black'};
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 80%;
  white-space: pre-wrap;
  font-size: 16px;
  line-height: 1.5;
`;

const UserMessageContainer = styled.div`
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 80%;
  align-items: flex-end;
  width: fit-content;
`;

const StyledAiMessage = styled(ShareAiResponseMessage)`
  padding: 0;
  max-width: 100%;
  align-self: flex-start;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: ${({ theme }) => theme.text || '#666'};
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #f44336;
`;

const EmptyContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.subtleText || '#999'};
  font-size: 16px;
`;

const parseMessageContent = (content: ChatMessage['content']) => {
  // content가 문자열인 경우 처리
  if (typeof content === 'string') {
    return {
      text: content,
      isImage: false,
      imageUrl: null,
      fileName: null
    };
  }

  // content가 객체인 경우 처리
  const text = content?.content || content?.value || '';
  
  return {
    text,
    isImage: false,
    imageUrl: null,
    fileName: null
  };
};

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  chatSessionId,
  userName,
  chatTitle,
  aiProfile,
  companyCode, // ✅ 추가
  aiName
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && chatSessionId) {
      loadChatMessages();
    }
  }, [isOpen, chatSessionId]);

  const loadChatMessages = async () => {
    if (!chatSessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getChatMessages(chatSessionId);
      setMessages((response as ChatMessage[]) || []);
    } catch (err) {
      console.error('채팅 메시지 로드 오류:', err);
      setError('채팅 메시지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>
            대화 이력 {userName && `- ${userName}`}
            <br />
            <small style={{ fontSize: '14px', opacity: 0.7 }}>
              채팅방 ID: {chatSessionId}
            </small>
          </h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {loading && (
          <LoadingContainer>
            채팅 이력을 불러오는 중...
          </LoadingContainer>
        )}

        {error && (
          <ErrorContainer>
            {error}
          </ErrorContainer>
        )}

        {!loading && !error && messages.length > 0 && (
          <ChatBox>
            {messages.map((message, index) => {
              if (message.role === 'USER') {
                const parsedContent = parseMessageContent(message.content);
                
                return (
                  <UserMessageContainer key={message._id || index}>
                    {parsedContent.text && (
                      <UserMessage>{parsedContent.text}</UserMessage>
                    )}
                  </UserMessageContainer>
                );
              } else {
                const content = typeof message.content === 'string' 
                  ? message.content 
                  : message.content?.content || message.content?.value || '';
                
                // aiProfile과 aiName을 props로 받아서 사용
                const profileImageUrl = aiProfile 
                  ? `${import.meta.env.VITE_FILE_URL}/${aiProfile}`
                  : '/ai-estimate/pretty.png';
                const aiAgentName = aiName || 'AI 에이전트';
                
                return (
                  <StyledAiMessage
                    key={message._id || index}
                    content={content}
                    profileImage={profileImageUrl}
                    name={aiAgentName}
                    companyCode={companyCode} // ✅ 추가
                  />
                );
              }
            })}
          </ChatBox>
        )}

        {!loading && !error && messages.length === 0 && (
          <EmptyContainer>
            표시할 메시지가 없습니다.
          </EmptyContainer>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChatHistoryModal;
