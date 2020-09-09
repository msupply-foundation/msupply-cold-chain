import React from 'react';
import { StatusBar } from 'react-native';
import RNSettings from 'react-native-settings';

import { NavigationContainer } from '@react-navigation/native';

import { NAVIGATION } from '~constants';
import { MainHeader } from './components';

import { Settings } from '~screens/settings';
import { Sensors } from '~screens/sensors';

import {
  ReduxContainer,
  KeepAwakeContainer,
  DependencyContainer,
  StoreRehydrateContainer,
  MainTabNavigator,
  MainTabScreen,
} from './containers';

RNSettings.getSetting(RNSettings.LOCATION_SETTING).then(result => {
  if (result !== RNSettings.ENABLED) {
    RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS);
  }
});

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
                <MainTabScreen name={NAVIGATION.SCREENS.MAIN_TABS.SENSORS} component={Sensors} />
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
