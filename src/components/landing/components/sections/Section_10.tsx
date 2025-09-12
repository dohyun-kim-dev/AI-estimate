import { planDetails } from "../../utils/constants";
import PlanAccordion from "../common/PlanAccordion";

export default function Section_10() {
  return (
    <section
      id="pricing"
      className="flex w-full flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#ECEFFE] px-[16px] py-[25px] sm:pt-[50px] sm:pb-[80px]"
    >
      <div className="flex w-full max-w-[960px] flex-col items-center">
        <h2 className="text-mobile-28b-emphasis-title sm:text-pc-32b-emphasis-title self-start sm:self-center sm:text-center">
          <span className="text-on-bg-a-9 sm:text-on-surface-a-5 sm:text-pc-20sb-body">
            맞춤 요금제
          </span>

          <span className="mt-2 block sm:mt-4">최적의 요금제를 골라보세요</span>
        </h2>
        <div className="mt-[60px] flex w-full flex-col gap-[24px] sm:flex-row sm:gap-[20px]">
          {planDetails.map((plan, index) => (
            <PlanAccordion {...plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
