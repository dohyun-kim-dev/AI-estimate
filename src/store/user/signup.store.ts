import { create } from "zustand";

type Steps = "userInfo" | "phoneVerify" | "membership" | "success";

interface signupState {
  step: Steps;
  setStep: (step: Steps) => void;
  name: string;
  email: string;
  cellphone: { prefix: string; phone: string };
  authNum: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setCellphone: (cellphone: { prefix?: string; phone?: string }) => void;
  setAuthNum: (authNum: string) => void;
  resetStore: () => void; // 스토어 초기화 함수 추가
}

const useSignupStore = create<signupState>((set) => ({
  step: "phoneVerify",
  name: "",
  email: "",
  cellphone: { prefix: "", phone: "" },
  authNum: "",
  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setCellphone: (cellphone) =>
    set((state) => ({
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
