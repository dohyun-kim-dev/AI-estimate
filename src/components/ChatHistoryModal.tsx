import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getChatMessages } from '@/lib/api/admin/adminApi';
import { useShareChatStore } from '@/store/shareChatStore';
import ShareAiResponseMessage from '@/components/ai-esti/ShareAiResponseMessage';
import { AiMessageContent } from '@/app/ai/page';
import CmsPopup from '@/components/CmsPopup';
import { devLog } from '@/utils/devLogger'
import ImageGrid from '@/components/ai-esti/ImageGrid';
import { ImageData } from '@/store/chatStore';
import { useThemeStore } from '@/store/themeStore';
import { useCompanyStore } from '@/store/companyStore';
 
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
    files?: string[]; // 파일명 배열 추가
  };
  createAt: string;
  files?: FileUploadData[]; // 클라이언트에서 변환된 파일 정보
}
 
const Container = styled.div<{ $isDarkMode: boolean }>`
  max-width: 100%;
  width: 100%;
  padding: 0 4px 20px 4px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
 
  /* 웹킷 브라우저 스크롤바 */
  &::-webkit-scrollbar {
    width: 12px;
  }
 
  &::-webkit-scrollbar-track {
    background: ${({ $isDarkMode }) => $isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 6px;
  }
 
  &::-webkit-scrollbar-thumb {
    background: ${({ $isDarkMode }) => $isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    border-radius: 6px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
 
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ $isDarkMode }) => $isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
    background-clip: content-box;
  }
 
  /* 파이어폭스 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: ${({ $isDarkMode }) => 
    $isDarkMode ? 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)'
  };
`;
 
const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 20px;
  border-radius: 8px;
  padding: 12px;
  min-height: 320px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;
 
const UserMessage = styled.div<{ $isDarkMode: boolean }>`
  align-self: flex-end;
  background: ${({ $isDarkMode }) => $isDarkMode ? '#383838' : '#007AFF'};
  color: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  white-space: pre-wrap;
  font-size: 16px;
  line-height: 1.5;
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  box-sizing: border-box;
`;
 
const UserMessageContainer = styled.div<{ hasImages?: boolean }>`
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 80%;
  min-width: 0; /* flexbox 축소 허용 */
  gap: 8px;
  box-sizing: border-box;
  
  /* 이미지가 있을 때는 더 넓게 */
  ${({ hasImages }) => hasImages && `
    max-width: 90%;
  `}
`;
 
const StyledAiMessage = styled(ShareAiResponseMessage)<{ isFullWidth?: boolean }>`
  padding: 0;
  max-width: ${({ isFullWidth }) => (isFullWidth ? '100%' : '100%')};
  align-self: flex-start;
  min-width: 0; /* flexbox 축소 허용 */
  box-sizing: border-box;
  overflow-x: hidden; /* 내부 콘텐츠 가로 스크롤 방지 */
`;
 
const LoadingContainer = styled.div<{ $isDarkMode: boolean }>`
  text-align: center;
  color: ${({ $isDarkMode }) => $isDarkMode ? '#fff' : '#000'};
  padding: 40px 20px;
`;
 
const ErrorContainer = styled.div<{ $isDarkMode: boolean }>`
  text-align: center;
  color: ${({ $isDarkMode }) => $isDarkMode ? '#d32f2f' : '#c62828'};
  padding: 20px;
`;
 
const ChatHeader = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ChatHeaderContent = styled.div`
  flex: 1;
`;

const ChatTitle = styled.h2<{ $isDarkMode: boolean }>`
  color: ${({ $isDarkMode }) => $isDarkMode ? '#fff' : '#000'};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 8px;
`;

const ChatSubtitle = styled.div<{ $isDarkMode: boolean }>`
  color: ${({ $isDarkMode }) => $isDarkMode ? '#999' : '#666'};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserBadge = styled.span`
  background: #333;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const CloseIcon = styled.button<{ $isDarkMode: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ $isDarkMode }) => $isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
  
  svg path {
    fill: ${({ $isDarkMode }) => $isDarkMode ? '#fff' : '#000'};
  }
`;

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessionId: string;
  userName?: string;
  chatTitle?: string; // 채팅방 제목 추가
}
 
const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  chatSessionId,
  userName,
  chatTitle
}) => {
  const { setSessionId, addMessage, messages, clearMessages } = useShareChatStore();
  const { isDarkMode } = useThemeStore();
  const { companyInfo } = useCompanyStore();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  // 견적서 메시지 감지 함수
  const isEstimateMessage = (content: string) => {
    if (typeof content !== 'string') return false;
    
    // 1. script 태그 형식
    if (content.includes('<script type="application/json" id="invoiceData">')) return true;
    
    // 2. 마크다운 코드 블록 형식
    if (/```json\s*\n[\s\S]*?"uuid"[\s\S]*?\n```/.test(content)) return true;
    
    // 3. 직접 JSON 형식 (uuid나 project_name 포함)
    if (/^[\s]*{[\s\S]*"(uuid|project_name)"[\s\S]*}[\s]*$/.test(content.trim())) return true;
    
    return false;
  };
 
  // 유저 메시지에서 ai 프롬프트(견적 정보 등) 제거 및 액션별 메시지 변환
  const stripAiPrompt = (text: string) => {
    // AI 예산 줄이기 패턴 감지 및 변환
    if (text.includes('AI 예산 줄이기') || text.includes('예산을 줄이')) {
      const projectNameMatch = text.match(/프로젝트명:\s*([^\n]*)/);
      const projectName = projectNameMatch ? projectNameMatch[1].trim() : '프로젝트';
      return `${projectName} - AI 예산 줄이기`;
    }
    
    // AI 맞춤 추천 패턴 감지 및 변환
    if (text.includes('AI 맞춤 추천') || text.includes('맞춤 추천')) {
      const projectNameMatch = text.match(/프로젝트명:\s*([^\n]*)/);
      const projectName = projectNameMatch ? projectNameMatch[1].trim() : '프로젝트';
      return `${projectName} - AI 맞춤 추천`;
    }
    
    // [현재 견적 정보] 패턴이 포함된 경우 프로젝트명만 추출
    if (text.includes('[현재 견적 정보]')) {
      const projectNameMatch = text.match(/프로젝트명:\s*([^\n]*)/);
      if (projectNameMatch) {
        const projectName = projectNameMatch[1].trim();
        // 액션 유형 결정
        if (text.includes('예산을 줄이')) {
          return `${projectName} - AI 예산 줄이기`;
        } else if (text.includes('맞춤 추천')) {
          return `${projectName} - AI 맞춤 추천`;
        }
        return projectName; // 기본적으로 프로젝트명만
      }
    }
    
    // [현재 견적 정보] ~ 위 견적을 기반으로 ... 패턴만 제거 (기존 로직)
    let cleanedText = text.replace(/\[현재 견적 정보][\s\S]*?위 견적을 기반으로 [^\n]*를 진행해주세요\./g, '').trim();
    
    return cleanedText;
  };
 
  const parseMessageContent = (content: string, files?: FileUploadData[]) => {
    // console.log('🔍 parseMessageContent 호출:', { content, files });
    
    // content가 undefined나 null인 경우 처리
    if (!content || typeof content !== 'string') {
      const result = {
        text: '',
        images: files ? files.filter(f => f.mimeType?.startsWith('image/')).map(f => ({
          url: f.fileUri,
          fileName: f.name,
          mimeType: f.mimeType || 'image/png'
        })) : [],
        hasImages: files ? files.some(f => f.mimeType?.startsWith('image/')) : false
      };
      // console.log('🔍 parseMessageContent 결과 (빈 content):', result);
      return result;
    }
    
    // 첨부파일 패턴을 찾아서 제거하되, 이미지는 images 배열로 처리
    const fileMatches = content.match(/\[첨부파일: (.+?)\]/g);
    let textContent = content;
    const extractedImages: ImageData[] = [];
    
    if (fileMatches) {
      fileMatches.forEach(match => {
        const fileName = match.match(/\[첨부파일: (.+?)\]/)?.[1];
        if (fileName) {
          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
          if (isImage) {
            // 환경에 따른 이미지 URL 생성
            const getImageUrl = (fileName: string) => {
              // 이미 full URL인 경우 (http로 시작)
              if (fileName.startsWith('http')) {
                return fileName;
              }
              
              // 개발 환경에서는 프록시 설정에 의해 /api/file/로 접근
              if (process.env.NODE_ENV === 'development') {
                return `/api/file/${fileName}`;
              }
              
              // 프로덕션 환경에서는 file 경로로 직접 접근
              const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
              return `${apiHost}/file/${fileName}`;
            };
            
            const imageUrl = getImageUrl(fileName);
            
            extractedImages.push({
              url: imageUrl,
              fileName: fileName,
              mimeType: `image/${fileName.split('.').pop()?.toLowerCase() || 'png'}`
            });
          }
        }
        // 텍스트에서 첨부파일 태그 제거
        textContent = textContent.replace(match, '').trim();
      });
    }
    
    // files prop과 추출된 이미지를 합치기 (files에서 이미지만 필터링)
    const filesImages = files ? files
      .filter(f => f.mimeType?.startsWith('image/'))
      .map(f => ({
        url: f.fileUri,
        fileName: f.name,
        mimeType: f.mimeType || 'image/png'
      })) : [];
    
    const allImages = [...extractedImages, ...filesImages];
    
    const result = {
      text: stripAiPrompt(textContent),
      images: allImages,
      hasImages: allImages.length > 0
    };
    // console.log('🔍 parseMessageContent 결과 (일반):', result);
    return result;
  };
 
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!chatSessionId || !isOpen) return;
 
      setLoading(true);
      setErrorMessage(null);
      
      try {
        devLog('채팅 메시지 로딩 시작:', chatSessionId);
        
        // 기존 메시지 클리어
        clearMessages();
        
        // 세션 ID를 채팅 스토어에 설정
        setSessionId(chatSessionId);
        
        // 채팅 메시지 API 호출
        const messagesResponse = await getChatMessages(chatSessionId) as any;
        
        devLog('전체 API 응답:', messagesResponse);
        
        let messages: ChatMessage[] = [];
        
        // 응답 처리 (userMng 페이지와 동일한 패턴 적용)
        if (messagesResponse && typeof messagesResponse === 'object') {
          // 응답이 직접 API 응답 객체인 경우
          if ('statusCode' in messagesResponse && messagesResponse.statusCode === 200) {
            messages = Array.isArray(messagesResponse.data) ? messagesResponse.data : [];
          }
          // 응답이 배열로 감싸져 있는 경우 (callAdminApi 특성)
          else if (Array.isArray(messagesResponse) && messagesResponse[0]) {
            const firstItem = messagesResponse[0];
            if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
              const responseData = firstItem.data;
              if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
                const typedResponseData = responseData as { data?: ChatMessage[]; statusCode: number };
                if (typedResponseData.statusCode === 200) {
                  messages = Array.isArray(typedResponseData.data) ? typedResponseData.data : [];
                }
              }
            }
          }
        }
        
        devLog('파싱된 메시지 데이터:', messages);
        devLog('메시지 개수:', messages.length);
        
        if (messages.length > 0) {
          // 메시지들을 채팅 스토어에 추가
          messages.forEach((message: ChatMessage) => {
            devLog('처리 중인 메시지:', message);
            if (message.role === 'USER') {
              // USER 메시지: content.content에 텍스트, content.file에 파일명, content.files 배열에 파일명들
              const userContent = message.content?.content || '';
              const fileInfo = message.content?.file ? `\n[첨부파일: ${message.content.file}]` : '';
              
              // content.files 배열을 FileUploadData 형태로 변환
              let convertedFiles: FileUploadData[] = [];
              if (message.content?.files && Array.isArray(message.content.files)) {
                convertedFiles = message.content.files.map(fileName => {
                  // 환경에 따른 파일 URL 생성
                  const getFileUrl = (fileName: string) => {
                    // 개발 환경에서는 프록시 설정에 의해 /api/file/로 접근
                    if (process.env.NODE_ENV === 'development') {
                      return `/api/file/${fileName}`;
                    }
                    
                    // 프로덕션 환경에서는 file 경로로 직접 접근
                    const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
                    return `${apiHost}/file/${fileName}`;
                  };
                  
                  // 파일 확장자로 MIME 타입 추정
                  const getFileType = (fileName: string): string => {
                    const ext = fileName.split('.').pop()?.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
                      return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
                    }
                    if (ext === 'pdf') return 'application/pdf';
                    return 'application/octet-stream';
                  };
                  
                  return {
                    name: fileName,
                    fileUri: getFileUrl(fileName),
                    mimeType: getFileType(fileName)
                  };
                });
              }
              
              addMessage({
                role: 'user',
                content: userContent + fileInfo,
                files: convertedFiles // 변환된 파일 정보 전달
              });
            } else if (message.role === 'AI') {
              // AI 메시지: content.value에 텍스트
              addMessage({
                role: 'ai',
                content: message.content?.value || ''
              });
            }
          });
        } else {
          devLog('메시지가 없거나 API 응답 형식이 올바르지 않습니다.');
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('메시지 로딩 실패:', err);
        setErrorMessage('채팅 메시지를 불러올 수 없습니다. 세션이 삭제되었거나 접근 권한이 없을 수 있습니다.');
        setLoading(false);
      }
    };
 
    loadChatMessages();
  }, [chatSessionId, isOpen, setSessionId, addMessage, clearMessages]);
 
  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer $isDarkMode={isDarkMode}>
          <p>채팅 메시지를 불러오는 중...</p>
        </LoadingContainer>
      );
    }
 
    if (errorMessage) {
      return (
        <ErrorContainer $isDarkMode={isDarkMode}>
          <p>{errorMessage}</p>
        </ErrorContainer>
      );
    }
 
    return (
      <ChatBox>
        {messages.map((message, index) => {
          if (message.role === 'user') {
            // 이미지와 텍스트를 분리해서 처리
            const parsedContent = parseMessageContent(message.content, message.files);
            
            // console.log('🔍 사용자 메시지 파싱:', {
            //   originalContent: message.content,
            //   originalFiles: message.files,
            //   parsedContent,
            //   hasImages: parsedContent.hasImages
            // });
            
            return (
              <UserMessageContainer key={index} hasImages={parsedContent.hasImages}>
                {/* 이미지가 있으면 그리드로 표시 */}
                {parsedContent.hasImages && (
                  <ImageGrid images={parsedContent.images} />
                )}
                {/* 텍스트가 있으면 말풍선으로 표시 */}
                {parsedContent.text && (
                  <UserMessage $isDarkMode={isDarkMode}>{parsedContent.text}</UserMessage>
                )}
              </UserMessageContainer>
            );
          } else {
            return (
              <StyledAiMessage
                key={index}
                content={<AiMessageContent content={message.content}/>}
                profileImage={
                  companyInfo?.aiProfile 
                    ? (companyInfo.aiProfile.startsWith('/ai-estimate/') 
                        ? companyInfo.aiProfile 
                        : `/api/file/${companyInfo.aiProfile}`)
                    : "/ai-estimate/pretty.png"
                }
                name={companyInfo?.aiName || "AI 에이전트"}
                chatSessionId={chatSessionId}
                isFullWidth={isEstimateMessage(message.content)}
              />
            );
          }
        })}
      </ChatBox>
    );
  };
 
  return (
    <CmsPopup
      title={`${userName ? `${userName}의 ` : ''}채팅 이력 - ${chatSessionId}`}
      hideHeader
      isOpen={isOpen}
      onClose={onClose}
      isWide
      backgroundColor={isDarkMode ? "#000" : "#ffffff"}
    >

              {/* 채팅방 제목 헤더 */}
      <ChatHeader>
        <ChatHeaderContent>
          <ChatTitle $isDarkMode={isDarkMode}>{chatTitle || '채팅방'}</ChatTitle>
          <ChatSubtitle $isDarkMode={isDarkMode}>
            <UserBadge>{userName || '사용자'}</UserBadge>
            <span>세션 ID: {chatSessionId}</span>
          </ChatSubtitle>
        </ChatHeaderContent>
        <CloseIcon $isDarkMode={isDarkMode} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7.00078 8.40078L2.10078 13.3008C1.91745 13.4841 1.68411 13.5758 1.40078 13.5758C1.11745 13.5758 0.884114 13.4841 0.700781 13.3008C0.517448 13.1174 0.425781 12.8841 0.425781 12.6008C0.425781 12.3174 0.517448 12.0841 0.700781 11.9008L5.60078 7.00078L0.700781 2.10078C0.517448 1.91745 0.425781 1.68411 0.425781 1.40078C0.425781 1.11745 0.517448 0.884114 0.700781 0.700781C0.884114 0.517448 1.11745 0.425781 1.40078 0.425781C1.68411 0.425781 1.91745 0.517448 2.10078 0.700781L7.00078 5.60078L11.9008 0.700781C12.0841 0.517448 12.3174 0.425781 12.6008 0.425781C12.8841 0.425781 13.1174 0.517448 13.3008 0.700781C13.4841 0.884114 13.5758 1.11745 13.5758 1.40078C13.5758 1.68411 13.4841 1.91745 13.3008 2.10078L8.40078 7.00078L13.3008 11.9008C13.4841 12.0841 13.5758 12.3174 13.5758 12.6008C13.5758 12.8841 13.4841 13.1174 13.3008 13.3008C13.1174 13.4841 12.8841 13.5758 12.6008 13.5758C12.3174 13.5758 12.0841 13.4841 11.9008 13.3008L7.00078 8.40078Z" fill="white"/>
          </svg>
        </CloseIcon>
      </ChatHeader>
      
      <Container $isDarkMode={isDarkMode}>
        {renderContent()}
      </Container>
    </CmsPopup>
  );
};
 
export default ChatHistoryModal;
 