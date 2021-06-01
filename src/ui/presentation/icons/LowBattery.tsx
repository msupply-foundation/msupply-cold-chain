import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const LowBattery: FC = () => {
  return <Icon size={ICON_SIZE.MS} name={ICON_NAME.LOW_BATTERY} color={COLOUR.WHITE} />;
};
