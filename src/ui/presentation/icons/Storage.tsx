import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Storage: FC = () => {
  return <Icon name={ICON_NAME.DATABASE} size={ICON_SIZE.XL} color={COLOUR.WHITE} />;
};
