import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Sensors: FC = () => {
  return <Icon name={ICON_NAME.SENSORS} size={ICON_SIZE.S} color={COLOUR.OFF_WHITE} />;
};
