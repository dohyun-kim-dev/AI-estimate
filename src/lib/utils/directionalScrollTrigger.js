// lib/utils/directionalScrollTrigger.ts
import { ScrollTrigger } from 'gsap/ScrollTrigger';
let lastScroll = { x: 0, y: 0 };
function detectScrollDirection() {
    const dx = Math.abs(window.scrollX - lastScroll.x);
    const dy = Math.abs(window.scrollY - lastScroll.y);
    lastScroll = { x: window.scrollX, y: window.scrollY };
    return dx > dy ? 'horizontal' : 'vertical';
}
export function directionalScrollTrigger(options) {
    const direction = detectScrollDirection();
    const smart = options.smartPinType !== false;
    return ScrollTrigger.create({
        ...options,
        pin: true,
        pinType: smart
            ? direction === 'horizontal'
                ? 'transform'
                : 'fixed'
            : options.pinType,
    });
}
