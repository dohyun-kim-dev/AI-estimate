import React from "react";
interface ScrollAwareWrapperProps {
    children: React.ReactNode;
}
declare const ScrollAwareWrapper: React.FC<ScrollAwareWrapperProps>;
export default ScrollAwareWrapper;
export declare const OuterWrapper: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components/dist/types").Substitute<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    $scrollbarWidth?: number;
    $scrollbarHeight?: number;
}>> & string;
