import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import { COLOUR, NAVIGATION } from '~constants';
import { MsupplyMan } from '../../presentation/icons';
import { Row } from '../../layouts';

// Create a stack navigator
const MainStack = createStackNavigator();

// Default options for each screen within the stack.
const screenOptions = {
  cardStyle: { opacity: 1, backgroundColor: COLOUR.TRANSPARENT },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  cardOverlayEnabled: true,
  gestureEnabled: true,
  gestureDirection: NAVIGATION.CONFIG.MAIN_STACK.GESTURE_DIRECTION,
  header: () => {
    return (
      <Row style={{ backgroundColor: COLOUR.HIGHLIGHT }} justifyContent="center">
        <MsupplyMan />
      </Row>
    );
  },
};

// Exporting a main stack navigator component
export const MainStackNavigator = ({ children }) => (
  <MainStack.Navigator screenOptions={screenOptions} headerMode="none">
    {children}
  </MainStack.Navigator>
);

// As well as a screen component for this stack navigator
export const MainStackScreen = MainStack.Screen;
