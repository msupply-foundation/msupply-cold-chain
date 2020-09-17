import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

import { COLOUR, ICON } from '~constants';

export const Battery = ({ batteryLevel, isCharging, size = 50, style = { marginRight: 10 } }) => {
  const getIconProps = () => {
    if (isCharging) return [ICON.BATTERY_CHARGING, COLOUR.PRIMARY];
    if (batteryLevel < 5) return [ICON.BATTERY_EMPTY, COLOUR.DANGER];
    if (batteryLevel < 25) return [ICON.BATTERY_ONE, COLOUR.DANGER];
    if (batteryLevel < 50) return [ICON.BATTERY_TWO, COLOUR.PRIMARY];
    if (batteryLevel < 75) return [ICON.BATTERY_THREE, COLOUR.PRIMARY];
    return [ICON.BATTERY_FOUR, COLOUR.PRIMARY];
  };

  const [iconName, iconColour] = getIconProps();

  // FA charging icon is not usable under our software license
  const IconComponent = isCharging ? Feather : FontAwesome;

  return <IconComponent style={style} name={iconName} size={size} color={iconColour} />;
};
