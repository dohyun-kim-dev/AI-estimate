import { pageLoaderController } from '@/contexts/PageLoaderContext'
import { devLog, devWarn } from '../utils/devLogger'

// API 경로 생성 함수
const createApiUrl = (endpoint: string) => {
  // 앞쪽 슬래시 보장
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  // /api로 시작하지 않는 경우 추가
  const apiPath = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`
  
  // 개발 환경에서는 상대 경로 사용 (프록시를 통해 요청)
  if (import.meta.env.DEV) {
    console.log('Development API Request:', apiPath)
    return apiPath
  }
  
  // 프로덕션 환경에서는 전체 URL 사용
  const API_HOST = (import.meta.env.VITE_PUBLIC_API_HOST || 'http://121.157.229.40:8535').replace(/\/$/, '')
  const fullUrl = `${API_HOST}${apiPath}`
  console.log('Production API Request:', fullUrl)
  return fullUrl
}

interface CallApiPostParams {
  title: string
  endpoint: string // url 대신 endpoint를 받도록 변경
  body?: Record<string, unknown>
  isCallPageLoader?: boolean
}

export async function callApiPost<T = unknown>({
  title,
  endpoint,
  body = {},
  isCallPageLoader = false,
}: CallApiPostParams): Promise<T> {
  const url = createApiUrl(endpoint)
  devLog(`📱 [${title}]`, url, body)
  if (isCallPageLoader) pageLoaderController.open()

  let returnValue = ''

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    // 쿠키 인증으로 변경 - 액세스 토큰 제거
    // if (accessToken) {
    //   headers['Authorization'] = `Bearer ${accessToken}`
    // }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include', // 쿠키를 포함하기 위해 추가
      mode: 'cors', // CORS 모드 명시적 설정
    })

    returnValue = await response.text()
    devLog(`📱 [${title}] 응답`, returnValue)
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러`, error)
    returnValue = '[]'
  } finally {
    if (isCallPageLoader) pageLoaderController.close()
  }

  try {
    return JSON.parse(returnValue)
  } catch (e) {
    devWarn(`⚠️ [${title}] JSON 파싱 실패`, e)
    return [] as T
  }
}

