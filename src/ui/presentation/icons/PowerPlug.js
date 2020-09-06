import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ICON, COLOUR } from '~constants';

export const PowerPlug = ({ isPLuggedIn }) => {
  const iconName = isPLuggedIn ? ICON.POWER_PLUG_ON : ICON.POWER_PLUG_OFF;
  const colour = isPLuggedIn ? COLOUR.WHITE : COLOUR.DANGER;

  return <MaterialCommunityIcon name={iconName} size={100} color={colour} />;
};
