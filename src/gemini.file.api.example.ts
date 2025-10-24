// 🔥 Gemini File API를 사용한 파일 업로드 (Firebase Storage 대체)

import { GoogleGenerativeAI, GoogleAIFileManager } from '@google/generative-ai';

export interface FileUploadData {
  name: string;
  fileUri: string;
  mimeType: string;
  size?: number;
}

export interface UploadOptions {
  onUpload: (data: FileUploadData) => void;
  progress?: (progress: number) => void;
}

/**
 * Gemini File API를 사용하여 파일 업로드
 * 
 * 장점:
 * - ✅ Firebase Storage 불필요 (완전 제거 가능)
 * - ✅ 타사 Gemini API Key로 과금 분리
 * - ✅ AI가 직접 파일 접근 가능 (다운로드 URL 불필요)
 * 
 * 단점:
 * - ❌ 48시간 후 자동 삭제 (영구 저장 불가)
 * - ❌ 20GB 제한
 */
export async function uploadFileWithGemini(
  file: File,
  apiKey: string,
  { onUpload, progress }: UploadOptions
): Promise<void> {
  try {
    const fileManager = new GoogleAIFileManager(apiKey);
    
    // 파일 업로드 (Gemini File API)
    const uploadResponse = await fileManager.uploadFile(file.name, {
      mimeType: file.type,
      displayName: file.name,
    });
    
    devLog('✅ Gemini File API 업로드 성공:', uploadResponse.file.uri);
    
    // 진행률 100% 설정
    if (progress) progress(100);
    
    // 업로드 완료 콜백
    onUpload({
      name: uploadResponse.file.name,
      fileUri: uploadResponse.file.uri, // gs://generativelanguage-download/...
      mimeType: uploadResponse.file.mimeType,
      size: file.size,
    });
  } catch (error) {
    console.error('Gemini File API 업로드 실패:', error);
    throw error;
  }
}

/**
 * Gemini AI에서 파일 사용 예시
 */
export async function generateWithFile(
  apiKey: string,
  fileUri: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: 'image/jpeg',
        fileUri: fileUri, // Gemini File API에서 받은 URI
      },
    },
    { text: prompt },
  ]);
  
  return result.response.text();
}

/**
 * 파일 삭제 (48시간 전 수동 삭제 가능)
 */
export async function deleteFileFromGemini(
  apiKey: string,
  fileName: string
): Promise<void> {
  const fileManager = new GoogleAIFileManager(apiKey);
  await fileManager.deleteFile(fileName);
  devLog('✅ Gemini File API 파일 삭제:', fileName);
}

/**
 * 파일 목록 조회
 */
export async function listFilesFromGemini(apiKey: string): Promise<any[]> {
  const fileManager = new GoogleAIFileManager(apiKey);
  const listFilesResponse = await fileManager.listFiles();
  return listFilesResponse.files;
}

/**
 * 🎯 사용 예시
 */
/*
// 1. 파일 업로드
await uploadFileWithGemini(file, apiKey, {
  onUpload: (data) => {
    console.log('업로드 완료:', data.fileUri);
  },
  progress: (percent) => {
    console.log(`업로드 ${percent}% 완료`);
  },
});

// 2. AI에서 파일 사용
const response = await generateWithFile(
  apiKey,
  'gs://generativelanguage-download/xxx',
  '이 이미지를 분석해주세요'
);

// 3. 파일 삭제 (선택)
await deleteFileFromGemini(apiKey, 'files/xxx');
*/
