import React, { FC } from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { COLOUR, NAVIGATION } from '../../common/constants';

// Create a stack navigator
const SensorStack = createStackNavigator();

// Default options for each screen within the stack.
const screenOptions: StackNavigationOptions = {
  cardStyle: { opacity: 1, backgroundColor: COLOUR.TRANSPARENT },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  cardOverlayEnabled: true,
  gestureEnabled: true,
  gestureDirection: NAVIGATION.CONFIG.SENSOR_STACK.GESTURE_DIRECTION as 'horizontal',
};

// Exporting a main stack navigator component
export const SensorStackNavigator: FC = ({ children }) => (
  <SensorStack.Navigator
    screenOptions={screenOptions}
    headerMode={NAVIGATION.CONFIG.SENSOR_STACK.HEADER_MODE as 'none'}
  >
    {children}
  </SensorStack.Navigator>
);

// As well as a screen component for this stack navigator
export const SensorStackScreen = SensorStack.Screen;
