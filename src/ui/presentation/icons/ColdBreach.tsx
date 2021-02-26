import React, { FC } from 'react';
import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const ColdBreach: FC = () => {
  return <Icon size={ICON_SIZE.L} name={ICON_NAME.COLD_BREACH} color={COLOUR.WHITE} />;
};
