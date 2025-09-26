import { useState } from 'react';
import useAI from './useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { combinePrompts } from '@/ai/promptTemplates';
import { FileUploadData } from '@/firebase.functions';
import type { SimpleModel } from './useAI';
import { createChatSession, createGuestChatSession, sendChatMessage, sendMessageWithFiles, validateFileType, validateFileSize, uploadFiles, ChatMessageResponseData, crawlUrl } from '@/lib/api/user/userApi';
import { generateAndUploadPdf } from '@/hooks/pdfUtils';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import { v4 as uuidv4 } from 'uuid';


import { ensureEstimateUuid, buildFullEstimateData, extractIntroFromReply } from '@/hooks/estimate';
import { uploadEstimatePdf } from '@/lib/api/user/userApi';
import { calculateTotalAmount, calculateEstimatedPeriod } from '../utils/estimateCalculator';
import { transformMessageForDisplay } from '@/utils/messageTransform';

// 견적서 데이터를 추출하는 유틸리티 함수
const extractEstimateData = (content: string): ProjectEstimate | null => {
  // ✅ 문자열이 아니면 바로 종료
  if (typeof content !== 'string') return null;

  try {
    const match = content.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    if (!match) return null;
    console.log("extractEstimateData match[1]:", match[1]);

    const data = JSON.parse(match[1]);
    if (!data || typeof data !== 'object' || !Array.isArray(data.categories)) {
      return null;
    }
    console.log("extractEstimateData data:", data);
    return data as ProjectEstimate;
  } catch (err) {
    console.error('Failed to parse estimate data:', err);
    return null;
  }
};

// 파일 크기 검증 함수 (단일 파일 20MB, 복수 파일 합계 20MB)
const validateFilesSize = (files: File[], maxSizeMB: number = 20): { isValid: boolean; errorMessage?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // 단일 파일 검증
  for (const file of files) {
    if (file.size > maxSizeBytes) {
      return { 
        isValid: false, 
        errorMessage: `파일 "${file.name}"이(가) 20MB를 초과합니다.` 
      };
    }
  }
  
  // 복수 파일 합계 검증
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxSizeBytes) {
    return { 
      isValid: false, 
      errorMessage: `전체 파일 크기가 20MB를 초과합니다. (${(totalSize / 1024 / 1024).toFixed(2)}MB)` 
    };
  }
  
  return { isValid: true };
};

// 파일을 base64로 인코딩하는 함수
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64, 부분을 제거하고 base64 부분만 반환
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// 파일을 base64로 인코딩하는 함수// 파일을 base64로 인코딩하는 함수

// 빠른 설명 추출
const extractDescription = (html: string): string => {
  const patterns = [
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 200); // 200자 제한
    }
  }
  return '';
};

// 빠른 키워드 추출
const extractKeywords = (html: string): string[] => {
  const keywords = [];

  // 메타 키워드
  const metaKeywords = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (metaKeywords && metaKeywords[1]) {
    keywords.push(...metaKeywords[1].split(',').map(k => k.trim()).slice(0, 3));
  }

  // 헤더 태그들 (빠른 추출)
  const headers = html.match(/<h[1-2][^>]*>([^<]+)<\/h[1-2]>/gi);
  if (headers) {
    keywords.push(...headers.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 2));
  }

  return keywords.slice(0, 5); // 최대 5개 키워드
};

// 비회원 UUID 관리 함수
const getOrCreateGuestUuid = (): string => {
  const storedUuid = localStorage.getItem('guest-uuid');
  if (storedUuid) {
    return storedUuid;
  }
  
  // UUID가 없으면 새로 생성
  const newUuid = uuidv4();
  localStorage.setItem('guest-uuid', newUuid);
  return newUuid;
};

interface UseChatActionsProps {
  modelName: SimpleModel;
  selectedPromptId: string;
}

export function useChatActions({ modelName, selectedPromptId }: UseChatActionsProps) {
  const { sendChat } = useAI(modelName);
  const { success, error } = useToast();
  const { addMessage, updateLastMessage, chatSessionId, setChatSessionId, isProcessing, setIsProcessing } = useChatStore((s) => ({
    addMessage: s.addMessage,
    updateLastMessage: s.updateLastMessage,
    chatSessionId: s.chatSessionId,
    setChatSessionId: s.setChatSessionId,
    isProcessing: s.isProcessing, // 추가: store에서 가져오기
    setIsProcessing: s.setIsProcessing, // 추가: store 설정 함수
  }));
  const { isAuthenticated } = useAuthStore();

  // 항상 최신 세션ID를 가져오는 함수
  const getEffectiveSessionId = () => {
    // 1. URL 파라미터
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlSessionId = searchParams.get('sessionId');
      if (urlSessionId) return urlSessionId;
    } catch {}
    // 2. Zustand 스토어
    if (chatSessionId) return chatSessionId;
    // 3. localStorage
    const localSessionId = localStorage.getItem('chatSessionId');
    if (localSessionId) return localSessionId;
    // 4. sessionStorage
    const sessionSessionId = sessionStorage.getItem('chatSessionId');
    if (sessionSessionId) return sessionSessionId;
    return null;
  };

  const [uploadedFiles, setUploadedFiles] = useState<FileUploadData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // 파일을 즉시 업로드하지 않고 미리보기만 추가
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    console.log('📁 handleFileUpload 호출됨 - 파일 개수:', files.length);
    console.log('📁 파일 리스트:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    const invalidFiles = files.filter(file => !validateFileType(file));
    if (invalidFiles.length > 0) {
      error(`지원하지 않는 파일 형식입니다: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    const sizeValidation = validateFilesSize(files);
    if (!sizeValidation.isValid) {
      error(sizeValidation.errorMessage || '파일 크기 검증에 실패했습니다.');
      return;
    }
    
    const fileDataArray: FileUploadData[] = files.map(file => ({
      name: file.name,
      fileUri: URL.createObjectURL(file),
      mimeType: file.type,
      size: file.size,
    }));
    
    setUploadedFiles(prev => {
      console.log('📁 이전 uploadedFiles:', prev.length, '개');
      const newFiles = [...prev, ...fileDataArray];
      console.log('📁 새로운 uploadedFiles:', newFiles.length, '개');
      return newFiles;
    });
    
    setSelectedFiles(prev => {
      console.log('📁 이전 selectedFiles:', prev.length, '개');
      const newFiles = [...prev, ...files];
      console.log('📁 새로운 selectedFiles:', newFiles.length, '개');
      return newFiles;
    });
    
    success(`파일 ${files.length}개가 추가되었습니다.`);
  };

  const handleFileUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const removeFile = (fileUri: string) => {
    const fileToRemove = uploadedFiles.find(file => file.fileUri === fileUri);
    if (fileToRemove) {
      setUploadedFiles((prev) => prev.filter((file) => file.fileUri !== fileUri));
      setSelectedFiles((prev) => prev.filter((file) => file.name !== fileToRemove.name));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading && !isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 🔥 이미지 붙여넣기 처리 함수
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageFiles: File[] = [];
    const textContent = e.clipboardData?.getData('text') || '';

    // 클립보드에서 이미지 파일 추출
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    // 이미지가 있으면 파일로 처리
    if (imageFiles.length > 0) {
      e.preventDefault(); // 기본 텍스트 붙여넣기 방지
      await handleFileUpload(imageFiles);
      // success(`이미지 ${imageFiles.length}개가 붙여넣기로 추가되었습니다.`);
      return;
    }

    // Base64 이미지 패턴 감지
    const base64Pattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/gi;
    const base64Images = textContent.match(base64Pattern);
    
    if (base64Images && base64Images.length > 0) {
      e.preventDefault();
      try {
        // Base64 이미지를 파일로 변환
        const base64Promises = base64Images.map(async (base64Data, index) => {
          try {
            // Base64 데이터를 Blob으로 변환
            const response = await fetch(base64Data);
            const blob = await response.blob();
            
            // MIME 타입 추출
            const mimeMatch = base64Data.match(/data:image\/([^;]+);base64/);
            const extension = mimeMatch ? mimeMatch[1] : 'png';
            const fileName = `pasted-base64-image-${Date.now()}-${index}.${extension}`;
            
            return new File([blob], fileName, { type: blob.type });
          } catch (error) {
            console.warn(`Base64 이미지 변환 실패:`, error);
            return null;
          }
        });

        const imageFiles = (await Promise.all(base64Promises)).filter(Boolean) as File[];
        
        if (imageFiles.length > 0) {
          await handleFileUpload(imageFiles);
          success(`Base64 이미지 ${imageFiles.length}개가 파일로 변환되어 추가되었습니다.`);
        }
      } catch (error) {
        console.error('Base64 이미지 처리 실패:', error);
        error('Base64 이미지를 처리하는 중 오류가 발생했습니다.');
      }
      return;
    }

    // 텍스트에 이미지 URL이 포함되어 있는지 확인
    const imageUrlPattern = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[^\s]*)?/gi;
    const imageUrls = textContent.match(imageUrlPattern);
    
    if (imageUrls && imageUrls.length > 0) {
      e.preventDefault();
      try {
        // 이미지 URL을 파일로 변환
        const imagePromises = imageUrls.map(async (url, index) => {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            
            const blob = await response.blob();
            const fileName = `pasted-image-${Date.now()}-${index}.${blob.type.split('/')[1] || 'png'}`;
            return new File([blob], fileName, { type: blob.type });
          } catch (error) {
            console.warn(`이미지 URL 로드 실패: ${url}`, error);
            return null;
          }
        });

        const imageFiles = (await Promise.all(imagePromises)).filter(Boolean) as File[];
        
        if (imageFiles.length > 0) {
          await handleFileUpload(imageFiles);
          success(`이미지 URL ${imageFiles.length}개가 파일로 변환되어 추가되었습니다.`);
        }
      } catch (error) {
        console.error('이미지 URL 처리 실패:', error);
        error('이미지 URL을 처리하는 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSubmit = async (input: string, options?: { displayMessage?: string; abortSignal?: AbortSignal; chatHistory?: Array<{role: 'user' | 'model'; content: string}> }) => {
    const displayMessage = options?.displayMessage || input;
    const abortSignal = options?.abortSignal;
    const explicitChatHistory = options?.chatHistory;
    if ((!input.trim() && uploadedFiles.length === 0) || isProcessing) return;

    setIsProcessing(true);

    // 사용자에게 보이는 메시지 생성 (간단한 버전)
    let userDisplayContent = transformMessageForDisplay(displayMessage);
    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map((file) => `[첨부파일: ${file.name}]`).join('\n');
      userDisplayContent = `${userDisplayContent}\n\n${fileInfo}`;
    }

    // AI에게 전달할 실제 메시지 내용 (상세 정보 포함)
    let messageContent = input; // 원본 input (AI 프롬프트 등 포함)
    
    // 사용자 메시지 임시 추가 (표시용은 간단하게)
    addMessage({ role: 'user', content: userDisplayContent });
    // ai 메시지는 isLoading: true로 추가 (실시간 업데이트용)
    addMessage({ role: 'ai', content: '', isLoading: true });
    console.log('사용자 메시지 및 빈 AI 메시지 추가 완료', { userDisplayContent }, { role: 'ai', content: '', isLoading: true });

    // URL 감지 및 크롤링 처리 (UI 로딩 상태가 이미 표시된 후 실행)
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const detectedUrls = displayMessage.match(urlPattern);
    let urlAnalysisForAI = '';
    let urlCrawlFailed = false;

    if (detectedUrls && detectedUrls.length > 0) {
      try {
        console.log('URL 발견, 크롤링 시작:', detectedUrls);
        // URL 크롤링 중임을 AI 메시지로 표시
        updateLastMessage({
          content: 'URL을 분석하고 있습니다...',
          isLoading: true,
        });
        
        // 첫 번째 URL만 크롤링 (여러 개 있어도 하나만 처리)
        const firstUrl = detectedUrls[0];
        
        // AbortController를 사용한 30초 타임아웃 처리
        const crawlAbortController = new AbortController();
        let crawlCompleted = false;
        
        // 30초 후 타임아웃 처리
        const timeoutId = setTimeout(() => {
          if (!crawlCompleted) {
            console.log('URL 크롤링 30초 타임아웃, API 호출 중단');
            crawlCompleted = true;
            urlCrawlFailed = true; // 크롤링 실패 표시
            crawlAbortController.abort(); // API 호출 중단
            
            // 타임아웃 시 사용자에게 알림 메시지 표시
            updateLastMessage({
              content: `URL 분석에 시간이 오래 걸려 건너뛰고 진행합니다.`,
              isLoading: true,
            });
            // 2초 후 빈 상태로 변경하여 AI 응답 준비
            setTimeout(() => {
              updateLastMessage({
                content: '',
                isLoading: true,
              });
            }, 2000);
          }
        }, 30000);
        
        try {
          // crawlUrl이 AbortSignal을 지원한다면 전달, 아니면 Promise.race 사용
          const crawlPromise = crawlUrl(firstUrl);
          const timeoutPromise = new Promise<never>((_, reject) => {
            crawlAbortController.signal.addEventListener('abort', () => {
              reject(new Error('크롤링 타임아웃'));
            });
          });
          
          const crawlResponse = await Promise.race([crawlPromise, timeoutPromise]);
          
          if (!crawlCompleted) {
            crawlCompleted = true;
            clearTimeout(timeoutId);
            
            if (crawlResponse?.statusCode === 200 && crawlResponse.data) {
              urlAnalysisForAI = crawlResponse.data;
              console.log('URL 크롤링 완료, AI에게 전달할 내용 준비됨');
              // 크롤링 완료 후 다시 빈 상태로 변경
              updateLastMessage({
                content: '',
                isLoading: true,
              });
            } else {
              console.log('URL 크롤링 응답이 유효하지 않음, 원본 메시지로 진행');
              updateLastMessage({
                content: '',
                isLoading: true,
              });
            }
          }
        } catch (error) {
          if (!crawlCompleted) {
            crawlCompleted = true;
            urlCrawlFailed = true; // 크롤링 실패 표시
            clearTimeout(timeoutId);
            console.log('URL 크롤링 실패 또는 타임아웃, 원본 메시지로 진행:', error.message);
            updateLastMessage({
              content: '',
              isLoading: true,
            });
          }
        }
      } catch (error) {
        console.error('URL 크롤링 처리 중 오류:', error);
        // 크롤링 실패해도 원본 메시지로 진행
        updateLastMessage({
          content: '',
          isLoading: true,
        });
      }
    }

    // 🔥 UI 미리보기만 즉시 제거 (실제 파일은 업로드 후 제거)
    setUploadedFiles([]);

    let currentSessionId = getEffectiveSessionId();
    let userId = null;

    if (isAuthenticated()) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        userId = authData.state?.user?._id;
      }
    } else {
      userId = getOrCreateGuestUuid();
    }

    if (!currentSessionId) {
      try {
        let createResponse;
        if (isAuthenticated()) {
          createResponse = await createChatSession(displayMessage.slice(0, 20) || '새로운 채팅');
        } else {
          createResponse = await createGuestChatSession(displayMessage.slice(0, 20) || '새로운 채팅', userId);
        }
        if (createResponse && createResponse.statusCode === 200 && createResponse.data && createResponse.data.length > 0 && createResponse.data[0]._id) {
          currentSessionId = createResponse.data[0]._id;
          setChatSessionId(currentSessionId);
          sessionStorage.setItem('chatSessionId', currentSessionId);
          localStorage.setItem('chatSessionId', currentSessionId);
          // URL 파라미터로 sessionId 추가 (추출 편의성 향상)
          // const newUrl = `${window.location.pathname}?sessionId=${currentSessionId}`;
          // window.history.pushState(null, '', newUrl);
        } else {
          throw new Error(createResponse.error?.message || '채팅방 생성에 실패했습니다.');
        }
      } catch (e) {
        error(`채팅방 생성 실패: ${(e as Error).message}`);
        setIsProcessing(false);
        return;
      }
    }

    try {
      let uploadedFileNames = [];
      let filesForGemini = [];
      
      // 🔍 파일 업로드 직전 디버깅
      console.log('🔍 파일 업로드 시작 - selectedFiles 상태:', selectedFiles);
      console.log('🔍 selectedFiles.length:', selectedFiles.length);
      console.log('🔍 각 파일 정보:', selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })));
      
      if (selectedFiles.length > 0) {
        console.log('📤 서버로 파일 업로드 시작...');
          if (abortSignal?.aborted) return;

        const uploadResponse = await uploadFiles(selectedFiles);
          if (abortSignal?.aborted) return;

        console.log('📥 서버 업로드 응답:', uploadResponse);
        
        // 🔥 API 응답 구조 수정: { statusCode: 200, data: [...] } 형태
        if (uploadResponse && uploadResponse.statusCode === 200 && Array.isArray(uploadResponse.data) && uploadResponse.data.length > 0) {
          console.log('✅ 파일 업로드 성공 - 파일명들:', uploadResponse.data);
          uploadedFileNames = uploadResponse.data;
          filesForGemini = await Promise.all(
            uploadedFileNames.map(async (fileName, index) => {
              const file = selectedFiles[index];
              const base64 = await fileToBase64(file);
              const fileUrl = `/file/${fileName}`;
              return {
                name: file.name,
                fileUri: fileUrl,
                mimeType: file.type,
                base64: base64
              };
            })
          );
          await new Promise(resolve => setTimeout(resolve, 1000));
          // 🔥 파일 업로드 완료 후 selectedFiles 초기화
          setSelectedFiles([]);
        } else {
          console.error('❌ 파일 업로드 실패 - 응답이 비어있거나 잘못됨:', uploadResponse);
          console.error('❌ statusCode:', uploadResponse?.statusCode);
          console.error('❌ data 길이:', uploadResponse?.data?.length);
          throw new Error(`파일 업로드에 실패했습니다. 상태코드: ${uploadResponse?.statusCode || 'unknown'}`);
        }
      } else {
        console.log('📝 파일 없이 텍스트만 전송');
      }

      // DB 저장용 메시지 내용
      const messageContentForDB = {
        content: input, // AI에게 전달되는 원본 내용
        file: uploadedFileNames.length > 0 ? uploadedFileNames[0] : undefined
      };

      const filesForAI = filesForGemini.map(file => ({
        name: file.name,
        fileUri: file.fileUri,
        mimeType: file.mimeType,
        base64: file.base64
      }));

      const combinedPrompt = await combinePrompts(selectedPromptId, input);

      // URL 크롤링 결과가 있으면 프롬프트에 추가
      let finalPrompt = combinedPrompt;
      if (urlAnalysisForAI) {
        finalPrompt = `url 크롤링한 텍스트야 보고 분석한 뒤 핵심 서비스 기능들을 나열해줘 ${input} ${urlAnalysisForAI}`;
        console.log('URL 크롤링 결과가 AI 프롬프트에 포함됨');
      } else if (urlCrawlFailed && detectedUrls && detectedUrls.length > 0) {
        // URL 크롤링에 실패한 경우 AI에게 친절한 대응 요청
        finalPrompt = `${input}\n\n[참고: 사용자가 제공한 URL(${detectedUrls[0]})의 내용을 분석하려 했지만 크롤링에 실패했습니다. URL 내용 없이도 친절하고 도움이 되는 답변을 해주세요. 가능하다면 사용자에게 URL을 다시 확인하거나 해당 페이지의 주요 내용을 직접 설명해달라고 요청해주세요.]`;
        console.log('URL 크롤링 실패, AI에게 친절한 대응 요청 메시지 추가');
      }

      // 🔥 명시적으로 전달된 chatHistory가 있으면 우선 사용, 없으면 스토어에서 생성
      let chatHistory: Array<{role: 'user' | 'model'; content: string}> = [];
      
      if (explicitChatHistory !== undefined) {
        // 명시적으로 전달된 chatHistory 사용 (빈 배열일 수도 있음)
        chatHistory = explicitChatHistory;
        console.log('[useChatActions] 명시적으로 전달된 chatHistory 사용:', chatHistory.length, '개 메시지');
      } else {
        // 스토어에서 현재 메시지 히스토리 가져와서 AI에게 전달
        const currentMessages = useChatStore.getState().messages;
        
        // 로딩 중이거나 빈 content를 가진 메시지 제외
        const filteredMessages = currentMessages
          .filter(msg => msg.role === 'user' || msg.role === 'ai')
          .filter(msg => !msg.isLoading) // 로딩 중인 메시지 제외
          .filter(msg => msg.content && msg.content.trim() !== ''); // 빈 content 메시지 제외

        // 마지막 메시지가 방금 추가한 사용자 메시지라면 그것만 제외
        let historyMessages = filteredMessages;
        if (historyMessages.length > 0 && 
            historyMessages[historyMessages.length - 1].role === 'user') {
          historyMessages = historyMessages.slice(0, -1);
        }

        chatHistory = historyMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          content: msg.content
        }));

        // 첫 번째 메시지가 AI(model) 역할이면 제외 (초기 인사말 제거)
        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
          chatHistory = chatHistory.slice(1);
        }

        // 첫 번째 메시지가 user가 아니면 빈 배열로 시작 (안전장치)
        if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
          chatHistory = [];
        }
        
        console.log('[useChatActions] 스토어에서 생성된 chatHistory 사용:', chatHistory.length, '개 메시지');
      }

      // 🔥 chatHistory 검증 및 정리 (연속된 동일 역할 메시지 방지)
      const validatedChatHistory: Array<{role: 'user' | 'model'; content: string}> = [];
      let lastRole: 'user' | 'model' | null = null;
      
      for (const message of chatHistory) {
        if (message.role !== lastRole && message.content.trim() !== '') {
          validatedChatHistory.push(message);
          lastRole = message.role;
        } else {
          console.log('🔍 중복 역할 또는 빈 메시지 제외:', message.role, message.content.substring(0, 50));
        }
      }
      
      // 첫 번째 메시지는 반드시 'user'여야 함
      if (validatedChatHistory.length > 0 && validatedChatHistory[0].role !== 'user') {
        validatedChatHistory.shift();
      }
      
      console.log('[useChatActions] AI에게 전달할 검증된 채팅 히스토리:', validatedChatHistory.length, '개 메시지');
      console.log('[useChatActions] 검증된 히스토리 구조:', validatedChatHistory.map(msg => `${msg.role}: ${msg.content.substring(0, 30)}...`));

      // ⭐️ 먼저 AI 응답을 받고 성공하면 DB에 저장하는 방식으로 변경
      let aiReply = '';
      let firstChunkReceived = false;
      console.log('finalPrompt:', finalPrompt);
      console.log('filesForAI:', filesForAI);
      console.log('validatedChatHistory:', validatedChatHistory);
      const chatResult = await sendChat(finalPrompt, filesForAI, {
        streaming: true,
        chatHistory: validatedChatHistory, // 🔥 검증된 과거 대화 이력 전달
        onStream: (chunk) => {
        // 중지(abort) 상태면 메시지 업데이트 하지 않음
        if (abortSignal?.aborted || !useChatStore.getState().isProcessing) {
          return;
        }
        
        const wasEmpty = aiReply.length === 0;
        aiReply += chunk;
        updateLastMessage({
          content: aiReply,
          isLoading: wasEmpty ? false : false,
        });
        if (!firstChunkReceived && wasEmpty) firstChunkReceived = true;
      },
        abortSignal,
      });

      const reply = chatResult.text;

      // AI 응답이 성공했으므로 이제 DB에 사용자 메시지 저장
      if (abortSignal?.aborted) return;

      const userMessageResponse = await sendChatMessage(currentSessionId, {
        role: 'USER',
        content: messageContentForDB,
        uid: userId
      });
      if (abortSignal?.aborted) return;

      // Zustand 스토어에서 마지막 사용자 메시지를 업데이트하여 messageId 추가
      // 현재 messages 배열에서 뒤에서 두 번째가 사용자 메시지
      const currentMessagesForUpdate = useChatStore.getState().messages;
      if (currentMessagesForUpdate.length >= 2) {
        const userMessageIndex = currentMessagesForUpdate.length - 2; // 뒤에서 두 번째
        if (currentMessagesForUpdate[userMessageIndex].role === 'user') {
          // updateMessageById 대신 직접 스토어 업데이트 (인덱스 기반)
          // 여기서는 단순히 로그만 남기고 실제 messageId 업데이트는 나중에 필요시 구현
          console.log('사용자 메시지 DB 저장 완료:', userMessageResponse);
        }
      }

      // 실제 토큰 사용량으로 로그 출력
      if (chatResult.tokenUsage) {
        console.log(`🤖 Gemini 2.5 Flash 실제 토큰 사용량:`);
        console.log(`   📥 입력 토큰: ${chatResult.tokenUsage.promptTokens.toLocaleString()}`);
        console.log(`   📤 출력 토큰: ${chatResult.tokenUsage.completionTokens.toLocaleString()}`);
        console.log(`   🔢 총 토큰: ${chatResult.tokenUsage.totalTokens.toLocaleString()}`);
        console.log(`   💰 비용: ₩${chatResult.tokenUsage.costKRW.toFixed(2)}`);
        console.log(`   📊 토큰 효율성: ${(chatResult.tokenUsage.completionTokens / chatResult.tokenUsage.promptTokens * 100).toFixed(1)}% (출력/입력 비율)`);
      }

      // 스트리밍이 끝나면 마지막 ai 메시지의 isLoading을 false로 변경
      updateLastMessage({
        content: aiReply,
        isLoading: false, 
      });

      // 견적 JSON 감지 및 저장 로직은 reply 전체가 온 뒤 기존대로 처리
      const estimateData = extractEstimateData(reply);
console.log('extractEstimateData 직후 추출된 견적 데이터:', estimateData); 

let finalReply = reply;
let estimateId = null;

if (estimateData) {
  try {
    const invoiceTitle = estimateData.project_name || '새로운 견적서';
    // userId가 없으면 guest-uuid 사용
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      effectiveUserId = localStorage.getItem('guest-uuid') || undefined;
    }
    ensureEstimateUuid(estimateData);
    console.log('견적 데이터 저장 시작', estimateData);
    estimateId = estimateData.uuid;
    const dataStr = buildFullEstimateData(reply, estimateId);
    console.log('견적 데이터 조립 완료, 업로드 시작', { estimateId, dataStr });
    if (abortSignal?.aborted) return;

    // sessionStorage에서 guestinfo 가져오기
    let userInfo = undefined;
    const guestInfoRaw = sessionStorage.getItem('guestinfo');
    if (guestInfoRaw) {
      try {
        const guestInfo = JSON.parse(guestInfoRaw);
        userInfo = {
          name: guestInfo.name || '',
          email: guestInfo.email || '',
          cellphone: guestInfo.cellphone || ''
        };
      } catch {}
    }

    // calculateTotalAmount와 calculateEstimatedPeriod 함수를 사용하여 정확한 값 계산
    const totalAmount = calculateTotalAmount(estimateData);
    console.log('계산된 실제 총 금액:', totalAmount);

    // 정확한 기간 계산을 위해 calculateEstimatedPeriod 함수 사용
    const periodCalculation = calculateEstimatedPeriod(estimateData);
    console.log('계산된 실제 기간:', periodCalculation.estimatedPeriodText);

    // 부가세 포함 금액 계산 (10% 부가세)
    const vatIncludedAmount = Math.round(totalAmount * 1.1);

    // AI가 생성한 견적 데이터를 정확한 계산 값으로 업데이트
    const correctedEstimateData = {
      ...estimateData,
      total_price: totalAmount.toLocaleString(), // 계산된 총 금액으로 수정
      vat_included_price: vatIncludedAmount.toLocaleString(), // 부가세 포함 금액 수정
      estimated_period: `${periodCalculation.finalWeeks}주`, // 계산된 기간으로 수정 (주 단위만)
      categories: periodCalculation.updatedEstimate.categories // 화면설계 가격이 업데이트된 카테고리 사용
    };
    console.log('수정된 견적 데이터:', {
      original_total: estimateData.total_price,
      corrected_total: correctedEstimateData.total_price,
      original_period: estimateData.estimated_period,
      corrected_period: correctedEstimateData.estimated_period
    });

    // 수정된 견적 데이터로 다시 조립 (첫 번째는 견적 데이터, 두 번째는 AI 인트로)
    const correctedDataStr = buildFullEstimateData(correctedEstimateData, extractIntroFromReply(reply));

    const uploadBody = {
      sessionId: currentSessionId,
      invoiceTitle,
      userId: effectiveUserId,
      dataStr: correctedDataStr, // 수정된 데이터 사용
      estimateId,
      amount: totalAmount,
      ...(userInfo ? { userInfo } : {})
    };

    const uploadResponse = await uploadEstimatePdf(
      uploadBody.sessionId,
      uploadBody.invoiceTitle,
      uploadBody.userId,
      uploadBody.dataStr,
      uploadBody.estimateId,
      uploadBody.userInfo, // 옵셔널
      uploadBody.amount // 실제 계산된 총 금액
    );

    if (abortSignal?.aborted) return;
    if (uploadResponse?.statusCode !== 200) {
      throw new Error(uploadResponse?.error?.message || '견적 저장 실패');
    }
          finalReply = correctedDataStr; // 수정된 데이터 사용
        } catch (pdfError) {
          error(`견적 저장 실패: ${(pdfError as Error).message}`);
          // 견적 저장 실패해도 일반 응답으로 처리
        }
      }

      // AI 응답 메시지를 DB에 저장
      if (abortSignal?.aborted) return;

      const aiMessageResponse: ChatMessageResponseData = await sendChatMessage(currentSessionId, {
        role: 'AI',
        content: { type: 'text', value: finalReply, ...(estimateId && { estimateId }) },
        uid: userId
      });
      if (abortSignal?.aborted) return;
      const aiMessageId = aiMessageResponse?.data?._id;
      
      // 스토어의 마지막 AI 메시지 업데이트 (messageId와 estimateId 추가)
      updateLastMessage({
        content: finalReply,
        messageId: aiMessageId,
        ...(estimateId && { estimateId }),
        isLoading: false,
      });

    } catch (e) {
      // error(`메시지 전송 실패: ${(e as Error).message}`);
    console.log('❗ 메시지 전송 중 오류 발생:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 스트리밍 중단 시 마지막 ai 메시지 정리
  const stopStreaming = () => {
    // 마지막 ai isLoading 메시지 삭제
    if (useChatStore.getState().removeLastAiLoadingMessage) {
      useChatStore.getState().removeLastAiLoadingMessage();
    }
  };

  return {
    handleSubmit,
    handlePaste, // 🔥 이미지 붙여넣기 함수 추가
    stopStreaming,
    isProcessing,
    uploadedFiles,
    isDragOver,
    isUploading,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile,
    uploadProgress,
  };
}