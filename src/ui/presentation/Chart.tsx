import React, { FC } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryLabel } from 'victory-native';
import { FONT, STYLE, COLOUR, CHART, DEPENDENCY } from '~constants';
import { ChartGradient } from './ChartGradient';
import { Centered, Row } from '~layouts';
import { MediumText } from './typography';
import { FormatService } from '~common/services';
import { ChartDataPoint } from '~features/Chart';
import { useDependency } from '~hooks';

const style = {
  container: {
    height: STYLE.HEIGHT.NORMAL_CHART,
    width: STYLE.WIDTH.NORMAL_CHART,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxis: {
    tickLabels: {
      stroke: COLOUR.PRIMARY,
      fontSize: FONT.SIZE.S,
      fontFamily: FONT.FAMILY.REGULAR,
    },
    axis: { stroke: COLOUR.TRANSPARENT },
    grid: { stroke: COLOUR.OFF_WHITE },
  },
  xAxis: {
    tickLabels: {
      stroke: COLOUR.PRIMARY,
      fontSize: FONT.SIZE.S,
      fontFamily: FONT.FAMILY.REGULAR,
    },
    axis: { stroke: COLOUR.TRANSPARENT },
  },
  line: {
    data: { stroke: CHART.LINE_GRADIENT_ID },
  },
};

const round5 = (n: number) => {
  return Math.ceil(n / 5) * 5;
};

interface ChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  isLoading: boolean;
  startTime?: number;
  endTime?: number;
}

const DOMAIN_OFFSET = 5;

export const Chart: FC<ChartProps> = ({
  data = [],
  startTime,
  endTime,
  isLoading,
  width,
  height,
}) => {
  const formatter = useDependency(DEPENDENCY.FORMAT_SERVICE) as FormatService;

  const tickFormatter = formatter.getTickFormatter();

  const minTemp = Math.min(...data.map(({ temperature }) => temperature)) ?? 0;
  const maxTemp = Math.max(...data.map(({ temperature }) => temperature)) ?? 0;

  const domainMin = round5(minTemp) - DOMAIN_OFFSET;
  const domainMax = round5(maxTemp) + DOMAIN_OFFSET;

  const minTime = startTime ?? Math.min(...data.map(({ timestamp }) => timestamp));
  const maxTime = endTime ?? Math.max(...data.map(({ timestamp }) => timestamp));

  // currently a small bug with the x-axis placement when values are both +ve and -ve on the chart
  // So manually setting  calculating the offset for now
  const offsetY = domainMin > 0 ? undefined : 25;

  const Empty = () => (
    <Row alignItems="center" justifyContent="center" style={{ width: STYLE.WIDTH.NORMAL_CHART }}>
      <MediumText>No data</MediumText>
    </Row>
  );

  const FullChart = () => (
    <VictoryChart
      width={width}
      height={height}
      padding={{ top: 10, bottom: 30, left: 30, right: 30 }}
      domain={{ y: [domainMin, domainMax], x: [minTime, maxTime] }}
    >
      {/* X AXIS */}
      <VictoryAxis
        orientation="bottom"
        offsetY={offsetY}
        style={style.xAxis}
        tickFormat={tickFormatter}
        tickCount={6}
        domainPadding={{ x: [offsetY ?? 0 + 5, 0] }}
      />

      {/* Y AXIS */}
      <VictoryAxis dependentAxis orientation="left" tickCount={5} style={style.yAxis} />

      <ChartGradient />
      <VictoryLine
        data={data}
        x={CHART.X_KEY}
        y={CHART.Y_KEY}
        interpolation={CHART.INTERPOLATION}
        style={style.line}
      />
      {/* <VictoryLabel
        text={`startTime: ${startTime} endTime: ${endTime}, time: ${data[0]?.timestamp}}`}
        x={width / 2}
        y={10}
        textAnchor="middle"
        style={{ fill: COLOUR.PRIMARY, fontFamily: FONT.FAMILY.REGULAR, fontSize: FONT.SIZE.S }}
      /> */}
    </VictoryChart>
  );

  const LoadingIndicator = () => (
    <Centered style={{ width: '100%', minHeight: height }}>
      <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
    </Centered>
  );

  const EmptyOrLoading = isLoading ? LoadingIndicator : Empty;
  const ChartOrEmpty = data.length ? FullChart : EmptyOrLoading;
  // const MaybeLoadingIndicator = isLoading ? LoadingIndicator : ChartOrEmpty;

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <ChartOrEmpty />
    </View>
  );
};
