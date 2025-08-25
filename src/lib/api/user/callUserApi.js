import { callApiPost } from '@/lib/methods/callApiPost';
import { callApiGet } from '@/lib/methods/callApiGet';
import { callApiPut } from '@/lib/methods/callApiPut';
import { callApiPatch } from '@/lib/methods/callApiPatch';
import { callApiDelete } from '@/lib/methods/callApiDelete';
export async function callUserApi({ title, url, method = 'POST', // 기본 메서드를 GET으로 변경하거나
body, isCallPageLoader = false, }) {
    let response;
    // 'method' 값에 따라 다른 API 호출 함수를 사용
    if (method === 'GET') {
        response = await callApiGet({
            title,
            url,
            isCallPageLoader,
        });
    }
    else if (method === 'PUT') {
        response = await callApiPut({
            title,
            url,
            body,
            isCallPageLoader,
        });
    }
    else if (method === 'PATCH') {
        response = await callApiPatch({
            title,
            url,
            body,
            isCallPageLoader,
        });
    }
    else if (method === 'DELETE') {
        response = await callApiDelete({
            title,
            url,
            isCallPageLoader,
        });
    }
    else {
        // 기본적으로 POST를 사용
        response = await callApiPost({
            title,
            url,
            body,
            isCallPageLoader,
        });
    }
    // 401 에러 처리 (기존 로직 유지)
    if (response.statusCode === 401) {
        return response;
    }
    return response;
}
