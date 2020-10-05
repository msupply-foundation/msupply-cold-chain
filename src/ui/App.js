import React from 'react';
import { StatusBar } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { NAVIGATION } from '~constants';

import { MainHeader } from './components';
import { Settings } from '~screens/settings';
import { Sensors } from '~screens/sensors';

import {
  StorybookContainer,
  ReduxContainer,
  KeepAwakeContainer,
  DependencyContainer,
  MainTabNavigator,
  MainTabScreen,
  PermissionsContainer,
  ErrorBoundary,
} from './containers';
import { LargeText } from './presentation/typography';

const App = () => {
  return (
    <ErrorBoundary>
      <StorybookContainer>
        <ReduxContainer>
          <KeepAwakeContainer>
            <LargeText colour="white">{!!global.HermesInternal}</LargeText>
            <DependencyContainer>
              <PermissionsContainer>
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
              </PermissionsContainer>
            </DependencyContainer>
          </KeepAwakeContainer>
        </ReduxContainer>
      </StorybookContainer>
    </ErrorBoundary>
  );
};

export default App;
