import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import { COLOUR, NAVIGATION } from '~constants';

// Create a stack navigator
const SensorStack = createStackNavigator();

// Default options for each screen within the stack.
const screenOptions = {
  cardStyle: { opacity: 1, backgroundColor: COLOUR.TRANSPARENT },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  cardOverlayEnabled: true,
  gestureEnabled: true,
  gestureDirection: NAVIGATION.CONFIG.SENSOR_STACK.GESTURE_DIRECTION,
};

// Exporting a main stack navigator component
export const SensorStackNavigator = ({ children }) => (
  <SensorStack.Navigator
    screenOptions={screenOptions}
    headerMode={NAVIGATION.CONFIG.SENSOR_STACK.HEADER_MODE}
  >
    {children}
  </SensorStack.Navigator>
);

// As well as a screen component for this stack navigator
export const SensorStackScreen = SensorStack.Screen;
