import React, { FC } from 'react';
import { ParamListBase, RouteProp } from '@react-navigation/core';
import {
  BottomTabBarOptions,
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { NAVIGATION, COLOUR, FONT } from '../../common/constants';
import { t } from '../../common/translations';
import { Icon } from '../presentation/icons';

export const ICON_LOOKUP = {
  [NAVIGATION.SCREENS.MAIN_TABS.SETTINGS]: <Icon.Cog />,
  [NAVIGATION.SCREENS.MAIN_TABS.MAP]: <Icon.Map />,
  [NAVIGATION.SCREENS.MAIN_TABS.SENSORS]: <Icon.Sensors />,
};

// Create a TabNavigator
const Tab = createBottomTabNavigator();

// Default screen options for each page. Fetch an icon given the route name.
interface ScreenOptionsParams {
  route: RouteProp<ParamListBase, string>;
}

const screenOptions = ({
  route: { name: routeName },
}: ScreenOptionsParams): BottomTabNavigationOptions => ({
  tabBarIcon: () => ICON_LOOKUP[routeName],
  title: t(routeName),
});

// TabBar styling options
const tabBarOptions: BottomTabBarOptions = {
  activeTintColor: COLOUR.WHITE,
  inactiveTintColor: COLOUR.OFF_WHITE,
  activeBackgroundColor: COLOUR.HIGHLIGHT,
  inactiveBackgroundColor: COLOUR.SECONDARY,
  tabStyle: {
    borderWidth: 1,
    borderColor: COLOUR.DIVIDER,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  labelStyle: { fontFamily: FONT.FAMILY.REGULAR, fontSize: FONT.SIZE.MS },
  labelPosition: 'below-icon',
};

// Export a TabNavigator component with configuration set.
export const MainTabNavigator: FC = ({ children }) => (
  <Tab.Navigator screenOptions={screenOptions} tabBarOptions={tabBarOptions}>
    {children}
  </Tab.Navigator>
);

// Export a screen component to nest within the MainTabNavigator
export const MainTabScreen = Tab.Screen;
