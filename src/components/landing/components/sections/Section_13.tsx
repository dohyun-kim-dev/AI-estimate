import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormData {
  name: string;
  companyName: string;
  cellphone: string;
  email: string;
  memo: string;
}

interface FormErrors {
  name?: string;
  companyName?: string;
  cellphone?: string;
  email?: string;
  memo?: string;
}

export default function Section_13() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    companyName: "",
    cellphone: "",
    email: "",
    memo: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isToggled, setIsToggled] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "회사명을 입력해주세요.";
    }

    if (!formData.cellphone.trim()) {
      newErrors.cellphone = "전화번호를 입력해주세요.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일 주소를 입력해주세요.";
    }

    if (!formData.memo.trim()) {
      newErrors.memo = "문의사항을 입력해주세요.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed", errors);
      return;
    }

    if (!isToggled) {
      alert("개인정보 수집동의를 체크해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/inquiry`;
      console.log("API URL:", apiUrl);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          companyName: formData.companyName,
          email: formData.email,
          cellphone: formData.cellphone,
          memo: formData.memo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Form submission successful:", result);

      setFormData({
        name: "",
        companyName: "",
        cellphone: "",
        email: "",
        memo: "",
      });
      setIsToggled(false);
      navigate("/completed");
    } catch (error) {
      console.error("Form submission error:", error);
      alert("문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="flex w-full flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#ECEFFE] px-[16px] py-[25px] sm:py-[80px]"
    >
      <div className="flex w-full max-w-[960px] flex-col items-center rounded-[20px] sm:bg-white/5 sm:p-[40px] sm:shadow-2xl">
        <h2 className="text-mobile-28b-emphasis-title sm:text-pc-32b-emphasis-title block self-start sm:hidden sm:self-center sm:text-center">
          <span className="text-on-bg-a-9 sm:text-on-surface-a-5 sm:text-pc-20sb-body">
            고객 문의
          </span>
          <span className="mt-2 block sm:mt-4">AIGO에게 궁금하신 점을</span>
          <span className="mt-2 block sm:mt-4">적어주세요</span>
        </h2>
        <div className="flex w-full sm:flex-row">
          <div className="mr-[24px] hidden flex-col sm:flex sm:flex-[2]">
            <p className="text-on-surface-c-5 text-pc-20sb-body">고객 문의</p>
            <p className="text-pc-32b-emphasis-title text-on-surface-c-6">
              AIGO에게
            </p>
            <p className="text-pc-32b-emphasis-title text-on-surface-c-6">
              궁금하신 점을 적어주세요
            </p>
          </div>
          <form
            id="contact-form"
            className="mt-[60px] flex w-full flex-col sm:mt-[0] sm:flex-[3]"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="space-y-[26px]">
              <div>
                <label
                  htmlFor="name"
                  className="text-mobile-16sb-body text-on-bg-e-1 mb-2 block"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력해주세요."
                  className={`bg-input placeholder:text-on-input-3 w-full rounded-lg border px-4 py-3 transition-colors outline-none ${
                    errors.name ? "border-on-input-5" : "border-transparent"
                  }`}
                />
                {errors.name && (
                  <p className="text-on-input-5 text-mobile-14m-subtext mt-2 ml-4">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="text-mobile-16sb-body text-on-bg-e-1 mb-2 block"
                >
                  회사명
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="회사명을 입력해주세요."
                  className={`bg-input placeholder:text-on-input-3 w-full rounded-lg border px-4 py-3 transition-colors outline-none ${
                    errors.companyName
                      ? "border-on-input-5"
                      : "border-transparent"
                  }`}
                  required
                />
                {errors.companyName && (
                  <p className="text-on-input-5 text-mobile-14m-subtext mt-2 ml-4">
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="cellphone"
                  className="text-mobile-16sb-body text-on-bg-e-1 mb-2 block"
                >
                  전화번호
                </label>
                <input
                  type="tel"
                  id="cellphone"
                  name="cellphone"
                  value={formData.cellphone}
                  onChange={handleInputChange}
                  placeholder="전화번호를 입력해주세요."
                  className={`bg-input placeholder:text-on-input-3 w-full rounded-lg border px-4 py-3 transition-colors outline-none ${
                    errors.cellphone
                      ? "border-on-input-5"
                      : "border-transparent"
                  }`}
                  required
                />
                {errors.cellphone && (
                  <p className="text-on-input-5 text-mobile-14m-subtext mt-2 ml-4">
                    {errors.cellphone}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="text-mobile-16sb-body text-on-bg-e-1 mb-2 block"
                >
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="이메일 주소를 입력해주세요."
                  className={`bg-input placeholder:text-on-input-3 w-full rounded-lg border px-4 py-3 transition-colors outline-none ${
                    errors.email ? "border-on-input-5" : "border-transparent"
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-on-input-5 text-mobile-14m-subtext mt-2 ml-4">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="memo"
                  className="text-mobile-16sb-body text-on-bg-e-1 mb-2 block"
                >
                  문의사항
                </label>
                <textarea
                  id="memo"
                  name="memo"
                  rows={6}
                  value={formData.memo}
                  onChange={handleInputChange}
                  placeholder="문의사항을 적어주세요."
                  className={`bg-input placeholder:text-on-input-3 w-full resize-none rounded-lg border px-4 py-3 transition-colors outline-none ${
                    errors.memo ? "border-on-input-5" : "border-transparent"
                  }`}
                  required
                />
                {errors.memo && (
                  <p className="text-on-input-5 text-mobile-14m-subtext mt-2 ml-4">
                    {errors.memo}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-[26px] flex w-full flex-row justify-between">
              <div
                className="flex flex-row gap-[8px] hover:cursor-pointer"
                onClick={() => {
                  setIsToggled((prev) => !prev);
                }}
              >
                <img
                  src={`/images/${isToggled ? "active" : "default"}_checkbox.svg`}
                />
                <p className="text-mobile-14m-subtext text-on-bg-e-2">
                  개인정보 수집 동의
                </p>
              </div>
              <p className="text-mobile-14m-subtext text-on-bg-e-2 underline underline-offset-4">
                전문보기
              </p>
            </div>
          </form>
        </div>
        <p className="text-mobile-14m-subtext text-on-bg-e-2 sm:text-on-bg-e-4 mt-[24px] text-center sm:mt-[40px]">
          *영업일 기준 24시간 이내 답변드리겠습니다
        </p>
        <button
          type="submit"
          form="contact-form"
          disabled={isSubmitting}
          className={`mt-[8px] w-full rounded-[16px] px-6 py-[12px] font-semibold text-white transition-colors sm:mt-[20px] ${
            isSubmitting
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[linear-gradient(to_right,#7393FF_0%,#1A1FFF_50%,#1A1FFF_100%)]"
          }`}
        >
          {isSubmitting ? "전송 중..." : "가입 문의하기 →"}
        </button>
      </div>
    </section>
  );
}
