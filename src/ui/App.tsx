import React, { FC } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { NAVIGATION } from '../common/constants';

import { MainHeader } from './components';
import { Settings } from './screens/settings';
import { Sensors } from './screens/sensors';

import {
  SplashScreenContainer,
  StorybookContainer,
  ReduxContainer,
  KeepAwakeContainer,
  DependencyContainer,
  MainTabNavigator,
  MainTabScreen,
  PermissionsContainer,
  ErrorBoundary,
  MigrationRunner,
} from './containers';

const App: FC = () => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StorybookContainer>
          <ReduxContainer>
            <KeepAwakeContainer>
              <DependencyContainer>
                <MigrationRunner>
                  <PermissionsContainer>
                    <SplashScreenContainer>
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
                    </SplashScreenContainer>
                  </PermissionsContainer>
                </MigrationRunner>
              </DependencyContainer>
            </KeepAwakeContainer>
          </ReduxContainer>
        </StorybookContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
