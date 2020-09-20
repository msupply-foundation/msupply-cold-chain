/* eslint-disable no-nested-ternary */
import React, { useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';

import { FONT, STYLE, COLOUR, CHART } from '~constants';

import { ChartGradient } from './ChartGradient';
import { Centered, Row } from '../layouts';
import { withFormatService } from '../hoc/withFormatService';
import { MediumText } from './typography';

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

const round5 = n => {
  return Math.ceil(n / 5) * 5;
};

export const Chart = withFormatService(
  ({
    formatter,
    data = [],
    width = STYLE.WIDTH.NORMAL_CHART,
    height = STYLE.HEIGHT.NORMAL_CHART,
    isLoading,
  }) => {
    const tickFormatter = useCallback(formatter.getTickFormatter(), [data]);

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
          minHeight: height,
          minWidth: width,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {!isLoading ? (
          data.length ? (
            <VictoryChart
              height={height}
              width={width}
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
              <VictoryAxis
                dependentAxis
                orientation="left"
                numberOfTicks={CHART.NUMBER_OF_TICKS_Y}
                style={style.yAxis}
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
  }
);
