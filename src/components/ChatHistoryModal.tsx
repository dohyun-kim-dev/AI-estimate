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

const Container = styled.div`
  max-width: 100%;
  width: 100%;
  padding: 1px;
  padding-bottom: 20px;
  max-height: 70vh;
  overflow-y: auto;

  /* 윈도우/크롬 스크롤바 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #000;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #868686;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

  /* 파이어폭스 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: #868686 #000;
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  border-radius: 8px;
  padding: 12px;
  min-height: 320px;

  /* 윈도우/크롬 스크롤바 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #000;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #868686;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

  /* 파이어폭스 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: #868686 #000;
`;

const UserMessage = styled.div`
  align-self: flex-end;
  background: #383838;
  color: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  white-space: pre-wrap;
  font-size: 16px;
  line-height: 1.5;
`;

const UserMessageContainer = styled.div<{ hasImages?: boolean }>`
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 80%;
  gap: 8px;
`;

const StyledAiMessage = styled(ShareAiResponseMessage)<{ isFullWidth?: boolean }>`
  padding: 0;
  max-width: ${({ isFullWidth }) => (isFullWidth ? '100%' : '100%')};
  align-self: flex-start;
`;

const LoadingContainer = styled.div`
  text-align: center;
  color: #fff;
  padding: 40px 20px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  color: #d32f2f;
  padding: 20px;
`;

const PopupFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

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
  
  &:hover {
    opacity: 0.8;
  }
`;

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessionId: string;
  userName?: string;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  chatSessionId, 
  userName 
}) => {
  const { setSessionId, addMessage, messages, clearMessages } = useShareChatStore();
  // 항상 다크모드로 설정
  const isDarkMode = true;
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
    console.log('🔍 parseMessageContent 호출:', { content, files });
    
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
      console.log('🔍 parseMessageContent 결과 (빈 content):', result);
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
    console.log('🔍 parseMessageContent 결과 (일반):', result);
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
        <LoadingContainer>
          <p>채팅 메시지를 불러오는 중...</p>
        </LoadingContainer>
      );
    }

    if (errorMessage) {
      return (
        <ErrorContainer>
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
            
            console.log('🔍 사용자 메시지 파싱:', {
              originalContent: message.content,
              originalFiles: message.files,
              parsedContent,
              hasImages: parsedContent.hasImages
            });
            
            return (
              <UserMessageContainer key={index} hasImages={parsedContent.hasImages}>
                {/* 이미지가 있으면 그리드로 표시 */}
                {parsedContent.hasImages && (
                  <ImageGrid images={parsedContent.images} />
                )}
                {/* 텍스트가 있으면 말풍선으로 표시 */}
                {parsedContent.text && (
                  <UserMessage>{parsedContent.text}</UserMessage>
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
      backgroundColor="#000"
      bottomFloating={
        <PopupFooter>
          <CloseButton onClick={onClose}>닫기</CloseButton>
        </PopupFooter>
      }
    >
      <Container>
        {renderContent()}
      </Container>
    </CmsPopup>
  );
};

export default ChatHistoryModal;
