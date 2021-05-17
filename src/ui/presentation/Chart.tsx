import React, { FC } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';
import { FONT, STYLE, COLOUR, CHART, DEPENDENCY } from '../../common/constants';

import { ChartGradient } from './ChartGradient';
import { Centered, Row } from '../layouts';
import { MediumText } from './typography';
import { FormatService } from '../../common/services';
import { ChartDataPoint } from '../../features/Chart/ChartManager';
import { useDependency } from '../hooks';

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
    grid: { stroke: COLOUR.GREY_ONE },
  },
  xAxis: {
    tickLabels: {
      stroke: COLOUR.PRIMARY,
      fontSize: FONT.SIZE.S,
      fontFamily: FONT.FAMILY.REGULAR,
    },
    axis: { stroke: COLOUR.TRANSPARENT },
  },
  line: { data: { stroke: CHART.LINE_GRADIENT_ID } },
};

const round5 = (n: number) => {
  return Math.ceil(n / 5) * 5;
};

interface ChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  isLoading: boolean;
}

export const Chart: FC<ChartProps> = ({ data = [], isLoading, width, height }) => {
  const formatter = useDependency(DEPENDENCY.FORMAT_SERVICE) as FormatService;

  const tickFormatter = formatter.getTickFormatter();

  const minTemp = Math.min(...data.map(({ temperature }) => temperature));
  const maxTemp = Math.max(...data.map(({ temperature }) => temperature));

  const domainMin = round5(minTemp) - 5;
  const domainMax = round5(maxTemp) + 5;

  const minTime = Math.min(...data.map(({ timestamp }) => timestamp));
  const maxTime = Math.max(...data.map(({ timestamp }) => timestamp));

  const Empty = (
    <Row alignItems="center" justifyContent="center" style={{ width: STYLE.WIDTH.NORMAL_CHART }}>
      <MediumText>No data</MediumText>
    </Row>
  );

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {!isLoading ? (
        data.length ? (
          <VictoryChart
            width={width}
            height={height}
            padding={{ top: 10, bottom: 30, left: 30, right: 30 }}
            domain={{ y: [domainMin, domainMax], x: [minTime, maxTime] }}
          >
            {/* X AXIS */}
            <VictoryAxis
              orientation="bottom"
              style={style.xAxis}
              tickFormat={tickFormatter}
              tickCount={5}
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
          </VictoryChart>
        ) : (
          Empty
        )
      ) : (
        <Centered style={{ width: '100%' }}>
          <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
        </Centered>
      )}
    </View>
  );
};
