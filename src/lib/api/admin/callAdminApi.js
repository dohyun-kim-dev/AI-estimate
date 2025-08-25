import { callApiPost } from '@/lib/methods/callApiPost';
import { callApiGet } from '@/lib/methods/callApiGet';
import { callApiPut } from '@/lib/methods/callApiPut';
import { callApiPatch } from '@/lib/methods/callApiPatch';
import { callApiDelete } from '@/lib/methods/callApiDelete';
import { callNullCheck } from '@/lib/utils/nullChecker';
import { triggerAdminLogout } from '@/contexts/AdminAuthContext';
export async function callAdminApi({ title, url, body, method = 'POST', isCallPageLoader = false, }) {
    let raw;
    // 'method' 값에 따라 다른 API 호출 함수를 사용
    if (method === 'GET') {
        raw = await callApiGet({
            title,
            url,
            isCallPageLoader,
        });
    }
    else if (method === 'PUT') {
        raw = await callApiPut({
            title,
            url,
            body,
            isCallPageLoader,
        });
    }
    else if (method === 'PATCH') {
        raw = await callApiPatch({
            title,
            url,
            body,
            isCallPageLoader,
        });
    }
    else if (method === 'DELETE') {
        raw = await callApiDelete({
            title,
            url,
            isCallPageLoader,
        });
    }
    else {
        // 기본적으로 POST를 사용
        raw = await callApiPost({
            title,
            url,
            body,
            isCallPageLoader,
        });
    }
    // API 응답을 배열로 변환
    const responseArray = Array.isArray(raw) ? raw : [raw];
    // 401 에러 감지 (쿠키 인증에서도 유지)
    if (responseArray[0]?.statusCode === 401 &&
        (responseArray[0]?.message === 'token is invalid' || responseArray[0]?.message === 'Unauthorized')) {
        triggerAdminLogout();
        return [];
    }
    // 응답이 배열이 아닌 경우 배열로 변환하여 처리
    return callNullCheck(responseArray);
}
