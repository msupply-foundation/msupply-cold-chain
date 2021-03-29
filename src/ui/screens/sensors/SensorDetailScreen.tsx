import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useOnMount, useHideTabBar, useRouteProps } from '../../hooks';
import { SensorSelector, DetailAction } from '../../../features';

import {
  SensorDetailChart,
  SensorDetailActionBar,
  SensorDetailCumulativeBreachStatus,
} from '../../components';
import { SensorLogsTable, SensorDetailScreenLayout } from '../../layouts';
import { LargeText } from '../../presentation/typography';
import { SensorStackNavigatorParameters } from '../../containers/SensorStackNavigator';
import { SENSOR_STACK } from '../../../common/constants/Navigation';
import { RootState } from '../../../common/store/store';

export const SensorDetailScreen: FC = () => {
  const { id } = useRouteProps<SensorStackNavigatorParameters, SENSOR_STACK.SENSOR_DETAIL>();
  const name = useSelector((state: RootState) => SensorSelector.getName(state, { id }));
  const dispatch = useDispatch();

  const fetch = () => dispatch(DetailAction.fetch(id));
  const flush = () => dispatch(DetailAction.flush());

  useOnMount([flush, fetch]);
  useHideTabBar();

  return (
    <SensorDetailScreenLayout
      ActionBar={<SensorDetailActionBar id={id} />}
      Name={<LargeText>{name}</LargeText>}
      CumulativeBreach={<SensorDetailCumulativeBreachStatus />}
      Chart={<SensorDetailChart />}
      Table={<SensorLogsTable id={id} />}
    />
  );
};
