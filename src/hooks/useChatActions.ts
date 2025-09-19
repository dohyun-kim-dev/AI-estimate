import { useState } from 'react';
import useAI from './useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { combinePrompts } from '@/ai/promptTemplates';
import { FileUploadData } from '@/firebase.functions';
import type { SimpleModel } from './useAI';
import { createChatSession, createGuestChatSession, sendChatMessage, sendMessageWithFiles, validateFileType, validateFileSize, uploadFiles, ChatMessageResponseData } from '@/lib/api/user/userApi';
import { generateAndUploadPdf } from '@/hooks/pdfUtils';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import { v4 as uuidv4 } from 'uuid';
import { ensureEstimateUuid, buildFullEstimateData, extractIntroFromReply } from '@/hooks/estimate';
import { uploadEstimatePdf } from '@/lib/api/user/userApi';
import { detectUrls, shortenUrl, analyzeUrls } from './useUrlAnalyzer';

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
  const { addMessage, updateLastMessage, chatSessionId, setChatSessionId } = useChatStore((s) => ({
    addMessage: s.addMessage,
    updateLastMessage: s.updateLastMessage,
    chatSessionId: s.chatSessionId,
    setChatSessionId: s.setChatSessionId,
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

  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleSubmit = async (input: string, options?: { displayMessage?: string; abortSignal?: AbortSignal }) => {
    const displayMessage = options?.displayMessage || input;
    const abortSignal = options?.abortSignal;
    if ((!input.trim() && uploadedFiles.length === 0) || isProcessing) return;

    setIsProcessing(true);

    // URL 감지 및 동기 처리
    const detectedUrls = detectUrls(displayMessage);
    let urlAnalysisForAI = '';

    if (detectedUrls.length > 0) {
      try {
        // URL 분석을 동기적으로 처리 (메시지 전송 전에 완료)
        const analysisResult = await analyzeUrls(detectedUrls, (progress) => {
          console.log(`URL 분석 진행: ${progress.completed}/${progress.total}`);
        });
        
        if (analysisResult && analysisResult.summary) {
          urlAnalysisForAI = analysisResult.summary;
          console.log('URL 분석 완료, AI에게 전달할 내용 준비됨');
        }
      } catch (error) {
        console.error('URL 분석 실패:', error);
        // 분석 실패해도 원본 메시지로 진행
      }
    }

    // 사용자 메시지 생성
    let userMessageContent = displayMessage;
    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map((file) => `[첨부파일: ${file.name}]`).join('\n');
      userMessageContent = `${displayMessage}\n\n${fileInfo}`;
    }

    // 사용자 메시지 임시 추가 (깔끔한 버전)
    addMessage({ role: 'user', content: userMessageContent });
    // ai 메시지는 isLoading: true로 추가 (실시간 업데이트용)
    addMessage({ role: 'ai', content: '', isLoading: true });
    console.log('사용자 메시지 및 빈 AI 메시지 추가 완료', { userMessageContent }, { role: 'ai', content: '', isLoading: true });

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
        const uploadResponse = await uploadFiles(selectedFiles);
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

      const messageContent = {
        content: input,
        file: uploadedFileNames.length > 0 ? uploadedFileNames[0] : undefined
      };

      const filesForAI = filesForGemini.map(file => ({
        name: file.name,
        fileUri: file.fileUri,
        mimeType: file.mimeType,
        base64: file.base64
      }));

      const combinedPrompt = await combinePrompts(selectedPromptId, input);

      // URL 분석 결과가 있으면 프롬프트에 추가
      let finalPrompt = combinedPrompt;
      if (urlAnalysisForAI) {
        finalPrompt = `${combinedPrompt}\n\n[추가 참고 정보 - 웹사이트 분석 결과]\n${urlAnalysisForAI}`;
        console.log('URL 분석 결과가 AI 프롬프트에 포함됨');
      }

      // 🔥 스토어에서 현재 메시지 히스토리 가져와서 AI에게 전달
      const currentMessages = useChatStore.getState().messages;
      let chatHistory = currentMessages
        .filter(msg => msg.role === 'user' || msg.role === 'ai')
        .filter(msg => !msg.isLoading) // 로딩 중인 메시지 제외
        .slice(0, -2) // 방금 추가한 사용자 메시지와 빈 AI 메시지 제외
        .map(msg => ({
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

      console.log('[useChatActions] AI에게 전달할 채팅 히스토리:', chatHistory.length, '개 메시지');

      // ⭐️ 먼저 AI 응답을 받고 성공하면 DB에 저장하는 방식으로 변경
      let aiReply = '';
      let firstChunkReceived = false;
      const chatResult = await sendChat(finalPrompt, filesForAI, {
        streaming: true,
        chatHistory, // 🔥 과거 대화 이력 전달
        onStream: (chunk) => {
          const wasEmpty = aiReply.length === 0;
          aiReply += chunk;
          // 스트리밍 중에는 content만 누적, isLoading은 그대로 true 유지
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
      const userMessageResponse = await sendChatMessage(currentSessionId, {
        role: 'USER',
        content: messageContent,
        uid: userId
      });
      
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
          if (!userId) throw new Error('사용자 ID를 가져올 수 없습니다.');
          ensureEstimateUuid(estimateData);
          console.log('견적 데이터 저장 시작', estimateData);
          estimateId = estimateData.uuid;
          const dataStr = buildFullEstimateData(reply, estimateId);
          console.log('견적 데이터 조립 완료, 업로드 시작', { estimateId, dataStr });
          const uploadResponse = await uploadEstimatePdf(
            currentSessionId,
            invoiceTitle,
            userId,
            dataStr,
            estimateId
          );
          if (uploadResponse?.statusCode !== 200) {
            throw new Error(uploadResponse?.error?.message || '견적 저장 실패');
          }
          finalReply = dataStr;
        } catch (pdfError) {
          error(`견적 저장 실패: ${(pdfError as Error).message}`);
          // 견적 저장 실패해도 일반 응답으로 처리
        }
      }

      // AI 응답 메시지를 DB에 저장
      const aiMessageResponse: ChatMessageResponseData = await sendChatMessage(currentSessionId, {
        role: 'AI',
        content: { type: 'text', value: finalReply, ...(estimateId && { estimateId }) },
        uid: userId
      });
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