import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Tick: FC = () => {
  return <Icon name={ICON_NAME.CHECK} color={COLOUR.GOOD} size={ICON_SIZE.L} />;
};
