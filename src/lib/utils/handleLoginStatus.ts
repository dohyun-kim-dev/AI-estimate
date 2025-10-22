import { ApiLoginStatus } from '@lib/utils/apiLoginStatus';

type HandleLoginStatusProps = {
  status: ApiLoginStatus;
  message: string;
  customMessage?: string;
  onSuccess: () => void;
  onFail?: () => void;
  showMessage?: (msg: string) => void;
};

export function handleLoginStatus({
  status,
  message,
  customMessage,
  onSuccess,
  onFail,
  showMessage = (msg) => alert(msg),
}: HandleLoginStatusProps) {
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
    case ApiLoginStatus.Forbidden:
      onFail?.();
      showMessage(customMessage || '관리자 권한이 없습니다.');
      break;
    case ApiLoginStatus.Unknown:
      onFail?.();
      showMessage(customMessage || `알 수 없는 오류: ${message}`);
      break;
  }
}
