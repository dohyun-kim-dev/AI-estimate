import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAI } from 'firebase/ai'
import { devLog } from '@/utils/devLogger'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 환경 변수가 제대로 로드되었는지 확인
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '설정됨' : '설정되지 않음',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '설정됨' : '설정되지 않음',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '설정됨' : '설정되지 않음',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '설정됨' : '설정되지 않음',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '설정됨' : '설정되지 않음',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '설정됨' : '설정되지 않음',
})

let app
devLog('>>>> Firebase Config: Attempting initialization...')

// Firebase 초기화 전에 필수 설정값 확인
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0) {
  console.error("❌ Firebase 환경 변수 누락됨:", missingKeys)
} else {
  console.log("✅ 모든 Firebase 환경 변수가 정상적으로 설정됨")
}

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig)
    devLog('>>>> Firebase Config: Initialized successfully:', app.name)
  } catch (error) {
    console.error('>>>> Firebase Config: Error during initializeApp:', error)
    throw error
  }
} else {
  app = getApp()
  devLog('>>>> Firebase Config: App already exists, getting app:', app.name)
}

const auth = getAuth(app)
const db = app ? getFirestore(app) : null
const storage = app ? getStorage(app) : null
const ai = app ? getAI(app) : null

export { app, auth, db, storage, ai }