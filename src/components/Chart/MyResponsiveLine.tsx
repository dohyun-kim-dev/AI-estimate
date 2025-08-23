import React from "react";
import dynamic from "next/dynamic";
const ResponsiveLine = dynamic(() => import("@nivo/line").then(m => m.ResponsiveLine), { ssr: false });
import "./nivo-style-overrides.css";

type Datum = {
  x: string | number | Date;
  y: number | string | null;
};

type LineSerie = {
  id: string;
  data: Datum[];
  color?: string; // ✅ 커스텀 색상 지정 가능
};

type MyResponsiveLineProps = {
  data: LineSerie[];
};

const MyResponsiveLine: React.FC<MyResponsiveLineProps> = ({ data }) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 30, right: 80, bottom: 30, left: 30 }}
    xScale={{ type: "point" }}
    yScale={{ type: "linear", min: "auto", max: "auto" }}
    colors={({ id }) => {
      const serie = data.find((s) => s.id === id);
      return serie?.color || "#000";
    }}
    yFormat=" >-.2f"
    axisTop={null}
    axisRight={{
      tickSize: 0,
      tickPadding: 20,
      tickRotation: 0,
      truncateTickAt: 0,
    }}
    axisBottom={{
      tickSize: 0,
      tickPadding: 10,
      tickRotation: 0,
      legendOffset: 30,
      legendPosition: "middle",
      truncateTickAt: 0,
    }}
    axisLeft={null}
    enableGridX={false}
    enableGridY={false}
    theme={{
      background: "#fff",
      axis: {
        domain: {
          line: {
            stroke: "#999",
            strokeWidth: 1,
          },
        },
      },
    }}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabel="data.yFormatted"
    pointLabelYOffset={-12}
    enableTouchCrosshair={true}
    useMesh={true}
    legends={[
      {
        anchor: "top-right",
        direction: "row",
        translateY: -30,
        itemsSpacing: 50,
        itemWidth: 85,
        itemHeight: 10,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: "circle",
        symbolBorderColor: "rgba(0, 0, 0, .5)",
        effects: [
          {
            on: "hover",
            style: {
              itemBackground: "rgba(0, 0, 0, .03)",
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
  />
);

export default MyResponsiveLine;
