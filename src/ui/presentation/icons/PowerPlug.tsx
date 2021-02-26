import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

interface PowerPlugProps {
  isPLuggedIn: boolean;
}

export const PowerPlug: FC<PowerPlugProps> = ({ isPLuggedIn }) => {
  const iconName = isPLuggedIn ? ICON_NAME.POWER_PLUG_ON : ICON_NAME.POWER_PLUG_OFF;
  const colour = isPLuggedIn ? COLOUR.WHITE : COLOUR.DANGER;

  return <Icon name={iconName} size={ICON_SIZE.XL} color={colour} />;
};
