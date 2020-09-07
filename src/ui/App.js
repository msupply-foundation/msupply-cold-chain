import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import { NAVIGATION } from '~constants';
import { MainHeader } from './components';

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

import {
  ReduxContainer,
  KeepAwakeContainer,
  DependencyContainer,
  StoreRehydrateContainer,
  SettingsStackNavigator,
  SettingsStackScreen,
  MainStackNavigator,
  MainStackScreen,
  MainTabNavigator,
  MainTabScreen,
} from './containers';

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
      <KeepAwakeContainer>
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
      </KeepAwakeContainer>
    </ReduxContainer>
  );
};

export default App;
