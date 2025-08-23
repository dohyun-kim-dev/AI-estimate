import { ResponsivePie } from "@nivo/pie";
import React from "react";

type PieDatum = {
  id: string;
  label: string;
  value: number;
};

type MyResponsivePieProps = {
  data: PieDatum[];
  baseColor: string; // 예: "#4f46e5"
};

const MyResponsivePie: React.FC<MyResponsivePieProps> = ({ data, baseColor }) => {
  // 값 기준 정렬
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // RGB 추출 (예: #4f46e5 → [79, 70, 229])
  const rgb = baseColor.match(/\w\w/g)?.map((hex) => parseInt(hex, 16)) || [0, 0, 0];

  // 각 조각에 색상 추가
  const coloredData = sortedData.map((item, index, array) => {
    const alpha = 1 - index / array.length;
    return {
      ...item,
      color: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(2)})`,
    };
  });

  return (
    <ResponsivePie
      data={coloredData}
      margin={{ top: 20, right: -80, bottom: 35, left: 80 }}
      sortByValue={true}
      activeOuterRadiusOffset={8}
      colors={({ id }) => {
        const found = coloredData.find((d) => d.id === id);
        return found?.color || `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
      }}
      borderColor={{ theme: "background" }}
      enableArcLinkLabels={false}
      enableArcLabels={false}
      arcLinkLabelsSkipAngle={12}
      arcLabelsSkipAngle={11}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsRadiusOffset={0.4}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      
      motionConfig="default"
      legends={[
        {
          anchor: "left",
          direction: "column",
          justify: false,
          translateX: -80,
          translateY: 0,
          itemsSpacing: 25,
          itemWidth: 120,
          itemHeight: 10,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 15,
          symbolShape: "square",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
          data: coloredData.map((d) => ({
            id: d.id,
            label: `${d.label} (${d.value})`,
            color: d.color,
          })),
          
        },
      ]}
    />
  );
};

export default MyResponsivePie;
