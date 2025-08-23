"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
const ResponsivePie = dynamic(() => import("@nivo/pie").then(m => m.ResponsivePie), { ssr: false });
const ResponsiveLine = dynamic(() => import("@nivo/line").then(m => m.ResponsiveLine), { ssr: false });
const MyResponsiveBar = dynamic(() => import("@/components/Chart/MyResponsiveBar"), { ssr: false });
import { THEME_COLORS, ThemeMode } from "@/styles/theme_colors";
import GenericDateRangePicker from "@/components/CustomList/GenericDateRangePicker";
import dayjs from "dayjs";

const PageWrapper = styled.div`
  width: 100%; // ✅ 수정: 부모(MainContent)의 너비를 그대로 따라감
  padding: 30px 0;
  overflow-x: auto;

  background-color: #E6E7E9;
`;



const LineChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const LineChartButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const LineChartButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid ${({ active }) => (active ? "#2f64cb" : "#ccc")};
  background-color: ${({ active }) => (active ? "#2f64cb" : "#eee")};
  color: ${({ active }) => (active ? "#fff" : "#666")};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ active }) => (active ? "#2f64cb" : "#ddd")};
  }
`;



const TopListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const TopListItem = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  height: 40px;
  
  justify-content: space-between;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const NameDateBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-size: 16px;
  color: #3e3e3e;
  font-weight: 500;
`;

const DateText = styled.div`
  font-size: 14px;
  color: #808080;
`;

const Price = styled.div`
  font-size: 16px;
  color: #3e3e3e;
  font-weight: 500;
  white-space: nowrap;
`;


const SearchButton = styled.button<{ $themeMode: ThemeMode }>`
  width: 60px;
  height: 40px;
  margin-left: 10px;
  background: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.primary : THEME_COLORS.dark.buttonBackground};
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.buttonText : THEME_COLORS.dark.buttonText)};
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  border-left: none;
  border-radius: 0;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const Container = styled.div<{ $themeMode: ThemeMode }>`
  min-width: 1200px;
  width: 100%;
  padding: 0px 30px;
  padding-bottom: 30px;
  background-color: ${({ $themeMode }) =>
    $themeMode === 'light' ? THEME_COLORS.light.background : THEME_COLORS.dark.background};
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? THEME_COLORS.light.text : THEME_COLORS.dark.text};
  box-sizing: border-box;
`;



const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ControlHeader = styled(TopHeader)`
  margin-bottom: 20px;
`;

const visitMeta = {
  title: "방문유형 (PC · Mobile)",
  accessCount: { pc: 150, mobile: 40 },
  accessUser: { pc: 140, mobile: 25 },
};

const labels = ["7일전", "6일전", "5일전", "4일전", "3일전", "2일전", "기준일"];

const dummyLineData = [
  {
    id: "AI 사용량",
    data: [
      { x: "2025.05.07", y: 3 },
      { x: "2025.05.08", y: 4 },
      { x: "2025.05.09", y: 7 },
      { x: "2025.05.10", y: 7 },
      { x: "2025.05.11", y: 10 },
      { x: "2025.05.12", y: 11 },
      { x: "2025.05.13", y: 14 },
    ],
  },
];

const barChartMeta = [
  {
    title: "누적 가입 고객수(명)",
    total: 1234,
    period: 41,
    week: 41,
    counts: [8, 5, 3, 3, 10, 10, 2],
  },
  {
    title: "견적 다운로드(건)",
    total: 200,
    period: 40,
    week: 40,
    counts: [5, 3, 4, 6, 7, 10, 5],
  },
  {
    title: "AI 답변 확인 필요(건)",
    total: 87,
    period: 29,
    week: 29,
    counts: [4, 4, 5, 5, 4, 4, 3],
  },
  {
    title: "견적 문의 요청(건)",
    total: 100,
    period: 40,
    week: 40,
    counts: [3, 3, 4, 6, 8, 10, 6],
  },
  {
    title: "견적 PDF 다운로드(건)",
    total: 88,
    period: 39,
    week: 39,
    counts: [8, 5, 3, 3, 10, 10, 2],
  },
].map((item) => ({
  ...item,
  data: labels.map((label, i) => ({
    label,
    count: item.counts[i],
  })),
}));

const DashboardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;




const ChartCard = styled.div`
  background: #fff;
  border: 1px solid #dbdfea;
  border-radius: 8px;
  flex: 1 1 calc((100% - 32px) / 3); // gap 16px × 2
  min-width: 360px;
  height: 430px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;



const LineChartCard = styled(ChartCard)`
  width: 100%;
  grid-column: 1 / -1;
`;

const MetaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChartContainer = styled.div`
  height: 280px;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #000;
`;

const Value = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #000;
`;

const Label = styled.div`
  font-size: 13px;
  color: #999;
`;

interface TopItem {
  name: string;
  date: string;
  value: string; // 금액 또는 횟수
}


const dummyRequestTop5: TopItem[] = [
  { name: "IoT 앱", date: "2시간 전", value: "30,000,000원" },
  { name: "식음료", date: "한달 전", value: "40,600,000원" },
  { name: "AI", date: "25.03.14", value: "90,000,000원" },
  { name: "전산", date: "25.02.13", value: "80,500,000원" },
  { name: "IoT 앱", date: "25.01.12", value: "30,000,000원" },
];

const dummyDownloadTop5: TopItem[] = [
  { name: "보안시스템", date: "방금 전", value: "25,000,000원" },
  { name: "의료기기", date: "1시간 전", value: "50,000,000원" },
  { name: "스마트홈", date: "25.03.11", value: "15,000,000원" },
  { name: "에너지관리", date: "25.02.25", value: "12,300,000원" },
  { name: "AI 분석", date: "25.02.01", value: "32,000,000원" },
];

const dummyAccessTop5: TopItem[] = [
  { name: "Lucas", date: "25.05.14", value: "20회" },
  { name: "David", date: "25.05.13", value: "16회" },
  { name: "Elena", date: "25.05.12", value: "12회" },
  { name: "오하연", date: "25.05.11", value: "8회" },
  { name: "정혜진", date: "25.05.10", value: "6회" },
];



// ---------- ChartCard Renderer ----------
const renderBarChartCard = (item: typeof barChartMeta[number]) => (
  <ChartCard key={item.title}>
    <MetaSection>
      <Row>
        <Title>{item.title}</Title>
        <Value>{item.total.toLocaleString()}</Value>
      </Row>
      <Row>
        <Label>기간내</Label>
        <Label>{item.period}</Label>
      </Row>
      <Row>
        <Label>7일내</Label>
        <Label>{item.week}</Label>
      </Row>
    </MetaSection>
    <ChartContainer>
      <MyResponsiveBar data={item.data} />
    </ChartContainer>
  </ChartCard>
);

const renderTopListCard = (title: string, items: { name: string; date: string; value: string; imageUrl?: string }[]) => (
  <ChartCard key={title}>
    <Title>{title}</Title>
    <TopListWrapper>
      {items.map((item, i) => {
        // imageUrl이 없거나 빈 값이면 /cms/nodata.svg 사용
        const profileImgSrc = item.imageUrl && item.imageUrl.trim() ? item.imageUrl : '/cms/nodata.svg';
        return (
          <TopListItem key={i}>
            <ProfileSection>
              <ProfileImage src={profileImgSrc} alt="user" />
              <NameDateBox>
                <Name>{item.name}</Name>
                <DateText>{item.date}</DateText>
              </NameDateBox>
            </ProfileSection>
            <Price>{item.value}</Price>
          </TopListItem>
        );
      })}
    </TopListWrapper>
  </ChartCard>
);

const renderVisitPieCard = () => {
  const data = visitMeta.accessUser;
  return (
    <ChartCard>
      <Title>방문유형 (PC · Mobile)</Title>
      <MetaSection>
        {["접속수별", "접속자별"].map((label, idx) => {
          const key = idx === 0 ? "accessCount" : "accessUser";
          const row = visitMeta[key as "accessCount" | "accessUser"];
          const total = row.pc + row.mobile;
          return (
            <Row key={label}>
              <Label style={{ color: "#324c8e", minWidth: 80 }}>{label}</Label>
              <Value style={{ color: "#324c8e" }}>{row.pc}</Value>
              <Value style={{ color: "#678b6c" }}>{row.mobile}</Value>
              <Value>{total}</Value>
            </Row>
          );
        })}
      </MetaSection>
      <ChartContainer>
        <ResponsivePie
          data={[
            { id: "PC", label: "PC", value: visitMeta.accessUser.pc },
            { id: "Mobile", label: "Mobile", value: visitMeta.accessUser.mobile },
          ]}
          margin={{ top: 0, right: 10, bottom: 20, left: 10 }}
          innerRadius={0.6}
          padAngle={1}
          cornerRadius={3}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          tooltip={() => null}
          colors={["#324c8e", "#678b6c"]}
          layers={[
            "arcs",
            ({ centerX, centerY }) => (
              <>
                <text x={centerX} y={centerY - 10} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: "14px", fontWeight: "bold", fill: "#324c8e" }}>
                  PC: {visitMeta.accessUser.pc}
                </text>
                <text x={centerX} y={centerY + 10} textAnchor="middle" dominantBaseline="central"
                  style={{ fontSize: "14px", fontWeight: "bold", fill: "#678b6c" }}>
                  Mobile: {visitMeta.accessUser.mobile}
                </text>
              </>
            ),
          ]}
        />
      </ChartContainer>
    </ChartCard>
  );
};

// ---------- Main Page ----------
const CmsDashboardPage = () => {
  const [fromDate, setFromDate] = useState(dayjs().subtract(6, "month").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [visitorView, setVisitorView] = useState("월간");

  const handleDateChangeInternal = (newFrom: string, newTo: string) => {
    setFromDate(newFrom);
    setToDate(newTo);
  };

  const visitorData = [
    {
      id: "방문자 수",
      data: [
        { x: "1", y: 30 },
        { x: "2", y: 50 },
        { x: "3", y: 20 },
        { x: "4", y: 16 },
        { x: "5", y: 18 },
        { x: "6", y: 16 },
        { x: "7", y: 16 },
        { x: "8", y: 62 },
        { x: "9", y: 48 },
        { x: "10", y: 40 },
        { x: "11", y: 12 },
        { x: "12", y: 14 },
        { x: "13", y: 30 },
      ],
    },
  ];

  return (
    <PageWrapper>
    <Container $themeMode="light">
      <TopHeader>
        <h1>CMS 대시보드</h1>
      </TopHeader>

      <ControlHeader>
        <GenericDateRangePicker
          initialFromDate={fromDate}
          initialToDate={toDate}
          onDateChange={handleDateChangeInternal}
          themeMode="light"
        />
        <SearchButton $themeMode="light">조회</SearchButton>
      </ControlHeader>

      <DashboardWrapper>
        {/* 1행 */}
        {renderBarChartCard(barChartMeta[0])}
        <ChartCard>

    <LineChartHeader>
    <Title>방문자 수(건)</Title>
    <Value>40</Value>
    <LineChartButtonGroup>
      {['주간', '월간', '연간'].map((label) => (
        <LineChartButton
          key={label}
          active={visitorView === label}
          onClick={() => setVisitorView(label)}>
          {label}
        </LineChartButton>
      ))}
    </LineChartButtonGroup>
  </LineChartHeader>

  <ChartContainer>
    <ResponsiveLine
      data={visitorData}
      margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: "auto", max: "auto" }}
      axisBottom={{ tickRotation: 0, tickPadding: 5 }}
      axisLeft={null}
      enableArea={false}
      colors={["#2f64cb"]}
      lineWidth={2}
      pointSize={6}
      pointColor="#fff"
      pointBorderWidth={2}
      pointBorderColor="#2f64cb"
      useMesh
    />
  </ChartContainer>
</ChartCard>
        {renderVisitPieCard()}

        {/* 2행 */}
        {renderBarChartCard(barChartMeta[3])}
        {renderTopListCard("견적 문의 대상 TOP 5", dummyRequestTop5)}
        {renderBarChartCard(barChartMeta[2])}

        {/* 3행 */}
        {renderBarChartCard(barChartMeta[4])}
        {renderTopListCard("견적 다운로드 TOP 5", dummyDownloadTop5)}
        {renderTopListCard("자주 접속 TOP 5", dummyAccessTop5)}


        {/* 마지막: AI 사용 현황 */}
        <LineChartCard>
          <LineChartHeader>
            <Title>AI 사용 현황</Title>
            <LineChartButtonGroup>
              <LineChartButton active>주간</LineChartButton>
              <LineChartButton>월간</LineChartButton>
              <LineChartButton>연간</LineChartButton>
            </LineChartButtonGroup>
          </LineChartHeader>
          <ChartContainer>
            <ResponsiveLine
              data={dummyLineData}
              margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              axisBottom={{ tickRotation: 0, tickPadding: 5 }}
              axisLeft={null}
              enableArea
              areaOpacity={0.15}
              colors={["#2f64cb"]}
              lineWidth={3}
              pointSize={6}
              pointColor="#2f64cb"
              pointBorderWidth={2}
              pointBorderColor="#fff"
              useMesh
            />
          </ChartContainer>
        </LineChartCard>
      </DashboardWrapper>
    </Container>
    </PageWrapper>
  );
};



export default CmsDashboardPage;
