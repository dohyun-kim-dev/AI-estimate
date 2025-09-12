import { useState } from "react";

const FAQAccordion = ({
  id,
  question,
  answer,
  initialOpen = false,
}: {
  id: number;
  question: string;
  answer: string;
  initialOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  const toggleOpen = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="border-line-1 mb-[24px] border-b">
        <button
          onClick={toggleOpen}
          className="flex w-full items-center justify-between py-[12px] text-left"
          aria-expanded={isOpen}
          type="button"
        >
          <div className="flex items-center">
            <span className="text-mobile-16sb-body text-on-bg-a-4 sm:text-pc-20sb-body mr-4">
              {id}
            </span>
            <h3 className="text-mobile-16sb-body text-on-bg-a-1 sm:text-pc-16r-subtext">
              {question}
            </h3>
          </div>
          <div className="ml-4 flex-shrink-0">
            <img
              src={
                isOpen
                  ? "/images/chevron_arrow_up.svg"
                  : "/images/chevron_arrow_down.svg"
              }
              alt={isOpen ? "Collapse" : "Expand"}
              width={24}
              height={24}
              className="text-gray-400"
            />
          </div>
        </button>
      </div>
      {isOpen && (
        <div className="border-line-1 -mt-[12px] mb-[12px] border-b pb-[12px]">
          <div className="text-on-surface-a-7 text-mobile-16sb-body bg-surface-a sm:text-pc-16r-subtext rounded-[12px] p-3">
            <p>{answer}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default FAQAccordion;
