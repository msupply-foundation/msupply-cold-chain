import React, { FC } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';

import { SensorStatusSelector, ChartSelector, SensorSelector } from '~features';
import { SensorRowLayout } from '~layouts';
import { Chart } from '~presentation';
import { SensorStatus } from './SensorStatus';
import { RootState } from '~store';
import { CHART } from '~constants';
import moment from 'moment';

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
        <Chart
          isLoading={isLoadingChartData}
          data={data}
          width={width * widthFactor}
          height={height * CHART.HEIGHT_FACTOR}
          startTime={startTime}
          endTime={endTime}
        />
      }
      SensorStatus={
        <SensorStatus name={name} isLoading={isLoadingStatus} hasData={hasData} id={id} />
      }
      direction="right"
    />
  );
});
