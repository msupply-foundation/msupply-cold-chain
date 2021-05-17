import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Unlock: FC = () => {
  return <Icon size={ICON_SIZE.L} name={ICON_NAME.UNLOCK} color={COLOUR.PRIMARY} />;
};
