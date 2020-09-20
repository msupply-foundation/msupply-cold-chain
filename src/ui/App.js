import React from 'react';
import { StatusBar } from 'react-native';

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
  ErrorBoundary,
} from './containers';

import { DeviceSettingsContainer } from './containers/DeviceSettingsContainer';

const App = () => {
  return (
    <ErrorBoundary>
      <ReduxContainer>
        <KeepAwakeContainer>
          <DependencyContainer>
            <StoreRehydrateContainer>
              <DeviceSettingsContainer>
                <NavigationContainer>
                  <StatusBar hidden />
                  <MainHeader />
                  <MainTabNavigator>
                    <MainTabScreen
                      name={NAVIGATION.SCREENS.MAIN_TABS.SENSORS}
                      component={Sensors}
                    />
                    <MainTabScreen
                      name={NAVIGATION.SCREENS.MAIN_TABS.SETTINGS}
                      component={Settings}
                    />
                  </MainTabNavigator>
                </NavigationContainer>
              </DeviceSettingsContainer>
            </StoreRehydrateContainer>
          </DependencyContainer>
        </KeepAwakeContainer>
      </ReduxContainer>
    </ErrorBoundary>
  );
};

export default App;
