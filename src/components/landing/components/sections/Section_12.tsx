import { useState } from "react";
import { faqItems } from "../../utils/constants";
import FAQAccordion from "../common/FAQAccordion";

export default function Section_12() {
  const [isToggled, setIsToggled] = useState(false);

  const questions = isToggled ? faqItems : faqItems.slice(0, 3);

  return (
    <section
      id="faq"
      className="flex w-full flex-col items-center px-[16px] py-[25px] sm:py-[80px]"
    >
      <div className="flex w-full max-w-[960px] flex-col items-center">
        <h2 className="text-mobile-28b-emphasis-title sm:text-pc-32b-emphasis-title block self-start sm:self-center sm:text-center">
          <span className="text-on-bg-a-9 sm:text-on-surface-a-5 sm:text-pc-20sb-body">
            FAQ
          </span>
          <span className="mt-2 block sm:mt-4">자주 묻는 질문</span>
        </h2>
        <div className="mt-[60px] w-full sm:mt-[80px]">
          {questions.map(
            (
              item: { id: number; question: string; answer: string },
              index: number,
            ) => (
              <FAQAccordion
                key={item.id}
                id={item.id}
                question={item.question}
                answer={item.answer}
                initialOpen={index < 3}
              />
            ),
          )}
        </div>
        <div
          onClick={() => {
            setIsToggled((prev) => !prev);
          }}
          className="mt-[16px] flex flex-row items-center gap-1 hover:cursor-pointer sm:mt-[40px]"
        >
          <p className="text-mobile-14m-subtext text-on-surface-b-3">
            {isToggled ? "접기" : "더보기"}
          </p>
          <img
            src={`${isToggled ? "/images/chevron_arrow_up.svg" : "/images/chevron_arrow_down.svg"}`}
          />
        </div>
      </div>
    </section>
  );
}
