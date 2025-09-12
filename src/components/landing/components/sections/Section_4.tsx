import { useState } from "react";
import GridCard from "../common/GridCard";
import { gridOptions } from "../../utils/constants";

export default function Section_4() {
  const [selectedOption, setSelectedOption] = useState(0);

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
  };

  const rowOne = gridOptions.slice(0, 3);
  const rowTwo = gridOptions.slice(3, 6);
  const rowThree = gridOptions.slice(6, 9);

  return (
    <section
      id="report"
      className="bg-bg-c flex w-full flex-col items-center overflow-x-hidden py-[25px] sm:bg-white sm:px-[120px] sm:py-[100px]"
    >
      <div className="sm:bg-surface-a rounded-[20px] sm:w-[960px] sm:p-[40px]">
        <h2 className="text-mobile-14m-subtext text-bg-c-5 text-center">
          비즈니스 맞춤 분석 <br />
          <span className="text-mobile-28b-emphasis-title text-bg-c-2">
            24시간 영업 리포트
          </span>
        </h2>
        <p className="text-mobile-14m-subtext text-on-surface-b-4 mt-[50px] text-center sm:mt-[80px]">
          *매일 이메일로 발송되는 AI 리포트로 유입 트래픽 분석
        </p>
        <div className="flex flex-col items-center justify-center sm:flex-row sm:gap-[30px]">
          {/* Desktop Graphic */}
          <img
            src={`/images/pc_graphic_${selectedOption + 1}.svg`}
            className="mt-[24px] hidden h-[324px] w-auto sm:block"
          />
          <div className="flex flex-col">
            <div className="mt-8 mb-[12px] flex flex-row justify-center sm:gap-[24px]">
              {rowOne.map((option) => (
                <GridCard
                  key={option.index}
                  iconUrl={option.image}
                  label={option.label}
                  isActive={selectedOption === option.index}
                  onClick={() => handleOptionClick(option.index)}
                />
              ))}
            </div>
            {/* Mobile Graphic */}
            <img
              src="/images/graphic_1.svg"
              className={
                selectedOption === 0 ? "block sm:hidden" : "hidden sm:hidden"
              }
            />
            <img
              src="/images/graphic_2.svg"
              className={
                selectedOption === 1 ? "block sm:hidden" : "hidden sm:hidden"
              }
            />
            <img
              src="/images/graphic_3.svg"
              className={
                selectedOption === 2 ? "block sm:hidden" : "hidden sm:hidden"
              }
            />
            <div className="mt-[12px] mb-[12px] flex flex-row justify-center sm:gap-[24px]">
              {rowTwo.map((option) => (
                <GridCard
                  key={option.index}
                  iconUrl={option.image}
                  label={option.label}
                  isActive={selectedOption === option.index}
                  onClick={() => handleOptionClick(option.index)}
                />
              ))}
            </div>
            {/* Mobile Graphic */}
            <img
              src="/images/graphic_4.svg"
              className={`sm:hidden ${selectedOption === 3 ? "block" : "hidden"}`}
            />
            <img
              src="/images/graphic_5.svg"
              className={`sm:hidden ${selectedOption === 4 ? "block" : "hidden"}`}
            />
            <img
              src="/images/graphic_6.svg"
              className={`sm:hidden ${selectedOption === 5 ? "block" : "hidden"}`}
            />
            <div className="mt-[12px] mb-[12px] flex flex-row justify-center sm:gap-[24px]">
              {rowThree.map((option) => (
                <GridCard
                  key={option.index}
                  iconUrl={option.image}
                  label={option.label}
                  isActive={selectedOption === option.index}
                  onClick={() => handleOptionClick(option.index)}
                />
              ))}
            </div>
            {/* Mobile Graphic */}
            <img
              src="/images/graphic_7.svg"
              className={`sm:hidden ${selectedOption === 6 ? "block" : "hidden"}`}
            />
            <img
              src="/images/graphic_8.svg"
              className={`sm:hidden ${selectedOption === 7 ? "block" : "hidden"}`}
            />
            <img
              src="/images/graphic_9.svg"
              className={`sm:hidden ${selectedOption === 8 ? "block" : "hidden"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
