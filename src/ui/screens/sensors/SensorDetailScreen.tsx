import React, { FC, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useHideTabBar, useRouteProps } from '~hooks';
import { SensorSelector, DetailAction, SensorStatusSelector } from '~features';

import {
  SensorDetailChart,
  SensorDetailActionBar,
  SensorDetailCumulativeBreachStatus,
} from '~components';
import { SensorLogsTable, SensorDetailScreenLayout } from '~layouts';
import { NormalText } from '~presentation/typography';
import { SensorStackNavigatorParameters } from '../../containers/SensorStackNavigator';
import { SENSOR_STACK } from '~constants/Navigation';
import { RootState } from '~store';

export const SensorDetailScreen: FC = () => {
  const dispatch = useDispatch();
  const { id } = useRouteProps<SensorStackNavigatorParameters, SENSOR_STACK.SENSOR_DETAIL>();

  const minFrom = useSelector((state: RootState) => SensorStatusSelector.possibleFrom(state, id));
  const maxTo = useSelector((state: RootState) => SensorStatusSelector.possibleTo(state, id));
  const name = useSelector((state: RootState) => SensorSelector.getName(state, { id }));

  // Use layout effect ensures this action is dispatched as soon as possible on rendering,
  // so the remaining components are able to access the date values from the reducer.
  useLayoutEffect(() => {
    dispatch(DetailAction.init(id, minFrom, maxTo));
  }, [dispatch, id, minFrom, maxTo]);

  useHideTabBar();

  return (
    <SensorDetailScreenLayout
      ActionBar={<SensorDetailActionBar id={id} />}
      Name={<NormalText>{name}</NormalText>}
      CumulativeBreach={<SensorDetailCumulativeBreachStatus />}
      Chart={<SensorDetailChart />}
      Table={<SensorLogsTable id={id} />}
    />
  );
};
