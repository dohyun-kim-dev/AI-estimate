import { ApiLoginStatus } from '@lib/utils/apiLoginStatus';
export function handleLoginStatus({ status, message, onSuccess, onFail, showMessage = (msg) => alert(msg), }) {
    switch (status) {
        case ApiLoginStatus.Success:
            onSuccess();
            break;
        case ApiLoginStatus.NoUser:
            onFail?.();
            showMessage('가입된 회원 정보가 없습니다');
            break;
        case ApiLoginStatus.PasswordIncorrect:
            onFail?.();
            showMessage('비밀번호가 일치하지 않습니다');
            break;
        case ApiLoginStatus.DisabledUser:
            onFail?.();
            showMessage('탈퇴한 회원입니다. 재가입이 필요합니다.');
            break;
        case ApiLoginStatus.NoData:
            onFail?.();
            showMessage('데이터가 없습니다');
            break;
        case ApiLoginStatus.Unknown:
            onFail?.();
            showMessage(`알 수 없는 오류: ${message}`);
            break;
    }
}
