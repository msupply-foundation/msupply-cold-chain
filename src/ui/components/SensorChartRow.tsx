import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useOnMount } from '../hooks';
import {
  ChartAction,
  CumulativeBreachAction,
  SensorStatusAction,
  SensorStatusSelector,
  ChartSelector,
  SensorSelector,
} from '../../features';

import { SensorRowLayout } from '../layouts';
import { Chart } from '../presentation';
import { SensorStatus } from './SensorStatus';
import { withFormatService } from '../hoc/withFormatService';
import { RootState } from '../../common/store/store';

interface SensorChartRowProps {
  id: string;
  onPress: () => void;
}

export const SensorChartRowComponent: FC<SensorChartRowProps> = React.memo(({ id, onPress }) => {
  const dispatch = useDispatch();
  const fetchStatus = () => dispatch(SensorStatusAction.fetch(id));
  const fetchChartData = () => dispatch(ChartAction.getListChartData(id));
  const fetchCumulative = () => dispatch(CumulativeBreachAction.fetchListForSensor(id));

  const isLoadingChartData = useSelector((state: RootState) =>
    ChartSelector.isLoading(state, { id })
  );
  const isLoadingStatus = useSelector((state: RootState) =>
    SensorStatusSelector.isLoading(state, { id })
  );
  const data = useSelector((state: RootState) => ChartSelector.listData(state, { id }));
  const name = useSelector((state: RootState) => SensorSelector.getName(state, { id }));
  const hasData = useSelector((state: RootState) => SensorStatusSelector.hasData(state, { id }));

  useOnMount([fetchStatus, fetchChartData, fetchCumulative]);

  return (
    <SensorRowLayout
      onPress={hasData && !isLoadingChartData ? () => onPress() : null}
      Chart={<Chart isLoading={isLoadingChartData} onPress={onPress} data={data} />}
      SensorStatus={
        <SensorStatus name={name} isLoading={isLoadingStatus} hasData={hasData} id={id} />
      }
      direction="right"
    />
  );
});

export const SensorChartRow = withFormatService(SensorChartRowComponent);
