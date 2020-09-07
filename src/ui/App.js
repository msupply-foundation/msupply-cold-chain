import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import { NAVIGATION } from '~constants';
import { MainHeader } from './components';

import {
  SettingsStackNavigator,
  SettingsStackScreen,
  MainStackNavigator,
  MainStackScreen,
  MainTabNavigator,
  MainTabScreen,
} from './components/navigation';

import {
  MainSettingsScreen,
  BluetoothSettingsScreen,
  TemperatureBreachSettingsScreen,
  SensorSettingsScreen,
  TemperatureBreachDetailScreen,
  DevSettingsScreen,
  SensorDetailScreen as SensorSettingsDetailScreen,
  CumulativeDetailSettingScreen,
} from '~screens/settings';

import { StoreRehydrateContainer } from './containers/StoreRehydrateContainer';
import { DependencyContainer } from './containers/DependencyContainer';
import { ReduxContainer } from './containers/ReduxContainer';

import { SensorListScreen, SensorDetailScreen } from './screens/sensor';

const Settings = () => (
  <SettingsStackNavigator>
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.MENU}
      component={MainSettingsScreen}
    />
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.BLUETOOTH}
      component={BluetoothSettingsScreen}
    />
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.SENSORS}
      component={SensorSettingsScreen}
    />
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_BREACH}
      component={TemperatureBreachSettingsScreen}
    />
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.SENSOR_DETAIL}
      component={SensorSettingsDetailScreen}
    />
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL}
      component={TemperatureBreachDetailScreen}
    />
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.DEVELOPER}
      component={DevSettingsScreen}
    />
    <SettingsStackScreen
      name={NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_CUMULATIVE_DETAIL}
      component={CumulativeDetailSettingScreen}
    />
  </SettingsStackNavigator>
);

const Stack = () => {
  return (
    <MainStackNavigator>
      <MainStackScreen name={NAVIGATION.SCREENS.MAIN_STACK.TABS} component={SensorListScreen} />
      <MainStackScreen
        name={NAVIGATION.SCREENS.MAIN_STACK.SENSOR_DETAIL}
        component={SensorDetailScreen}
      />
    </MainStackNavigator>
  );
};

const App = () => {
  return (
    <ReduxContainer>
      <DependencyContainer>
        <StoreRehydrateContainer>
          <NavigationContainer>
            <StatusBar hidden />
            <MainHeader />
            <MainTabNavigator>
              <MainTabScreen name={NAVIGATION.SCREENS.MAIN_TABS.SENSORS} component={Stack} />
              <MainTabScreen name={NAVIGATION.SCREENS.MAIN_TABS.SETTINGS} component={Settings} />
            </MainTabNavigator>
          </NavigationContainer>
        </StoreRehydrateContainer>
      </DependencyContainer>
    </ReduxContainer>
  );
};

export default App;
