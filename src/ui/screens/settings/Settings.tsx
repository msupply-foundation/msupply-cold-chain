import React, { FC } from 'react';
import { SETTINGS_STACK } from '../../../common/constants';

import { SettingsStackNavigator, SettingsStackScreen } from '../../containers';

import { MainSettingsScreen } from './MainSettingsScreen';
import { SensorSettingsScreen } from './SensorSettingsScreen';
import { TemperatureBreachSettingsScreen } from './TemperatureBreachSettingsScreen';
import { TemperatureBreachDetailScreen } from './TemperatureBreachDetailScreen';
import { DevSettingsScreen } from './DevSettingsScreen';
import { DebugSettingsScreen } from './DebugSettingsScreen';
import { CumulativeDetailSettingScreen } from './CumulativeDetailSettingScreen';
import { SensorDetailSettingsScreen } from './SensorDetailSettingsScreen';
import { SyncSettingsScreen } from './SyncSettingsScreen';

export const Settings: FC = () => (
  <SettingsStackNavigator>
    <SettingsStackScreen name={SETTINGS_STACK.MENU} component={MainSettingsScreen} />
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
    <SettingsStackScreen name={SETTINGS_STACK.DEBUG} component={DebugSettingsScreen} />
    <SettingsStackScreen
      name={SETTINGS_STACK.TEMPERATURE_CUMULATIVE_DETAIL}
      component={CumulativeDetailSettingScreen}
    />
    <SettingsStackScreen name={SETTINGS_STACK.SYNC} component={SyncSettingsScreen} />
  </SettingsStackNavigator>
);
