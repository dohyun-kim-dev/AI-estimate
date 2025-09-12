import { useState } from "react";
import { testimonials, marqueeImages } from "../../utils/constants";
import TestimonialCard from "../common/TestimonialCard";

export default function Section_11() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const displayedTestimonials = isExpanded
    ? testimonials
    : window.innerWidth >= 640
      ? testimonials.slice(0, 4)
      : testimonials.slice(0, 2);

  return (
    <section
      id="review"
      className="flex w-full flex-col items-center py-[20px] sm:py-[80px]"
    >
      <div className="flex w-full flex-col items-center overflow-hidden">
        <div className="mb-[60px] flex w-full max-w-[960px] flex-col items-start px-4 sm:items-center">
          <h2 className="text-mobile-28b-emphasis-title sm:text-pc-32b-emphasis-title text-left sm:text-center">
            <span className="text-on-bg-a-9 sm:text-on-surface-a-5 sm:text-pc-20sb-body">
              고객 후기
            </span>

            {/* Bottom line */}
            <span className="mt-2 block sm:mt-4">
              함께 성장하는{" "}
              <span className="mt-2 block sm:mt-0 sm:inline">
                에이고 고객 이야기
              </span>
            </span>
          </h2>
        </div>
        <div className="hidden overflow-hidden sm:block">
          <div className="animate-scroll-left flex w-max gap-[32px]">
            {[
              ...marqueeImages,
              ...marqueeImages,
              ...marqueeImages,
              ...marqueeImages,
              ...marqueeImages,
              ...marqueeImages,
            ].map((src, idx) => (
              <img key={idx} src={src} className="flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="block overflow-hidden sm:hidden">
          <div className="pc-animate-scroll-left flex w-max gap-[32px]">
            {[...marqueeImages, ...marqueeImages, ...marqueeImages].map(
              (src, idx) => (
                <img key={idx} src={src} className="flex-shrink-0" />
              ),
            )}
          </div>
        </div>
        <div className="mt-[24px] block overflow-hidden sm:hidden">
          <div className="animate-scroll-right flex w-max gap-[32px]">
            {[...marqueeImages, ...marqueeImages, ...marqueeImages].map(
              (src, idx) => (
                <img key={`right-${idx}`} src={src} className="flex-shrink-0" />
              ),
            )}
          </div>
        </div>
        <div className="mt-[60px] flex max-w-[960px] flex-col px-[0px] sm:px-[16px] lg:px-[0px]">
          <div className="flex flex-col gap-[16px] px-[16px] sm:grid sm:grid-cols-2 sm:gap-[32px] sm:px-[0px]">
            {displayedTestimonials.map((testimonial) => (
              <TestimonialCard {...testimonial} />
            ))}
          </div>
          <div className="border-gray-100 pt-[40px]">
            <button
              onClick={toggleExpanded}
              className="flex w-full items-center justify-center py-2 text-gray-400 hover:cursor-pointer"
            >
              <span className="text-sm">{isExpanded ? "접기" : "더보기"}</span>
              <span className="ml-2">
                {isExpanded ? (
                  <img src="/images/chevron_arrow_up.svg" />
                ) : (
                  <img src="/images/chevron_arrow_down.svg" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
