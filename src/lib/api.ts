import { pageLoaderController } from '@/contexts/PageLoaderContext'
import { devLog, devWarn } from '../utils/devLogger'
import { getCompanyCodeFromUrl } from '../utils/companyUtils'

// API 경로 생성 함수
const createApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const apiPath = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`
  
  if (import.meta.env.DEV) {
    devLog('Development API Request:', apiPath)
    return apiPath
  }
  
  const API_HOST = (import.meta.env.VITE_PUBLIC_API_HOST || 'http://121.157.229.40:8535').replace(/\/$/, '')
  const fullUrl = `${API_HOST}${apiPath}`
  devLog('Production API Request:', fullUrl)
  return fullUrl
}

// ⭐️ headers를 매개변수에 추가
interface CallApiPostParams {
  title: string
  endpoint: string
  body?: Record<string, unknown>
  isCallPageLoader?: boolean
  headers?: Headers | Record<string, string> // ⭐️ headers 매개변수 추가
}

export async function callApiPost<T = unknown>({
  title,
  endpoint,
  body = {},
  isCallPageLoader = false,
  headers = {}, // ⭐️ 기본값 설정
}: CallApiPostParams): Promise<T> {
  const url = createApiUrl(endpoint)
  devLog(`📱 [${title}]`, url, body)
  if (isCallPageLoader) pageLoaderController.open()

  let returnValue = ''

  try {
    // ⭐️ URL에서 company code 동적 추출 후 기존 headers 객체와 병합
    const companyCode = getCompanyCodeFromUrl()
    const mergedHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-company-code': companyCode, 
      ...headers, 
    }

    devLog(`📱 [${title}] Company Code:`, companyCode)

    const response = await fetch(url, {
      method: 'POST',
      headers: mergedHeaders,
      body: JSON.stringify(body),
      credentials: 'include',
      mode: 'cors',
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