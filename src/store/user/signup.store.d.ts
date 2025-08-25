type Steps = "userInfo" | "phoneVerify" | "membership" | "success";
interface signupState {
    step: Steps;
    setStep: (step: Steps) => void;
    name: string;
    email: string;
    cellphone: {
        prefix: string;
        phone: string;
    };
    authNum: string;
    setName: (name: string) => void;
    setEmail: (email: string) => void;
    setCellphone: (cellphone: {
        prefix?: string;
        phone?: string;
    }) => void;
    setAuthNum: (authNum: string) => void;
    resetStore: () => void;
}
declare const useSignupStore: import("zustand").UseBoundStore<import("zustand").StoreApi<signupState>>;
export default useSignupStore;
