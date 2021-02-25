/* eslint-disable no-shadow */
import React, { FC } from 'react';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextProps } from 'react-native';

export enum ICON_NAME {
  HOT_BREACH = 'thermometer',
  COLD_BREACH = 'snowflake-o',
  CHEVRON_LEFT = 'chevron-left',
  CHEVRON_RIGHT = 'chevron-right',
  LOW_BATTERY = 'battery-1',
  CALENDAR = 'calendar',
  SETTINGS = 'cog',
  MAP = 'map',
  SENSORS = 'line-chart',
  PENCIL = 'pencil',
  CLOSE = 'close',
  SORT_UP = 'sort-asc',
  SORT_DOWN = 'sort-desc',
  SORT = 'sort',
  DOWNLOAD = 'download',
  BLUETOOTH = 'bluetooth',
  EMAIL = 'envelope-o',
  LOCK = 'lock',
  UNLOCK = 'unlock',

  // Power off icon is for PRO FA members. Using MaterialCommunityIcon variants.
  POWER_PLUG_ON = 'power-plug',
  POWER_PLUG_OFF = 'power-plug-off',

  BATTERY_EMPTY = 'battery-0',
  BATTERY_ONE = 'battery-1',
  BATTERY_TWO = 'battery-2',
  BATTERY_THREE = 'battery-3',
  BATTERY_FOUR = 'battery-4',

  // Using Feather icon replacement - FA charging icon is for PRO members
  BATTERY_CHARGING = 'battery-charging',
}

export enum ICON_SIZE {
  L = 60,
  S = 20,
}

const DefaultIconComponent = FontAwesome;

// Type of FontAwesome is the base Icon type of react-native-vector-icons
// but the base Icon type isn't exported
const iconComponentFromIconName = (name: ICON_NAME): typeof FontAwesome => {
  const lookup = {
    [ICON_NAME.POWER_PLUG_ON]: MaterialCommunityIcon,
    [ICON_NAME.POWER_PLUG_OFF]: MaterialCommunityIcon,
    [ICON_NAME.BATTERY_EMPTY]: MaterialCommunityIcon,
    [ICON_NAME.BATTERY_ONE]: MaterialCommunityIcon,
    [ICON_NAME.BATTERY_TWO]: MaterialCommunityIcon,
    [ICON_NAME.BATTERY_THREE]: MaterialCommunityIcon,
    [ICON_NAME.BATTERY_FOUR]: MaterialCommunityIcon,

    [ICON_NAME.BATTERY_CHARGING]: Feather,
  };

  return lookup[name] ?? DefaultIconComponent;
};

interface IconProps {
  name: ICON_NAME;
  size: ICON_SIZE;
  style: TextProps;
  color: string;
}

export const Icon: FC<IconProps> = ({ name, size = ICON_SIZE.S, style = {} }) => {
  const Component = iconComponentFromIconName(name);

  return <Component name={name} size={size} style={style} />;
};
