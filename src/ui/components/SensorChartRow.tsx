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
  onPress: () => void;
}

export const SensorChartRow: FC<SensorChartRowProps> = React.memo(({ id, onPress }) => {
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
  const endTime = moment().valueOf() / 1000;

  return (
    <SensorRowLayout
      {...(hasData && !isLoadingChartData ? { onPress } : {})}
      Chart={
        <Chart
          isLoading={isLoadingChartData}
          data={data}
          width={width * CHART.WIDTH_FACTOR}
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
