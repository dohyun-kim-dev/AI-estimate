import { useEffect, useState } from "react";

interface BannerProps {
  images: {
    id: string;
    imageUrl: string;
    mobileImageUrl: string;
    altText: string;
  }[];
}

export default function Banner({ images }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 500);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
      {images.map((image, index) => (
  <div
  key={image.id}
  className={`absolute w-full h-full transition-opacity duration-500 ${
    index === currentIndex ? "opacity-100" : "opacity-0"
  }`}>
  <img
    src={isMobile ? image.mobileImageUrl : image.imageUrl}
    alt={image.altText}
    className="object-cover w-full h-full"
  />
</div>
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
 