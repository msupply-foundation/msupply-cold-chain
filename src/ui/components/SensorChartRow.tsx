import React, { FC } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';

import { SensorStatusSelector, ChartSelector, SensorSelector } from '~features';
import { Column, Row, SensorRowLayout } from '~layouts';
import { Chart } from '~presentation';
import { SensorStatus } from './SensorStatus';
import { RootState } from '~store';
import { CHART, COLOUR, STYLE } from '~constants';
import moment from 'moment';
import { BoldText } from '~presentation/typography';
import { SensorStatusBar } from './SensorStatusBar';

interface SensorChartRowProps {
  id: string;
  endTime: number;
  onPress: () => void;
}

export const SensorChartRow: FC<SensorChartRowProps> = React.memo(({ id, endTime, onPress }) => {
  const { width, height } = useWindowDimensions();

  const isLoadingChartData = useSelector((state: RootState) =>
    ChartSelector.isLoading(state, { id })
  );
  const isLoadingStatus = useSelector((state: RootState) =>
    SensorStatusSelector.isLoading(state, { id })
  );
  const data = useSelector((state: RootState) => ChartSelector.listData(state, { id }));
  const name = useSelector((state: RootState) => SensorSelector.getName(state, { id }));
  const hasData = useSelector((state: RootState) => SensorStatusSelector.hasData(state, { id }));
  const startTime = moment().subtract(1, 'day').unix();
  const widthFactor = width > height ? CHART.WIDTH_FACTOR_LANDSCAPE : CHART.WIDTH_FACTOR_PORTRAIT;

  return (
    <SensorRowLayout
      {...(hasData ? { onPress } : {})}
      Chart={
        <Column flex={1}>
          <Row
            justifyContent="flex-start"
            alignItems="center"
            flex={1}
            style={{ paddingLeft: 30, paddingTop: 10, marginBottom: -10 }}
          >
            <BoldText colour={COLOUR.WHITE}>{name}</BoldText>
            <Row style={{ marginLeft: 5 }} />
            <SensorStatusBar id={id} />
          </Row>
          <Chart
            isLoading={isLoadingChartData}
            data={data}
            width={width * widthFactor}
            height={height * CHART.HEIGHT_FACTOR}
            startTime={startTime}
            endTime={endTime}
          />
        </Column>
      }
      SensorStatus={
        <Column justifyContent="center" style={{ width: STYLE.WIDTH.LARGE_RECTANGLE }}>
          <SensorStatus isLoading={isLoadingStatus} hasData={hasData} id={id} />
        </Column>
      }
      direction="right"
    />
  );
});
