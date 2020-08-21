import React from 'react';
import { View } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';

import { FONT, STYLE, COLOUR, CHART } from '~constants';
import { tickFormat } from '~formatters';

import { ChartGradient } from './ChartGradient';

const style = {
  container: { height: STYLE.HEIGHT.NORMAL_CHART, width: STYLE.WIDTH.NORMAL_CHART },
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

export const Chart = ({ data }) => {
  return (
    <View style={style.container}>
      <VictoryChart
        height={STYLE.HEIGHT.NORMAL_CHART}
        width={STYLE.WIDTH.NORMAL_CHART}
        domainPadding={CHART.DOMAIN_PADDING}
      >
        {/* Y AXIS */}
        <VictoryAxis
          crossAxis
          numberOfTicks={CHART.NUMBER_OF_TICKS_Y}
          dependentAxis
          style={style.yAxis}
        />

        {/* X AXIS */}
        <VictoryAxis crossAxis tickFormat={tickFormat} style={style.xAxis} />

        <ChartGradient />
        <VictoryLine
          data={data}
          x={CHART.X_KEY}
          y={CHART.Y_KEY}
          interpolation={CHART.INTERPOLATION}
          style={style.line}
        />
      </VictoryChart>
    </View>
  );
};
