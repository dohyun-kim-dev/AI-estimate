import { create } from "zustand";
const useSignupStore = create((set) => ({
    step: "phoneVerify",
    name: "",
    email: "",
    cellphone: { prefix: "", phone: "" },
    authNum: "",
    setStep: (step) => set({ step }),
    setName: (name) => set({ name }),
    setEmail: (email) => set({ email }),
    setCellphone: (cellphone) => set((state) => ({
        cellphone: {
            ...state.cellphone,
            ...cellphone,
        },
    })),
    setAuthNum: (authNum) => set({ authNum }),
    // 스토어를 초기 상태로 리셋하는 함수
    resetStore: () => set({
        step: "phoneVerify",
        name: "",
        email: "",
        cellphone: { prefix: "", phone: "" },
        authNum: "",
    }),
}));
export default useSignupStore;
