import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function Banner({ images }) {
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
    return (_jsxs("div", { className: "relative w-full h-[200px] md:h-[300px] overflow-hidden", children: [images.map((image, index) => (_jsx("div", { className: `absolute w-full h-full transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0"}`, children: _jsx("img", { src: isMobile ? image.mobileImageUrl : image.imageUrl, alt: image.altText, className: "object-cover w-full h-full" }) }, image.id))), _jsx("div", { className: "absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2", children: images.map((_, index) => (_jsx("button", { className: `w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`, onClick: () => setCurrentIndex(index) }, index))) })] }));
}
