export var ApiStatus;
(function (ApiStatus) {
    ApiStatus["Success"] = "success";
    ApiStatus["Fail"] = "fail";
    ApiStatus["NoData"] = "no data";
    ApiStatus["Unknown"] = "unknown";
})(ApiStatus || (ApiStatus = {}));
export function getApiStatus(message) {
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
