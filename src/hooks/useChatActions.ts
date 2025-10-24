import { useState, useRef } from 'react';
import useAI from './useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useUsageStore } from '@/store/usageStore';
import { combinePrompts } from '@/ai/promptTemplates';
import { FileUploadData } from '@/firebase.functions';
import type { SimpleModel } from './useAI';
import { createChatSession, createGuestChatSession, sendChatMessage, sendMessageWithFiles, validateFileType, validateFileSize, uploadFiles, ChatMessageResponseData, crawlUrl, updateChatSessionTitle } from '@/lib/api/user/userApi';
import { generateAndUploadPdf } from '@/hooks/pdfUtils';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import { v4 as uuidv4 } from 'uuid';
import { devLog } from '@/utils/devLogger'



import { ensureEstimateUuid, buildFullEstimateData, extractIntroFromReply } from '@/hooks/estimate';
import { uploadEstimatePdf } from '@/lib/api/user/userApi';
import { calculateTotalAmount, calculateEstimatedPeriod, calculateTotalPages, updateDesignItemPrices } from '../utils/estimateCalculator';
import { transformMessageForDisplay } from '@/utils/messageTransform';

// 견적서 데이터를 추출하는 유틸리티 함수
const extractEstimateData = (content: string): ProjectEstimate | null => {
  // ✅ 문자열이 아니면 바로 종료
  if (typeof content !== 'string') return null;

  try {
    // 1. 먼저 <script> 태그에서 JSON 찾기 (기존 로직)
    const scriptMatch = content.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    
    if (scriptMatch) {
      const data = JSON.parse(scriptMatch[1]);
      if (data && typeof data === 'object' && Array.isArray(data.categories)) {
        devLog("extractEstimateData data (from script):", data);
        return data as ProjectEstimate;
      }
    }
    
    // 2. <script> 태그가 없으면 마크다운 코드블록에서 JSON 찾기
    const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const data = JSON.parse(codeBlockMatch[1]);
      if (data && typeof data === 'object' && Array.isArray(data.categories)) {
        devLog("extractEstimateData data (from markdown):", data);
        return data as ProjectEstimate;
      }
    }
    
    // 3. 위 두 방법이 안되면 JSON 형태인지 먼저 확인 후 파싱 시도
    const trimmedContent = content.trim();
    
    // JSON 형태일 가능성이 높은 패턴만 체크 (객체나 배열로 시작/끝)
    if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
        (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
      
      try {
        const data = JSON.parse(trimmedContent);
        if (data && typeof data === 'object' && Array.isArray(data.categories)) {
          devLog("extractEstimateData data (from raw JSON):", data);
          return data as ProjectEstimate;
        }
      } catch (jsonErr) {
        // JSON 파싱 실패는 정상적인 경우 (일반 텍스트)이므로 에러 로그 없이 넘어감
        devLog("Raw JSON parsing failed - likely normal text content");
      }
    }
    
    return null;
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
  const { addMessage, updateLastMessage, chatSessionId, setChatSessionId, getEffectiveSessionId, isProcessing, setIsProcessing, removeLastUserAndAiMessage } = useChatStore((s) => ({
    addMessage: s.addMessage,
    updateLastMessage: s.updateLastMessage,
    chatSessionId: s.chatSessionId,
    setChatSessionId: s.setChatSessionId,
    getEffectiveSessionId: s.getEffectiveSessionId, // 추가: store에서 가져오기
    isProcessing: s.isProcessing, // 추가: store에서 가져오기
    setIsProcessing: s.setIsProcessing, // 추가: store 설정 함수
    removeLastUserAndAiMessage: s.removeLastUserAndAiMessage, // 추가: 메시지 제거 함수
  }));
  const { isAuthenticated } = useAuthStore();

  const [uploadedFiles, setUploadedFiles] = useState<FileUploadData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // 드래그 상태 관리를 위한 ref와 카운터 (윈도우 환경 깜빡임 방지)
  const dragCounterRef = useRef(0);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 파일을 즉시 업로드하지 않고 미리보기만 추가
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    devLog('📁 handleFileUpload 호출됨 - 파일 개수:', files.length);
    devLog('📁 파일 리스트:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
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
      devLog('📁 이전 uploadedFiles:', prev.length, '개');
      const newFiles = [...prev, ...fileDataArray];
      devLog('📁 새로운 uploadedFiles:', newFiles.length, '개');
      return newFiles;
    });
    
    setSelectedFiles(prev => {
      devLog('📁 이전 selectedFiles:', prev.length, '개');
      const newFiles = [...prev, ...files];
      devLog('📁 새로운 selectedFiles:', newFiles.length, '개');
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
    e.stopPropagation();
    if (!isUploading && !isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그 카운터 증가
    dragCounterRef.current++;
    
    if (!isUploading && !isProcessing) {
      setIsDragOver(true);
    }
    
    // 기존 타이머가 있으면 취소
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그 카운터 감소
    dragCounterRef.current--;
    
    // 카운터가 0 이하가 되면 드래그 상태 해제 (디바운싱 적용)
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      
      // 100ms 후에 드래그 상태 해제 (윈도우 환경에서의 깜빡임 방지)
      dragTimeoutRef.current = setTimeout(() => {
        if (dragCounterRef.current <= 0) {
          setIsDragOver(false);
        }
        dragTimeoutRef.current = null;
      }, 100);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그 카운터 초기화 및 타이머 정리
    dragCounterRef.current = 0;
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
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

    // AbortSignal이 감지되었을 때 정리하는 헬퍼 함수
    const handleAbort = () => {
      devLog('🛑 작업이 중단되었습니다. 메시지를 정리합니다.');
      removeLastUserAndAiMessage();
      setUploadedFiles([]);
      setSelectedFiles([]);
      setIsProcessing(false);
      error('작업이 중단되었습니다.');
    };

    // 사용자에게 보이는 메시지 생성 (간단한 버전)
    let userDisplayContent = displayMessage; // 이미 변환된 메시지 그대로 사용
    devLog('useChatActions - displayMessage:', displayMessage);
    devLog('useChatActions - userDisplayContent 초기값:', userDisplayContent);
    
    // 이미지와 텍스트를 분리할 때는 텍스트에 파일 정보를 포함하지 않음
    // (기존 방식과의 호환성을 위해 조건부로 처리)
    let shouldSeparateMessages = false;
    if (uploadedFiles.length > 0) {
      const imageFiles = uploadedFiles.filter((file: FileUploadData) => 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
      );
      shouldSeparateMessages = imageFiles.length > 0;
      
      if (!shouldSeparateMessages) {
        // 이미지가 아닌 파일들만 있는 경우에만 파일 정보를 텍스트에 추가
        const fileInfo = uploadedFiles.map((file) => `[첨부파일: ${file.name}]`).join('\n');
        userDisplayContent = `${userDisplayContent}\n\n${fileInfo}`;
      }
    }

    devLog('useChatActions - userDisplayContent 최종값:', userDisplayContent);
    devLog('useChatActions - shouldSeparateMessages:', shouldSeparateMessages);

    // AI에게 전달할 실제 메시지 내용 (상세 정보 포함)
    let messageContent = input; // 원본 input (AI 프롬프트 등 포함)
    
    // 이미지와 텍스트를 분리해서 메시지 추가
    devLog('🔍 handleSubmit 시작:', { input, uploadedFilesCount: uploadedFiles.length });
    
    const messageId = uuidv4();
    
    // 이미지 파일이 있는 경우 이미지 데이터 생성
    if (uploadedFiles.length > 0) {
      devLog('🔍 업로드된 파일들:', uploadedFiles);
      const imageFiles = uploadedFiles.filter((file: FileUploadData) => 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
      );
      const documentFiles = uploadedFiles.filter((file: FileUploadData) => 
        /\.(pdf|txt)$/i.test(file.name)
      );
      devLog('🔍 필터링된 이미지 파일들:', imageFiles);
      devLog('🔍 필터링된 문서 파일들:', documentFiles);
      
      if (imageFiles.length > 0 || documentFiles.length > 0) {
        // ⚠️ 먼저 실제 파일 업로드를 수행하여 UUID 파일명 획득
        devLog('📤 파일 URL 생성을 위한 파일 업로드 시작...');
        let serverFileNames: string[] = [];
        
        if (selectedFiles.length > 0) {
          // 🔥 selectedFiles도 uploadedFiles와 동일한 순서로 정렬
          // uploadedFiles의 name 순서대로 selectedFiles를 재정렬
          const orderedSelectedFiles = uploadedFiles
            .map(uploadedFile => selectedFiles.find(sf => sf.name === uploadedFile.name))
            .filter((f): f is File => f !== undefined);
          
          devLog('🔍 정렬된 selectedFiles:', orderedSelectedFiles.map(f => f.name));
          
          const uploadResponse = await uploadFiles(orderedSelectedFiles);
          if (uploadResponse && uploadResponse.statusCode === 200 && Array.isArray(uploadResponse.data)) {
            serverFileNames = uploadResponse.data;
            devLog('✅ 서버에서 반환된 UUID 파일명들:', serverFileNames);
            devLog('✅ 파일명 매핑:', orderedSelectedFiles.map((f, i) => `${f.name} -> ${serverFileNames[i]}`));
          } else {
            devLog('❌ 파일 업로드 실패:', uploadResponse);
            throw new Error('파일 업로드에 실패했습니다.');
          }
        }
        
        // 환경에 따른 파일 URL 생성 (UUID 파일명 사용)
        const getFileUrl = (serverFileName: string) => {
          // 개발 환경에서는 프록시 설정에 의해 /api/file/로 접근
          if (process.env.NODE_ENV === 'development') {
            return `/api/file/${serverFileName}`;
          }
          
          // 프로덕션 환경에서는 file 경로로 직접 접근
          const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
          return `${apiHost}/file/${serverFileName}`;
        };
        
        // 🔥 이미지 파일들 처리 - uploadedFiles 순서대로 매핑
        const images = imageFiles.map((file: FileUploadData, index: number) => {
          // uploadedFiles 전체에서 해당 이미지 파일의 인덱스를 찾기
          const globalIndex = uploadedFiles.findIndex(uf => uf.name === file.name);
          const serverFileName = serverFileNames[globalIndex] || file.name;
          const fileUrl = getFileUrl(serverFileName);
          devLog(`🔗 이미지 URL 생성 [${index}/${imageFiles.length}]: ${file.name} -> ${serverFileName} -> ${fileUrl} (전체 인덱스: ${globalIndex})`);

          return {
            url: fileUrl,
            fileName: file.name,
            mimeType: file.mimeType || `image/${file.name.split('.').pop()?.toLowerCase() || 'png'}`
          };
        });

        // 🔥 문서 파일들 처리 - uploadedFiles 순서대로 매핑
        const files = documentFiles.map((file: FileUploadData, index: number) => {
          // uploadedFiles 전체에서 해당 문서 파일의 인덱스를 찾기
          const globalIndex = uploadedFiles.findIndex(uf => uf.name === file.name);
          const serverFileName = serverFileNames[globalIndex] || file.name;
          const fileUrl = getFileUrl(serverFileName);
          devLog(`🔗 문서 파일 URL 생성 [${index}/${documentFiles.length}]: ${file.name} -> ${serverFileName} -> ${fileUrl} (전체 인덱스: ${globalIndex})`);

          return {
            url: fileUrl,
            fileName: file.name,
            mimeType: file.mimeType || (/\.pdf$/i.test(file.name) ? 'application/pdf' : 'text/plain'),
            size: file.size
          };
        });

        devLog('🔍 이미지 파일들 처리됨:', images);
        devLog('🔍 문서 파일들 처리됨:', files);

        // 🔥 파일과 텍스트를 하나의 메시지로 합치기
        const combinedMessage = {
          role: 'user' as const,
          content: userDisplayContent.trim(), // 텍스트 내용
          ...(images.length > 0 && { images }), // 이미지가 있으면 추가
          ...(files.length > 0 && { files }), // 파일이 있으면 추가
          messageId
        };
        devLog('🔍 통합 메시지 생성:', combinedMessage);
        addMessage(combinedMessage);
      } else {
        // 지원하지 않는 파일 형식만 있는 경우
        addMessage({ role: 'user', content: userDisplayContent, messageId });
      }
    } else {
      // 파일이 없는 일반 메시지
      addMessage({ role: 'user', content: userDisplayContent, messageId });
    }
    // ai 메시지는 isLoading: true로 추가 (실시간 업데이트용)
    addMessage({ role: 'ai', content: '', isLoading: true });
    devLog('사용자 메시지 및 빈 AI 메시지 추가 완료', { userDisplayContent }, { role: 'ai', content: '', isLoading: true });

    // URL 감지 및 크롤링 처리 (UI 로딩 상태가 이미 표시된 후 실행)
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const detectedUrls = displayMessage.match(urlPattern);
    let urlAnalysisForAI = '';
    let urlCrawlFailed = false;

    if (detectedUrls && detectedUrls.length > 0) {
      try {
        devLog('URL 발견, 크롤링 시작:', detectedUrls);
        // URL 크롤링 상태 설정
        const { setIsCrawlingUrl } = useChatStore.getState();
        setIsCrawlingUrl(true);
        
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
        
        try {
          // 🔥 타임아웃과 함께 crawlUrl 호출 (30초 후 자동 중단)
          const crawlResponse = await Promise.race([
            crawlUrl(firstUrl),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('URL 크롤링 120초 타임아웃'));
              }, 120000);
            })
          ]);
          
          if (!crawlCompleted) {
            crawlCompleted = true;
            // URL 크롤링 상태 해제
            const { setIsCrawlingUrl } = useChatStore.getState();
            setIsCrawlingUrl(false);
            
            if (crawlResponse?.statusCode === 200 && crawlResponse.data) {
              urlAnalysisForAI = crawlResponse.data;
              devLog('URL 크롤링 완료, AI에게 전달할 내용 준비됨');
              // 크롤링 완료 후 다시 빈 상태로 변경
              updateLastMessage({
                content: '',
                isLoading: true,
              });
            } else {
              devLog('URL 크롤링 응답이 유효하지 않음, 원본 메시지로 진행');
              updateLastMessage({
                content: '',
                isLoading: true,
              });
            }
          }
        } catch (error) {
          if (!crawlCompleted) {
            crawlCompleted = true;
            // URL 크롤링 상태 해제
            const { setIsCrawlingUrl } = useChatStore.getState();
            setIsCrawlingUrl(false);
            
            urlCrawlFailed = true; // 크롤링 실패 표시
            devLog('URL 크롤링 실패 또는 타임아웃, 원본 메시지로 진행:', error.message);
            
            // 🔥 타임아웃 에러인지 확인하고 사용자에게 알림
            if (error.message.includes('타임아웃') || error.message.includes('timeout')) {
              updateLastMessage({
                content: 'URL 분석에 시간이 오래 걸려 건너뛰고 진행합니다.',
                isLoading: true,
              });
              // 2초 후 빈 상태로 변경하여 AI 응답 준비
              setTimeout(() => {
                updateLastMessage({
                  content: '',
                  isLoading: true,
                });
              }, 2000);
            } else {
              updateLastMessage({
                content: '',
                isLoading: true,
              });
            }
          }
        }
      } catch (error) {
        console.error('URL 크롤링 처리 중 오류:', error);
        // URL 크롤링 상태 해제
        const { setIsCrawlingUrl } = useChatStore.getState();
        setIsCrawlingUrl(false);
        
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
    devLog('🔍 [useChatActions handleSubmit] 시작 시점 currentSessionId:', currentSessionId);
    devLog('🔍 [useChatActions handleSubmit] 시작 시점 스토어 chatSessionId:', useChatStore.getState().chatSessionId);
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
          createResponse = await createChatSession(displayMessage);
        } else {
          createResponse = await createGuestChatSession(displayMessage, userId);
        }
        if (createResponse && createResponse.statusCode === 200 && createResponse.data && createResponse.data.length > 0 && createResponse.data[0]._id) {
          currentSessionId = createResponse.data[0]._id;
          devLog('🔍 [useChatActions] 새 세션 생성됨:', currentSessionId);
          setChatSessionId(currentSessionId); // store에만 저장
          devLog('🔍 [useChatActions] setChatSessionId 호출 후 스토어 상태:', useChatStore.getState().chatSessionId);
          // URL 파라미터로 sessionId 추가 (추출 편의성 향상)
          // const newUrl = `${window.location.pathname}?sessionId=${currentSessionId}`;
          // window.history.pushState(null, '', newUrl);
        } else {
          throw new Error(createResponse.error?.message || '채팅방 생성에 실패했습니다.');
        }
      } catch (e) {
        devLog('❗ 채팅방 생성 중 오류 발생:', e);
        
        // 채팅방 생성 실패 시 추가된 메시지들 제거
        removeLastUserAndAiMessage();
        
        // 토스트 에러 메시지 표시
        error(`채팅방 생성에 실패했습니다. 다시 시도해주세요.`);
        
        // 파일 상태 초기화
        setUploadedFiles([]);
        setSelectedFiles([]);
        
        setIsProcessing(false);
        return;
      }
    }

    try {
      let uploadedFileNames = [];
      let filesForGemini = [];
      
      // 🔍 파일 업로드 직전 디버깅
      devLog('🔍 파일 업로드 시작 - selectedFiles 상태:', selectedFiles);
      devLog('🔍 selectedFiles.length:', selectedFiles.length);
      devLog('🔍 각 파일 정보:', selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })));
      
      if (selectedFiles.length > 0) {
        devLog('📤 서버로 파일 업로드 시작...');
          if (abortSignal?.aborted) {
            handleAbort();
            return;
          }

        // ⚠️ 이미 이미지 URL 생성을 위해 업로드를 수행했는지 확인
        // selectedFiles가 남아있다면 아직 업로드되지 않은 파일들이 있음
        let needsUpload = true;
        
        // 이미지가 포함된 경우 이미 위에서 업로드했을 수 있음
        const hasImages = selectedFiles.some(file => 
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
        );
        
        if (hasImages && uploadedFileNames.length > 0) {
          devLog('🔄 이미지 파일들은 이미 업로드됨, 추가 업로드 생략');
          needsUpload = false;
        }
        
        if (needsUpload) {
          const uploadResponse = await uploadFiles(selectedFiles);
            if (abortSignal?.aborted) {
              handleAbort();
              return;
            }

          devLog('📥 서버 업로드 응답:', uploadResponse);
          
          // 🔥 API 응답 구조 수정: { statusCode: 200, data: [...] } 형태
          if (uploadResponse && uploadResponse.statusCode === 200 && Array.isArray(uploadResponse.data) && uploadResponse.data.length > 0) {
            devLog('✅ 파일 업로드 성공 - 파일명들:', uploadResponse.data);
            uploadedFileNames = uploadResponse.data;
          } else {
            console.error('❌ 파일 업로드 실패 - 응답이 비어있거나 잘못됨:', uploadResponse);
            console.error('❌ statusCode:', uploadResponse?.statusCode);
            console.error('❌ data 길이:', uploadResponse?.data?.length);
            throw new Error(`파일 업로드에 실패했습니다. 상태코드: ${uploadResponse?.statusCode || 'unknown'}`);
          }
        }
        
        // Gemini용 파일 데이터 생성
        if (uploadedFileNames.length > 0) {
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
        }
        
        // 🔥 파일 업로드 완료 후 selectedFiles 초기화
        setSelectedFiles([]);
      } else {
        devLog('📝 파일 없이 텍스트만 전송');
      }

      // DB 저장용 메시지 내용
      // 🔥 원본 파일명과 UUID 파일명을 매핑하여 저장
      const fileMetadata = uploadedFileNames.length > 0 ? uploadedFileNames.map((serverFileName, index) => {
        // orderedSelectedFiles에서 원본 파일 정보 가져오기
        const originalFile = selectedFiles[index];
        const uploadedFile = uploadedFiles[index];
        
        return {
          serverFileName: serverFileName, // UUID 파일명
          originalFileName: originalFile?.name || uploadedFile?.name || serverFileName, // 원본 파일명
          mimeType: originalFile?.type || uploadedFile?.mimeType || '',
          size: originalFile?.size || uploadedFile?.size
        };
      }) : undefined;
      
      const messageContentForDB = {
        content: input, // AI에게 전달되는 원본 내용
        files: uploadedFileNames.length > 0 ? uploadedFileNames : undefined,  // UUID 파일명 배열 (하위 호환성)
        fileMetadata: fileMetadata  // 🔥 새로운 필드: 파일 메타데이터 (원본 파일명 포함)
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
        finalPrompt = `지능형 콘텐츠 분석 및 워크플로우 최적화 규칙에 따라주세요 URL 분석한 내용입니다 ${input} ${urlAnalysisForAI} 지능형 콘텐츠 분석 및 워크플로우 최적화 규칙에 따라주세요 URL 분석한 내용입니다`;
        devLog('URL 크롤링 결과가 AI 프롬프트에 포함됨');
      } else if (urlCrawlFailed && detectedUrls && detectedUrls.length > 0) {
        // URL 크롤링에 실패한 경우 AI에게 친절한 대응 요청
        finalPrompt = `${input}\n\n[참고: 사용자가 제공한 URL(${detectedUrls[0]})의 내용을 분석하려 했지만 크롤링에 실패했습니다. URL 내용 없이도 친절하고 도움이 되는 답변을 해주세요. 가능하다면 사용자에게 URL을 다시 확인하거나 해당 페이지의 주요 내용을 직접 설명해달라고 요청해주세요.]`;
        devLog('URL 크롤링 실패, AI에게 친절한 대응 요청 메시지 추가');
      }

      // 🔥 명시적으로 전달된 chatHistory가 있으면 우선 사용, 없으면 스토어에서 생성
      let chatHistory: Array<{role: 'user' | 'model'; content: string}> = [];
      
      if (explicitChatHistory !== undefined) {
        // 명시적으로 전달된 chatHistory 사용 (빈 배열일 수도 있음)
        chatHistory = explicitChatHistory;
        devLog('[useChatActions] 명시적으로 전달된 chatHistory 사용:', chatHistory.length, '개 메시지');
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
        
        devLog('[useChatActions] 스토어에서 생성된 chatHistory 사용:', chatHistory.length, '개 메시지');
      }

      // 🔥 chatHistory 검증 및 정리 (연속된 동일 역할 메시지 방지)
      const validatedChatHistory: Array<{role: 'user' | 'model'; content: string}> = [];
      let lastRole: 'user' | 'model' | null = null;
      
      for (const message of chatHistory) {
        if (message.role !== lastRole && message.content.trim() !== '') {
          validatedChatHistory.push(message);
          lastRole = message.role;
        } else {
          devLog('🔍 중복 역할 또는 빈 메시지 제외:', message.role, message.content.substring(0, 50));
        }
      }
      
      // 첫 번째 메시지는 반드시 'user'여야 함
      if (validatedChatHistory.length > 0 && validatedChatHistory[0].role !== 'user') {
        validatedChatHistory.shift();
      }
      
      devLog('[useChatActions] AI에게 전달할 검증된 채팅 히스토리:', validatedChatHistory.length, '개 메시지');
      devLog('[useChatActions] 검증된 히스토리 구조:', validatedChatHistory.map(msg => `${msg.role}: ${msg.content.substring(0, 30)}...`));

      // ⭐️ 먼저 AI 응답을 받고 성공하면 DB에 저장하는 방식으로 변경
      let aiReply = '';
      let firstChunkReceived = false;
      devLog('finalPrompt:', finalPrompt);
      devLog('filesForAI:', filesForAI);
      devLog('validatedChatHistory:', validatedChatHistory);
      const chatResult = await sendChat(finalPrompt, filesForAI, {
        streaming: true,
        chatHistory: validatedChatHistory, // 🔥 검증된 과거 대화 이력 전달
        maxRetries: 2, // 최대 2회 재시도
        retryDelay: 1000, // 1초 기본 지연
        onRetry: (attempt, error) => {
          devLog(`🔄 AI API 재시도 중... (${attempt}번째 시도)`);
          updateLastMessage({
            content: `연결 문제로 재시도 중입니다... (${attempt}/2)`,
            isLoading: true,
          });
        },
        onStream: async (chunk) => {
        // 중지(abort) 상태면 메시지 업데이트 하지 않음
        if (abortSignal?.aborted || !useChatStore.getState().isProcessing) {
          if (abortSignal?.aborted) {
            handleAbort();
          }
          return;
        }
        
        const wasEmpty = aiReply.length === 0;
        aiReply += chunk;
        
        // 🔥 스트리밍 도중 잘못된 형식 감지 시 즉시 중단
        const trimmedReply = aiReply.trim();
        
        // 빈 응답 체크 (충분한 청크가 쌓인 후에 체크)
        if (aiReply.length > 10 && (trimmedReply === '' || trimmedReply === '""' || trimmedReply === "''")) {
          devLog('❌ 스트리밍 도중 빈 응답 감지, 즉시 중단 및 원복');
          handleAbort();
          error('AI가 빈 응답을 했습니다. 다시 시도해주세요.');
          return;
        }
        
        // 🔥 스트리밍 중에도 chatTitle 태그와 백틱 실시간 제거
        let displayContent = aiReply;

        // chatTitle 태그 제거
        if (/<chatTitle>.*?<\/chatTitle>/gs.test(aiReply)) {
          displayContent = displayContent.replace(/<chatTitle>.*?<\/chatTitle>/gs, '');
        }
        
        // 🔥 백틱 제거 (항상 실행)
        displayContent = displayContent
          .replace(/```json\s*\n?/g, '') // ```json 코드 블록 시작 제거
          .replace(/```\s*\n?/g, '') // ``` 코드 블록 마커 제거
          .replace(/`([^`]*)`/g, '$1') // 인라인 백틱 제거 (예: `텍스트`)
          .replace(/^\s*\n+/g, '') // 시작 부분 빈 줄 제거
          .trim();
        
        // 일반 텍스트 스트리밍 표시 (정리된 내용으로)
        updateLastMessage({
          content: displayContent,
          isLoading: wasEmpty ? false : false,
        });
        
        if (!firstChunkReceived && wasEmpty) firstChunkReceived = true;
      },
        abortSignal,
      });

      const reply = chatResult.text;

      // 🔥 AI 응답 형식 검증 - 잘못된 형식으로 응답했는지 확인
      const trimmedReply = reply?.trim() || '';
      
      // 빈 응답 체크
      if (trimmedReply === '' || trimmedReply === '""' || trimmedReply === "''") {
        devLog('❌ AI가 빈 응답으로 완료함');
        throw new Error('AI가 빈 응답을 했습니다.');
      }
      
      // JSON 형식 검증 로직 제거 - 이제 모든 형태의 JSON 응답을 지원합니다.
      // - ```json ... ``` (마크다운 코드블록)
      // - { ... } (순수 JSON)
      // - <script type="application/json">...</script> (기존 방식)
      // 모두 extractEstimateData 함수에서 정상 처리됩니다.

      // AI 응답이 성공했으므로 이제 DB에 사용자 메시지 저장
      if (abortSignal?.aborted) {
        handleAbort();
        return;
      }

      const userMessageResponse = await sendChatMessage(currentSessionId, {
        role: 'USER',
        content: messageContentForDB,
        uid: userId
      });
      if (abortSignal?.aborted) {
        handleAbort();
        return;
      }

      // 🔥 사용자 메시지 저장 후 사용량 업데이트 (응답에서 queryUsage 확인)
      devLog('🔍 사용자 메시지 응답 전체 구조:', userMessageResponse);
      devLog('🔍 응답 데이터 존재 여부:', !!userMessageResponse);
      devLog('🔍 data 존재 여부:', !!(userMessageResponse as any)?.data);
      devLog('🔍 queryUsage 존재 여부:', !!(userMessageResponse as any)?.data?.queryUsage);
      devLog('🔍 dailyQueryUsage 값:', (userMessageResponse as any)?.data?.queryUsage?.dailyQueryUsage);
      
      if (userMessageResponse && (userMessageResponse as any).data?.queryUsage?.dailyQueryUsage !== undefined) {
        const { remainingCount: currentCount, setRemainingCount } = useUsageStore.getState();
        const messageData = (userMessageResponse as any).data;
        const newRemainingCount = messageData.queryUsage.dailyQueryUsage;

        devLog('📊 사용량 업데이트 시작:', {
          이전카운트: currentCount,
          새로운카운트: newRemainingCount,
          전체응답: messageData.queryUsage
        });
        
        setRemainingCount(newRemainingCount);
        
        // 업데이트 후 확인
        setTimeout(() => {
          const updatedCount = useUsageStore.getState().remainingCount;
          const localStorageCount = localStorage.getItem('remainingCount');
          devLog('📊 사용량 업데이트 완료 확인:', {
            스토어값: updatedCount,
            로컬스토리지값: localStorageCount,
            업데이트성공: updatedCount === newRemainingCount
          });
        }, 100);
      } else {
        console.warn('⚠️ 사용량 정보가 응답에 없습니다:', {
          hasResponse: !!userMessageResponse,
          hasData: !!(userMessageResponse as any)?.data,
          hasQueryUsage: !!(userMessageResponse as any)?.data?.queryUsage,
          dailyQueryUsage: (userMessageResponse as any)?.data?.queryUsage?.dailyQueryUsage
        });
      }

      // Zustand 스토어에서 마지막 사용자 메시지를 업데이트하여 messageId 추가
      // 현재 messages 배열에서 뒤에서 두 번째가 사용자 메시지
      const currentMessagesForUpdate = useChatStore.getState().messages;
      if (currentMessagesForUpdate.length >= 2) {
        const userMessageIndex = currentMessagesForUpdate.length - 2; // 뒤에서 두 번째
        if (currentMessagesForUpdate[userMessageIndex].role === 'user') {
          // updateMessageById 대신 직접 스토어 업데이트 (인덱스 기반)
          // 여기서는 단순히 로그만 남기고 실제 messageId 업데이트는 나중에 필요시 구현
          devLog('사용자 메시지 DB 저장 완료:', userMessageResponse);
        }
      }

      // 실제 토큰 사용량으로 로그 출력
      if (chatResult.tokenUsage) {
        devLog(`🤖 Gemini 2.5 Flash 실제 토큰 사용량:`);
        devLog(`   📥 입력 토큰: ${chatResult.tokenUsage.promptTokens.toLocaleString()}`);
        devLog(`   📤 출력 토큰: ${chatResult.tokenUsage.completionTokens.toLocaleString()}`);
        devLog(`   🔢 총 토큰: ${chatResult.tokenUsage.totalTokens.toLocaleString()}`);
        devLog(`   💰 비용: ₩${chatResult.tokenUsage.costKRW.toFixed(2)}`);
        devLog(`   📊 토큰 효율성: ${(chatResult.tokenUsage.completionTokens / chatResult.tokenUsage.promptTokens * 100).toFixed(1)}% (출력/입력 비율)`);
      }

      // 스트리밍이 끝나면 마지막 ai 메시지의 isLoading을 false로 변경
      updateLastMessage({
        content: aiReply,
        isLoading: false, 
      });

      // 견적 JSON 감지 및 저장 로직은 reply 전체가 온 뒤 기존대로 처리
      const estimateData = extractEstimateData(reply);
devLog('extractEstimateData 직후 추출된 견적 데이터:', estimateData); 

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
    devLog('견적 데이터 저장 시작', estimateData);
    estimateId = estimateData.uuid;
    const dataStr = buildFullEstimateData(reply, estimateId);
    devLog('견적 데이터 조립 완료, 업로드 시작', { estimateId, dataStr });
    if (abortSignal?.aborted) {
      handleAbort();
      return;
    }

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
    
    // 🔍 디버깅: AI 생성 데이터 상세 분석
    devLog('🔍 AI 생성 원본 데이터 분석:', {
      categories: estimateData.categories?.length,
      aiTotalPrice: estimateData.total_price
    });
    
    let debugTotalForCheck = 0;
    estimateData.categories?.forEach((cat, catIdx) => {
      devLog(`🔍 카테고리 ${catIdx}: ${cat.category_name}`);
      cat.sub_categories?.forEach((sub, subIdx) => {
        devLog(`  🔍 서브카테고리 ${subIdx}: ${sub.sub_category_name}`);
        sub.items?.forEach((item, itemIdx) => {
          const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
          devLog(`    🔍 항목 ${itemIdx}: ${item.name} - 가격: ${price}, 삭제됨: ${item.is_deleted}`);
          if (!item.is_deleted) {
            debugTotalForCheck += (price || 0);
          }
        });
      });
    });
    devLog('🔍 수동 계산 총액:', debugTotalForCheck);
    
    // 🔍 EstimateAccordion과 동일한 전처리 적용 테스트
    const totalPages = calculateTotalPages(estimateData.categories);
    const preprocessedEstimate = updateDesignItemPrices(estimateData, totalPages);
    
    const totalAmountOriginal = calculateTotalAmount(estimateData);
    const totalAmountPreprocessed = calculateTotalAmount(preprocessedEstimate);
    
    devLog('🔍 계산 결과 비교:', {
      original: totalAmountOriginal,
      preprocessed: totalAmountPreprocessed,
      aiSaid: estimateData.total_price
    });
    
    // 전처리된 데이터로 최종 계산
    const totalAmount = totalAmountPreprocessed;

    // 정확한 기간 계산을 위해 calculateEstimatedPeriod 함수 사용
    const periodCalculation = calculateEstimatedPeriod(estimateData);
    devLog('계산된 실제 기간:', periodCalculation.estimatedPeriodText);

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
    devLog('수정된 견적 데이터:', {
      original_total: estimateData.total_price,
      corrected_total: correctedEstimateData.total_price,
      original_period: estimateData.estimated_period,
      corrected_period: correctedEstimateData.estimated_period
    });

    // 수정된 견적 데이터로 다시 조립 (인트로 정보 보존)
    const originalIntro = extractIntroFromReply(reply);
    const correctedDataStr = buildFullEstimateData(correctedEstimateData, estimateId, originalIntro);

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

    if (abortSignal?.aborted) {
      handleAbort();
      return;
    }
    if (uploadResponse?.statusCode !== 200) {
      throw new Error(uploadResponse?.error?.message || '견적 저장 실패');
    }
          finalReply = correctedDataStr; // 수정된 데이터 사용
        } catch (pdfError) {
          error(`견적 저장 실패: ${(pdfError as Error).message}`);
          // 견적 저장 실패해도 일반 응답으로 처리
        }
      }

      // 🔥 채팅방 타이틀 자동 업데이트 (AI 응답에서 추출 후 내용에서 제거)
      // ⚠️ DB 저장 전에 먼저 처리하여 깔끔한 내용만 저장되도록 함
      let cleanedReply = finalReply;
      try {
        // <chatTitle>태그로 감싸진 제목 추출
        const titleMatch = finalReply.match(/<chatTitle>(.*?)<\/chatTitle>/s);
        if (titleMatch && titleMatch[1]) {
          const extractedTitle = titleMatch[1].trim();
          devLog('🏷️ AI 응답에서 추출된 타이틀:', extractedTitle);
          
          if (extractedTitle && extractedTitle !== '새로운 채팅') {
            await updateChatSessionTitle(currentSessionId, extractedTitle);
            devLog('✅ 채팅방 타이틀 업데이트 완료:', extractedTitle);
          }
        }
        
        // 🔥 응답 내용에서 chatTitle 태그와 모든 백틱 제거 (항상 실행)
        cleanedReply = finalReply
          .replace(/<chatTitle>.*?<\/chatTitle>/gs, '') // chatTitle 태그 제거
          .replace(/```json\s*\n?/g, '') // ```json 코드 블록 시작 제거
          .replace(/```\s*\n?/g, '') // ``` 코드 블록 마커 제거
          .replace(/`([^`]*)`/g, '$1') // 인라인 백틱 제거 (예: `텍스트` -> 텍스트)
          .replace(/\\`/g, '') // 이스케이프된 백틱 제거
          .replace(/^\s*\n+/g, '') // 시작 부분 빈 줄 제거
          .replace(/\n+\s*$/g, '') // 끝 부분 빈 줄 제거
          .trim();
        
        devLog('🔧 chatTitle 태그 및 백틱 제거된 응답:', cleanedReply.substring(0, 100) + '...');
      } catch (titleError) {
        devLog('⚠️ 채팅방 타이틀 업데이트 실패:', titleError);
        // 타이틀 업데이트 실패는 무시하고 계속 진행
      }
      
      // 🔥 정리된 내용을 finalReply에 저장하여 DB에 깔끔하게 저장되도록 함
      finalReply = cleanedReply;

      // AI 응답 메시지를 DB에 저장 (이미 정리된 내용으로)
      if (abortSignal?.aborted) {
        handleAbort();
        return;
      }

      const aiMessageResponse: ChatMessageResponseData = await sendChatMessage(currentSessionId, {
        role: 'AI',
        content: { type: 'text', value: finalReply, ...(estimateId && { estimateId }) },
        uid: userId
      });
      if (abortSignal?.aborted) {
        handleAbort();
        return;
      }
      const aiMessageId = aiMessageResponse?.data?._id;
      
      // 🔄 스토어의 UI 표시용 메시지도 정리된 내용으로 업데이트
      updateLastMessage({
        content: cleanedReply,
        messageId: aiMessageId,
        ...(estimateId && { estimateId }),
        isLoading: false,
      });

    } catch (e) {
      devLog('❗ 메시지 전송 중 오류 발생:', e);
      
      // 에러 발생 시 마지막 사용자 메시지와 AI 메시지 제거
      removeLastUserAndAiMessage();
      
      // 🔥 AI 오류 시 사용량 차감 복구 (비회원만)
      if (!isAuthenticated()) {
        const { remainingCount, setRemainingCount } = useUsageStore.getState();
        setRemainingCount(remainingCount + 1); // 차감된 횟수 복구
        devLog('🔄 AI 오류로 인한 사용량 복구 완료');
      }
      
      // 토스트 에러 메시지 표시
      error(`[AI오류] 잠시 후 재 시도 바랍니다`);
      
      // 🔥 에러를 throw하여 BottomInput에서 입력값 복원 처리 가능하도록 함
      const errorWithInput = new Error('[AI오류] 잠시 후 재 시도 바랍니다');
      (errorWithInput as any).originalInput = input; // 원본 입력값 저장
      (errorWithInput as any).shouldRestoreInput = true; // 입력값 복원 필요 플래그
      throw errorWithInput;
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
    
    // 처리 상태 중지
    setIsProcessing(false);
    
    // URL 크롤링 상태 해제
    const { setIsCrawlingUrl } = useChatStore.getState();
    setIsCrawlingUrl(false);
    
    // 파일 상태 초기화
    setUploadedFiles([]);
    setSelectedFiles([]);
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
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile,
    uploadProgress,
  };
}