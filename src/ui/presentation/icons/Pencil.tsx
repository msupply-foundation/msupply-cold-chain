import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Pencil: FC = () => (
  <Icon name={ICON_NAME.PENCIL} size={ICON_SIZE.S} color={COLOUR.SECONDARY} />
);
