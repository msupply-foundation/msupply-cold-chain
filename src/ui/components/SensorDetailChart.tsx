import React, { FC } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { DetailChartSelector } from '../../features';
import { STYLE } from '../../common/constants';
import { Chart } from '../presentation';
import { RootState } from '../../common/store/store';

export const SensorDetailChart: FC = () => {
  const { height, width } = useWindowDimensions();

  const data = useSelector((state: RootState) => DetailChartSelector.data(state));
  const isLoading = useSelector((state: RootState) => DetailChartSelector.isLoading(state));

  return (
    <Chart
      isLoading={isLoading}
      data={data}
      width={width * STYLE.WIDTH.DETAIL_CHART_RATIO}
      height={height * STYLE.HEIGHT.DETAIL_CHART_RATIO}
    />
  );
};
