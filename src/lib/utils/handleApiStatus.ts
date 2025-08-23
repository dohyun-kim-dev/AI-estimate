import { ApiStatus } from '@lib/utils/apiStatus';

type HandleApiStatusProps = {
  status: ApiStatus;
  customMessageIfAny: string;
  onSuccess: () => void;
  onFail?: () => void;
  onNoData?: () => void;
  onUnknown?: () => void;
  customUI?: (message: string) => void;
};

export function handleApiStatus({
  status,
  customMessageIfAny,
  onSuccess,
  onFail,
  onNoData,
  onUnknown,
  customUI,
}: HandleApiStatusProps) {
  const showMessage = (message: string) => {
    if (customUI) {
      customUI(message);
    } else {
      alert(message); // 기본 fallback, toast 등으로 변경 가능
    }
  };

  switch (status) {
    case ApiStatus.Success:
      onSuccess();
      break;
    case ApiStatus.Fail:
      onFail?.();
      showMessage('요청에 실패했습니다');
      break;
    case ApiStatus.NoData:
      onNoData?.();
      showMessage('데이터가 없습니다');
      break;
    case ApiStatus.Unknown:
        onUnknown?.();
      showMessage(customMessageIfAny);
      break;
  }
}
