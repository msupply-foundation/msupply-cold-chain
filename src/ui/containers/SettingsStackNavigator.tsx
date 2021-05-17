import React, { FC } from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';

import { NAVIGATION, SETTINGS_STACK } from '../../common/constants';

import { SettingsStackHeader } from '../components/settings';

export type SettingsStackParameters = {
  [SETTINGS_STACK.MENU]: undefined;
  [SETTINGS_STACK.SENSORS]: undefined;
  [SETTINGS_STACK.BLUETOOTH]: undefined;
  [SETTINGS_STACK.TEMPERATURE_BREACH]: undefined;
  [SETTINGS_STACK.SENSOR_DETAIL]: { id: string };
  [SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL]: Record<string, unknown>;
  [SETTINGS_STACK.TEMPERATURE_CUMULATIVE_DETAIL]: Record<string, unknown>;
  [SETTINGS_STACK.DEVELOPER]: undefined;
  [SETTINGS_STACK.SYNC]: undefined;
};

// Create a stack navigator
const SettingsStack = createStackNavigator<SettingsStackParameters>();

// Default screen options for each screen within the stack.

const screenOptions: StackNavigationOptions = {
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  header: ({
    scene: {
      route: { name },
    },
    navigation: { goBack },
  }) => {
    return (
      <SettingsStackHeader
        name={name}
        goBack={name !== NAVIGATION.SCREENS.SETTINGS_STACK.MENU ? goBack : null}
      />
    );
  },
};

// Exporting a main stack navigator component
export const SettingsStackNavigator: FC = ({ children }) => (
  <SettingsStack.Navigator screenOptions={screenOptions}>{children}</SettingsStack.Navigator>
);

// As well as a screen component for this stack navigator
export const SettingsStackScreen = SettingsStack.Screen;
