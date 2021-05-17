import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_SIZE, ICON_NAME } from './Icon';

export const Location: FC = () => {
  return <Icon name={ICON_NAME.LOCATION} size={ICON_SIZE.XL} color={COLOUR.WHITE} />;
};
