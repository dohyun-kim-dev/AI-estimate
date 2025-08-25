export declare enum ApiLoginStatus {
    Success = "success",
    NoUser = "no user",
    PasswordIncorrect = "password is incorrect",
    DisabledUser = "disabled user",
    NoData = "no data",
    Unknown = "unknown"
}
export declare function getLoginStatus(message: string): ApiLoginStatus;
