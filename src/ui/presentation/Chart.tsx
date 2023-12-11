import React, { FC } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';
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
      minWidth: 175,
    },
    axis: { stroke: COLOUR.TRANSPARENT },
  },
  line: {
    data: { stroke: CHART.LINE_GRADIENT_ID },
  },
};

interface ChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  isLoading: boolean;
  startTime?: number;
  endTime?: number;
}

const DOMAIN_OFFSET = 2;

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

  const temperatures = data.map(({ temperature }) => temperature);
  const minTemp = Math.min(...temperatures) ?? 0;
  const maxTemp = Math.max(...temperatures) ?? 0;

  const domainMin = Math.floor(minTemp) - DOMAIN_OFFSET;
  const domainMax = Math.ceil(maxTemp) + DOMAIN_OFFSET;

  const minTime = startTime ?? Math.min(...data.map(({ timestamp }) => timestamp));
  const maxTime = endTime ?? Math.max(...data.map(({ timestamp }) => timestamp));

  const tickDiff = (maxTime - minTime) / 4;

  const tickValues = [
    minTime + 1000, // Offset to avoid the first tick being cut off
    minTime + tickDiff,
    minTime + tickDiff * 2,
    minTime + tickDiff * 3,
    maxTime,
  ];

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
      padding={{ top: 20, bottom: 30, left: 30, right: 30 }}
      domain={{ y: [domainMin, domainMax], x: [minTime, maxTime] }}
    >
      {/* X AXIS */}
      <VictoryAxis
        orientation="bottom"
        offsetY={offsetY}
        style={style.xAxis}
        tickFormat={tickFormatter}
        tickValues={tickValues}
        fixLabelOverlap={false}
        domainPadding={{ x: [offsetY ?? 0 + 5, 0] }}
      />
      {/* Y AXIS */}
      <VictoryAxis
        dependentAxis
        orientation="left"
        tickCount={5}
        style={style.yAxis}
        crossAxis={false}
        tickFormat={(tick: number) => tick.toFixed(0)}
      />
      <VictoryAxis
        dependentAxis
        orientation="right"
        tickCount={5}
        style={style.yAxis}
        crossAxis={false}
        tickFormat={(tick: number) => tick.toFixed(0)}
      />
      <ChartGradient />
      <VictoryLine
        data={data}
        x={CHART.X_KEY}
        y={CHART.Y_KEY}
        interpolation={CHART.INTERPOLATION}
        style={style.line}
      />
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
