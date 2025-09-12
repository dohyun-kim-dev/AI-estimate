import Chat_1 from "../Chat_1";
import Chat_2 from "../Chat_2";
import Chat_3 from "../Chat_3";
import Chat_4 from "../Chat_4";
import { useState } from "react";
import IndustryTabs from "../IndustryTabs";

export default function Section_8() {
  const [selectedOption, setSelectedOption] = useState("option_1");

  return (
    <section
      id="scenario"
      className="flex h-full w-full flex-col items-center pt-[40px] lg:py-[100px]"
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center">
        <h2 className="text-mobile-28b-emphasis-title text-on-bg-a-1 sm:text-pc-32b-emphasis-title mx-[16px] mb-[60px] self-start sm:mb-[80px] sm:self-center sm:text-center">
          <span className="text-on-bg-a-4 sm:text-pc-20sb-body">시나리오</span>

          <span className="mt-2 block sm:mt-4">산업군 별 에이고 활용 예시</span>
        </h2>
        <IndustryTabs
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          roundedSide="up"
        />
        {selectedOption === "option_1" && <Chat_1 />}
        {selectedOption === "option_2" && <Chat_2 />}
        {selectedOption === "option_3" && <Chat_3 />}
        {selectedOption === "option_4" && <Chat_4 />}
        <IndustryTabs
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          roundedSide="down"
        />
      </div>
    </section>
  );
}
