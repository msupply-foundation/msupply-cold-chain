import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Cog: FC = () => {
  return <Icon name={ICON_NAME.SETTINGS} size={ICON_SIZE.S} color={COLOUR.OFF_WHITE} />;
};
