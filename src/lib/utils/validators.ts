// src/utils/validators.ts

export const Validators = {
    // 아이디: 영문+숫자 포함 6~20자
    id: (value: string): boolean => {
      return /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{6,20}$/.test(value);
    },
  
    // 비밀번호: 영문+숫자+특수문자 포함 8자 이상
    password: (value: string): boolean => {
      return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?~^<>,.&+=])[A-Za-z\d$@$!%*#?~^<>,.&+=]{8,}$/.test(value);
    },
  
    // 비밀번호 일치 여부
    match: (value: string, compare: string): boolean => {
      return value === compare;
    },
  
    // 이메일 형식
    email: (value: string): boolean => {
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    },
  
    // 전화번호: 11자리 숫자만 (01012345678)
    phone: (value: string): boolean => {
      return /^\d{11}$/.test(value);
    },
  
    // 공백 검사
    required: (value: string): boolean => {
      return value.trim() !== '';
    },
  };
  