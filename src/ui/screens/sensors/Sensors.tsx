import React, { FC } from 'react';

import { SensorStackScreen, SensorStackNavigator } from '../../containers';

import { SensorListScreen } from './SensorListScreen';
import { SensorDetailScreen } from './SensorDetailScreen';
import { SENSOR_STACK } from '../../../common/constants/Navigation';

export const Sensors: FC = () => {
  return (
    <SensorStackNavigator>
      <SensorStackScreen name={SENSOR_STACK.TABS} component={SensorListScreen} />
      <SensorStackScreen name={SENSOR_STACK.SENSOR_DETAIL} component={SensorDetailScreen} />
    </SensorStackNavigator>
  );
};
