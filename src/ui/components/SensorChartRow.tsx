import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useOnMount } from '../hooks';
import { ChartAction, SensorStatusSelector, ChartSelector, SensorSelector } from '../../features';

import { SensorRowLayout } from '../layouts';
import { Chart } from '../presentation';
import { SensorStatus } from './SensorStatus';
import { RootState } from '../../common/store/store';
import { useWindowDimensions } from 'react-native';
import { CHART } from '~constants';

interface SensorChartRowProps {
  id: string;
  onPress: () => void;
}

export const SensorChartRow: FC<SensorChartRowProps> = React.memo(({ id, onPress }) => {
  const { width, height } = useWindowDimensions();
  const dispatch = useDispatch();

  const fetchChartData = () => dispatch(ChartAction.getListChartData(id));

  const isLoadingChartData = useSelector((state: RootState) =>
    ChartSelector.isLoading(state, { id })
  );
  const isLoadingStatus = useSelector((state: RootState) =>
    SensorStatusSelector.isLoading(state, { id })
  );
  const data = useSelector((state: RootState) => ChartSelector.listData(state, { id }));
  const name = useSelector((state: RootState) => SensorSelector.getName(state, { id }));
  const hasData = useSelector((state: RootState) => SensorStatusSelector.hasData(state, { id }));

  useOnMount([fetchChartData]);

  return (
    <SensorRowLayout
      onPress={hasData && !isLoadingChartData ? () => onPress() : undefined}
      Chart={
        <Chart
          isLoading={isLoadingChartData}
          data={data}
          width={width * CHART.WIDTH_FACTOR}
          height={height * CHART.HEIGHT_FACTOR}
        />
      }
      SensorStatus={
        <SensorStatus name={name} isLoading={isLoadingStatus} hasData={hasData} id={id} />
      }
      direction="right"
    />
  );
});
