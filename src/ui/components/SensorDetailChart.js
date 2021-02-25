import { useWindowDimensions } from 'react-native';
import { connect } from 'react-redux';

import { DetailChartSelector } from '~features';
import { STYLE } from '~constants';

import { Chart } from '~presentation';

const stateToProps = state => {
  const data = DetailChartSelector.data(state);
  const isLoading = DetailChartSelector.isLoading(state);

  return { data, isLoading };
};

export const SensorDetailChartWrapper = ({ data = [], isLoading = true, id }) => {
  const { height, width } = useWindowDimensions();

  return (
    <Chart
      isLoading={isLoading}
      data={data}
      width={width * STYLE.WIDTH.DETAIL_CHART_RATIO}
      height={height * STYLE.HEIGHT.DETAIL_CHART_RATIO}
    />
  );
};

export const SensorDetailChart = connect(stateToProps)(SensorDetailChartWrapper);
