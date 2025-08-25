export declare enum ApiStatus {
    Success = "success",
    Fail = "fail",
    NoData = "no data",
    Unknown = "unknown"
}
export declare function getApiStatus(message: string): ApiStatus;
