import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Email: FC = () => {
  return <Icon name={ICON_NAME.EMAIL} color={COLOUR.SECONDARY} size={ICON_SIZE.MS} />;
};
