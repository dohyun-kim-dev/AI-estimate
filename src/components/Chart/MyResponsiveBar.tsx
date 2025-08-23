import dynamic from "next/dynamic";
const ResponsiveBar = dynamic(() => import("@nivo/bar").then(m => m.ResponsiveBar), { ssr: false });

type MyResponsiveBarProps = {
  data: Array<Record<string, any>>;
};

const MyResponsiveBar = ({ data }: MyResponsiveBarProps) => {
  const allKeys = Object.keys(data[0]);
  const indexBy = allKeys[0];
  const keys = allKeys.slice(1);

  const lastIndex = data.length - 1;

  const coloredData: Array<Record<string, any>> = data.map((item, index) => ({
    ...item,
    color: index === lastIndex ? "#214A72" : "#648096",
  }));

  return (
    <ResponsiveBar
      data={coloredData}
      keys={keys}
      indexBy={indexBy}
      margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
      padding={0.3}
      groupMode="grouped"
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={({ indexValue }) => {
        const item = coloredData.find((d) => d[indexBy] === indexValue);
        return item?.color || "#648096";
      }}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      axisTop={null}
      // axisRight={{
      //   tickSize: 0,
      //   tickPadding: 5,
      //   tickRotation: 0,
      // }}
      axisBottom={{
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: 32,
        format: (value) => {
          if (value === "기준일") return "기준일";
          if (value === "7일전") return "7일전";
          return ""; // 나머지는 표시 안 함
        },
      }}
      
      // tooltip={({ id, value, indexValue }) => (
      //   <div
      //     style={{
      //       padding: 12,
      //       background: "#fff",
      //       border: "1px solid #ccc",
      //       color: "#214A72", // 원하는 hover 텍스트 색상
      //     }}
      //   >
      //     <strong>{id}</strong>: {value} in <strong>{indexValue}</strong>
      //   </div>
      // )}
      tooltip={() => null}
      label={(d) => `${d.value}`}
      labelPosition="end"
      labelOffset={12}
      enableTotals={false}
      animate={true}
      axisLeft={null}
      enableGridY={true}
       
      // enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={"#000"}
      legends={[]}
      role="application"
      ariaLabel="Nivo bar chart"
      barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in ${e.indexValue}`}
    />
  );
};

export default MyResponsiveBar;
