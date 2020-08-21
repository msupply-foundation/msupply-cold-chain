import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Cog, Map, Sensors } from '~presentation/icons';
import { NAVIGATION, COLOUR, FONT } from '~constants';

export const ICON_LOOKUP = {
  [NAVIGATION.SCREENS.MAIN_TABS.SETTINGS]: <Cog />,
  [NAVIGATION.SCREENS.MAIN_TABS.MAP]: <Map />,
  [NAVIGATION.SCREENS.MAIN_TABS.SENSORS]: <Sensors />,
};

// Create a TabNavigator
const Tab = createBottomTabNavigator();

// Default screen options for each page. Fetch an icon given the route name.
const screenOptions = ({ route }) => ({
  tabBarIcon: () => {
    const { name: routeName } = route;
    return ICON_LOOKUP[routeName];
  },
});

// TabBar styling options
const tabBarOptions = {
  activeTintColor: COLOUR.WHITE,
  inactiveTintColor: COLOUR.OFF_WHITE,
  activeBackgroundColor: COLOUR.HIGHLIGHT,
  inactiveBackgroundColor: COLOUR.SECONDARY,
  tabStyle: { borderWidth: 1, borderColor: COLOUR.DIVIDER, borderBottomWidth: 0 },
  labelStyle: { fontFamily: FONT.FAMILY.REGULAR, fontSize: FONT.SIZE.MS },
  labelPosition: 'below-icon',
};

// Export a TabNavigator component with configuration set.
export const MainTabNavigator = ({ children }) => (
  <Tab.Navigator screenOptions={screenOptions} tabBarOptions={tabBarOptions}>
    {children}
  </Tab.Navigator>
);

// Export a screen component to nest within the MainTabNavigator
export const MainTabScreen = Tab.Screen;
