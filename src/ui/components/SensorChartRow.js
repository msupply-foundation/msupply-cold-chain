import React from 'react';
import { connect } from 'react-redux';

import { useOnMount } from '~hooks';
import {
  ChartAction,
  CumulativeBreachAction,
  SensorStatusAction,
  SensorStatusSelector,
  ChartSelector,
  SensorSelector,
} from '~features';

import { SensorRowLayout } from '~layouts';
import { Chart } from '~presentation';
import { SensorStatus } from './SensorStatus';
import { withFormatService } from '../hoc/withFormatService';

const stateToProps = (state, props) => {
  const isLoadingChartData = ChartSelector.isLoading(state, props);
  const isLoadingStatus = SensorStatusSelector.isLoading(state, props);
  const data = ChartSelector.listData(state, props);
  const name = SensorSelector.getName(state, props);
  const hasData = SensorStatusSelector.hasData(state, props);

  return { data, isLoadingChartData, name, hasData, isLoadingStatus };
};
const dispatchToProps = (dispatch, { id }) => {
  const fetchStatus = () => dispatch(SensorStatusAction.fetch(id));
  const fetchChartData = () => dispatch(ChartAction.getListChartData(id));
  const fetchCumulative = () => dispatch(CumulativeBreachAction.fetchListForSensor(id));

  return { fetchStatus, fetchChartData, fetchCumulative };
};

export const SensorChartRowComponent = React.memo(
  ({
    id,
    data,
    name,
    onPress,
    isLoadingChartData,
    isLoadingStatus,
    fetchStatus,
    fetchChartData,
    fetchCumulative,
    hasData,
  }) => {
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
  }
);

export const SensorChartRow = withFormatService(
  connect(stateToProps, dispatchToProps)(SensorChartRowComponent)
);
