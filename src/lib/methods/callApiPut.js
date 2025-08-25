import { devLog } from '@/lib/utils/devLogger';
export async function callApiPut({ title, url, body, isCallPageLoader = false, }) {
    try {
        // 로더 표시 로직 (isCallPageLoader가 true일 경우)
        if (isCallPageLoader) {
            // 로더를 보여주는 함수 호출
        }
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        devLog(`✨ ${title} 응답`, data);
        // 로더 숨김
        if (isCallPageLoader) {
            // 로더를 숨기는 함수 호출
        }
        return data;
    }
    catch (error) {
        console.error(`❌ ${title} 오류:`, error);
        if (isCallPageLoader) {
            // 로더를 숨기는 함수 호출
        }
        throw error;
    }
}
