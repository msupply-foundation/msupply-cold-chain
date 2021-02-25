import React, { FC } from 'react';
import { TextStyle } from 'react-native';
import { COLOUR } from '../../../common/constants';
import { ICON_NAME, Icon, ICON_SIZE } from './Icon';

interface BatteryProps extends TextStyle {
  batteryLevel: number;
  isCharging: boolean;
  size: ICON_SIZE;
  style: TextStyle;
}

export const Battery: FC<BatteryProps> = ({
  batteryLevel = 100,
  isCharging = false,
  size = ICON_SIZE.L,
  style = { marginRight: 10 },
}) => {
  const getIconProps = (level: number, charging: boolean): [ICON_NAME, string] => {
    if (charging) return [ICON_NAME.BATTERY_CHARGING, COLOUR.PRIMARY];
    if (level < 5) return [ICON_NAME.BATTERY_EMPTY, COLOUR.DANGER];
    if (level < 25) return [ICON_NAME.BATTERY_ONE, COLOUR.DANGER];
    if (level < 50) return [ICON_NAME.BATTERY_TWO, COLOUR.PRIMARY];
    if (level < 75) return [ICON_NAME.BATTERY_THREE, COLOUR.PRIMARY];
    return [ICON_NAME.BATTERY_FOUR, COLOUR.PRIMARY];
  };

  const [iconName, iconColor] = getIconProps(batteryLevel, isCharging);

  return <Icon style={style} name={iconName} size={size} color={iconColor} />;
};
