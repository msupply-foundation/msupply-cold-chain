import { NAVIGATION } from '~constants';

import { SensorStackScreen, SensorStackNavigator } from '~containers';

import { SensorListScreen } from './SensorListScreen';
import { SensorDetailScreen } from './SensorDetailScreen';

export const Sensors = () => {
  return (
    <SensorStackNavigator>
      <SensorStackScreen name={NAVIGATION.SCREENS.SENSOR_STACK.TABS} component={SensorListScreen} />
      <SensorStackScreen
        name={NAVIGATION.SCREENS.SENSOR_STACK.SENSOR_DETAIL}
        component={SensorDetailScreen}
      />
    </SensorStackNavigator>
  );
};
