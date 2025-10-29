
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useShareChatStore } from '@/store/shareChatStore';
import { getChatMessages } from '@/lib/api/user/userApi';
import { useToast } from '@/components/common/ToastProvider';
import { useThemeStore } from '@/store/themeStore';
import { useCompanyStore } from '@/store/companyStore';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useUsageStore } from '@/store/usageStore';
import { useAuthStore } from '@/store/authStore';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';
import Icon from '@/components/ai-esti/Icon';
import ShareAiResponseMessage from '@/components/ai-esti/ShareAiResponseMessage';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import { AiMessageContent } from '@/app/ai/page';
import { devLog } from '@/utils/devLogger'
import ImageGrid from '@/components/ai-esti/ImageGrid';
import FileList from '@/components/ai-esti/FileList';
import type { ImageData, FileData } from '@/store/chatStore';

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
    files?: string[]; // 파일명 배열 (UUID)
    fileMetadata?: FileMetadata[]; // 파일 메타데이터
  };
  createAt: string;
  files?: FileUploadData[];
}

// 파일 메타데이터 타입 정의
interface FileMetadata {
  serverFileName: string;  // UUID 파일명
  originalFileName: string; // 원본 파일명 (한글 등)
  mimeType: string;
  size?: number;
}


const CenterFlex = styled.div`
width: 100vw;
  display: flex;  
  justify-content: center;
`

// AI 레이아웃과 동일한 스타일
const LayoutWrapper = styled.div`
  // min-height: 100vw;
  max-width: 960px;
  margin : 0 auto;
  display: flex;
    position: relative;

  justify-content: center;
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
  // display: flex;
  // justify-content: center;
  // padding-top: 76px;
  padding-bottom: 20px;
  min-height: 100vh;
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
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

const UserMessageContainer = styled.div<{ hasImages?: boolean }>`
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;      
  max-width: ${({ hasImages }) => (hasImages ? '90%' : '80%')};
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

// 스크롤 다운 버튼 스타일
const ScrollDownButton = styled.button<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 100px;
  right: 20px;
  display: flex;
  padding: 6px;
  align-items: center;
  gap: 10px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: ${({ $isVisible }) => ($isVisible ? 'translateY(0)' : 'translateY(20px)')};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
  
  /* 다크모드 스타일 */
  background: ${({ theme }) => (theme.body === '#FFFFFF' ? '#FFF' : '#343435')};
  box-shadow: ${({ theme }) => 
    theme.body === '#FFFFFF' 
      ? '-2px -2px 10px 0 rgba(144, 144, 144, 0.25), 2px 2px 10px 0 rgba(144, 144, 144, 0.25)'
      : '-2px -2px 10px 0 rgba(60, 60, 60, 0.25), 2px 2px 10px 0 rgba(60, 60, 60, 0.25)'
  };
`;

const ScrollDownIcon = styled.div<{ $isDark: boolean }>`
  width: 24px;
  height: 24px;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg path {
    fill: ${({ $isDark }) => $isDark ? '#E4E4E4' : '#6C6C6C'};
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
  const { companyInfo } = useCompanyStore();
  const { fetchCompanyInfo } = useCompanyInfo();

  // sessionId에 uuid가 아닌 안내문구 등이 붙어있을 경우, uuid만 추출해서 쿼리스트링으로 리다이렉트 (pdfPreview.tsx와 동일한 방식)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    // 전체 pathname에서 uuid 패턴 검색 (붙여넣기 시 추가 텍스트 포함 가능)
    const path = location.pathname;
    const uuidMatch = path.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (!uuidMatch) return;
    const pureUuid = uuidMatch[0];
    const expectedPath = `/aiclient/${companyCode || ''}/ai/share/${pureUuid}`;
    if (path !== expectedPath) {
      // 쿼리 그대로 유지
      const qs = searchParams.toString();
      window.location.replace(`${expectedPath}${qs ? `?${qs}` : ''}`);
    }
  }, [location.pathname, companyCode, searchParams]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedMessages = useRef(false); // 중복 로딩 방지용
  
  // 스크롤 버튼 관련 상태
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // 메시지에서 파일 정보를 파싱하는 함수
  const parseMessageContent = (content: string, files?: FileUploadData[]) => {
    // console.log('🔍 parseMessageContent 호출:', { content, files });
    
    // content가 undefined나 null인 경우 처리
    if (!content || typeof content !== 'string') {
      // files prop에서 이미지와 문서 분리
      const imageFiles = files ? files.filter(f => f.mimeType?.startsWith('image/')) : [];
      const documentFiles = files ? files.filter(f => 
        f.mimeType === 'application/pdf' || f.mimeType === 'text/plain'
      ) : [];
      
      const result = {
        text: '',
        images: imageFiles.map(f => ({
          url: f.fileUri,
          fileName: f.name,
          mimeType: f.mimeType || 'image/png'
        })),
        files: documentFiles.map(f => ({
          url: f.fileUri,
          fileName: f.name,
          mimeType: f.mimeType || 'application/pdf',
          size: f.size
        })),
        hasImages: imageFiles.length > 0,
        hasFiles: documentFiles.length > 0
      };
      // console.log('🔍 parseMessageContent 결과 (빈 content):', result);
      return result;
    }
    
    // 첨부파일 패턴을 찾아서 제거하되, 이미지와 문서 파일로 분리
    const fileMatches = content.match(/\[첨부파일: (.+?)\]/g);
    let textContent = content;
    const extractedImages: ImageData[] = [];
    const extractedFiles: FileData[] = [];
    
    if (fileMatches) {
      fileMatches.forEach(match => {
        const fileName = match.match(/\[첨부파일: (.+?)\]/)?.[1];
        if (fileName) {
          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
          const isPdf = /\.pdf$/i.test(fileName);
          const isTxt = /\.txt$/i.test(fileName);
          
          // 환경에 따른 파일 URL 생성
          const getFileUrl = (fileName: string) => {
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
          
          const fileUrl = getFileUrl(fileName);
          
          if (isImage) {
            extractedImages.push({
              url: fileUrl,
              fileName: fileName,
              mimeType: `image/${fileName.split('.').pop()?.toLowerCase() || 'png'}`
            });
          } else if (isPdf || isTxt) {
            extractedFiles.push({
              url: fileUrl,
              fileName: fileName,
              mimeType: isPdf ? 'application/pdf' : 'text/plain'
            });
          }
        }
        // 텍스트에서 첨부파일 태그 제거
        textContent = textContent.replace(match, '').trim();
      });
    }
    
    // files prop에서 이미지와 문서 분리
    const filesImages = files ? files
      .filter(f => f.mimeType?.startsWith('image/'))
      .map(f => ({
        url: f.fileUri,
        fileName: f.name,
        mimeType: f.mimeType || 'image/png'
      })) : [];
    
    const filesDocuments = files ? files
      .filter(f => f.mimeType === 'application/pdf' || f.mimeType === 'text/plain')
      .map(f => ({
        url: f.fileUri,
        fileName: f.name,
        mimeType: f.mimeType || 'application/pdf',
        size: f.size
      })) : [];
    
    // 추출된 것과 prop으로 받은 것을 합치기
    const allImages = [...extractedImages, ...filesImages];
    const allFiles = [...extractedFiles, ...filesDocuments];
    
    const result = {
      text: stripAiPrompt(textContent),
      images: allImages,
      files: allFiles,
      hasImages: allImages.length > 0,
      hasFiles: allFiles.length > 0
    };
    // console.log('🔍 parseMessageContent 결과 (일반):', result);
    return result;
  };


  useEffect(() => {
    const loadSharedMessages = async () => {
      if (!sessionId) {
        setErrorMessage('세션 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        devLog('공유 세션 메시지 로딩 중:', sessionId);
        
        // 페이지 로드 시 기존 메시지 클리어
        clearMessages();
        
        // 세션 ID를 공유 채팅 스토어에 설정
        setSessionId(sessionId);
        
        // 공유용 메시지 API 직접 호출
        const messagesResponse = await getChatMessages(sessionId) as any;
        
        if (messagesResponse && messagesResponse.statusCode === 200 && messagesResponse.data) {
          const messages = messagesResponse.data;
          devLog('메시지 데이터:', messages);
          
                  // 메시지들을 채팅 스토어에 추가
        messages.forEach((message: ChatMessage) => {
          if (message.role === 'USER') {
            // USER 메시지: content.content에 텍스트, content.file에 파일명, content.files 배열에 파일명들
            const userContent = message.content?.content || '';
            const fileInfo = message.content?.file ? `\n[첨부파일: ${message.content.file}]` : '';
            
            // 🔥 fileMetadata가 있으면 우선 사용, 없으면 기존 files 배열 사용
            let convertedFiles: FileUploadData[] = [];
            
            if (message.content?.fileMetadata && Array.isArray(message.content.fileMetadata)) {
              // 새로운 방식: fileMetadata 사용 (원본 파일명 포함)
              devLog('🔥 fileMetadata 사용:', message.content.fileMetadata);
              convertedFiles = message.content.fileMetadata.map((metadata: FileMetadata) => {
                // 환경에 따른 파일 URL 생성 (UUID 파일명 사용)
                const getFileUrl = (serverFileName: string) => {
                  if (serverFileName.startsWith('http')) {
                    return serverFileName;
                  }
                  
                  if (process.env.NODE_ENV === 'development') {
                    return `/api/file/${serverFileName}`;
                  }
                  
                  const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
                  return `${apiHost}/file/${serverFileName}`;
                };
                
                return {
                  name: metadata.originalFileName,
                  fileUri: getFileUrl(metadata.serverFileName),
                  mimeType: metadata.mimeType,
                  size: metadata.size
                };
              });
            } else if (message.content?.files && Array.isArray(message.content.files)) {
              // 기존 방식: files 배열 사용 (하위 호환성)
              devLog('⚠️ 기존 files 배열 사용 (fileMetadata 없음)');
              convertedFiles = message.content.files.map(fileName => {
                const getFileUrl = (fileName: string) => {
                  if (fileName.startsWith('http')) {
                    return fileName;
                  }
                  
                  if (process.env.NODE_ENV === 'development') {
                    return `/api/file/${fileName}`;
                  }
                  
                  const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
                  return `${apiHost}/file/${fileName}`;
                };
                
                // 파일 확장자로 MIME 타입 추정
                const getFileType = (fileName: string): string => {
                  const ext = fileName.split('.').pop()?.toLowerCase();
                  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
                    return `image/${ext}`;
                  }
                  if (ext === 'pdf') return 'application/pdf';
                  if (ext === 'txt') return 'text/plain';
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
              content: message.content.value || ''
            });
          }
        });
          
          // success('공유된 채팅 세션이 로드되었습니다.');
          setLoading(false);
          
        } else {
          throw new Error(messagesResponse?.error?.customMessage || '메시지를 찾을 수 없습니다.');
        }
        
      } catch (err) {
        console.error('메시지 로딩 실패:', err);
        setErrorMessage('공유된 채팅 세션을 불러올 수 없습니다. 세션이 삭제되었거나 접근 권한이 없을 수 있습니다.');
        setLoading(false);
      }
    };

    loadSharedMessages();
  }, [sessionId, companyCode, setSessionId, addMessage, clearMessages]); // messages 제거

  // 회사 정보 및 게스트 사용량 불러오기 - 페이지 진입 시 한 번만 실행
  useEffect(() => {
    const initializeData = async () => {
      // 회사 정보 불러오기
      devLog('회사정보 fetch 호출 - 테마 모드 적용 예정');
      await fetchCompanyInfo();
      
      // fetchCompanyInfo 완료 후 최신 회사정보로 테마 적용
      const latestCompanyInfo = useCompanyStore.getState().companyInfo;
      if (latestCompanyInfo && latestCompanyInfo.mode) {
        devLog('fetchCompanyInfo 완료 - 테마 모드 적용:', latestCompanyInfo.mode);
        if (latestCompanyInfo.mode === 'LIGHT') {
          useThemeStore.setState({ isDarkMode: false });
        } else if (latestCompanyInfo.mode === 'DARK') {
          useThemeStore.setState({ isDarkMode: true });
        }
      }
    };

    initializeData();
  }, []); // 페이지 진입 시 한 번만 실행

  const handleRetry = () => {
    setLoading(true);
    setErrorMessage(null);
    window.location.reload();
  };

  const handleBack = () => {
    navigate(`/aiclient/${companyCode}/ai`);
  };

  // 스크롤 버튼 관련 함수
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // 스크롤 감지 useEffect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 현재 스크롤 위치가 문서 높이에서 2페이지(2 * windowHeight) 이상 위에 있으면 버튼 표시
      const showButton = (documentHeight - currentScrollY - windowHeight) > (2 * windowHeight);
      
      setShowScrollButton(showButton);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  if (loading) {
    return (
      <CenterFlex>
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
            {/* <LoadingSpinner />
            <p>공유된 채팅 세션을 불러오는 중...</p> */}
          </LoadingContainer>
        </Container>
      </LayoutWrapper>
      </CenterFlex>
    );
  }

  if (errorMessage) {
    return (

      <CenterFlex>
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

      </CenterFlex>
    );
  }

  
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
  return (
      
      <CenterFlex>
          <LayoutWrapper>
      <Container>
        <ReadOnlyNotice>
          AIGO 견적 열람 모드
        </ReadOnlyNotice>

        {/* <Divider /> */}

        <ChatBox>
          {messages.map((message, index) => {
            if (message.role === 'user') {
              // 이미지와 텍스트를 분리해서 처리
              const parsedContent = parseMessageContent(message.content, message.files);
              
              return (
                <UserMessageContainer key={index} hasImages={parsedContent.hasImages}>
                  {/* 이미지가 있으면 그리드로 표시 */}
                  {parsedContent.hasImages && (
                    <ImageGrid images={parsedContent.images} />
                  )}
                  {/* 📄 문서 파일이 있으면 파일 목록으로 표시 */}
                  {parsedContent.hasFiles && (
                    <FileList files={parsedContent.files} />
                  )}
                  {/* 텍스트가 있으면 말풍선으로 표시 */}
                  {parsedContent.text && (
                    <UserMessage>{parsedContent.text}</UserMessage>
                  )}
                </UserMessageContainer>
              );
            } else {
              // AI 프로필 이미지 경로 처리 (환경별 분기)
              const getAiProfileImage = () => {
                if (!companyInfo?.aiProfile) return "/ai-estimate/pretty.png";
                
                // 정적 파일인 경우 그대로 반환
                if (companyInfo.aiProfile.startsWith('/ai-estimate/') || 
                    companyInfo.aiProfile.startsWith('/cms/')) {
                  return companyInfo.aiProfile;
                }
                
                // 서버 파일인 경우 환경별 경로 처리
                const isDev = import.meta.env.VITE_ENV_NAME === 'dev';
                return isDev ? `/api/file/${companyInfo.aiProfile}` : `/file/${companyInfo.aiProfile}`;
              };
              
              return (
                <StyledAiMessage
                  key={index}
                  content={<AiMessageContent content={message.content}/>} 
                  profileImage={getAiProfileImage()}
                  name={companyInfo?.aiName || "AI 에이전트"}
                  chatSessionId={sessionId}
                  // estimateDataForConsult={estimateDataForConsult}
                  isFullWidth={isEstimateMessage(message.content)}
                />
              );
            }
          })}
        </ChatBox>
        
        {/* 스크롤 다운 버튼 */}
        <ScrollDownButton 
          $isVisible={showScrollButton}
          onClick={scrollToBottom}
          aria-label="맨 아래로 스크롤"
        >
          <ScrollDownIcon $isDark={isDarkMode}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <g clipPath="url(#clip0_scroll_down)">
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M12.707 15.7073C12.5194 15.8948 12.2651 16.0001 12 16.0001C11.7348 16.0001 11.4805 15.8948 11.293 15.7073L5.63598 10.0503C5.54047 9.9581 5.46428 9.84775 5.41188 9.72575C5.35947 9.60374 5.33188 9.47252 5.33073 9.33974C5.32957 9.20697 5.35487 9.07529 5.40516 8.95239C5.45544 8.82949 5.52969 8.71784 5.62358 8.62395C5.71747 8.53006 5.82913 8.4558 5.95202 8.40552C6.07492 8.35524 6.2066 8.32994 6.33938 8.33109C6.47216 8.33225 6.60338 8.35983 6.72538 8.41224C6.84739 8.46465 6.95773 8.54083 7.04998 8.63634L12 13.5863L16.95 8.63634C17.1386 8.45418 17.3912 8.35339 17.6534 8.35567C17.9156 8.35795 18.1664 8.46312 18.3518 8.64852C18.5372 8.83393 18.6424 9.08474 18.6447 9.34694C18.6469 9.60914 18.5461 9.86174 18.364 10.0503L12.707 15.7073Z"
                />
              </g>
              <defs>
                <clipPath id="clip0_scroll_down">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </ScrollDownIcon>
        </ScrollDownButton>
      </Container>


    </LayoutWrapper>
    </CenterFlex>
  );
};

export default SharePage;