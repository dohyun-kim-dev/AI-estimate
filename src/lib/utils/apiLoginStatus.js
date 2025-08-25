export var ApiLoginStatus;
(function (ApiLoginStatus) {
    ApiLoginStatus["Success"] = "success";
    ApiLoginStatus["NoUser"] = "no user";
    ApiLoginStatus["PasswordIncorrect"] = "password is incorrect";
    ApiLoginStatus["DisabledUser"] = "disabled user";
    ApiLoginStatus["NoData"] = "no data";
    ApiLoginStatus["Unknown"] = "unknown";
})(ApiLoginStatus || (ApiLoginStatus = {}));
export function getLoginStatus(message) {
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
