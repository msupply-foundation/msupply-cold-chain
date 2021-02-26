import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Close: FC = () => {
  return <Icon name={ICON_NAME.CLOSE} color={COLOUR.DANGER} size={ICON_SIZE.L} />;
};
