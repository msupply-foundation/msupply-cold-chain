import React, { FC } from 'react';
import { SETTINGS_STACK } from '../../../common/constants';

import { SettingsStackNavigator, SettingsStackScreen } from '../../containers';

import { MainSettingsScreen } from './MainSettingsScreen';
import { BluetoothSettingsScreen } from './BluetoothSettingsScreen';
import { SensorSettingsScreen } from './SensorSettingsScreen';
import { TemperatureBreachSettingsScreen } from './TemperatureBreachSettingsScreen';
import { TemperatureBreachDetailScreen } from './TemperatureBreachDetailScreen';
import { DevSettingsScreen } from './DevSettingsScreen';
import { CumulativeDetailSettingScreen } from './CumulativeDetailSettingScreen';
import { SensorDetailSettingsScreen } from './SensorDetailSettingsScreen';

export const Settings: FC = () => (
  <SettingsStackNavigator>
    <SettingsStackScreen name={SETTINGS_STACK.MENU} component={MainSettingsScreen} />
    <SettingsStackScreen name={SETTINGS_STACK.BLUETOOTH} component={BluetoothSettingsScreen} />
    <SettingsStackScreen name={SETTINGS_STACK.SENSORS} component={SensorSettingsScreen} />
    <SettingsStackScreen
      name={SETTINGS_STACK.TEMPERATURE_BREACH}
      component={TemperatureBreachSettingsScreen}
    />
    <SettingsStackScreen
      name={SETTINGS_STACK.SENSOR_DETAIL}
      component={SensorDetailSettingsScreen}
    />
    <SettingsStackScreen
      name={SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL}
      component={TemperatureBreachDetailScreen}
    />
    <SettingsStackScreen name={SETTINGS_STACK.DEVELOPER} component={DevSettingsScreen} />
    <SettingsStackScreen
      name={SETTINGS_STACK.TEMPERATURE_CUMULATIVE_DETAIL}
      component={CumulativeDetailSettingScreen}
    />
  </SettingsStackNavigator>
);
