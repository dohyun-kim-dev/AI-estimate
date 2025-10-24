import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app'
import { getStorage } from 'firebase/storage'
import { devLog } from '@/utils/devLogger'

// 🔥 Gemini API Key 유효성 검증 함수 (외부에서도 사용 가능)
// Google Generative AI SDK로 검증 (useAI.ts와 동일한 방식)
export async function validateGeminiApiKey(apiKey: string): Promise<{ isValid: boolean; message: string }> {
  try {
    devLog('🔐 Gemini API Key 유효성 검증 시작...');
    
    if (!apiKey || apiKey.trim() === '') {
      return { isValid: false, message: 'API Key가 비어있습니다.' };
    }
    
    // 🔥 Google Generative AI SDK로 검증 (실제 사용 방식과 동일)
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash', // 가장 빠른 모델 사용
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10, // 검증용이므로 최소화
        }
      });
      
      // 실제 API 요청으로 검증
      const result = await model.generateContent('test');
      const text = result.response.text();
      
      devLog('✅ Gemini API Key 유효성 검증 성공:', text?.substring(0, 50));
      
      return { isValid: true, message: 'API Key가 유효합니다. ✓' };
    } catch (error: any) {
      devLog('❌ Google Generative AI SDK 검증 실패:', error);
      
      const errorMessage = error?.message || String(error);
      const errorStatus = error?.status || error?.statusCode;
      
      // 에러 타입별 처리
      if (errorStatus === 400 || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
        return { isValid: false, message: 'API Key가 유효하지 않습니다.' };
      } else if (errorStatus === 403 || errorMessage.includes('permission') || errorMessage.includes('PERMISSION_DENIED')) {
        return { isValid: false, message: 'API Key 권한이 없습니다. Generative Language API를 활성화해주세요.' };
      } else if (errorStatus === 429 || errorMessage.includes('quota') || errorMessage.includes('RATE_LIMIT')) {
        return { isValid: false, message: 'API 할당량이 초과되었습니다.' };
      } else if (errorMessage.includes('API key expired')) {
        return { isValid: false, message: 'API Key가 만료되었습니다.' };
      } else if (errorMessage.includes('blocked') || errorMessage.includes('disabled')) {
        return { isValid: false, message: 'Gemini API가 차단되었거나 비활성화되었습니다. Google AI Studio에서 확인해주세요.' };
      } else {
        // 일반적인 에러 (네트워크 등)
        return { isValid: false, message: `검증 실패: ${errorMessage.substring(0, 100)}` };
      }
    }
  } catch (error) {
    devLog('❌ Gemini API Key 검증 중 오류:', error);
    return { isValid: false, message: '검증 중 오류가 발생했습니다.' };
  }
}

// 🔥 Gemini API Key를 동적으로 가져오는 함수 (Firebase와 분리)
export async function fetchGeminiApiKey(): Promise<string> {
  try {
    devLog('🔑 Gemini API Key 동적 로드 시작...');
    
    // getCompanyInfo 함수를 동적으로 import
    const { getCompanyInfo } = await import('@/lib/api/user/userApi');
    const response = await getCompanyInfo();
    
    devLog('🔍 getCompanyInfo 응답:', response);
    
    if (response.statusCode === 200 && response.data?.geminiApiKey) {
      const apiKey = response.data.geminiApiKey;
      devLog('✅ Gemini API Key 동적 로드 성공:', apiKey.substring(0, 10) + '...');
      
      // 🔥 API Key 유효성 검증 추가
      const validationResult = await validateGeminiApiKey(apiKey);
      if (!validationResult.isValid) {
        devLog('⚠️ 동적으로 로드된 Gemini API Key가 유효하지 않음');
        throw new Error('유효하지 않은 Gemini API Key');
      }
      
      return apiKey;
    } else {
      devLog('⚠️ getCompanyInfo에서 Gemini API Key를 찾을 수 없음');
      throw new Error('Gemini API Key를 찾을 수 없음');
    }
  } catch (error) {
    devLog('❌ Gemini API Key 동적 로드 실패:', error);
    throw error;
  }
}

// 🔥 Firebase 초기화를 비동기로 처리
let app: any = null;
let storage: any = null;
let initPromise: Promise<void> | null = null;

async function initializeFirebase() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    devLog('>>>> Firebase Config: Attempting initialization...');
    
    // 🔥 Firebase 초기화는 환경변수 사용 (고정)
    // Gemini API Key는 별도로 관리 (fetchGeminiApiKey 함수 사용)
    const firebaseConfig: FirebaseOptions = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    
    devLog('🔧 최종 Firebase Config:', {
      apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : '설정되지 않음',
      authDomain: firebaseConfig.authDomain ? '설정됨' : '설정되지 않음',
      projectId: firebaseConfig.projectId ? '설정됨' : '설정되지 않음',
      storageBucket: firebaseConfig.storageBucket ? '설정됨' : '설정되지 않음',
      messagingSenderId: firebaseConfig.messagingSenderId ? '설정됨' : '설정되지 않음',
      appId: firebaseConfig.appId ? '설정됨' : '설정되지 않음',
    });

    // Firebase 초기화 전에 필수 설정값 확인
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      devLog('❌ Firebase 환경 변수 누락됨:', missingKeys);
    } else {
      devLog('✅ 모든 Firebase 환경 변수가 정상적으로 설정됨');
    }

    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        devLog('>>>> Firebase Config: Initialized successfully:', app.name);
      } catch (error) {
        devLog('>>>> Firebase Config: Error during initializeApp:', error);
        throw error;
      }
    } else {
      app = getApp();
      devLog('>>>> Firebase Config: App already exists, getting app:', app.name);
    }

    storage = app ? getStorage(app) : null;
  })();
  
  return initPromise;
}

// 🔥 앱 시작 시 Firebase 초기화
initializeFirebase().catch(error => {
  console.error('Firebase 초기화 실패:', error);
});

// 🔥 Firebase가 초기화될 때까지 기다리는 헬퍼 함수
export async function ensureFirebaseInitialized() {
  await initializeFirebase();
  return { app, storage };
}

export { app, storage }