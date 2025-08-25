import React from "react";
type PieDatum = {
    id: string;
    label: string;
    value: number;
};
type MyResponsivePieProps = {
    data: PieDatum[];
    baseColor: string;
};
declare const MyResponsivePie: React.FC<MyResponsivePieProps>;
export default MyResponsivePie;
