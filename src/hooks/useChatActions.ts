// src/hooks/useChatActions.ts

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

// 견적서 데이터를 추출하는 유틸리티 함수
const extractEstimateData = (content: string): ProjectEstimate | null => {
  // ✅ 문자열이 아니면 바로 종료
  if (typeof content !== 'string') return null;

  try {
    const match = content.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    if (!match) return null;

    const data = JSON.parse(match[1]);
    if (!data || typeof data !== 'object' || !Array.isArray(data.categories)) {
      return null;
    }
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

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // 파일을 즉시 업로드하지 않고 미리보기만 추가
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
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
    
    setUploadedFiles(prev => [...prev, ...fileDataArray]);
    setSelectedFiles(prev => [...prev, ...files]);
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


  const handleSubmit = async (input: string, abortSignal?: AbortSignal) => {
    if ((!input.trim() && uploadedFiles.length === 0) || isProcessing) return;

    setIsProcessing(true);

    let userMessageContent = input;
    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map((file) => `[첨부파일: ${file.name}]`).join('\n');
      userMessageContent = `${input}\n\n${fileInfo}`;
    }

    // 사용자 메시지 임시 추가
    addMessage({ role: 'user', content: userMessageContent });
    // ai 메시지는 isLoading: true로 추가 (실시간 업데이트용)
    addMessage({ role: 'ai', content: '', isLoading: true });
  console.log('사용자 메시지 및 빈 AI 메시지 추가 완료', { userMessageContent }, { role: 'ai', content: '', isLoading: true });

    let currentSessionId = chatSessionId;
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
          createResponse = await createChatSession(input.slice(0, 20) || '새로운 채팅');
        } else {
          createResponse = await createGuestChatSession(input.slice(0, 20) || '새로운 채팅', userId);
        }
        if (createResponse && createResponse.statusCode === 200 && createResponse.data && createResponse.data.length > 0 && createResponse.data[0]._id) {
          currentSessionId = createResponse.data[0]._id;
          setChatSessionId(currentSessionId);
          sessionStorage.setItem('chatSessionId', currentSessionId);
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
      if (selectedFiles.length > 0) {
        const uploadResponse = await uploadFiles(selectedFiles);
        if (uploadResponse && uploadResponse.statusCode === 200 && uploadResponse.data) {
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
        } else {
          throw new Error(uploadResponse?.error?.message || '파일 업로드에 실패했습니다.');
        }
      }

      const messageContent = {
        content: input,
        file: uploadedFileNames.length > 0 ? uploadedFileNames[0] : undefined
      };

      // 사용자 메시지 전송 API 호출 및 응답에서 messageId 추출
      const userMessageResponse = await sendChatMessage(currentSessionId, {
        role: 'USER',
        content: messageContent,
        uid: userId
      });
      // Zustand 스토어에서 마지막 메시지(임시로 추가한 사용자 메시지)를 업데이트하여 messageId 추가
      updateLastMessage({
        content: userMessageContent,
        // 기존 속성들도 함께 전달해야 함
      });

      const filesForAI = filesForGemini.map(file => ({
        name: file.name,
        fileUri: file.fileUri,
        mimeType: file.mimeType,
        base64: file.base64
      }));

      const combinedPrompt = await combinePrompts(selectedPromptId, input);

      // ⭐️ 실시간 스트리밍 반영: onStream에서 마지막 ai 메시지 content 누적 업데이트
      let aiReply = '';
      let firstChunkReceived = false;
      const reply = await sendChat(combinedPrompt, filesForAI, {
        streaming: true,
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

      // 스트리밍이 끝나면 마지막 ai 메시지의 isLoading을 false로 변경
      updateLastMessage({
        content: aiReply,
        isLoading: false,
      });

      // 견적 JSON 감지 및 저장 로직은 reply 전체가 온 뒤 기존대로 처리
      const estimateData = extractEstimateData(reply);
      if (estimateData) {
        try {
          const invoiceTitle = estimateData.project_name || '새로운 견적서';
          if (!userId) throw new Error('사용자 ID를 가져올 수 없습니다.');
          ensureEstimateUuid(estimateData);
          const estimateId = estimateData.uuid;
          const intro = extractIntroFromReply(reply);
          const dataStr = buildFullEstimateData(estimateData, intro);
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
          const updatedReply =
            `<script type="application/json" id="invoiceData">${JSON.stringify(estimateData)}</script>`;
          const aiMessageResponse: ChatMessageResponseData = await sendChatMessage(currentSessionId, {
            role: 'AI',
            content: { type: 'text', value: updatedReply },
            uid: userId
          });
          const aiMessageId = aiMessageResponse?.data?._id;
          updateLastMessage({
            content: updatedReply,
            messageId: aiMessageId,
            estimateId: estimateId,
            isLoading: false,
          });
        } catch (pdfError) {
          error(`견적 저장 실패: ${(pdfError as Error).message}`);
          const aiMessageResponse: ChatMessageResponseData = await sendChatMessage(currentSessionId, {
            role: 'AI',
            content: { type: 'text', value: reply },
            uid: userId
          });
          const aiMessageId = aiMessageResponse?.data?._id;
          updateLastMessage({
            content: reply,
            messageId: aiMessageId,
            isLoading: false,
          });
        }
      } else {
        const aiMessageResponse: ChatMessageResponseData = await sendChatMessage(currentSessionId, {
          role: 'AI',
          content: { type: 'text', value: reply },
          uid: userId
        });
        const aiMessageId = aiMessageResponse?.data?._id;
        updateLastMessage({
          content: reply,
          messageId: aiMessageId,
          isLoading: false,
        });
      }

      setUploadedFiles([]);
      setSelectedFiles([]);

    } catch (e) {
      error(`메시지 전송 실패: ${(e as Error).message}`);
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