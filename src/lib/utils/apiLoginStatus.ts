export enum ApiLoginStatus {
    Success = 'success',
    NoUser = 'no user',
    PasswordIncorrect = 'password is incorrect',
    DisabledUser = 'disabled user',
    NoData = 'no data',
    Unknown = 'unknown',
  }
  
  export function getLoginStatus(message: string): ApiLoginStatus {
    switch (message) {
      case 'success':
        return ApiLoginStatus.Success;
      case 'no user':
        return ApiLoginStatus.NoUser;
      case 'password is incorrect':
        return ApiLoginStatus.PasswordIncorrect;
      case 'disabled user':
        return ApiLoginStatus.DisabledUser;
      case 'no data':
        return ApiLoginStatus.NoData;
      default:
        return ApiLoginStatus.Unknown;
    }
  }
  