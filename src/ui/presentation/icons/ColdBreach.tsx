import React, { FC } from 'react';
import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

interface ColdBreachProps {
  size: ICON_SIZE;
  color: string;
}

export const ColdBreach: FC<ColdBreachProps> = ({ size = ICON_SIZE.L, color = COLOUR.WHITE }) => {
  return <Icon size={size} name={ICON_NAME.COLD_BREACH} color={color} />;
};
