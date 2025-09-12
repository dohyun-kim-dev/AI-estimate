
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useShareChatStore } from '@/store/shareChatStore';
import { getChatMessages } from '@/lib/api/user/userApi';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
import Icon from '@/components/ai-esti/Icon';
import ShareAiResponseMessage from '@/components/ai-esti/ShareAiResponseMessage';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import { AiMessageContent } from '@/app/ai/page';

// 메시지 타입 정의
import type { FileUploadData } from '@/firebase.functions';
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
  files?: FileUploadData[];
}

// AI 레이아웃과 동일한 스타일
const LayoutWrapper = styled.div`
  min-height: 100vh;
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
  background-color: ${({ theme }) => theme.body};
`;

const TopNav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.body};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  z-index: 100;

  .left-icons, .right-icons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    border-radius: 8px;

    &:hover {
      background-color: ${({ theme }) => `${theme.body}`};
    }
  }
`;

const NavTitle = styled.h1`
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;

const Container = styled.div`
  max-width: 960px;
  width: 100vw;
  margin: 0 auto;
  padding: 1px;
  // padding-top: 76px;
  padding-bottom: 20px;
  min-height: 100vh;
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 8px;
  padding: 12px;
  min-height: 320px;
`;

const UserMessage = styled.div`
  align-self: flex-end;
  background: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  padding: 10px 12px;
  border-radius: 12px;
  white-space: pre-wrap;
  font-size: 18px;
  line-height: 2.0;
`;

const UserMessageContainer = styled.div`
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;

  align-items: flex-end;      
  max-width: 80%;            
  width: fit-content;
`;

const  Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 12px 0 28px 0;
  width: 100%;
  align-self: center;
`;

const UserImagePreview = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.border};
`;

const StyledAiMessage = styled(ShareAiResponseMessage)<{ isFullWidth?: boolean }>`
  padding: 0;
  max-width: ${({ isFullWidth }) => (isFullWidth ? '100%' : '100%')};
  align-self: flex-start;
`;

const StyledDiv = styled.div`
  font-size: 18px;
  line-height: 2.0;
  color: ${({ theme }) => (theme.body === '#FFFFFF' ? '#333333' : '#dddddd')};
`;

const ReadOnlyNotice = styled.div`
  text-align: center;
  padding: 12px 16px;
  // background: ${({ theme }) => theme.surface1};
  border-radius: 8px;
  margin: 12px;
  color: ${({ theme }) => theme.shareTitle};
  font-weight: 600;
  font-size: 20px;
  // border: 1px solid ${({ theme }) => theme.border};
`;

const LoadingContainer = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.text};
  padding: 40px 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.border};
  border-top: 4px solid ${({ theme }) => theme.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  color: #d32f2f;
  max-width: 400px;
  padding: 40px 20px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.subtleText};
`;

const RetryButton = styled.button`
  background: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const BackButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.surface1};
  }
`;

const SharePage: React.FC = () => {
  // useSearchParams는 컴포넌트 최상단에서 한 번만 선언
  const { sessionId, companyCode } = useParams<{ sessionId: string; companyCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToast();
  const { setSessionId, addMessage, messages, clearMessages } = useShareChatStore();
  const { isDarkMode } = useThemeStore();

  // sessionId에 uuid가 아닌 안내문구 등이 붙어있을 경우, uuid만 추출해서 쿼리스트링으로 리다이렉트 (pdfPreview.tsx와 동일한 방식)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    // 전체 pathname에서 uuid 패턴 검색 (붙여넣기 시 추가 텍스트 포함 가능)
    const path = location.pathname;
    const uuidMatch = path.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (!uuidMatch) return;
    const pureUuid = uuidMatch[0];
    const expectedPath = `/aiclient/${companyCode || 'heredot'}/ai/share/${pureUuid}`;
    if (path !== expectedPath) {
      // 쿼리 그대로 유지
      const qs = searchParams.toString();
      window.location.replace(`${expectedPath}${qs ? `?${qs}` : ''}`);
    }
  }, [location.pathname, companyCode, searchParams]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 메시지에서 파일 정보를 파싱하는 함수
  const parseMessageContent = (content: string) => {
    const fileMatch = content.match(/\[첨부파일: (.+?)\]/);
    if (fileMatch) {
      const fileName = fileMatch[1];
      const textContent = content.replace(/\[첨부파일: .+?\]/, '').trim();
      const imageUrl = `/file/${fileName}`;
      
      // 이미지 파일인지 확인
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
      
      return {
        text: textContent,
        fileName,
        imageUrl,
        isImage
      };
    }
    
    return {
      text: content,
      fileName: null,
      imageUrl: null,
      isImage: false
    };
  };


  useEffect(() => {
    // 페이지 로드 시 기존 메시지 클리어
    clearMessages();
    console.log('messages', messages);
    const loadSharedMessages = async () => {
      if (!sessionId) {
        setErrorMessage('세션 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        console.log('공유 세션 메시지 로딩 중:', sessionId);
        
        // 세션 ID를 공유 채팅 스토어에 설정
        setSessionId(sessionId);
        
        // 공유용 메시지 API 직접 호출
        const messagesResponse = await getChatMessages(sessionId);
        
        if (messagesResponse && messagesResponse.statusCode === 200 && messagesResponse.data) {
          const messages = messagesResponse.data;
          console.log('메시지 데이터:', messages);
          
                  // 메시지들을 채팅 스토어에 추가
        messages.forEach((message: ChatMessage) => {
          if (message.role === 'USER') {
            // USER 메시지: content.content에 텍스트, content.file에 파일명
            const userContent = message.content.content || '';
            const fileInfo = message.content.file ? `\n[첨부파일: ${message.content.file}]` : '';
            addMessage({
              role: 'user',
              content: userContent + fileInfo
            });
          } else if (message.role === 'AI') {
            // AI 메시지: content.value에 텍스트
            addMessage({
              role: 'ai',
              content: message.content.value || ''
            });
          }
        });
          
          // success('공유된 채팅 세션이 로드되었습니다.');
          setLoading(false);
          
        } else {
          throw new Error(messagesResponse?.error?.message || '메시지를 찾을 수 없습니다.');
        }
        
      } catch (err) {
        console.error('메시지 로딩 실패:', err);
        setErrorMessage('공유된 채팅 세션을 불러올 수 없습니다. 세션이 삭제되었거나 접근 권한이 없을 수 있습니다.');
        setLoading(false);
      }
    };

    loadSharedMessages();
  }, [sessionId, companyCode, setSessionId, addMessage, success, clearMessages]);

  const handleRetry = () => {
    setLoading(true);
    setErrorMessage(null);
    window.location.reload();
  };

  const handleBack = () => {
    navigate(`/aiclient/${companyCode}/ai`);
  };



  if (loading) {
    return (
      <LayoutWrapper>
        <TopNav>
          {/* <div className="left-icons">
            <Icon 
              src={isDarkMode ? '/ai-estimate/arrow_back.png' : '/ai-estimate/arrow_back.png'} 
              width={24} 
              height={24} 
              onClick={handleBack}
            />
          </div> */}
          {/* <NavTitle>공유된 채팅</NavTitle> */}
          <div className="right-icons"></div>
        </TopNav>
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
            <p>공유된 채팅 세션을 불러오는 중...</p>
          </LoadingContainer>
        </Container>
      </LayoutWrapper>
    );
  }

  if (errorMessage) {
    return (
      <LayoutWrapper>
        {/* <TopNav> */}
          {/* <div className="left-icons">
            <Icon 
              src={isDarkMode ? '/ai-estimate/arrow_back.png' : '/ai-estimate/arrow_back.png'} 
              width={24} 
              height={24} 
              onClick={handleBack}
            />
          </div> */}
          {/* <NavTitle>공유된 채팅</NavTitle>
          <div className="right-icons"></div>
        </TopNav> */}
        <Container>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>세션을 불러올 수 없습니다</ErrorTitle>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            <div>
              <RetryButton onClick={handleRetry}>다시 시도</RetryButton>
              <BackButton onClick={handleBack}>돌아가기</BackButton>
            </div>
          </ErrorContainer>
        </Container>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      {/* <TopNav>
        <div className="left-icons">
          <Icon 
            src={isDarkMode ? '/ai-estimate/arrow_back.png' : '/ai-estimate/arrow_back.png'} 
            width={24} 
            height={24} 
            onClick={handleBack}
          />
        </div>
        <NavTitle>공유된 채팅</NavTitle>
        <div className="right-icons"></div>
      </TopNav> */}
      
      <Container>
        <ReadOnlyNotice>
          AIGO 견적 열람 모드
        </ReadOnlyNotice>

        {/* <Divider /> */}

        <ChatBox>
          {messages.map((message, index) => {
            if (message.role === 'user') {
              const parsedContent = parseMessageContent(message.content);
              return (
                <UserMessageContainer key={index}>
                  {/* 텍스트 메시지 */}
                  {parsedContent.text && (
                    <UserMessage>{parsedContent.text}</UserMessage>
                  )}
                  {/* files 배열 기반 이미지/파일 미리보기 */}
                  {message.files && message.files.length > 0 && message.files.map((file, idx) =>
                    file.mimeType && file.mimeType.startsWith('image/') ? (
                      <UserImagePreview
                        key={idx}
                        src={file.fileUri}
                        alt={file.name}
                        onError={(e) => {
                          console.error('이미지 로드 실패:', file.fileUri);
                          setTimeout(() => {
                            e.currentTarget.src = file.fileUri + '?retry=' + Date.now();
                          }, 1000);
                        }}
                      />
                    ) : (
                      <UserMessage key={idx}>
                        📎 <a href={file.fileUri} download={file.name} target="_blank" rel="noopener noreferrer">{file.name}</a>
                      </UserMessage>
                    )
                  )}
                  {/* 기존 텍스트 파싱 방식의 이미지/파일(백워드 호환) */}
                  {parsedContent.isImage && parsedContent.imageUrl && (
                    <UserImagePreview
                      src={parsedContent.imageUrl}
                      alt={parsedContent.fileName || '첨부된 이미지'}
                      onError={(e) => {
                        console.error('이미지 로드 실패:', parsedContent.imageUrl);
                        setTimeout(() => {
                          e.currentTarget.src = parsedContent.imageUrl + '?retry=' + Date.now();
                        }, 1000);
                      }}
                    />
                  )}
                  {parsedContent.fileName && !parsedContent.isImage && (
                    <UserMessage>
                      📎 {parsedContent.fileName}
                    </UserMessage>
                  )}
                </UserMessageContainer>
              );
            } else {
              return (
                <StyledAiMessage
                  key={index}
                  content={<AiMessageContent content={message.content}/>} 
                  profileImage="/ai-estimate/pretty.png"
                  name="강유하"
                  chatSessionId={sessionId}
                  // estimateDataForConsult={estimateDataForConsult}
                  isFullWidth={message.content.includes('<script type="application/json" id="invoiceData">')}
                />
              );
            }
          })}
        </ChatBox>
      </Container>


    </LayoutWrapper>
  );
};

export default SharePage;