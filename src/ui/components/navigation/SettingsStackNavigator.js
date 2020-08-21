import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { NAVIGATION } from '~constants';
import { navigationSlide } from '~animations';

import { StackHeader } from './StackHeader';

// Create a stack navigator
const SettingsStack = createStackNavigator();

// Default screen options for each screen within the stack.

const screenOptions = {
  cardStyleInterpolator: navigationSlide,
  header: ({
    scene: {
      route: { name },
    },
    navigation: { goBack },
  }) => {
    return (
      <StackHeader
        name={name}
        goBack={name !== NAVIGATION.SCREENS.SETTINGS_STACK.MENU ? goBack : null}
      />
    );
  },
};

// Exporting a main stack navigator component
export const SettingsStackNavigator = ({ children }) => (
  <SettingsStack.Navigator screenOptions={screenOptions}>{children}</SettingsStack.Navigator>
);

// As well as a screen component for this stack navigator
export const SettingsStackScreen = SettingsStack.Screen;
