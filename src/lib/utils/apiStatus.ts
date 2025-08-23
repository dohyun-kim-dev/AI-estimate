export enum ApiStatus {
    Success = 'success',
    Fail = 'fail',
    NoData = 'no data',
    Unknown = 'unknown',
  }
  
  export function getApiStatus(message: string): ApiStatus {
    switch (message) {
      case 'success':
        return ApiStatus.Success;
      case 'fail':
        return ApiStatus.Fail;
      case 'no data':
        return ApiStatus.NoData;
      default:
        return ApiStatus.Unknown;
    }
  }
  