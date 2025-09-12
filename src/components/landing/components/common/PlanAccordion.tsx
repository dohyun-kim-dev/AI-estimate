import { useEffect, useState } from "react";

export default function PlanAccordion({
  title,
  subtitle,
  badge,
  description,
  sections,
  index,
}: Readonly<{
  title: string;
  subtitle: string;
  badge?: string;
  description: string;
  sections: Array<{
    title: string;
    items: Array<{
      title: string;
      asterisk?: string;
      details?: Array<{
        detail: string;
        subdetail?: string;
        subsubdetail?: string;
      }>;
    }>;
  }>;
  index: number;
}>) {
  const renderContentWithPurpleText = (text: string) => {
    const parts = text.split(/(\{\{.*?\}\}|\\n)/);
    return parts.map((part, index) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const purpleText = part.slice(2, -2);
        return (
          <span key={index} className="text-on-surface-a-1">
            {purpleText}
          </span>
        );
      }
      if (part === "\\n") {
        return <br key={index} />;
      }
      return part;
    });
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    setIsExpanded(mediaQuery.matches);
  }, []);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Check if any section is opened
  const anySectionExpanded = Object.values(expandedSections).some(Boolean);

  return (
    <div
      className={`flex w-full flex-col self-start rounded-2xl border border-gray-100 bg-white p-[16px] shadow-lg sm:min-h-[230px] ${
        isExpanded
          ? anySectionExpanded
            ? "sm:min-h-[426px]" // allow growth if section is open
            : "sm:h-[486px]" // fixed height otherwise
          : "sm:h-auto"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-mobile-20sb-title2 text-on-surface-b-2">{title}</h2>
        {badge && (
          <p className="text-mobile-15m-btn text-on-tag-1 rounded-full bg-[#6A2DFA] px-[10px] py-[4px]">
            {badge}
          </p>
        )}
      </div>
      {/* Subtitle */}
      <div className="mb-2 flex flex-row items-baseline gap-2">
        <p className="text-mobile-28b-emphasis-title text-on-surface-b-1">
          {subtitle}
        </p>
        {index !== 2 && (
          <>
            <p className="text-mobile-14m-subtext text-on-surface-b-1">구독</p>
            <p className="text-mobile-14m-subtext text-on-surface-b-4">
              (VAT 별도)
            </p>
          </>
        )}
      </div>
      {/* Description */}
      <p className="text-mobile-14m-subtext text-on-surface-b-1 tracking-normal sm:tracking-tighter lg:tracking-normal">
        {renderContentWithPurpleText(description)}
      </p>
      {/* Sections */}
      <div className="flex-1">
        {isExpanded && (
          <div
            className={`${index === 1 ? "mt-[4px]" : "mt-[24px]"} space-y-3 p-[10px]`}
          >
            {sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="border-gray-100 last:border-b-0"
              >
                {sections.length > 1 ? (
                  <>
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="flex w-full items-center justify-between py-2 text-left hover:cursor-pointer"
                    >
                      <span className="text-mobile-16sb-body text-on-surface-b-1">
                        {section.title}
                      </span>
                      <span className="text-xl text-gray-400">
                        {expandedSections[sectionIndex] ? (
                          <img src="/images/chevron_arrow_up.svg" />
                        ) : (
                          <img src="/images/chevron_arrow_down.svg" />
                        )}
                      </span>
                    </button>
                    {expandedSections[sectionIndex] && (
                      <div className="space-y-[4px]">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="pl-4">
                            <div className="flex w-full items-center text-left">
                              <span className="text-mobile-14m-subtext text-on-surface-b-5 flex items-center">
                                <span className="mr-3 h-[3px] w-[3px] rounded-full bg-black" />
                                {item.title}
                              </span>
                            </div>
                            {item.details && (
                              <div className="space-y-1 py-2 pl-8">
                                {item.details.map((detailObj, detailIndex) => (
                                  <div key={detailIndex} className="space-y-1">
                                    <div className="text-on-surface-b-4 text-xs tracking-tighter">
                                      <span className="mr-2">-</span>
                                      <span>
                                        {renderContentWithPurpleText(
                                          detailObj.detail,
                                        )}
                                      </span>
                                    </div>
                                    {detailObj.subdetail && (
                                      <div className="text-on-surface-b-3 text-xs">
                                        <span className="mr-2">*</span>
                                        <span>{detailObj.subdetail}</span>
                                      </div>
                                    )}
                                    {detailObj.subsubdetail && (
                                      <div className="text-mobile-14m-subtext text-on-surface-b-3 pl-4">
                                        <span className="mr-2">*</span>
                                        <span>{detailObj.subsubdetail}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.asterisk && (
                              <div className="pt-1 pl-8 text-xs text-gray-400">
                                <span className="mr-2">*</span>
                                <span>{item.asterisk}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="py-2">
                      <span className="text-mobile-16sb-body text-on-surface-b-1">
                        {section.title}
                      </span>
                    </div>
                    <div className="space-y-[4px]">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="pl-4">
                          <div className="flex w-full items-center text-left">
                            <span className="text-mobile-14m-subtext text-on-surface-b-5 flex items-center">
                              <span className="mr-3 h-[3px] w-[3px] rounded-full bg-black" />
                              {item.title}
                            </span>
                          </div>
                          {item.details && (
                            <div className="space-y-1 py-2 pl-8">
                              {item.details.map((detailObj, detailIndex) => (
                                <div key={detailIndex} className="space-y-1">
                                  <div className="text-xs text-gray-500">
                                    <span className="mr-2">-</span>
                                    <span>{detailObj.detail}</span>
                                  </div>
                                  {detailObj.subdetail && (
                                    <div className="pl-4 text-xs text-gray-400">
                                      <span className="mr-2">-</span>
                                      <span>{detailObj.subdetail}</span>
                                    </div>
                                  )}
                                  {detailObj.subsubdetail && (
                                    <div className="pl-8 text-xs text-gray-300">
                                      <span className="mr-2">-</span>
                                      <span>{detailObj.subsubdetail}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {item.asterisk && (
                            <div className="text-on-surface-b-3 text-mobile-14m-subtext mt-[2px] -ml-[18px] pt-1 tracking-tight">
                              <span>*</span>
                              <span>{item.asterisk}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Details button */}
      <div className="border-gray-100 pt-4">
        <button
          onClick={toggleExpanded}
          className="flex w-full items-center justify-center py-2 text-gray-400 hover:cursor-pointer"
        >
          <span className="text-sm">자세히보기</span>
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
  );
}
