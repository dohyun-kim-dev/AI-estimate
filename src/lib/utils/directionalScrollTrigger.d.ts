import { ScrollTrigger } from 'gsap/ScrollTrigger';
export interface DirectionalScrollTriggerOptions extends ScrollTrigger.Vars {
    smartPinType?: boolean;
}
export declare function directionalScrollTrigger(options: DirectionalScrollTriggerOptions): ScrollTrigger;
