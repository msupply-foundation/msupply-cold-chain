import React, { FC } from 'react';
import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

interface HotBreachProps {
  size?: ICON_SIZE;
  color?: string;
}

export const HotBreach: FC<HotBreachProps> = ({ size = ICON_SIZE.L, color = COLOUR.WHITE }) => {
  return <Icon size={size} name={ICON_NAME.HOT_BREACH} color={color} />;
};
