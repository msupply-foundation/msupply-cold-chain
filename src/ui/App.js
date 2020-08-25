import React, { useState } from 'react';
import { getStorybookUI, configure } from '@storybook/react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { View } from 'react-native';
import moment from 'moment';

import { NAVIGATION } from '~constants';

import { PinEntry, SensorChartRow } from '~components';
import { Gradient } from '~layouts';

import { Button } from '~components/buttons';

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
  SensorDetailScreen,
  TemperatureBreachDetailScreen,
  DevSettingsScreen,
} from '~screens/settings';

import { StoreRehydrateContainer } from './StoreRehydrateContainer';
import { DependencyContainer } from './DependencyContainer';
import { ReduxContainer } from './ReduxContainer';

configure(() => {
  require('./storybook/stories');
}, module);

// eslint-disable-next-line no-unused-vars
const StorybookUIRoot = getStorybookUI({
  asyncStorage: require('@react-native-community/async-storage').default,
});

const getData = n => {
  const date = moment().subtract(30 * n, 'minutes');

  const getTemperature = () => Number((Math.random() * 10).toFixed(2));

  return Array.from({ length: n }).map((_, i) => ({
    timestamp: moment(date)
      .add(30 * i, 'hour')
      .toDate(),
    temperature: getTemperature(),
  }));
};

const ScreenOne = ({ navigation }) => {
  const logs = getData(30);

  return (
    <LinearGradient colors={['#282F46', '#4C68A3']} style={{ height: '100%' }}>
      <Button
        title="Go to sensor"
        style={{ backgroundColour: 'red' }}
        onPress={() => navigation.navigate('Sensor')}
      />

      <SensorChartRow logs={logs} />
    </LinearGradient>
  );
};

const Mapz = () => {
  return <View style={{}} />;
};

const sensor = { name: 'sensor one', temperature: '3.2c' };

const Sensor = () => {
  return (
    <LinearGradient colors={['#282F46', '#4C68A3']} style={{ height: '100%' }}>
      <SensorChartRow sensor={sensor} logs={getData(30)} direction="left" />
    </LinearGradient>
  );
};

const Settings = ({ navigation }) => {
  const [authorized] = useState(false);

  const onComplete = () => {};

  const isFocused = useIsFocused();

  return !authorized && !__DEV__ ? (
    isFocused && <PinEntry onComplete={onComplete} onCancel={() => navigation.goBack()} />
  ) : (
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
        component={SensorDetailScreen}
      />

      <SettingsStackScreen
        name={NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL}
        component={TemperatureBreachDetailScreen}
      />

      <SettingsStackScreen
        name={NAVIGATION.SCREENS.SETTINGS_STACK.DEVELOPER}
        component={DevSettingsScreen}
      />
    </SettingsStackNavigator>
  );
};

const Tabs = () => (
  <MainTabNavigator>
    <MainTabScreen name="Sensors" component={ScreenOne} />
    <MainTabScreen name="Mapz" component={Mapz} />
    <MainTabScreen name="Settings" component={Settings} />
  </MainTabNavigator>
);

const App = () => {
  return (
    <ReduxContainer>
      <DependencyContainer>
        <StoreRehydrateContainer>
          <NavigationContainer>
            <Gradient>
              <MainStackNavigator>
                <MainStackScreen name="Tabs" component={Tabs} />
                <MainStackScreen name="Sensor" component={Sensor} />
              </MainStackNavigator>
            </Gradient>
          </NavigationContainer>
        </StoreRehydrateContainer>
      </DependencyContainer>
    </ReduxContainer>
  );
};

export default App;
