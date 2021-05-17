import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

interface SensorsProps {
  color: COLOUR;
}

export const Sensors: FC<SensorsProps> = ({ color = COLOUR.OFF_WHITE }) => {
  return <Icon name={ICON_NAME.SENSORS} size={ICON_SIZE.S} color={color} />;
};
