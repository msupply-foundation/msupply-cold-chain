import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Bluetooth: FC = () => {
  return <Icon name={ICON_NAME.BLUETOOTH} color={COLOUR.WHITE} size={ICON_SIZE.XXL} />;
};
