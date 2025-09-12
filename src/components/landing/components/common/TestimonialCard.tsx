export default function TestimonialCard({
  name,
  title,
  content,
}: {
  name: string;
  title: string;
  content: string;
}) {
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

  return (
    <div className="bg-surface-a rounded-[12px] px-[12px] py-[16px] sm:px-[20px] sm:py-[20px]">
      <div className="mb-1 flex">
        {[...Array(5)].map((_, index) => (
          <img
            key={index}
            src="/images/star_icon.svg"
            alt="star"
            className="h-[16px] w-[18px]"
          />
        ))}
      </div>
      <div className="mb-2 flex flex-row items-center">
        <p className="text-mobile-14m-subtext text-on-surface-a-7">{name}</p>
        <img src="/images/circle.svg" className="inline h-[12px] w-[12px]" />
        <img src="/images/circle.svg" className="inline h-[12px] w-[12px]" />
        <p className="text-mobile-16sb-body text-on-surface-a-7 ml-[4px]">
          {title}
        </p>
      </div>
      <p className="text-on-surface-a-6 text-mobile-14m-subtext sm:text-pc-16r-subtext sm:tracking-tight">
        "{renderContentWithPurpleText(content)}"
      </p>
    </div>
  );
}
