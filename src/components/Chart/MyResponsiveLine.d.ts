import React from "react";
import "./nivo-style-overrides.css";
type Datum = {
    x: string | number | Date;
    y: number | string | null;
};
type LineSerie = {
    id: string;
    data: Datum[];
    color?: string;
};
type MyResponsiveLineProps = {
    data: LineSerie[];
};
declare const MyResponsiveLine: React.FC<MyResponsiveLineProps>;
export default MyResponsiveLine;
